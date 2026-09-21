from io import StringIO
from urllib.parse import parse_qs, urlparse

import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.accounts.mfa import totp_now
from apps.accounts.models import UserMFADevice, UserRole, is_platform_operator
from apps.audit.models import AuditAction, AuditEvent
from apps.clinics.models import Clinic, ClinicMembership
from apps.professionals.models import Professional


def make_user(username: str, role: str = UserRole.PROFESSIONAL):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


@pytest.mark.django_db
def test_login_records_audit_event_for_regular_user():
    user = make_user("regular-login")
    client = APIClient()

    response = client.post(
        reverse("api-token-auth"),
        {"username": user.username, "password": "safe-test-password"},
        format="json",
    )

    assert response.status_code == 200
    assert Token.objects.filter(user=user).exists()
    assert AuditEvent.objects.filter(
        actor=user,
        action=AuditAction.LOGIN_SUCCESS,
    ).exists()


@pytest.mark.django_db
def test_clinic_admin_without_mfa_is_blocked_at_login():
    user = make_user("clinic-admin-mfa", UserRole.CLINIC_ADMIN)
    clinic = Clinic.objects.create(name="Clínica MFA")
    ClinicMembership.objects.create(
        clinic=clinic, user=user, role=UserRole.CLINIC_ADMIN
    )
    client = APIClient()

    response = client.post(
        reverse("api-token-auth"),
        {"username": user.username, "password": "safe-test-password"},
        format="json",
    )

    assert response.status_code == 403
    assert response.json()["mfa_setup_required"] is True
    assert response.json()["secret"]
    assert response.json()["provisioning_uri"].startswith("otpauth://totp/")
    assert AuditEvent.objects.filter(
        actor=user,
        action=AuditAction.MFA_CHALLENGE,
    ).exists()


@pytest.mark.django_db
def test_clinic_admin_can_confirm_initial_mfa_from_login():
    user = make_user("clinic-admin-login-mfa", UserRole.CLINIC_ADMIN)
    clinic = Clinic.objects.create(name="Clínica MFA Login")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    client = APIClient()

    setup_response = client.post(
        reverse("api-token-auth"),
        {"username": user.username, "password": "safe-test-password"},
        format="json",
    )
    secret = setup_response.json()["secret"]
    login_response = client.post(
        reverse("api-token-auth"),
        {
            "username": user.username,
            "password": "safe-test-password",
            "otp": totp_now(secret),
        },
        format="json",
    )

    device = UserMFADevice.objects.get(user=user)
    assert setup_response.status_code == 403
    assert login_response.status_code == 200
    assert device.is_confirmed is True
    assert "token" in login_response.json()


@pytest.mark.django_db
def test_user_can_setup_confirm_and_login_with_mfa():
    user = make_user("mfa-user")
    client = APIClient()
    client.force_authenticate(user=user)

    setup_response = client.post(reverse("api-mfa-setup"), {}, format="json")
    device = UserMFADevice.objects.get(user=user)
    confirm_response = client.post(
        reverse("api-mfa-confirm"),
        {"otp": totp_now(device.secret)},
        format="json",
    )
    client.force_authenticate(user=None)
    login_response = client.post(
        reverse("api-token-auth"),
        {
            "username": user.username,
            "password": "safe-test-password",
            "otp": totp_now(device.secret),
        },
        format="json",
    )

    device.refresh_from_db()
    assert setup_response.status_code == 200
    assert confirm_response.status_code == 200
    assert device.is_confirmed is True
    assert login_response.status_code == 200
    assert AuditEvent.objects.filter(
        actor=user, action=AuditAction.MFA_ENABLED
    ).exists()


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_BASE_URL="https://app.example.com",
)
def test_password_reset_sends_link_and_updates_password():
    user = make_user("reset-password-user")
    Token.objects.create(user=user)
    client = APIClient()

    request_response = client.post(
        reverse("api-password-reset-request"),
        {"email": user.email},
        format="json",
    )
    reset_url = mail.outbox[0].body.split("\n")[3]
    query = parse_qs(urlparse(reset_url).query)
    confirm_response = client.post(
        reverse("api-password-reset-confirm"),
        {
            "uid": query["reset_uid"][0],
            "token": query["reset_token"][0],
            "new_password": "tulipa-forte-7319",
        },
        format="json",
    )
    login_response = client.post(
        reverse("api-token-auth"),
        {"username": user.username, "password": "tulipa-forte-7319"},
        format="json",
    )

    assert request_response.status_code == 200
    assert confirm_response.status_code == 200
    assert login_response.status_code == 200
    assert Token.objects.filter(user=user).count() == 1


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_password_reset_does_not_reveal_missing_email():
    client = APIClient()

    response = client.post(
        reverse("api-password-reset-request"),
        {"email": "missing@example.com"},
        format="json",
    )

    assert response.status_code == 200
    assert len(mail.outbox) == 0


