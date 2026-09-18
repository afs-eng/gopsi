from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import User, UserRole
from apps.clinics.models import Clinic, ClinicMembership


class PlatformClinicAdminProvisionSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, username):
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("Nome de usuário já está em uso.")
        return username

    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("E-mail já está em uso.")
        return email


class PlatformClinicSerializer(serializers.ModelSerializer):
    admin_user = PlatformClinicAdminProvisionSerializer(
        required=False,
        write_only=True,
    )

    class Meta:
        model = Clinic
        fields = [
            "id",
            "name",
            "legal_name",
            "document",
            "phone",
            "email",
            "admin_user",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if self.instance and "admin_user" in attrs:
            raise serializers.ValidationError(
                {"admin_user": "O administrador só pode ser provisionado na criação."}
            )
        if not self.instance and not attrs.get("admin_user"):
            raise serializers.ValidationError(
                {"admin_user": "Informe o administrador responsável pela clínica."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        admin_user_data = validated_data.pop("admin_user")
        clinic = Clinic.objects.create(**validated_data)
        user = User.objects.create_user(
            username=admin_user_data["username"],
            email=admin_user_data["email"],
            password=admin_user_data["password"],
            full_name=admin_user_data["full_name"],
            global_role=UserRole.CLINIC_ADMIN,
        )
        ClinicMembership.objects.create(
            clinic=clinic,
            user=user,
            role=UserRole.CLINIC_ADMIN,
        )
        return clinic
