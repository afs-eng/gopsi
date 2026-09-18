import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.clinics.models import Clinic, ClinicMembership
from apps.professionals.models import Professional, ProfessionalStatus


def make_user(username: str, role: str = UserRole.PROFESSIONAL):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


@pytest.mark.django_db
def test_clinic_admin_can_create_professional_for_own_clinic():
    user = make_user("clinic-admin", UserRole.PROFESSIONAL)
    clinic = Clinic.objects.create(name="Clínica A")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("professional-list"),
        {
            "clinic": str(clinic.id),
            "full_name": "Dra. Ana Psicóloga",
            "profession": "Psicóloga",
            "crp": "06/123456",
            "crp_state": "SP",
            "email": "ana@example.com",
            "appointment_modalities": "HYBRID",
            "appointment_price": "250.00",
            "default_appointment_duration": 50,
        },
        format="json",
    )

    assert response.status_code == 201
    assert Professional.objects.filter(
        clinic=clinic,
        full_name="Dra. Ana Psicóloga",
    ).exists()


@pytest.mark.django_db
def test_clinic_admin_cannot_create_professional_for_other_clinic():
    user = make_user("clinic-admin", UserRole.PROFESSIONAL)
    own_clinic = Clinic.objects.create(name="Clínica A")
    other_clinic = Clinic.objects.create(name="Clínica B")
    ClinicMembership.objects.create(
        clinic=own_clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("professional-list"),
        {
            "clinic": str(other_clinic.id),
            "full_name": "Dr. Outro Tenant",
            "profession": "Psicólogo",
            "crp": "01/111111",
            "crp_state": "DF",
        },
        format="json",
    )

    assert response.status_code == 403
    assert not Professional.objects.filter(full_name="Dr. Outro Tenant").exists()


@pytest.mark.django_db
def test_user_lists_only_professionals_from_own_clinic():
    user = make_user("clinic-member", UserRole.PSYCHOLOGIST)
    own_clinic = Clinic.objects.create(name="Clínica A")
    other_clinic = Clinic.objects.create(name="Clínica B")
    ClinicMembership.objects.create(
        clinic=own_clinic,
        user=user,
        role=UserRole.PSYCHOLOGIST,
    )
    own_professional = Professional.objects.create(
        clinic=own_clinic,
        full_name="Profissional A",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    other_professional = Professional.objects.create(
        clinic=other_clinic,
        full_name="Profissional B",
        profession="Psicóloga",
        crp="06/999999",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("professional-list"), {"clinic": own_clinic.id})

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.json()}
    assert str(own_professional.id) in returned_ids
    assert str(other_professional.id) not in returned_ids


@pytest.mark.django_db
def test_user_cannot_retrieve_professional_from_other_tenant():
    user = make_user("clinic-member", UserRole.PSYCHOLOGIST)
    own_clinic = Clinic.objects.create(name="Clínica A")
    other_clinic = Clinic.objects.create(name="Clínica B")
    ClinicMembership.objects.create(
        clinic=own_clinic,
        user=user,
        role=UserRole.PSYCHOLOGIST,
    )
    other_professional = Professional.objects.create(
        clinic=other_clinic,
        full_name="Profissional B",
        profession="Psicóloga",
        crp="06/999999",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(
        reverse("professional-detail", kwargs={"pk": other_professional.id})
    )

    assert response.status_code == 404
    assert other_professional.full_name not in response.content.decode()


@pytest.mark.django_db
def test_destroy_professional_uses_soft_delete():
    user = make_user("clinic-admin", UserRole.PROFESSIONAL)
    clinic = Clinic.objects.create(name="Clínica A")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Profissional Inativar",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.delete(
        reverse("professional-detail", kwargs={"pk": professional.id})
    )
    professional.refresh_from_db()

    assert response.status_code == 204
    assert professional.is_active is False
    assert professional.status == ProfessionalStatus.INACTIVE


@pytest.mark.django_db
def test_platform_operator_cannot_list_professional_directory():
    platform_operator = make_user("platform-professionals-list", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica Profissionais")
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Profissional Protegido",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    response = client.get(reverse("professional-list"), {"clinic": clinic.id})

    assert response.status_code == 403
    assert str(professional.id) not in response.content.decode()


@pytest.mark.django_db
def test_platform_operator_cannot_retrieve_professional_directory_entry():
    platform_operator = make_user("platform-professionals-detail", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica Profissionais")
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Profissional Protegido",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    response = client.get(
        reverse("professional-detail", kwargs={"pk": professional.id})
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_platform_operator_cannot_write_professional_directory():
    platform_operator = make_user("platform-professionals-write", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica Profissionais")
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    response = client.post(
        reverse("professional-list"),
        {
            "clinic": str(clinic.id),
            "full_name": "Profissional Indevido",
            "profession": "Psicóloga",
            "crp": "06/123456",
            "crp_state": "SP",
        },
        format="json",
    )

    assert response.status_code == 403
    assert not Professional.objects.filter(full_name="Profissional Indevido").exists()
