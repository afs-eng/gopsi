from django.contrib import admin

from apps.appointments.models import Appointment, ScheduleBlock


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "start_time",
        "end_time",
        "patient",
        "professional",
        "clinic",
        "status",
    )
    search_fields = ("patient__full_name", "professional__full_name", "clinic__name")
    list_filter = ("status", "modality", "date", "is_active")


@admin.register(ScheduleBlock)
class ScheduleBlockAdmin(admin.ModelAdmin):
    list_display = ("date", "start_time", "end_time", "professional", "clinic")
    search_fields = ("professional__full_name", "clinic__name", "reason")
    list_filter = ("date", "is_active")


# Register your models here.
