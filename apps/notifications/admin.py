from django.contrib import admin

from apps.notifications.models import Notification, NotificationTemplate


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "clinic", "event_type", "channel", "is_active"]
    list_filter = ["event_type", "channel", "is_active", "clinic"]
    search_fields = ["name", "subject", "body"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["recipient", "clinic", "event_type", "channel", "status"]
    list_filter = ["event_type", "channel", "status", "clinic"]
    search_fields = ["recipient", "subject", "body", "provider_message_id"]
