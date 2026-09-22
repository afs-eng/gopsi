from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.psychological_assessments.models import (
    AssessmentDocument,
    AssessmentInstrument,
    AssessmentResult,
    AssessmentSession,
    InstrumentApplication,
)
from apps.psychological_assessments.permissions import CanAccessPsychologicalAssessments
from apps.psychological_assessments.selectors import assessments_visible_to_user
from apps.psychological_assessments.serializers import (
    AssessmentDocumentSerializer,
    AssessmentInstrumentSerializer,
    AssessmentResultSerializer,
    AssessmentSerializer,
    AssessmentSessionSerializer,
    InstrumentApplicationSerializer,
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

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        assessment = self.get_object()
        serializer = self.get_serializer(assessment)
        serializer.cancel(assessment)
        return Response(self.get_serializer(assessment).data)

    def perform_destroy(self, instance):
        serializer = self.get_serializer(instance)
        serializer.cancel(instance)


class AssessmentSessionViewSet(ModelViewSet):
    serializer_class = AssessmentSessionSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return AssessmentSession.objects.filter(
            assessment__in=assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic")


class InstrumentApplicationViewSet(ModelViewSet):
    serializer_class = InstrumentApplicationSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return InstrumentApplication.objects.filter(
            assessment__in=assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic", "session")


class AssessmentResultViewSet(ModelViewSet):
    serializer_class = AssessmentResultSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return AssessmentResult.objects.filter(
            assessment__in=assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic", "created_by", "updated_by")


class AssessmentDocumentViewSet(ModelViewSet):
    serializer_class = AssessmentDocumentSerializer
    permission_classes = [CanAccessPsychologicalAssessments]

    def get_queryset(self):
        return AssessmentDocument.objects.filter(
            assessment__in=assessments_visible_to_user(self.request.user),
        ).select_related("assessment", "assessment__clinic", "document")
