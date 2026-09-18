from celery import shared_task
from django.utils import timezone

from apps.notifications.models import Notification, NotificationStatus
from apps.notifications.services import NotificationService


@shared_task
def send_notification(notification_id: str):
    notification = Notification.objects.get(id=notification_id)
    return str(NotificationService().send_notification(notification).id)


@shared_task
def send_due_notifications():
    notification_ids = list(
        Notification.objects.filter(
            status=NotificationStatus.QUEUED,
            scheduled_at__lte=timezone.now(),
        ).values_list("id", flat=True)
    )
    for notification_id in notification_ids:
        send_notification.delay(str(notification_id))
    return len(notification_ids)
