from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.medical_records.views import (
    MedicalRecordAuditEventViewSet,
    MedicalRecordEntryViewSet,
)

router = DefaultRouter()
router.register(
    "audit",
    MedicalRecordAuditEventViewSet,
    basename="medical-record-audit",
)
router.register("", MedicalRecordEntryViewSet, basename="medical-record")

urlpatterns = [path("", include(router.urls))]
