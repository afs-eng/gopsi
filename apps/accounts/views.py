from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.mfa import generate_totp_secret, provisioning_uri, verify_totp
from apps.accounts.models import UserMFADevice
from apps.accounts.serializers import (
    CurrentUserSerializer,
    MFASetupSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
)
from apps.audit.models import AuditAction
from apps.audit.services import record_audit_event

SENSITIVE_MFA_ROLES = {"SUPERADMIN", "CLINIC_ADMIN"}


def resolve_login_username(identifier):
    if not identifier:
        return identifier
    if "@" not in identifier:
        return identifier
    from apps.accounts.models import User

    user = User.objects.filter(email__iexact=identifier).only("username").first()
    return user.username if user else identifier


def user_requires_mfa(user) -> bool:
    if user.is_platform_admin:
        return True
    return (
        user.global_role in SENSITIVE_MFA_ROLES
        or user.clinic_memberships.filter(
            role="CLINIC_ADMIN",
            is_active=True,
        ).exists()
    )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        otp = request.data.get("otp", "")
        auth_username = resolve_login_username(username)
        user = authenticate(request, username=auth_username, password=password)

        if user is None:
            record_audit_event(
                action=AuditAction.LOGIN_FAILED,
                request=request,
                metadata={"username": username},
            )
            return Response(
                {"detail": "Credenciais inválidas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        device = getattr(user, "mfa_device", None)
        if device and device.is_confirmed:
            if not verify_totp(device.secret, otp):
                record_audit_event(
                    action=AuditAction.MFA_CHALLENGE,
                    request=request,
                    actor=user,
                    metadata={"verified": False},
                )
                return Response(
                    {"detail": "Código MFA inválido.", "mfa_required": True},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            device.last_used_at = timezone.now()
            device.save(update_fields=["last_used_at"])
        elif user_requires_mfa(user):
            device, _created = UserMFADevice.objects.get_or_create(
                user=user,
                defaults={"secret": generate_totp_secret()},
            )

            if otp and verify_totp(device.secret, otp):
                now = timezone.now()
                device.is_confirmed = True
                device.confirmed_at = now
                device.last_used_at = now
                device.save(
                    update_fields=["is_confirmed", "confirmed_at", "last_used_at"]
                )
                record_audit_event(
                    action=AuditAction.MFA_ENABLED, request=request, actor=user
                )
                token, _created = Token.objects.get_or_create(user=user)
                record_audit_event(
                    action=AuditAction.LOGIN_SUCCESS,
                    request=request,
                    actor=user,
                )
                return Response({"token": token.key})

            record_audit_event(
                action=AuditAction.MFA_CHALLENGE,
                request=request,
                actor=user,
                metadata={"setup_required": True},
            )
            return Response(
                {
                    "detail": "Configure MFA para continuar.",
                    "mfa_setup_required": True,
                    "secret": device.secret,
                    "provisioning_uri": provisioning_uri(user, device.secret),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _created = Token.objects.get_or_create(user=user)
        record_audit_event(
            action=AuditAction.LOGIN_SUCCESS, request=request, actor=user
        )
        return Response({"token": token.key})


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CurrentUserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.get_user()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_BASE_URL}/login?"
                f"reset_uid={uid}&reset_token={token}"
            )
            send_mail(
                subject="Redefinição de senha - Plataforma PSI",
                message=(
                    "Recebemos uma solicitação para redefinir sua senha.\n\n"
                    f"Acesse este link para criar uma nova senha:\n{reset_url}\n\n"
                    "Se você não solicitou a redefinição, ignore este e-mail."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(
            {
                "detail": (
                    "Se o e-mail estiver cadastrado, enviaremos instruções para "
                    "redefinir a senha."
                )
            }
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password", "updated_at"])
        Token.objects.filter(user=user).delete()
        return Response({"detail": "Senha redefinida com sucesso."})


class MFASetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device, created = UserMFADevice.objects.get_or_create(
            user=request.user,
            defaults={"secret": generate_totp_secret()},
        )
        if not created and not device.secret:
            device.secret = generate_totp_secret()
            device.save(update_fields=["secret"])
        return Response(MFASetupSerializer(device).data)


class MFAConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device = getattr(request.user, "mfa_device", None)
        if not device:
            return Response(
                {"detail": "Inicie a configuração MFA."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not verify_totp(device.secret, request.data.get("otp", "")):
            return Response(
                {"detail": "Código MFA inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        now = timezone.now()
        device.is_confirmed = True
        device.confirmed_at = now
        device.last_used_at = now
        device.save(update_fields=["is_confirmed", "confirmed_at", "last_used_at"])
        record_audit_event(action=AuditAction.MFA_ENABLED, request=request)
        return Response(MFASetupSerializer(device).data)


class MFADisableView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device = getattr(request.user, "mfa_device", None)
        if device:
            device.delete()
            record_audit_event(action=AuditAction.MFA_DISABLED, request=request)
        return Response(status=status.HTTP_204_NO_CONTENT)
