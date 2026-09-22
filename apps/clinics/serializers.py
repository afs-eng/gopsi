from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import User, UserRole
from apps.clinics.models import Clinic, ClinicMembership, ClinicStaff, ClinicStaffStatus
from apps.clinics.policies import is_clinic_admin


class ClinicAdminUserSerializer(serializers.Serializer):
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


class ClinicSerializer(serializers.ModelSerializer):
    admin_user = ClinicAdminUserSerializer(required=False, write_only=True)

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
        if not self.instance and not attrs.get("admin_user"):
            raise serializers.ValidationError(
                {"admin_user": "Informe o administrador responsável pela clínica."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        admin_user_data = validated_data.pop("admin_user", None)
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


class ClinicWorkspaceSerializer(serializers.ModelSerializer):
    """Safe metadata serializer for the clinic workspace."""

    class Meta:
        model = Clinic
        fields = [
            "id",
            "name",
            "legal_name",
            "document",
            "phone",
            "email",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]

    def to_internal_value(self, data):
        forbidden = {
            "admin_user",
            "appointments",
            "audit",
            "billing",
            "documents",
            "is_active",
            "medical_records",
            "memberships",
            "patients",
            "professionals",
        }
        errors = {
            field: "Este campo não pode ser alterado no workspace da clínica."
            for field in set(data) & forbidden
        }
        if errors:
            raise serializers.ValidationError(errors)

        unknown = set(data) - set(self.fields)
        if unknown:
            raise serializers.ValidationError(
                {
                    field: "Campo não permitido no workspace da clínica."
                    for field in unknown
                }
            )
        return super().to_internal_value(data)


class ClinicMembershipSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        user = attrs.get("user", self.instance.user if self.instance else None)
        role = attrs.get("role", self.instance.role if self.instance else None)
        if role == UserRole.SUPERADMIN:
            raise serializers.ValidationError(
                {"role": "O papel da plataforma não pode ser usado em uma clínica."}
            )
        if user and user.global_role == UserRole.SUPERADMIN:
            raise serializers.ValidationError(
                {"user": "Contas da plataforma não podem ter vínculo com clínicas."}
            )
        return attrs

    class Meta:
        model = ClinicMembership
        fields = [
            "id",
            "clinic",
            "user",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ClinicStaffSerializer(serializers.ModelSerializer):
    role_label = serializers.CharField(source="get_role_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ClinicStaff
        fields = [
            "id",
            "clinic",
            "user",
            "full_name",
            "role",
            "role_label",
            "cpf",
            "email",
            "phone",
            "position",
            "notes",
            "status",
            "status_label",
            "access_enabled",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "role_label",
            "status_label",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not is_clinic_admin(request.user, clinic.id):
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate(self, attrs):
        user = attrs.get("user") or getattr(self.instance, "user", None)
        clinic = attrs.get("clinic") or getattr(self.instance, "clinic", None)
        access_enabled = attrs.get(
            "access_enabled",
            getattr(self.instance, "access_enabled", False),
        )
        status = attrs.get("status", getattr(self.instance, "status", ClinicStaffStatus.ACTIVE))

        if user and user.global_role == UserRole.SUPERADMIN:
            raise serializers.ValidationError(
                {"user": "Contas da plataforma não podem ser funcionários da clínica."}
            )
        if user and clinic and not user.clinic_memberships.filter(
            clinic=clinic,
            is_active=True,
        ).exists():
            raise serializers.ValidationError(
                {"user": "Usuário precisa estar vinculado à clínica."}
            )
        if access_enabled and not user:
            raise serializers.ValidationError(
                {"user": "Informe um usuário para habilitar acesso ao sistema."}
            )
        if status == ClinicStaffStatus.BLOCKED and access_enabled:
            raise serializers.ValidationError(
                {"access_enabled": "Funcionário bloqueado não pode manter acesso ativo."}
            )
        return attrs
