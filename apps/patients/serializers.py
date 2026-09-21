import json

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
    guardians_json = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )
    professional_links_json = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

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
            "gender_identity",
            "photo",
            "record_number",
            "marital_status",
            "education",
            "profession",
            "occupation",
            "phone",
            "email",
            "address",
            "zip_code",
            "address_number",
            "address_complement",
            "district",
            "city",
            "state",
            "has_health_plan",
            "health_plan",
            "health_plan_card",
            "referral_source",
            "emergency_contact_name",
            "emergency_contact_phone",
            "status",
            "is_active",
            "guardians",
            "guardians_json",
            "professional_links",
            "professional_links_json",
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

    def _parse_json_list(self, value, field_name):
        if value in (None, ""):
            return []

        try:
            parsed_value = json.loads(value)
        except (TypeError, json.JSONDecodeError) as exc:
            raise serializers.ValidationError(
                {field_name: "Formato inválido."},
            ) from exc

        if not isinstance(parsed_value, list):
            raise serializers.ValidationError(
                {field_name: "Informe uma lista válida."},
            )

        return parsed_value

    def create(self, validated_data):
        validated_data["guardians"] = validated_data.pop(
            "guardians_json",
            validated_data.get("guardians", []),
        )
        validated_data["professional_links"] = validated_data.pop(
            "professional_links_json",
            validated_data.get("professional_links", []),
        )
        guardians = validated_data.pop("guardians", [])
        professional_links = validated_data.pop("professional_links", [])
        patient = Patient.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

        for guardian in guardians:
            Guardian.objects.create(patient=patient, **guardian)

        for link in professional_links:
            professional = link.get("professional")
            if hasattr(professional, "id"):
                ProfessionalPatient.objects.create(patient=patient, **link)
            else:
                ProfessionalPatient.objects.create(
                    patient=patient,
                    professional_id=professional,
                    is_primary=link.get("is_primary", False),
                    is_active=link.get("is_active", True),
                )

        return patient

    def update(self, instance, validated_data):
        validated_data.pop("guardians", None)
        validated_data.pop("guardians_json", None)
        validated_data.pop("professional_links", None)
        validated_data.pop("professional_links_json", None)
        return super().update(instance, validated_data)

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam dados de pacientes."
            )

        attrs["guardians_json"] = self._parse_json_list(
            attrs.get("guardians_json"),
            "guardians_json",
        )
        attrs["professional_links_json"] = self._parse_json_list(
            attrs.get("professional_links_json"),
            "professional_links_json",
        )
        professional_links = attrs.get("professional_links_json", [])
        if professional_links:
            visible_professionals = professionals_visible_to_user(
                self.context["request"].user,
            )
            for link in professional_links:
                professional_id = link.get("professional")
                if not visible_professionals.filter(id=professional_id).exists():
                    raise serializers.ValidationError(
                        "Profissional não encontrado."
                    )

        return attrs
