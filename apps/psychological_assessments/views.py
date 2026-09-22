from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.audit.models import AuditAction
from apps.audit.services import record_audit_event
from apps.psychological_assessments.models import (
    AssessmentDocument,
    AssessmentInstrument,
    AssessmentPlan,
    AssessmentResult,
    AssessmentResultStatus,
    AssessmentSession,
    AssessmentTimelineEvent,
    AssessmentTimelineEventType,
    InstrumentApplication,
)
from apps.psychological_assessments.permissions import CanAccessPsychologicalAssessments
from apps.psychological_assessments.selectors import (
    assessments_visible_to_user,
    clinical_assessments_visible_to_user,
)
from apps.psychological_assessments.serializers import (
    AssessmentCancelSerializer,
    AssessmentDocumentSerializer,
    AssessmentInstrumentSerializer,
    AssessmentPlanSerializer,
    AssessmentResultSerializer,
    AssessmentResultVoidSerializer,
    AssessmentSerializer,
    AssessmentSessionSerializer,
    InstrumentApplicationSerializer,
)


def record_timeline_event(
    *,
    assessment,
    event_type,
    title,
    request,
    description="",
    metadata=None,
):
    AssessmentTimelineEvent.objects.create(
        assessment=assessment,
        event_type=event_type,
        title=title,
        description=description,
        metadata=metadata or {},
        created_by=request.user if request and request.user.is_authenticated else None,
    )


def record_assessment_child_audit(
    *,
    action,
    request,
    assessment,
    resource_type,
    resource_id,
    metadata=None,
):
    record_audit_event(
        action=action,
        request=request,
        clinic=assessment.clinic,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata={
            "assessment": str(assessment.id),
            "assessment_code": assessment.code,
            **(metadata or {}),
        },
    )


class AssessmentInstrumentViewSet(ReadOnlyModelViewSet):
    serializer_class = AssessmentInstrumentSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return AssessmentInstrument.objects.filter(is_active=True).order_by(
            "category",
            "name",
        )


