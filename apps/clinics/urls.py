from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.clinics.views import ClinicStaffViewSet, ClinicViewSet

router = DefaultRouter()
router.register("staff", ClinicStaffViewSet, basename="clinic-staff")
router.register("", ClinicViewSet, basename="clinic")

urlpatterns = [path("", include(router.urls))]
