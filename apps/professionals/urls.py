from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.professionals.views import ProfessionalViewSet, SpecialtyViewSet

router = DefaultRouter()
router.register("specialties", SpecialtyViewSet, basename="specialty")
router.register("", ProfessionalViewSet, basename="professional")

urlpatterns = [path("", include(router.urls))]
