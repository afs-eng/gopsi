from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.appointments.models import Appointment, ScheduleBlock
from apps.clinics.selectors import clinics_visible_to_user
from apps.patients.selectors import patients_visible_to_user
from apps.professionals.selectors import professionals_visible_to_user


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "clinic",
            "patient",
            "patient_name",
            "professional",
            "professional_name",
            "date",
            "start_time",
            "end_time",
            "modality",
            "status",
            "value",
            "administrative_notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

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
        return professional

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam dados da agenda."
            )

        data = {}
        for field in Appointment._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        appointment = Appointment(**data)
        if self.instance:
            appointment.pk = self.instance.pk

        try:
            appointment.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs


class ScheduleBlockSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )

    class Meta:
        model = ScheduleBlock
        fields = [
            "id",
            "clinic",
            "professional",
            "professional_name",
            "date",
            "start_time",
            "end_time",
            "reason",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate_professional(self, professional):
        request = self.context["request"]
        if (
            not professionals_visible_to_user(request.user)
            .filter(id=professional.id)
            .exists()
        ):
            raise serializers.ValidationError("Profissional não encontrado.")
        return professional

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam dados da agenda."
            )

        data = {}
        for field in ScheduleBlock._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        block = ScheduleBlock(**data)
        if self.instance:
            block.pk = self.instance.pk

        try:
            block.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs
