from django.contrib import admin

from apps.professionals.models import Professional, Specialty


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(Professional)
class ProfessionalAdmin(admin.ModelAdmin):
    list_display = ("full_name", "clinic", "profession", "crp", "status", "is_active")
    search_fields = ("full_name", "cpf", "email", "crp")
    list_filter = ("status", "is_active", "appointment_modalities")


# Register your models here.
