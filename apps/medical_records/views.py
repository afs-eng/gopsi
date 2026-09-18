from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.audit.models import AuditAction
from apps.audit.services import record_audit_event
from apps.medical_records.permissions import CanAccessMedicalRecords
from apps.medical_records.selectors import (
    medical_record_audit_visible_to_user,
    medical_records_visible_to_user,
)
from apps.medical_records.serializers import (
    MedicalRecordAuditEventSerializer,
    MedicalRecordEntrySerializer,
)


class MedicalRecordEntryViewSet(ModelViewSet):
    serializer_class = MedicalRecordEntrySerializer
    permission_classes = [CanAccessMedicalRecords]

    def get_queryset(self):
        queryset = medical_records_visible_to_user(self.request.user).select_related(
            "clinic",
            "patient",
            "professional",
            "appointment",
            "created_by",
            "updated_by",
        ).prefetch_related("versions__changed_by")
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)

        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        appointment_id = self.request.query_params.get("appointment")
        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)

        if (
            self.action == "list"
            and not clinic_id
        ):
            return queryset.none()

        return queryset

    @action(detail=True, methods=["post"])
    def void(self, request, pk=None):
        entry = self.get_object()
        serializer = self.get_serializer(entry)
        serializer.void(entry)
        return Response(self.get_serializer(entry).data)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        entry = self.get_object()
        record_audit_event(
            action=AuditAction.MEDICAL_RECORD_VIEWED,
            request=request,
            clinic=entry.clinic,
            resource_type="MedicalRecordEntry",
            resource_id=entry.id,
        )
        return response

    def perform_destroy(self, instance):
        serializer = self.get_serializer(instance)
        serializer.void(instance)


class MedicalRecordAuditEventViewSet(ReadOnlyModelViewSet):
    serializer_class = MedicalRecordAuditEventSerializer
    permission_classes = [CanAccessMedicalRecords]

    def get_queryset(self):
        queryset = (
            medical_record_audit_visible_to_user(self.request.user).select_related(
                "clinic",
                "entry",
                "actor",
            )
        )
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)

        entry_id = self.request.query_params.get("entry")
        if entry_id:
            queryset = queryset.filter(entry_id=entry_id)

        if (
            self.action == "list"
            and not clinic_id
        ):
            return queryset.none()

        return queryset
