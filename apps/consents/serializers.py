from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.clinics.selectors import clinics_visible_to_user
from apps.consents.models import ConsentRecord, ConsentStatus, ConsentTemplate
from apps.consents.selectors import consent_templates_visible_to_user
from apps.patients.selectors import patients_visible_to_user


class ConsentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentTemplate
        fields = [
            "id",
            "clinic",
            "title",
            "template_type",
            "version",
            "body",
            "is_required",
            "is_active",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Operador da plataforma sem acesso.")
        return attrs

    def create(self, validated_data):
        return ConsentTemplate.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )


class ConsentRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    template_title = serializers.CharField(source="template.title", read_only=True)
    accepted_by_name = serializers.CharField(
        source="accepted_by.full_name",
        read_only=True,
    )

    class Meta:
        model = ConsentRecord
        fields = [
            "id",
            "clinic",
            "template",
            "template_title",
            "patient",
            "patient_name",
            "subject_user",
            "status",
            "accepted_by",
            "accepted_by_name",
            "accepted_at",
            "revoked_at",
            "ip_address",
            "user_agent",
            "document_title",
            "document_type",
            "document_version",
            "document_body",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "template_title",
            "patient_name",
            "accepted_by",
            "accepted_by_name",
            "accepted_at",
            "revoked_at",
            "document_title",
            "document_type",
            "document_version",
            "document_body",
            "created_at",
            "updated_at",
        ]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate_template(self, template):
        request = self.context["request"]
        if (
            not consent_templates_visible_to_user(request.user)
            .filter(id=template.id)
            .exists()
        ):
            raise serializers.ValidationError("Termo não encontrado.")
        return template

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
        for field in ConsentRecord._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        template = attrs.get("template") or getattr(self.instance, "template", None)
        if template and not self.instance:
            data.update(
                {
                    "accepted_by": self.context["request"].user,
                    "document_title": template.title,
                    "document_type": template.template_type,
                    "document_version": template.version,
                    "document_body": template.body,
                }
            )

        record = ConsentRecord(**data)
        if self.instance:
            record.pk = self.instance.pk

        try:
            record.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    def create(self, validated_data):
        template = validated_data["template"]
        return ConsentRecord.objects.create(
            **validated_data,
            accepted_by=self.context["request"].user,
            document_title=template.title,
            document_type=template.template_type,
            document_version=template.version,
            document_body=template.body,
        )

    def revoke(self, instance):
        instance.status = ConsentStatus.REVOKED
        instance.revoked_at = timezone.now()
        instance.save(update_fields=["status", "revoked_at", "updated_at"])
        return instance
