from rest_framework import serializers

from apps.accounts.mfa import provisioning_uri
from apps.accounts.models import User, UserMFADevice


class CurrentUserSerializer(serializers.ModelSerializer):
    is_platform_admin = serializers.BooleanField(read_only=True)
    mfa_enabled = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "global_role",
            "is_platform_admin",
            "mfa_enabled",
        ]

    def get_mfa_enabled(self, obj) -> bool:
        return hasattr(obj, "mfa_device") and obj.mfa_device.is_confirmed


class MFASetupSerializer(serializers.ModelSerializer):
    provisioning_uri = serializers.SerializerMethodField()

    class Meta:
        model = UserMFADevice
        fields = ["id", "secret", "provisioning_uri", "is_confirmed", "created_at"]
        read_only_fields = fields

    def get_provisioning_uri(self, obj) -> str:
        return provisioning_uri(obj.user, obj.secret)
