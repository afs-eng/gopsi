from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.clinics.selectors import clinics_visible_to_user
from apps.patients.models import Guardian, Patient, ProfessionalPatient
from apps.professionals.selectors import professionals_visible_to_user


class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = [
            "id",
            "full_name",
            "relationship",
            "cpf",
            "phone",
            "email",
            "has_authorization",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProfessionalPatientSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )

    class Meta:
        model = ProfessionalPatient
        fields = [
            "id",
            "professional",
            "professional_name",
            "is_primary",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PatientSerializer(serializers.ModelSerializer):
    guardians = GuardianSerializer(many=True, required=False)
    professional_links = ProfessionalPatientSerializer(many=True, required=False)

    class Meta:
        model = Patient
        fields = [
            "id",
            "clinic",
            "full_name",
            "social_name",
            "cpf",
            "birth_date",
            "sex",
            "phone",
            "email",
            "address",
            "emergency_contact_name",
            "emergency_contact_phone",
            "status",
            "is_active",
            "guardians",
            "professional_links",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")

        return clinic

    def validate_professional_links(self, links):
        request = self.context["request"]
        visible_professionals = professionals_visible_to_user(request.user)

        for link in links:
            professional = link["professional"]
            if not visible_professionals.filter(id=professional.id).exists():
                raise serializers.ValidationError("Profissional não encontrado.")

        return links

    def create(self, validated_data):
        guardians = validated_data.pop("guardians", [])
        professional_links = validated_data.pop("professional_links", [])
        patient = Patient.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

        for guardian in guardians:
            Guardian.objects.create(patient=patient, **guardian)

        for link in professional_links:
            ProfessionalPatient.objects.create(patient=patient, **link)

        return patient

    def update(self, instance, validated_data):
        validated_data.pop("guardians", None)
        validated_data.pop("professional_links", None)
        return super().update(instance, validated_data)

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam dados de pacientes."
            )
        return attrs
