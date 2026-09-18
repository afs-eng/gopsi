from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.audit.permissions import CanViewClinicalAudit
from apps.audit.selectors import audit_events_visible_to_user
from apps.audit.serializers import AuditEventSerializer


class AuditEventViewSet(ReadOnlyModelViewSet):
    serializer_class = AuditEventSerializer
    permission_classes = [CanViewClinicalAudit]

    def get_queryset(self):
        queryset = audit_events_visible_to_user(self.request.user).select_related(
            "clinic", "actor"
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        action = self.request.query_params.get("action")
        if action:
            queryset = queryset.filter(action=action)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset
