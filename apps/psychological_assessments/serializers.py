from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.clinics.policies import is_clinic_admin
from apps.clinics.selectors import clinics_visible_to_user
from apps.documents.selectors import generated_documents_visible_to_user
from apps.patients.selectors import patients_visible_to_user
from apps.professionals.selectors import professionals_visible_to_user
from apps.psychological_assessments.models import (
    Assessment,
    AssessmentDocument,
    AssessmentInstrument,
    AssessmentPlan,
    AssessmentResult,
    AssessmentResultStatus,
    AssessmentSession,
    AssessmentStatus,
    AssessmentTimelineEvent,
    InstrumentApplication,
)
from apps.psychological_assessments.selectors import (
    can_access_clinical_assessment_content,
    clinical_assessments_visible_to_user,
)


class AssessmentInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentInstrument
        fields = [
            "id",
            "code",
            "name",
            "category",
            "version",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AssessmentTimelineEventSerializer(serializers.ModelSerializer):
    event_type_label = serializers.CharField(
        source="get_event_type_display",
        read_only=True,
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True,
    )

    class Meta:
        model = AssessmentTimelineEvent
        fields = [
            "id",
            "assessment",
            "event_type",
            "event_type_label",
            "title",
            "description",
            "metadata",
            "created_by",
            "created_by_name",
            "created_at",
        ]
        read_only_fields = fields


class AssessmentCancelSerializer(serializers.Serializer):
    reason = serializers.CharField(allow_blank=False, trim_whitespace=True)


class AssessmentResultVoidSerializer(serializers.Serializer):
    reason = serializers.CharField(allow_blank=False, trim_whitespace=True)


class AssessmentPlanSerializer(serializers.ModelSerializer):
    planned_instruments = serializers.PrimaryKeyRelatedField(
        queryset=AssessmentInstrument.objects.filter(is_active=True),
        many=True,
        required=False,
    )
    planned_instrument_names = serializers.SerializerMethodField()

    class Meta:
        model = AssessmentPlan
        fields = [
            "id",
            "assessment",
            "question",
            "hypotheses",
            "domains",
            "procedures",
            "planned_instruments",
            "planned_instrument_names",
            "notes",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "planned_instrument_names",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def get_planned_instrument_names(self, obj):
        return [instrument.name for instrument in obj.planned_instruments.all()]

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not clinical_assessments_visible_to_user(request.user)
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
        return attrs

    def create(self, validated_data):
        instruments = validated_data.pop("planned_instruments", [])
        plan = AssessmentPlan.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )
        plan.planned_instruments.set(instruments)
        return plan

    def update(self, instance, validated_data):
        instruments = validated_data.pop("planned_instruments", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.updated_by = self.context["request"].user
        instance.save()
        if instruments is not None:
            instance.planned_instruments.set(instruments)
        return instance


class AssessmentSessionSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )

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
            "professional",
            "professional_name",
            "session_date",
            "start_time",
            "end_time",
            "modality",
            "status",
            "objective",
            "procedures",
            "administrative_notes",
            "permitted_observations",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "professional_name",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not clinical_assessments_visible_to_user(request.user)
            .filter(id=assessment.id)
            .exists()
        ):
            raise serializers.ValidationError("Avaliação não encontrada.")
        return assessment

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

    def create(self, validated_data):
        if not validated_data.get("professional"):
            validated_data["professional"] = validated_data["assessment"].professional
        return AssessmentSession.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.updated_by = self.context["request"].user
        instance.save()
        return instance


