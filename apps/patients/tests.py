import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.clinics.models import Clinic, ClinicMembership
from apps.patients.models import Guardian, Patient, PatientStatus, ProfessionalPatient
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
def test_clinic_admin_can_create_patient_with_guardian_and_professional_link():
    user = make_user("clinic-admin")
    clinic = Clinic.objects.create(name="Clínica A")
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Dra. Ana",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("patient-list"),
        {
            "clinic": str(clinic.id),
            "full_name": "Paciente A",
            "cpf": "12345678900",
            "phone": "11999990000",
            "email": "paciente@example.com",
            "guardians": [
                {
                    "full_name": "Responsável A",
                    "relationship": "Mãe",
                    "phone": "11888880000",
                    "has_authorization": True,
                }
            ],
            "professional_links": [
                {"professional": str(professional.id), "is_primary": True}
            ],
        },
        format="json",
    )

    patient = Patient.objects.get(full_name="Paciente A")
    assert response.status_code == 201
    assert patient.created_by == user
    assert Guardian.objects.filter(patient=patient, full_name="Responsável A").exists()
    assert ProfessionalPatient.objects.filter(
        patient=patient,
        professional=professional,
        is_primary=True,
    ).exists()


@pytest.mark.django_db
def test_clinic_admin_cannot_create_patient_for_other_clinic():
    user = make_user("clinic-admin")
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
        reverse("patient-list"),
        {"clinic": str(other_clinic.id), "full_name": "Paciente Bloqueado"},
        format="json",
    )

    assert response.status_code == 403
    assert not Patient.objects.filter(full_name="Paciente Bloqueado").exists()


@pytest.mark.django_db
def test_user_lists_only_patients_from_own_clinic():
    user = make_user("clinic-member", UserRole.RECEPTIONIST)
    own_clinic = Clinic.objects.create(name="Clínica A")
    other_clinic = Clinic.objects.create(name="Clínica B")
    ClinicMembership.objects.create(
        clinic=own_clinic,
        user=user,
        role=UserRole.RECEPTIONIST,
    )
    own_patient = Patient.objects.create(
        clinic=own_clinic,
        full_name="Paciente A",
        created_by=user,
    )
    other_patient = Patient.objects.create(
        clinic=other_clinic,
        full_name="Paciente B",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("patient-list"), {"clinic": own_clinic.id})

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.json()}
    assert str(own_patient.id) in returned_ids
    assert str(other_patient.id) not in returned_ids


@pytest.mark.django_db
def test_user_cannot_retrieve_patient_from_other_tenant():
    user = make_user("clinic-member", UserRole.RECEPTIONIST)
    own_clinic = Clinic.objects.create(name="Clínica A")
    other_clinic = Clinic.objects.create(name="Clínica B")
    ClinicMembership.objects.create(
        clinic=own_clinic,
        user=user,
        role=UserRole.RECEPTIONIST,
    )
    other_patient = Patient.objects.create(
        clinic=other_clinic,
        full_name="Paciente B",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(reverse("patient-detail", kwargs={"pk": other_patient.id}))

    assert response.status_code == 404
    assert other_patient.full_name not in response.content.decode()


@pytest.mark.django_db
def test_platform_operator_cannot_list_retrieve_or_create_patients_with_accidental_access():
    platform_operator = make_user("platform-patient-denial", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica protegida")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
        is_active=True,
    )
    Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador com perfil indevido",
        profession="Psicólogo",
        is_active=True,
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente protegido",
        created_by=platform_operator,
    )

    client = APIClient()
    client.force_authenticate(user=platform_operator)

    list_response = client.get(reverse("patient-list"), {"clinic": clinic.id})
    detail_response = client.get(
        reverse("patient-detail", kwargs={"pk": patient.id})
    )
    write_response = client.post(
        reverse("patient-list"),
        {"clinic": str(clinic.id), "full_name": "Paciente não permitido"},
        format="json",
    )

    assert list_response.status_code == 403
    assert detail_response.status_code == 403
    assert write_response.status_code == 403
    assert not Patient.objects.filter(full_name="Paciente não permitido").exists()


@pytest.mark.django_db
def test_destroy_patient_uses_soft_delete():
    user = make_user("clinic-admin")
    clinic = Clinic.objects.create(name="Clínica A")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Inativar",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.delete(reverse("patient-detail", kwargs={"pk": patient.id}))
    patient.refresh_from_db()

    assert response.status_code == 204
    assert patient.is_active is False
    assert patient.status == PatientStatus.INACTIVE
