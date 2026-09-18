from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.notifications.permissions import CanManageNotifications
from apps.notifications.selectors import (
    notification_templates_visible_to_user,
    notifications_visible_to_user,
)
from apps.notifications.serializers import (
    NotificationSerializer,
    NotificationTemplateSerializer,
)
from apps.notifications.tasks import send_notification


class NotificationTemplateViewSet(ModelViewSet):
    serializer_class = NotificationTemplateSerializer
    permission_classes = [CanManageNotifications]

    def get_queryset(self):
        queryset = notification_templates_visible_to_user(
            self.request.user
        ).select_related("clinic", "created_by")
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class NotificationViewSet(ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [CanManageNotifications]

    def get_queryset(self):
        queryset = notifications_visible_to_user(self.request.user).select_related(
            "clinic",
            "template",
            "patient",
            "appointment",
            "recipient_user",
            "created_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    @action(detail=True, methods=["post"])
    def queue(self, request, pk=None):
        notification = self.get_object()
        serializer = self.get_serializer(notification)
        serializer.queue(notification)
        return Response(self.get_serializer(notification).data)

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        notification = self.get_object()
        send_notification.delay(str(notification.id))
        serializer = self.get_serializer(notification)
        serializer.queue(notification)
        return Response(self.get_serializer(notification).data)
