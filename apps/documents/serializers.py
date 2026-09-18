from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.clinics.selectors import clinics_visible_to_user
from apps.documents.models import (
    DocumentTemplate,
    GeneratedDocument,
    GeneratedDocumentStatus,
)
from apps.documents.selectors import document_templates_visible_to_user
from apps.patients.selectors import patients_visible_to_user
from apps.professionals.selectors import professionals_visible_to_user


class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = [
            "id",
            "clinic",
            "name",
            "template_type",
            "body",
            "created_by",
            "is_active",
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
        return DocumentTemplate.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )


class GeneratedDocumentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )
    template_name = serializers.CharField(source="template.name", read_only=True)

    class Meta:
        model = GeneratedDocument
        fields = [
            "id",
            "clinic",
            "template",
            "template_name",
            "patient",
            "patient_name",
            "professional",
            "professional_name",
            "title",
            "content",
            "status",
            "signed_at",
            "created_by",
            "updated_by",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "template_name",
            "patient_name",
            "professional_name",
            "signed_at",
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

    def validate_template(self, template):
        if template is None:
            return template
        request = self.context["request"]
        if (
            not document_templates_visible_to_user(request.user)
            .filter(id=template.id)
            .exists()
        ):
            raise serializers.ValidationError("Modelo não encontrado.")
        return template

    def validate_patient(self, patient):
        if patient is None:
            return patient
        request = self.context["request"]
        if not patients_visible_to_user(request.user).filter(id=patient.id).exists():
            raise serializers.ValidationError("Paciente não encontrado.")
        return patient

    def validate_professional(self, professional):
        if professional is None:
            return professional
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
            raise serializers.ValidationError("Operador da plataforma sem acesso.")

        data = {}
        for field in GeneratedDocument._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        if not self.instance:
            data["created_by"] = self.context["request"].user

        document = GeneratedDocument(**data)
        if self.instance:
            document.pk = self.instance.pk

        try:
            document.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    def create(self, validated_data):
        return GeneratedDocument.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.updated_by = self.context["request"].user
        if instance.status == GeneratedDocumentStatus.SIGNED and not instance.signed_at:
            instance.signed_at = timezone.now()
        instance.save()
        return instance

    def void(self, instance):
        instance.status = GeneratedDocumentStatus.VOIDED
        instance.is_active = False
        instance.updated_by = self.context["request"].user
        instance.save(update_fields=["status", "is_active", "updated_by", "updated_at"])
        return instance