class AssessmentViewSet(ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        queryset = (
            assessments_visible_to_user(self.request.user)
            .select_related(
                "clinic", "patient", "professional", "created_by", "updated_by"
            )
            .prefetch_related(
                "sessions",
                "timeline_events",
                "instrument_applications",
                "assessment_documents__document",
            )
        )
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)

        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        professional_id = self.request.query_params.get("professional")
        if professional_id:
            queryset = queryset.filter(professional_id=professional_id)

        if (
            self.action == "list"
            and not clinic_id
        ):
            return queryset.none()

        return queryset

    def perform_create(self, serializer):
        assessment = serializer.save()
        record_audit_event(
            action=AuditAction.ASSESSMENT_CREATE,
            request=self.request,
            clinic=assessment.clinic,
            resource_type="psychological_assessment",
            resource_id=assessment.id,
            metadata={"code": assessment.code, "status": assessment.status},
        )
        record_timeline_event(
            assessment=assessment,
            event_type=AssessmentTimelineEventType.CREATED,
            title="Avaliação criada",
            request=self.request,
            metadata={"code": assessment.code, "status": assessment.status},
        )

    def perform_update(self, serializer):
        assessment = serializer.save()
        record_audit_event(
            action=AuditAction.ASSESSMENT_UPDATE,
            request=self.request,
            clinic=assessment.clinic,
            resource_type="psychological_assessment",
            resource_id=assessment.id,
            metadata={"code": assessment.code, "status": assessment.status},
        )
        record_timeline_event(
            assessment=assessment,
            event_type=AssessmentTimelineEventType.UPDATED,
            title="Avaliação atualizada",
            request=self.request,
            metadata={"code": assessment.code, "status": assessment.status},
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        assessment = self.get_object()
        cancel_serializer = AssessmentCancelSerializer(data=request.data)
        cancel_serializer.is_valid(raise_exception=True)
        serializer = self.get_serializer(assessment)
        reason = cancel_serializer.validated_data["reason"]
        serializer.cancel(assessment, reason)
        record_audit_event(
            action=AuditAction.ASSESSMENT_CANCEL,
            request=request,
            clinic=assessment.clinic,
            resource_type="psychological_assessment",
            resource_id=assessment.id,
            metadata={"code": assessment.code, "reason": reason},
        )
        record_timeline_event(
            assessment=assessment,
            event_type=AssessmentTimelineEventType.CANCELLED,
            title="Avaliação cancelada",
            description=reason,
            request=request,
            metadata={"code": assessment.code},
        )
        return Response(self.get_serializer(assessment).data)

    def perform_destroy(self, instance):
        serializer = self.get_serializer(instance)
        reason = "Cancelamento por remoção via API."
        serializer.cancel(instance, reason)
        record_audit_event(
            action=AuditAction.ASSESSMENT_CANCEL,
            request=self.request,
            clinic=instance.clinic,
            resource_type="psychological_assessment",
            resource_id=instance.id,
            metadata={"code": instance.code, "reason": reason},
        )
        record_timeline_event(
            assessment=instance,
            event_type=AssessmentTimelineEventType.CANCELLED,
            title="Avaliação cancelada",
            description=reason,
            request=self.request,
            metadata={"code": instance.code},
        )


class AssessmentSessionViewSet(ModelViewSet):
    serializer_class = AssessmentSessionSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return AssessmentSession.objects.filter(
            assessment__in=clinical_assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic")

    def perform_create(self, serializer):
        session = serializer.save()
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_SESSION_CREATE,
            request=self.request,
            assessment=session.assessment,
            resource_type="assessment_session",
            resource_id=session.id,
            metadata={
                "status": session.status,
                "session_date": session.session_date.isoformat(),
            },
        )
        record_timeline_event(
            assessment=session.assessment,
            event_type=AssessmentTimelineEventType.SESSION_REGISTERED,
            title="Sessão registrada",
            description=session.objective,
            request=self.request,
            metadata={
                "session_id": str(session.id),
                "status": session.status,
                "session_date": session.session_date.isoformat(),
            },
        )

    def perform_update(self, serializer):
        session = serializer.save()
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_SESSION_UPDATE,
            request=self.request,
            assessment=session.assessment,
            resource_type="assessment_session",
            resource_id=session.id,
            metadata={"status": session.status},
        )

    def perform_destroy(self, instance):
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_SESSION_DELETE,
            request=self.request,
            assessment=instance.assessment,
            resource_type="assessment_session",
            resource_id=instance.id,
            metadata={"status": instance.status},
        )
        instance.delete()


class AssessmentPlanViewSet(ModelViewSet):
    serializer_class = AssessmentPlanSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return (
            AssessmentPlan.objects.filter(
                assessment__in=clinical_assessments_visible_to_user(self.request.user),
            )
            .select_related(
                "assessment",
                "assessment__clinic",
                "created_by",
                "updated_by",
            )
            .prefetch_related("planned_instruments")
        )

    def perform_create(self, serializer):
        plan = serializer.save()
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_PLAN_CREATE,
            request=self.request,
            assessment=plan.assessment,
            resource_type="assessment_plan",
            resource_id=plan.id,
        )
        record_timeline_event(
            assessment=plan.assessment,
            event_type=AssessmentTimelineEventType.PLANNED,
            title="Planejamento registrado",
            description=plan.question,
            request=self.request,
            metadata={"plan_id": str(plan.id)},
        )

    def perform_update(self, serializer):
        plan = serializer.save()
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_PLAN_UPDATE,
            request=self.request,
            assessment=plan.assessment,
            resource_type="assessment_plan",
            resource_id=plan.id,
        )
        record_timeline_event(
            assessment=plan.assessment,
            event_type=AssessmentTimelineEventType.PLANNED,
            title="Planejamento atualizado",
            description=plan.question,
            request=self.request,
            metadata={"plan_id": str(plan.id)},
        )


