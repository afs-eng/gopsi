from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.consents.views import ConsentRecordViewSet, ConsentTemplateViewSet

router = DefaultRouter()
router.register("templates", ConsentTemplateViewSet, basename="consent-template")
router.register("", ConsentRecordViewSet, basename="consent-record")

urlpatterns = [path("", include(router.urls))]
