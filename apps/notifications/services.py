from abc import ABC, abstractmethod
from dataclasses import dataclass
from uuid import uuid4

from django.utils import timezone

from apps.notifications.models import Notification, NotificationStatus


@dataclass(frozen=True)
class NotificationDelivery:
    provider: str
    provider_message_id: str


class NotificationProvider(ABC):
    name = "internal"

    @abstractmethod
    def send(self, notification: Notification) -> NotificationDelivery:
        """Send a notification through a concrete provider."""


class InternalNotificationProvider(NotificationProvider):
    name = "internal"

    def send(self, notification: Notification) -> NotificationDelivery:
        return NotificationDelivery(
            provider=self.name,
            provider_message_id=f"internal-{uuid4()}",
        )


def get_notification_provider(channel: str) -> NotificationProvider:
    return InternalNotificationProvider()


class NotificationService:
    def queue_notification(self, notification: Notification) -> Notification:
        notification.status = NotificationStatus.QUEUED
        notification.save(update_fields=["status", "updated_at"])
        return notification

    def send_notification(self, notification: Notification) -> Notification:
        if notification.status == NotificationStatus.CANCELLED:
            return notification

        provider = get_notification_provider(notification.channel)
        try:
            delivery = provider.send(notification)
        except Exception as error:
            notification.status = NotificationStatus.FAILED
            notification.failed_at = timezone.now()
            notification.failure_reason = str(error)
            notification.save(
                update_fields=[
                    "status",
                    "failed_at",
                    "failure_reason",
                    "updated_at",
                ]
            )
            return notification

        notification.status = NotificationStatus.SENT
        notification.sent_at = timezone.now()
        notification.provider = delivery.provider
        notification.provider_message_id = delivery.provider_message_id
        notification.save(
            update_fields=[
                "status",
                "sent_at",
                "provider",
                "provider_message_id",
                "updated_at",
            ]
        )
        return notification
