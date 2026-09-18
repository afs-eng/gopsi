from rest_framework.viewsets import ModelViewSet

from apps.privacy.permissions import CanManagePrivacyRequests
from apps.privacy.selectors import data_subject_requests_visible_to_user
from apps.privacy.serializers import DataSubjectRequestSerializer


class DataSubjectRequestViewSet(ModelViewSet):
    serializer_class = DataSubjectRequestSerializer
    permission_classes = [CanManagePrivacyRequests]

    def get_queryset(self):
        queryset = data_subject_requests_visible_to_user(
            self.request.user
        ).select_related(
            "clinic", "patient", "subject_user", "created_by", "handled_by"
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset
