from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.clinics.selectors import clinics_visible_to_user
from apps.documents.selectors import generated_documents_visible_to_user
from apps.patients.selectors import patients_visible_to_user
from apps.professionals.selectors import professionals_visible_to_user
from apps.psychological_assessments.models import (
    Assessment,
    AssessmentDocument,
    AssessmentResult,
    AssessmentResultStatus,
    AssessmentSession,
    InstrumentApplication,
)
from apps.psychological_assessments.selectors import assessments_visible_to_user


class AssessmentSessionSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam avaliações."
            )
        return attrs

    class Meta:
        model = AssessmentSession
        fields = [
            "id",
            "assessment",
            "session_date",
            "start_time",
            "end_time",
            "status",
            "administrative_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not assessments_visible_to_user(request.user)
            .filter(id=assessment.id)
            .exists()
        ):
            raise serializers.ValidationError("Avaliação não encontrada.")
        return assessment


class InstrumentApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstrumentApplication
        fields = [
            "id",
            "assessment",
            "session",
            "instrument_name",
            "application_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not assessments_visible_to_user(request.user)
            .filter(id=assessment.id)
            .exists()
        ):
            raise serializers.ValidationError("Avaliação não encontrada.")
        return assessment

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam avaliações."
            )

        data = {}
        for field in InstrumentApplication._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        application = InstrumentApplication(**data)
        if self.instance:
            application.pk = self.instance.pk

        try:
            application.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs


class AssessmentResultSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam resultados de avaliações."
            )
        return attrs

    class Meta:
        model = AssessmentResult
        fields = [
            "id",
            "assessment",
            "status",
            "summary",
            "recommendations",
            "finalized_at",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "finalized_at",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not assessments_visible_to_user(request.user)
            .filter(id=assessment.id)
            .exists()
        ):
            raise serializers.ValidationError("Avaliação não encontrada.")
        return assessment

    def create(self, validated_data):
        if validated_data.get("status") == AssessmentResultStatus.FINAL:
            validated_data["finalized_at"] = timezone.now()
        return AssessmentResult.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.updated_by = self.context["request"].user
        if (
            instance.status == AssessmentResultStatus.FINAL
            and not instance.finalized_at
        ):
            instance.finalized_at = timezone.now()
        instance.save()
        return instance


class AssessmentDocumentSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source="document.title", read_only=True)

    class Meta:
        model = AssessmentDocument
        fields = [
            "id",
            "assessment",
            "document",
            "document_title",
            "document_type",
            "created_at",
        ]
        read_only_fields = ["id", "document_title", "created_at"]

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not assessments_visible_to_user(request.user)
            .filter(id=assessment.id)
            .exists()
        ):
            raise serializers.ValidationError("Avaliação não encontrada.")
        return assessment

    def validate_document(self, document):
        request = self.context["request"]
        if (
            not generated_documents_visible_to_user(request.user)
            .filter(id=document.id)
            .exists()
        ):
            raise serializers.ValidationError("Documento não encontrado.")
        return document

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam avaliações."
            )

        data = {}
        for field in AssessmentDocument._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        link = AssessmentDocument(**data)
        if self.instance:
            link.pk = self.instance.pk

        try:
            link.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs


class AssessmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )
    sessions = AssessmentSessionSerializer(many=True, read_only=True)
    instrument_applications = InstrumentApplicationSerializer(many=True, read_only=True)
    result = AssessmentResultSerializer(read_only=True)
    assessment_documents = AssessmentDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = [
            "id",
            "clinic",
            "patient",
            "patient_name",
            "professional",
            "professional_name",
            "title",
            "reason",
            "status",
            "started_at",
            "completed_at",
            "sessions",
            "instrument_applications",
            "result",
            "assessment_documents",
            "created_by",
            "updated_by",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient_name",
            "professional_name",
            "sessions",
            "instrument_applications",
            "result",
            "assessment_documents",
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
            id=professional.id
        ).exists():
            raise serializers.ValidationError("Profissional não autorizado.")
        return professional

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam avaliações."
            )

        data = {}
        for field in Assessment._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        if not self.instance:
            data["created_by"] = self.context["request"].user

        assessment = Assessment(**data)
        if self.instance:
            assessment.pk = self.instance.pk

        try:
            assessment.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    def create(self, validated_data):
        return Assessment.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.updated_by = self.context["request"].user
        instance.save()
        return instance

    def cancel(self, instance):
        instance.status = "CANCELLED"
        instance.is_active = False
        instance.updated_by = self.context["request"].user
        instance.save(update_fields=["status", "is_active", "updated_by", "updated_at"])
        return instance
