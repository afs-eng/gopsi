from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.privacy.views import DataSubjectRequestViewSet

router = DefaultRouter()
router.register("requests", DataSubjectRequestViewSet, basename="privacy-request")

urlpatterns = [path("", include(router.urls))]
