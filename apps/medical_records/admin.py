from django.contrib import admin

from apps.medical_records.models import (
    MedicalRecordAuditEvent,
    MedicalRecordEntry,
    MedicalRecordEntryVersion,
)


@admin.register(MedicalRecordEntry)
class MedicalRecordEntryAdmin(admin.ModelAdmin):
    list_display = ["patient", "professional", "entry_type", "status", "created_at"]
    list_filter = ["entry_type", "status", "is_active", "clinic"]
    search_fields = ["patient__full_name", "professional__full_name"]


@admin.register(MedicalRecordEntryVersion)
class MedicalRecordEntryVersionAdmin(admin.ModelAdmin):
    list_display = ["entry", "version", "status", "changed_by", "created_at"]
    list_filter = ["status", "entry_type"]


@admin.register(MedicalRecordAuditEvent)
class MedicalRecordAuditEventAdmin(admin.ModelAdmin):
    list_display = ["entry", "action", "actor", "created_at"]
    list_filter = ["action", "clinic"]
