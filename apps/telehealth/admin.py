from django.contrib import admin

from apps.telehealth.models import TelehealthParticipantEvent, TelehealthSession


@admin.register(TelehealthSession)
class TelehealthSessionAdmin(admin.ModelAdmin):
    list_display = (
        "appointment",
        "clinic",
        "status",
        "provider",
        "expires_at",
        "is_active",
    )
    search_fields = ("external_room_id", "appointment__patient__full_name")
    list_filter = ("status", "provider", "is_active")


@admin.register(TelehealthParticipantEvent)
class TelehealthParticipantEventAdmin(admin.ModelAdmin):
    list_display = ("session", "role", "display_name", "joined_at", "left_at")
    search_fields = ("display_name", "session__external_room_id")
    list_filter = ("role",)
