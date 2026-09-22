from django.contrib import admin

from apps.clinics.models import Clinic, ClinicMembership, ClinicStaff


@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    list_display = ("name", "document", "email", "is_active")
    search_fields = ("name", "legal_name", "document", "email")
    list_filter = ("is_active",)


@admin.register(ClinicMembership)
class ClinicMembershipAdmin(admin.ModelAdmin):
    list_display = ("clinic", "user", "role", "is_active")
    search_fields = ("clinic__name", "user__username", "user__email", "user__full_name")
    list_filter = ("role", "is_active")


@admin.register(ClinicStaff)
class ClinicStaffAdmin(admin.ModelAdmin):
    list_display = ("full_name", "clinic", "role", "status", "access_enabled")
    search_fields = ("full_name", "email", "cpf", "clinic__name")
    list_filter = ("role", "status", "access_enabled", "clinic")
