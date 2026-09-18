from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.clinics.platform_views import PlatformClinicViewSet

router = DefaultRouter()
router.register("clinics", PlatformClinicViewSet, basename="platform-clinic")

urlpatterns = [path("", include(router.urls))]
