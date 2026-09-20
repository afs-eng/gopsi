from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
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


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def get_user(self):
        email = self.validated_data["email"]
        return (
            get_user_model()
            .objects.filter(email__iexact=email, is_active=True)
            .first()
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = get_user_model().objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            raise serializers.ValidationError(
                {"token": "Link de redefinição inválido."}
            ) from None

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError(
                {"token": "Link de redefinição inválido."}
            )

        password_validation.validate_password(attrs["new_password"], user)
        attrs["user"] = user
        return attrs
