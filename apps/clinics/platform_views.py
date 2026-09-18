from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.clinics.models import Clinic
from apps.clinics.platform_permissions import IsPlatformOperator
from apps.clinics.platform_serializers import PlatformClinicSerializer


class PlatformClinicViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    serializer_class = PlatformClinicSerializer
    permission_classes = [IsPlatformOperator]

    def get_queryset(self):
        return Clinic.objects.all()

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        clinic = self.get_object()
        clinic.is_active = False
        clinic.save(update_fields=["is_active", "updated_at"])
        return Response(self.get_serializer(clinic).data)
