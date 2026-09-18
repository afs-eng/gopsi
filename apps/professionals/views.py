from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.professionals.models import ProfessionalStatus, Specialty
from apps.professionals.permissions import CanManageClinicProfessionals
from apps.professionals.selectors import professionals_visible_to_user
from apps.professionals.serializers import ProfessionalSerializer, SpecialtySerializer


class SpecialtyViewSet(ReadOnlyModelViewSet):
    serializer_class = SpecialtySerializer
    queryset = Specialty.objects.filter(is_active=True)


class ProfessionalViewSet(ModelViewSet):
    serializer_class = ProfessionalSerializer
    permission_classes = [CanManageClinicProfessionals]

    def get_queryset(self):
        queryset = professionals_visible_to_user(self.request.user).select_related(
            "clinic", "user"
        )
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            return queryset.filter(clinic_id=clinic_id)

        if self.action == "list":
            return queryset.none()

        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.status = ProfessionalStatus.INACTIVE
        instance.save(update_fields=["is_active", "status", "updated_at"])
