from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.psychological_assessments.views import (
    AssessmentDocumentViewSet,
    AssessmentInstrumentViewSet,
    AssessmentResultViewSet,
    AssessmentSessionViewSet,
    AssessmentViewSet,
    InstrumentApplicationViewSet,
)

router = DefaultRouter()
router.register(
    "instrument-catalog",
    AssessmentInstrumentViewSet,
    basename="assessment-instrument",
)
router.register("sessions", AssessmentSessionViewSet, basename="assessment-session")
router.register(
    "instruments",
    InstrumentApplicationViewSet,
    basename="instrument-application",
)
router.register("results", AssessmentResultViewSet, basename="assessment-result")
router.register("documents", AssessmentDocumentViewSet, basename="assessment-document")
router.register("", AssessmentViewSet, basename="psychological-assessment")

urlpatterns = [path("", include(router.urls))]
