from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet

from apps.clinics.permissions import IsClinicWorkspaceUser
from apps.clinics.selectors import clinics_visible_to_user
from apps.clinics.serializers import ClinicWorkspaceSerializer


class ClinicViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    serializer_class = ClinicWorkspaceSerializer
    permission_classes = [IsClinicWorkspaceUser]
    http_method_names = ["get", "head", "options", "patch", "put"]

    def get_queryset(self):
        return clinics_visible_to_user(self.request.user)
