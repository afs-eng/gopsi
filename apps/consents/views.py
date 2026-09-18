from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.consents.permissions import CanManageConsents
from apps.consents.selectors import (
    consent_records_visible_to_user,
    consent_templates_visible_to_user,
)
from apps.consents.serializers import ConsentRecordSerializer, ConsentTemplateSerializer


class ConsentTemplateViewSet(ModelViewSet):
    serializer_class = ConsentTemplateSerializer
    permission_classes = [CanManageConsents]

    def get_queryset(self):
        queryset = consent_templates_visible_to_user(self.request.user).select_related(
            "clinic",
            "created_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class ConsentRecordViewSet(ModelViewSet):
    serializer_class = ConsentRecordSerializer
    permission_classes = [CanManageConsents]

    def get_queryset(self):
        queryset = consent_records_visible_to_user(self.request.user).select_related(
            "clinic",
            "template",
            "patient",
            "subject_user",
            "accepted_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        record = self.get_object()
        serializer = self.get_serializer(record)
        serializer.revoke(record)
        return Response(self.get_serializer(record).data)
