from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.clinics.selectors import clinics_visible_to_user
from apps.professionals.models import Professional, Specialty


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "name", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProfessionalSerializer(serializers.ModelSerializer):
    specialties = SpecialtySerializer(many=True, read_only=True)
    specialty_ids = serializers.PrimaryKeyRelatedField(
        queryset=Specialty.objects.filter(is_active=True),
        many=True,
        required=False,
        source="specialties",
        write_only=True,
    )

    class Meta:
        model = Professional
        fields = [
            "id",
            "clinic",
            "user",
            "full_name",
            "social_name",
            "cpf",
            "birth_date",
            "email",
            "phone",
            "profession",
            "crp",
            "crp_state",
            "registration_number",
            "status",
            "biography",
            "appointment_modalities",
            "appointment_price",
            "default_appointment_duration",
            "specialties",
            "specialty_ids",
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

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Acesso de operador de plataforma negado.")

        profession = attrs.get("profession") or getattr(self.instance, "profession", "")
        crp = attrs.get("crp") or getattr(self.instance, "crp", "")
        crp_state = attrs.get("crp_state") or getattr(self.instance, "crp_state", "")

        if profession.lower() in {"psicólogo", "psicologa", "psicóloga", "psicologo"}:
            if not crp or not crp_state:
                raise serializers.ValidationError("CRP e UF do CRP são obrigatórios.")

        return attrs
