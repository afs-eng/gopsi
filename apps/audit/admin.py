from django.contrib import admin

from apps.audit.models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ["action", "clinic", "actor", "resource_type", "created_at"]
    list_filter = ["action", "clinic"]
    search_fields = ["resource_type", "resource_id", "actor__full_name"]
    readonly_fields = [field.name for field in AuditEvent._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
