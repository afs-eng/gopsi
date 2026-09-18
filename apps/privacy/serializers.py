from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.audit.models import AuditAction
from apps.audit.services import record_audit_event
from apps.clinics.selectors import clinics_visible_to_user
from apps.patients.selectors import patients_visible_to_user
from apps.privacy.models import DataSubjectRequest, DataSubjectRequestStatus


class DataSubjectRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = DataSubjectRequest
        fields = [
            "id",
            "clinic",
            "patient",
            "patient_name",
            "subject_user",
            "request_type",
            "status",
            "description",
            "requester_name",
            "requester_email",
            "due_date",
            "response_summary",
            "rejection_reason",
            "created_by",
            "handled_by",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient_name",
            "created_by",
            "handled_by",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate_patient(self, patient):
        if patient is None:
            return patient
        request = self.context["request"]
        if not patients_visible_to_user(request.user).filter(id=patient.id).exists():
            raise serializers.ValidationError("Paciente não encontrado.")
        return patient

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Operador da plataforma sem acesso.")

        data = {}
        for field in DataSubjectRequest._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)
        if not self.instance:
            data["created_by"] = self.context["request"].user
        request_obj = DataSubjectRequest(**data)
        if self.instance:
            request_obj.pk = self.instance.pk
        try:
            request_obj.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
        return attrs

    def create(self, validated_data):
        instance = DataSubjectRequest.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )
        record_audit_event(
            action=AuditAction.DATA_REQUEST_CREATED,
            request=self.context["request"],
            clinic=instance.clinic,
            resource_type="DataSubjectRequest",
            resource_id=instance.id,
        )
        return instance

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if instance.status in [
            DataSubjectRequestStatus.FULFILLED,
            DataSubjectRequestStatus.REJECTED,
            DataSubjectRequestStatus.CANCELLED,
        ]:
            instance.completed_at = instance.completed_at or timezone.now()
        instance.handled_by = self.context["request"].user
        instance.save()
        record_audit_event(
            action=AuditAction.DATA_REQUEST_UPDATED,
            request=self.context["request"],
            clinic=instance.clinic,
            resource_type="DataSubjectRequest",
            resource_id=instance.id,
            metadata={"status": instance.status},
        )
        return instance
