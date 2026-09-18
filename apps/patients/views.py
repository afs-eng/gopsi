from rest_framework.viewsets import ModelViewSet

from apps.patients.models import PatientStatus
from apps.patients.permissions import CanManageClinicPatients
from apps.patients.selectors import patients_visible_to_user
from apps.patients.serializers import PatientSerializer


class PatientViewSet(ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [CanManageClinicPatients]

    def get_queryset(self):
        queryset = patients_visible_to_user(self.request.user).prefetch_related(
            "guardians",
            "professional_links__professional",
        )
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            return queryset.filter(clinic_id=clinic_id)

        if self.action == "list" and not clinic_id:
            return queryset.none()

        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.status = PatientStatus.INACTIVE
        instance.save(update_fields=["is_active", "status", "updated_at"])