@pytest.mark.django_db
def test_password_reset_does_not_fail_when_email_delivery_fails(monkeypatch):
    user = make_user("reset-email-fails")
    client = APIClient()

    def fail_send_mail(*args, **kwargs):
        raise RuntimeError("email service unavailable")

    monkeypatch.setattr("apps.accounts.views.send_mail", fail_send_mail)

    response = client.post(
        reverse("api-password-reset-request"),
        {"email": user.email},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["detail"] == (
        "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir "
        "a senha."
    )


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_BASE_URL="https://app.example.com",
)
def test_password_reset_keeps_confirmed_mfa_required():
    user = make_user("reset-password-mfa")
    device = UserMFADevice.objects.create(
        user=user,
        secret="JBSWY3DPEHPK3PXP",
        is_confirmed=True,
    )
    client = APIClient()

    client.post(
        reverse("api-password-reset-request"),
        {"email": user.email},
        format="json",
    )
    reset_url = mail.outbox[-1].body.split("\n")[3]
    query = parse_qs(urlparse(reset_url).query)
    client.post(
        reverse("api-password-reset-confirm"),
        {
            "uid": query["reset_uid"][0],
            "token": query["reset_token"][0],
            "new_password": "tulipa-forte-7319",
        },
        format="json",
    )
    missing_mfa_response = client.post(
        reverse("api-token-auth"),
        {"username": user.username, "password": "tulipa-forte-7319"},
        format="json",
    )
    mfa_response = client.post(
        reverse("api-token-auth"),
        {
            "username": user.username,
            "password": "tulipa-forte-7319",
            "otp": totp_now(device.secret),
        },
        format="json",
    )

    assert missing_mfa_response.status_code == 400
    assert missing_mfa_response.json()["mfa_required"] is True
    assert mfa_response.status_code == 200


@pytest.mark.django_db
def test_django_superuser_is_not_implicitly_a_platform_operator():
    user = get_user_model().objects.create_superuser(
        username="technical-superuser",
        email="technical-superuser@example.com",
        password="safe-test-password",
        full_name="Technical Superuser",
    )

    assert user.is_superuser is True
    assert user.global_role == UserRole.PROFESSIONAL
    assert is_platform_operator(user) is False
    assert user.is_platform_admin is False


@pytest.mark.django_db
def test_platform_identity_requires_explicit_application_role():
    user = make_user("platform-operator", UserRole.SUPERADMIN)

    assert user.is_superuser is False
    assert is_platform_operator(user) is True
    assert user.is_platform_admin is True


@pytest.mark.django_db
def test_platform_and_clinic_identities_cannot_overlap():
    user = make_user("platform-overlap", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica de identidade")
    membership = ClinicMembership(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )

    with pytest.raises(ValidationError):
        membership.full_clean()

    membership.save()
    user.refresh_from_db()
    assert user.is_platform_admin is False
    assert is_platform_operator(user) is False


@pytest.mark.django_db
def test_platform_preflight_reports_identity_findings_without_changing_data():
    platform_with_membership = make_user(
        "preflight-platform-membership", UserRole.SUPERADMIN
    )
    platform_with_profile = make_user("preflight-platform-profile", UserRole.SUPERADMIN)
    platform_with_profile.is_staff = True
    platform_with_profile.save(update_fields=["is_staff"])
    invalid_membership_user = make_user("preflight-invalid-membership")
    inactive_membership_user = make_user("preflight-inactive-membership")
    inactive_membership_user.is_active = False
    inactive_membership_user.save(update_fields=["is_active"])
    make_user("preflight-legacy-clinic-admin", UserRole.CLINIC_ADMIN)
    get_user_model().objects.create_user(
        username="preflight-technical",
        email="preflight-technical@example.com",
        password="safe-test-password",
        full_name="Technical account",
        global_role=UserRole.PROFESSIONAL,
        is_staff=True,
    )
    membership_clinic = Clinic.objects.create(name="Preflight membership")
    profile_clinic = Clinic.objects.create(name="Preflight profile")
    Clinic.objects.create(name="Preflight empty")
    inactive_user_clinic = Clinic.objects.create(name="Preflight inactive user")
    ClinicMembership.objects.create(
        clinic=membership_clinic,
        user=platform_with_membership,
        role=UserRole.CLINIC_ADMIN,
    )
    Professional.objects.create(
        clinic=profile_clinic,
        user=platform_with_profile,
        full_name="Perfil indevido",
        profession="Psicólogo",
    )
    ClinicMembership.objects.create(
        clinic=profile_clinic,
        user=invalid_membership_user,
        role=UserRole.SUPERADMIN,
    )
    ClinicMembership.objects.create(
        clinic=inactive_user_clinic,
        user=inactive_membership_user,
        role=UserRole.CLINIC_ADMIN,
    )
    output = StringIO()
    before_counts = {
        "users": get_user_model().objects.count(),
        "clinics": Clinic.objects.count(),
        "memberships": ClinicMembership.objects.count(),
        "profiles": Professional.objects.count(),
    }

    call_command("platform_preflight", stdout=output)

    report = output.getvalue()
    assert "PLATFORM_ROLE_WITH_CLINIC_MEMBERSHIPS count=1" in report
    assert "PLATFORM_ROLE_WITH_PROFESSIONAL_PROFILES count=1" in report
    assert "PLATFORM_ROLE_WITH_DJANGO_TECHNICAL_FLAGS count=1" in report
    assert (
        f"user_id={platform_with_profile.id} global_role=SUPERADMIN "
        "is_superuser=False is_staff=True"
    ) in report
    assert "MEMBERSHIP_WITH_INVALID_PLATFORM_ROLE count=1" in report
    assert "GLOBAL_CLINIC_ADMIN_WITHOUT_ACTIVE_MEMBERSHIP count=1" in report
    assert "ACTIVE_CLINIC_WITHOUT_ACTIVE_ADMIN count=4" in report
    assert f"clinic_id={inactive_user_clinic.id} is_active=True" in report
    assert "DJANGO_TECHNICAL_ACCOUNT_WITHOUT_EXPLICIT_PLATFORM_ROLE count=1" in report
    assert "PREFLIGHT_SUMMARY findings=10" in report
    assert "preflight-platform-membership" not in report
    assert "Technical account" not in report
    assert before_counts == {
        "users": get_user_model().objects.count(),
        "clinics": Clinic.objects.count(),
        "memberships": ClinicMembership.objects.count(),
        "profiles": Professional.objects.count(),
    }
