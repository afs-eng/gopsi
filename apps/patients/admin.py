from django.contrib import admin

from apps.patients.models import Guardian, Patient, ProfessionalPatient


class GuardianInline(admin.TabularInline):
    model = Guardian
    extra = 0


class ProfessionalPatientInline(admin.TabularInline):
    model = ProfessionalPatient
    extra = 0


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    inlines = [GuardianInline, ProfessionalPatientInline]
    list_display = ("full_name", "clinic", "cpf", "email", "status", "is_active")
    search_fields = ("full_name", "social_name", "cpf", "email")
    list_filter = ("status", "is_active", "sex")


@admin.register(Guardian)
class GuardianAdmin(admin.ModelAdmin):
    list_display = ("full_name", "patient", "relationship", "has_authorization")
    search_fields = ("full_name", "patient__full_name", "cpf", "email")


@admin.register(ProfessionalPatient)
class ProfessionalPatientAdmin(admin.ModelAdmin):
    list_display = ("patient", "professional", "is_primary", "is_active")
    list_filter = ("is_primary", "is_active")


# Register your models here.
