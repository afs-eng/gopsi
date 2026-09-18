from django.contrib import admin

from apps.consents.models import ConsentRecord, ConsentTemplate


@admin.register(ConsentTemplate)
class ConsentTemplateAdmin(admin.ModelAdmin):
    list_display = ["title", "clinic", "template_type", "version", "is_active"]
    list_filter = ["template_type", "is_required", "is_active", "clinic"]
    search_fields = ["title", "body"]


@admin.register(ConsentRecord)
class ConsentRecordAdmin(admin.ModelAdmin):
    list_display = [
        "document_title",
        "clinic",
        "patient",
        "subject_user",
        "status",
        "accepted_at",
    ]
    list_filter = ["status", "document_type", "clinic"]
    search_fields = ["document_title", "patient__full_name", "subject_user__full_name"]
