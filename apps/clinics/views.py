from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet, ModelViewSet

from apps.clinics.models import ClinicStaff, ClinicStaffStatus
from apps.clinics.permissions import IsClinicAdminForStaff, IsClinicWorkspaceUser
from apps.clinics.selectors import clinics_visible_to_user
from apps.clinics.serializers import ClinicStaffSerializer, ClinicWorkspaceSerializer


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


class ClinicStaffViewSet(ModelViewSet):
    serializer_class = ClinicStaffSerializer
    permission_classes = [IsClinicAdminForStaff]

    def get_queryset(self):
        queryset = ClinicStaff.objects.select_related("clinic", "user")
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            return queryset.filter(clinic_id=clinic_id)

        if self.action == "list":
            return queryset.none()

        return queryset

    def perform_destroy(self, instance):
        instance.status = ClinicStaffStatus.INACTIVE
        instance.access_enabled = False
        instance.is_active = False
        instance.save(
            update_fields=["status", "access_enabled", "is_active", "updated_at"]
        )
