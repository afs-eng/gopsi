import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.clinics.models import Clinic, ClinicMembership
from apps.clinics.policies import is_clinic_admin


@pytest.mark.django_db
def test_user_lists_only_own_clinics():
    user = get_user_model().objects.create_user(
        username="psi-a",
        email="psi-a@example.com",
        password="safe-test-password",
        full_name="Psicóloga A",
        global_role=UserRole.PSYCHOLOGIST,
    )
    own_clinic = Clinic.objects.create(name="Clínica A")
    other_clinic = Clinic.objects.create(name="Clínica B")
    ClinicMembership.objects.create(
        clinic=own_clinic,
        user=user,
        role=UserRole.PSYCHOLOGIST,
    )

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("clinic-list"))

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.json()}
    assert str(own_clinic.id) in returned_ids
    assert str(other_clinic.id) not in returned_ids


@pytest.mark.django_db
def test_user_cannot_retrieve_clinic_from_another_tenant():
    user = get_user_model().objects.create_user(
        username="psi-a",
        email="psi-a@example.com",
        password="safe-test-password",
        full_name="Psicóloga A",
        global_role=UserRole.PSYCHOLOGIST,
    )
    own_clinic = Clinic.objects.create(name="Clínica A")
    other_clinic = Clinic.objects.create(name="Clínica B")
    ClinicMembership.objects.create(
        clinic=own_clinic,
        user=user,
        role=UserRole.PSYCHOLOGIST,
    )

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("clinic-detail", kwargs={"pk": other_clinic.id}))

    assert response.status_code == 404
    assert other_clinic.name not in response.content.decode()


@pytest.mark.django_db
def test_non_platform_user_with_invalid_platform_membership_role_cannot_list_clinic():
    user = get_user_model().objects.create_user(
        username="invalid-membership-role",
        email="invalid-membership-role@example.com",
        password="safe-test-password",
        full_name="Vínculo Inválido",
        global_role=UserRole.PROFESSIONAL,
    )
    clinic = Clinic.objects.create(name="Clínica com papel inválido")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.SUPERADMIN,
        is_active=True,
    )

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("clinic-list"))

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
def test_platform_operator_can_list_tenant_safe_clinic_metadata():
    user = get_user_model().objects.create_user(
        username="admin",
        email="admin@example.com",
        password="safe-test-password",
        full_name="Admin Plataforma",
        global_role=UserRole.SUPERADMIN,
    )
    clinic_a = Clinic.objects.create(name="Clínica A")
    clinic_b = Clinic.objects.create(name="Clínica B")
    Clinic.objects.create(name="Clínica Inativa", is_active=False)

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("platform-clinic-list"))
    detail_response = client.get(
        reverse("platform-clinic-detail", kwargs={"pk": clinic_a.id})
    )

    assert response.status_code == 200
    payload = response.json()
    returned_ids = {item["id"] for item in payload}
    assert {
        str(clinic_a.id),
        str(clinic_b.id),
    } <= returned_ids
    assert len(payload) == 3
    assert set(payload[0]) == {
        "id",
        "name",
        "legal_name",
        "document",
        "phone",
        "email",
        "is_active",
        "created_at",
        "updated_at",
    }
    assert detail_response.status_code == 200
    assert set(detail_response.json()) == set(payload[0])
    assert detail_response.json()["id"] == str(clinic_a.id)


