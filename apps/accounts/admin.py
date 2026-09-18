from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import User, UserMFADevice


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Dados da plataforma", {"fields": ("full_name", "cpf", "global_role")}),
    )
    list_display = ("username", "email", "full_name", "global_role", "is_active")
    search_fields = ("username", "email", "full_name", "cpf")


@admin.register(UserMFADevice)
class UserMFADeviceAdmin(admin.ModelAdmin):
    list_display = ["user", "is_confirmed", "created_at", "confirmed_at"]
    readonly_fields = ["secret", "created_at", "confirmed_at", "last_used_at"]
