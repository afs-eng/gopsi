from django.contrib import admin

from apps.privacy.models import DataSubjectRequest


@admin.register(DataSubjectRequest)
class DataSubjectRequestAdmin(admin.ModelAdmin):
    list_display = ["request_type", "clinic", "requester_name", "status", "due_date"]
    list_filter = ["request_type", "status", "clinic"]
    search_fields = ["requester_name", "requester_email", "description"]