class InstrumentApplicationSerializer(serializers.ModelSerializer):
    instrument_code = serializers.CharField(source="instrument.code", read_only=True)
    instrument_catalog_name = serializers.CharField(
        source="instrument.name",
        read_only=True,
    )
    applied_by_name = serializers.CharField(
        source="applied_by.full_name",
        read_only=True,
    )
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.full_name",
        read_only=True,
    )

    class Meta:
        model = InstrumentApplication
        fields = [
            "id",
            "assessment",
            "session",
            "instrument",
            "instrument_code",
            "instrument_catalog_name",
            "instrument_name",
            "applied_by",
            "applied_by_name",
            "reviewed_by",
            "reviewed_by_name",
            "application_date",
            "reviewed_at",
            "status",
            "notes",
            "raw_payload",
            "computed_payload",
            "classified_payload",
            "reviewed_payload",
            "interpretation_text",
            "is_validated",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "instrument_code",
            "instrument_catalog_name",
            "applied_by_name",
            "reviewed_by_name",
            "reviewed_at",
            "computed_payload",
            "classified_payload",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {"instrument_name": {"required": False, "allow_blank": True}}

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not clinical_assessments_visible_to_user(request.user)
            .filter(id=assessment.id)
            .exists()
        ):
            raise serializers.ValidationError("Avaliação não encontrada.")
        return assessment

    def validate_applied_by(self, professional):
        return self._validate_professional(professional)

    def validate_reviewed_by(self, professional):
        return self._validate_professional(professional)

    def _validate_professional(self, professional):
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
            raise serializers.ValidationError(
                "Operadores da plataforma não acessam avaliações."
            )
        if self.instance and self.instance.is_validated:
            raise serializers.ValidationError(
                "Aplicação validada não pode ser editada. Registre uma nova aplicação."
            )

        instrument = attrs.get("instrument") or getattr(
            self.instance,
            "instrument",
            None,
        )
        if instrument and not instrument.is_active:
            raise serializers.ValidationError("Instrumento inativo.")
        if instrument and not attrs.get("instrument_name"):
            attrs["instrument_name"] = instrument.name
        if attrs.get("is_validated") and not attrs.get("reviewed_at"):
            attrs["reviewed_at"] = timezone.now()

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
        if self.instance and self.instance.status == AssessmentResultStatus.FINAL:
            raise serializers.ValidationError(
                "Resultado finalizado não pode ser editado. "
                "Anule e registre novo resultado."
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
            "void_reason",
            "voided_at",
            "voided_by",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "finalized_at",
            "void_reason",
            "voided_at",
            "voided_by",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate_assessment(self, assessment):
        request = self.context["request"]
        if (
            not clinical_assessments_visible_to_user(request.user)
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
            not clinical_assessments_visible_to_user(request.user)
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
    allowed_status_transitions = {
        AssessmentStatus.PLANNING: {
            AssessmentStatus.IN_PROGRESS,
            AssessmentStatus.CANCELLED,
        },
        AssessmentStatus.IN_PROGRESS: {
            AssessmentStatus.WAITING_INFORMATION,
            AssessmentStatus.WRITING,
            AssessmentStatus.CANCELLED,
        },
        AssessmentStatus.WAITING_INFORMATION: {
            AssessmentStatus.IN_PROGRESS,
            AssessmentStatus.WRITING,
            AssessmentStatus.CANCELLED,
        },
        AssessmentStatus.WRITING: {
            AssessmentStatus.WAITING_FEEDBACK,
            AssessmentStatus.COMPLETED,
            AssessmentStatus.CANCELLED,
        },
        AssessmentStatus.WAITING_FEEDBACK: {
            AssessmentStatus.WRITING,
            AssessmentStatus.COMPLETED,
            AssessmentStatus.CANCELLED,
        },
        AssessmentStatus.COMPLETED: set(),
        AssessmentStatus.CANCELLED: set(),
    }

    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    professional_name = serializers.CharField(
        source="professional.full_name",
        read_only=True,
    )
    assessment_type_label = serializers.CharField(
        source="get_assessment_type_display",
        read_only=True,
    )
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    sessions = AssessmentSessionSerializer(many=True, read_only=True)
    plan = AssessmentPlanSerializer(read_only=True)
    instrument_applications = InstrumentApplicationSerializer(many=True, read_only=True)
    result = AssessmentResultSerializer(read_only=True)
    assessment_documents = AssessmentDocumentSerializer(many=True, read_only=True)
    timeline_events = AssessmentTimelineEventSerializer(many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = [
            "id",
            "code",
            "clinic",
            "patient",
            "patient_name",
            "professional",
            "professional_name",
            "title",
            "assessment_type",
            "assessment_type_label",
            "purpose",
            "demand_origin",
            "requester",
            "reason",
            "objective",
            "status",
            "status_label",
            "started_at",
            "expected_at",
            "completed_at",
            "cancellation_reason",
            "cancelled_at",
            "cancelled_by",
            "plan",
            "sessions",
            "instrument_applications",
            "result",
            "assessment_documents",
            "timeline_events",
            "created_by",
            "updated_by",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "code",
            "patient_name",
            "professional_name",
            "assessment_type_label",
            "status_label",
            "cancellation_reason",
            "cancelled_at",
            "cancelled_by",
            "plan",
            "sessions",
            "instrument_applications",
            "result",
            "assessment_documents",
            "timeline_events",
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
        if is_clinic_admin(request.user, professional.clinic_id):
            return professional
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

        self._validate_status_transition(assessment)

        return attrs

    def _validate_status_transition(self, assessment):
        if not self.instance:
            if assessment.status == AssessmentStatus.COMPLETED:
                raise serializers.ValidationError(
                    "Crie e finalize o resultado antes de concluir a avaliação."
                )
            return

        current_status = self.instance.status
        next_status = assessment.status
        if current_status == next_status:
            return

        if next_status not in self.allowed_status_transitions[current_status]:
            raise serializers.ValidationError(
                f"Transição de {current_status} para {next_status} não permitida."
            )

        if next_status == AssessmentStatus.COMPLETED:
            try:
                result = self.instance.result
            except AssessmentResult.DoesNotExist:
                result = None
            if not result or result.status != AssessmentResultStatus.FINAL:
                raise serializers.ValidationError(
                    "Finalize o resultado antes de concluir a avaliação."
                )

    def create(self, validated_data):
        return Assessment.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and not can_access_clinical_assessment_content(
            request.user,
            instance,
        ):
            for field in [
                "purpose",
                "reason",
                "objective",
                "plan",
                "result",
            ]:
                data[field] = None if field in {"plan", "result"} else ""
            for field in [
                "sessions",
                "instrument_applications",
                "assessment_documents",
                "timeline_events",
            ]:
                data[field] = []
        return data

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.updated_by = self.context["request"].user
        instance.save()
        return instance

    def cancel(self, instance, reason):
        instance.cancel(reason=reason, user=self.context["request"].user)
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        return instance
