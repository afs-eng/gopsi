from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.documents.views import DocumentTemplateViewSet, GeneratedDocumentViewSet

router = DefaultRouter()
router.register("templates", DocumentTemplateViewSet, basename="document-template")
router.register("", GeneratedDocumentViewSet, basename="generated-document")

urlpatterns = [path("", include(router.urls))]
