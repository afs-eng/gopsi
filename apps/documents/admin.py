from django.contrib import admin

from apps.documents.models import DocumentTemplate, GeneratedDocument


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "clinic", "template_type", "is_active", "created_at"]
    list_filter = ["template_type", "is_active"]
    search_fields = ["name", "body"]


@admin.register(GeneratedDocument)
class GeneratedDocumentAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "clinic",
        "patient",
        "professional",
        "status",
        "created_at",
    ]
    list_filter = ["status", "is_active"]
    search_fields = ["title", "content", "patient__full_name"]
