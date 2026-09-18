from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.appointments.selectors import appointments_visible_to_user
from apps.clinics.selectors import clinics_visible_to_user
from apps.medical_records.models import (
    MedicalRecordAuditAction,
    MedicalRecordAuditEvent,
    MedicalRecordEntry,
    MedicalRecordEntryStatus,
    MedicalRecordEntryVersion,
)
from apps.patients.selectors import patients_visible_to_user
from apps.professionals.selectors import professionals_visible_to_user


class MedicalRecordEntryVersionSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(
        source="changed_by.full_name",
        read_only=True,
    )

    class Meta:
        model = MedicalRecordEntryVersion
        fields = [
            "id",
            "version",
            "entry_type",
            "status",
            "content",
            "changed_by",
            "changed_by_name",
            "created_at",
        ]
        read_only_fields = fields


class MedicalRecordAuditEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.full_name", read_only=True)

    class Meta:
        model = MedicalRecordAuditEvent
        fields = [
            "id",
            "clinic",
            "entry",
            "action",
            "actor",
            "actor_name",
            "metadata",
            "created_at",
        ]
        read_only_fields = fields


class MedicalRecordEntrySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )
    versions = MedicalRecordEntryVersionSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecordEntry
        fields = [
            "id",
            "clinic",
            "patient",
            "patient_name",
            "professional",
            "professional_name",
            "appointment",
            "entry_type",
            "status",
            "content",
            "versions",
            "created_by",
            "updated_by",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "versions",
            "created_by",
            "updated_by",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate_patient(self, patient):
        request = self.context["request"]
        if not patients_visible_to_user(request.user).filter(id=patient.id).exists():
            raise serializers.ValidationError("Paciente não encontrado.")
        return patient

    def validate_professional(self, professional):
        request = self.context["request"]
        if (
            not professionals_visible_to_user(request.user)
            .filter(id=professional.id)
            .exists()
        ):
            raise serializers.ValidationError("Profissional não encontrado.")
        if not request.user.professional_profiles.filter(
            id=professional.id,
        ).exists():
            raise serializers.ValidationError("Profissional não autorizado.")
        return professional

    def validate_appointment(self, appointment):
        if appointment is None:
            return appointment

        request = self.context["request"]
        if (
            not appointments_visible_to_user(request.user)
            .filter(id=appointment.id)
            .exists()
        ):
            raise serializers.ValidationError("Consulta não encontrada.")
        return appointment

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam prontuários."
            )

        data = {}
        for field in MedicalRecordEntry._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        if not self.instance:
            data["created_by"] = self.context["request"].user

        entry = MedicalRecordEntry(**data)
        if self.instance:
            entry.pk = self.instance.pk

        try:
            entry.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        entry = MedicalRecordEntry.objects.create(**validated_data, created_by=user)
        self._record_change(entry, user, MedicalRecordAuditAction.CREATED)
        return entry

    @transaction.atomic
    def update(self, instance, validated_data):
        user = self.context["request"].user
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.updated_by = user
        instance.save()
        self._record_change(instance, user, MedicalRecordAuditAction.UPDATED)
        return instance

    def void(self, instance):
        user = self.context["request"].user
        instance.status = MedicalRecordEntryStatus.VOIDED
        instance.is_active = False
        instance.updated_by = user
        instance.save(update_fields=["status", "is_active", "updated_by", "updated_at"])
        self._record_change(instance, user, MedicalRecordAuditAction.VOIDED)
        return instance

    def _record_change(self, entry, user, action):
        version = entry.versions.count() + 1
        MedicalRecordEntryVersion.objects.create(
            entry=entry,
            version=version,
            entry_type=entry.entry_type,
            status=entry.status,
            content=entry.content,
            changed_by=user,
        )
        MedicalRecordAuditEvent.objects.create(
            clinic=entry.clinic,
            entry=entry,
            action=action,
            actor=user,
            metadata={"version": version, "status": entry.status},
        )