@pytest.mark.django_db
def test_platform_admin_cannot_create_clinic_without_clinic_admin_user():
    user = get_user_model().objects.create_user(
        username="admin-api",
        email="admin-api@example.com",
        password="safe-test-password",
        full_name="Admin API",
        global_role=UserRole.SUPERADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("platform-clinic-list"),
        {
            "name": "Clínica Inicial",
            "legal_name": "Clínica Inicial LTDA",
            "document": "12345678000190",
            "phone": "11999990000",
            "email": "clinica@example.com",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not Clinic.objects.filter(name="Clínica Inicial").exists()


@pytest.mark.django_db
def test_platform_admin_can_create_clinic_with_clinic_admin_user():
    platform_admin = get_user_model().objects.create_user(
        username="platform-owner",
        email="platform-owner@example.com",
        password="safe-test-password",
        full_name="Admin Plataforma",
        global_role=UserRole.SUPERADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=platform_admin)

    response = client.post(
        reverse("platform-clinic-list"),
        {
            "name": "Clínica com Admin",
            "legal_name": "Clínica com Admin LTDA",
            "email": "clinica-admin@example.com",
            "admin_user": {
                "username": "clinic-owner",
                "email": "clinic-owner@example.com",
                "full_name": "Responsável da Clínica",
                "password": "safe-test-password",
            },
        },
        format="json",
    )

    clinic = Clinic.objects.get(name="Clínica com Admin")
    clinic_admin = get_user_model().objects.get(username="clinic-owner")
    assert response.status_code == 201
    assert set(response.json()) == {
        "id",
        "name",
        "legal_name",
        "document",
        "phone",
        "email",
        "is_active",
        "created_at",
        "updated_at",
    }
    assert clinic_admin.global_role == UserRole.CLINIC_ADMIN
    assert clinic_admin.check_password("safe-test-password") is True
    assert ClinicMembership.objects.filter(
        clinic=clinic,
        user=clinic_admin,
        role=UserRole.CLINIC_ADMIN,
        is_active=True,
    ).exists()
    assert not ClinicMembership.objects.filter(
        clinic=clinic,
        user=platform_admin,
    ).exists()


@pytest.mark.django_db
def test_platform_operator_can_update_and_deactivate_clinic():
    platform_operator = get_user_model().objects.create_user(
        username="platform-lifecycle",
        email="platform-lifecycle@example.com",
        password="safe-test-password",
        full_name="Operador de ciclo de vida",
        global_role=UserRole.SUPERADMIN,
    )
    clinic = Clinic.objects.create(name="Clínica original")
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    update_response = client.patch(
        reverse("platform-clinic-detail", kwargs={"pk": clinic.id}),
        {"name": "Clínica atualizada"},
        format="json",
    )
    deactivate_response = client.post(
        reverse("platform-clinic-deactivate", kwargs={"pk": clinic.id}),
        format="json",
    )

    clinic.refresh_from_db()
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Clínica atualizada"
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["is_active"] is False
    assert clinic.is_active is False


@pytest.mark.django_db
def test_platform_operator_is_denied_by_clinic_workspace_endpoints():
    platform_operator = get_user_model().objects.create_user(
        username="platform-workspace-denial",
        email="platform-workspace-denial@example.com",
        password="safe-test-password",
        full_name="Operador sem workspace clínico",
        global_role=UserRole.SUPERADMIN,
    )
    clinic = Clinic.objects.create(name="Clínica workspace")
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    list_response = client.get(reverse("clinic-list"))
    detail_response = client.get(
        reverse("clinic-detail", kwargs={"pk": clinic.id})
    )
    create_response = client.post(
        reverse("clinic-list"),
        {"name": "Clínica não permitida"},
        format="json",
    )

    assert list_response.status_code == 403
    assert detail_response.status_code == 403
    assert create_response.status_code == 403
    assert not Clinic.objects.filter(name="Clínica não permitida").exists()


@pytest.mark.django_db
def test_clinic_user_is_denied_platform_control_plane_endpoints():
    user = get_user_model().objects.create_user(
        username="clinic-platform-denial",
        email="clinic-platform-denial@example.com",
        password="safe-test-password",
        full_name="Usuário da clínica",
        global_role=UserRole.CLINIC_ADMIN,
    )
    clinic = Clinic.objects.create(name="Clínica do usuário")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    list_response = client.get(reverse("platform-clinic-list"))
    detail_response = client.get(
        reverse("platform-clinic-detail", kwargs={"pk": clinic.id})
    )
    create_response = client.post(
        reverse("platform-clinic-list"),
        {
            "name": "Clínica indevida",
            "admin_user": {
                "username": "indebido",
                "email": "indebido@example.com",
                "full_name": "Admin indevido",
                "password": "safe-test-password",
            },
        },
        format="json",
    )

    assert list_response.status_code == 403
    assert detail_response.status_code == 403
    assert create_response.status_code == 403
    assert not Clinic.objects.filter(name="Clínica indevida").exists()


@pytest.mark.django_db
def test_clinic_admin_can_update_safe_metadata_for_own_active_clinic():
    user = get_user_model().objects.create_user(
        username="clinic-safe-update",
        email="clinic-safe-update@example.com",
        password="safe-test-password",
        full_name="Administrador da clínica",
        global_role=UserRole.CLINIC_ADMIN,
    )
    clinic = Clinic.objects.create(name="Clínica antes")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
        is_active=True,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.patch(
        reverse("clinic-detail", kwargs={"pk": clinic.id}),
        {"name": "Clínica depois", "phone": "11999990000"},
        format="json",
    )

    clinic.refresh_from_db()
    assert response.status_code == 200
    assert clinic.name == "Clínica depois"
    assert clinic.phone == "11999990000"


@pytest.mark.django_db
def test_clinic_admin_cannot_create_delete_deactivate_or_provision_from_workspace():
    user = get_user_model().objects.create_user(
        username="clinic-lifecycle-denial",
        email="clinic-lifecycle-denial@example.com",
        password="safe-test-password",
        full_name="Administrador sem ciclo de vida",
        global_role=UserRole.CLINIC_ADMIN,
    )
    clinic = Clinic.objects.create(name="Clínica protegida")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
        is_active=True,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    create_response = client.post(
        reverse("clinic-list"),
        {
            "name": "Clínica não permitida",
            "admin_user": {
                "username": "admin-não-permitido",
                "email": "admin-nao-permitido@example.com",
                "full_name": "Admin não permitido",
                "password": "safe-test-password",
            },
        },
        format="json",
    )
    delete_response = client.delete(
        reverse("clinic-detail", kwargs={"pk": clinic.id})
    )
    deactivate_response = client.patch(
        reverse("clinic-detail", kwargs={"pk": clinic.id}),
        {"is_active": False},
        format="json",
    )
    provision_response = client.patch(
        reverse("clinic-detail", kwargs={"pk": clinic.id}),
        {
            "admin_user": {
                "username": "admin-não-permitido-2",
                "email": "admin-nao-permitido-2@example.com",
                "full_name": "Admin não permitido 2",
                "password": "safe-test-password",
            }
        },
        format="json",
    )

    clinic.refresh_from_db()
    assert create_response.status_code == 403
    assert delete_response.status_code == 405
    assert deactivate_response.status_code == 400
    assert provision_response.status_code == 400
    assert clinic.is_active is True
    assert not Clinic.objects.filter(name="Clínica não permitida").exists()
    assert not get_user_model().objects.filter(username="admin-não-permitido").exists()
    assert not get_user_model().objects.filter(username="admin-não-permitido-2").exists()


@pytest.mark.django_db
def test_non_platform_admin_cannot_create_clinic_from_api():
    user = get_user_model().objects.create_user(
        username="regular-api",
        email="regular-api@example.com",
        password="safe-test-password",
        full_name="Regular API",
        global_role=UserRole.PROFESSIONAL,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("clinic-list"),
        {"name": "Clínica Bloqueada"},
        format="json",
    )

    assert response.status_code == 403
    assert not Clinic.objects.filter(name="Clínica Bloqueada").exists()


@pytest.mark.django_db
def test_current_user_endpoint_returns_authenticated_user():
    user = get_user_model().objects.create_user(
        username="me-api",
        email="me-api@example.com",
        password="safe-test-password",
        full_name="Usuário Atual",
        global_role=UserRole.SUPERADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("api-current-user"))

    assert response.status_code == 200
    assert response.json() == {
        "id": str(user.id),
        "username": "me-api",
        "email": "me-api@example.com",
        "full_name": "Usuário Atual",
        "global_role": UserRole.SUPERADMIN,
        "is_platform_admin": True,
        "mfa_enabled": False,
    }


@pytest.mark.django_db
def test_clinic_admin_authority_requires_active_membership():
    user = get_user_model().objects.create_user(
        username="inactive-clinic-admin",
        email="inactive-clinic-admin@example.com",
        password="safe-test-password",
        full_name="Administrador Inativo",
        global_role=UserRole.CLINIC_ADMIN,
    )
    clinic = Clinic.objects.create(name="Clínica de autoridade")
    membership = ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
        is_active=False,
    )

    assert is_clinic_admin(user, clinic.id) is False

    membership.is_active = True
    membership.save(update_fields=["is_active"])
    assert is_clinic_admin(user, clinic.id) is True


@pytest.mark.django_db
def test_platform_role_with_invalid_membership_fails_closed_for_clinic_list():
    user = get_user_model().objects.create_user(
        username="platform-invalid-membership",
        email="platform-invalid-membership@example.com",
        password="safe-test-password",
        full_name="Plataforma Ambígua",
        global_role=UserRole.SUPERADMIN,
    )
    clinic = Clinic.objects.create(name="Clínica ambígua")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("clinic-list"))

    assert response.status_code == 403
