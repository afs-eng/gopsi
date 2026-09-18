from django.contrib import admin

from apps.psychological_assessments.models import (
    Assessment,
    AssessmentDocument,
    AssessmentResult,
    AssessmentSession,
    InstrumentApplication,
)


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ["title", "clinic", "patient", "professional", "status"]
    list_filter = ["status", "clinic"]
    search_fields = ["title", "patient__full_name", "professional__full_name"]


@admin.register(AssessmentSession)
class AssessmentSessionAdmin(admin.ModelAdmin):
    list_display = ["assessment", "session_date", "start_time", "end_time", "status"]
    list_filter = ["status", "session_date"]


@admin.register(InstrumentApplication)
class InstrumentApplicationAdmin(admin.ModelAdmin):
    list_display = ["instrument_name", "assessment", "status", "application_date"]
    list_filter = ["status"]


@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ["assessment", "status", "finalized_at"]
    list_filter = ["status"]


@admin.register(AssessmentDocument)
class AssessmentDocumentAdmin(admin.ModelAdmin):
    list_display = ["assessment", "document", "document_type", "created_at"]
    list_filter = ["document_type"]