class InstrumentApplicationViewSet(ModelViewSet):
    serializer_class = InstrumentApplicationSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return InstrumentApplication.objects.filter(
            assessment__in=clinical_assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic", "session")

    def perform_create(self, serializer):
        application = serializer.save()
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_INSTRUMENT_CREATE,
            request=self.request,
            assessment=application.assessment,
            resource_type="instrument_application",
            resource_id=application.id,
            metadata={"status": application.status},
        )

    def perform_update(self, serializer):
        application = serializer.save()
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_INSTRUMENT_UPDATE,
            request=self.request,
            assessment=application.assessment,
            resource_type="instrument_application",
            resource_id=application.id,
            metadata={"status": application.status},
        )

    def perform_destroy(self, instance):
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_INSTRUMENT_DELETE,
            request=self.request,
            assessment=instance.assessment,
            resource_type="instrument_application",
            resource_id=instance.id,
            metadata={"status": instance.status},
        )
        instance.delete()


class AssessmentResultViewSet(ModelViewSet):
    serializer_class = AssessmentResultSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return AssessmentResult.objects.filter(
            assessment__in=clinical_assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic", "created_by", "updated_by")

    def perform_create(self, serializer):
        result = serializer.save()
        is_final = result.status == AssessmentResultStatus.FINAL
        record_timeline_event(
            assessment=result.assessment,
            event_type=(
                AssessmentTimelineEventType.RESULT_FINALIZED
                if is_final
                else AssessmentTimelineEventType.RESULT_CREATED
            ),
            title="Resultado finalizado" if is_final else "Resultado criado",
            request=self.request,
            metadata={"result_id": str(result.id), "status": result.status},
        )

    def perform_update(self, serializer):
        result = serializer.save()
        if result.status == AssessmentResultStatus.FINAL:
            record_timeline_event(
                assessment=result.assessment,
                event_type=AssessmentTimelineEventType.RESULT_FINALIZED,
                title="Resultado finalizado",
                request=self.request,
                metadata={"result_id": str(result.id), "status": result.status},
            )

    @action(detail=True, methods=["post"])
    def finalize(self, request, pk=None):
        result = self.get_object()
        try:
            result.finalize(user=request.user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
        record_audit_event(
            action=AuditAction.ASSESSMENT_RESULT_FINALIZE,
            request=request,
            clinic=result.assessment.clinic,
            resource_type="assessment_result",
            resource_id=result.id,
            metadata={"assessment": str(result.assessment_id)},
        )
        record_timeline_event(
            assessment=result.assessment,
            event_type=AssessmentTimelineEventType.RESULT_FINALIZED,
            title="Resultado finalizado",
            request=request,
            metadata={"result_id": str(result.id), "status": result.status},
        )
        return Response(self.get_serializer(result).data)

    @action(detail=True, methods=["post"])
    def void(self, request, pk=None):
        result = self.get_object()
        void_serializer = AssessmentResultVoidSerializer(data=request.data)
        void_serializer.is_valid(raise_exception=True)
        reason = void_serializer.validated_data["reason"]
        try:
            result.void(reason=reason, user=request.user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
        record_audit_event(
            action=AuditAction.ASSESSMENT_RESULT_VOID,
            request=request,
            clinic=result.assessment.clinic,
            resource_type="assessment_result",
            resource_id=result.id,
            metadata={"assessment": str(result.assessment_id), "reason": reason},
        )
        record_timeline_event(
            assessment=result.assessment,
            event_type=AssessmentTimelineEventType.RESULT_VOIDED,
            title="Resultado anulado",
            description=reason,
            request=request,
            metadata={"result_id": str(result.id), "status": result.status},
        )
        return Response(self.get_serializer(result).data)


class AssessmentDocumentViewSet(ModelViewSet):
    serializer_class = AssessmentDocumentSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return AssessmentDocument.objects.filter(
            assessment__in=clinical_assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic", "document")

    def perform_create(self, serializer):
        document_link = serializer.save()
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_DOCUMENT_LINK,
            request=self.request,
            assessment=document_link.assessment,
            resource_type="assessment_document",
            resource_id=document_link.id,
            metadata={
                "document": str(document_link.document_id),
                "document_type": document_link.document_type,
            },
        )

    def perform_destroy(self, instance):
        record_assessment_child_audit(
            action=AuditAction.ASSESSMENT_DOCUMENT_UNLINK,
            request=self.request,
            assessment=instance.assessment,
            resource_type="assessment_document",
            resource_id=instance.id,
            metadata={
                "document": str(instance.document_id),
                "document_type": instance.document_type,
            },
        )
        instance.delete()
