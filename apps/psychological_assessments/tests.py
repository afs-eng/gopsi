import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.clinics.models import Clinic, ClinicMembership
from apps.documents.models import GeneratedDocument
from apps.patients.models import Patient
from apps.professionals.models import Professional
from apps.psychological_assessments.models import (
    Assessment,
    AssessmentDocument,
    AssessmentResult,
    AssessmentResultStatus,
    AssessmentSession,
    InstrumentApplication,
)


def make_user(username: str, role: str = UserRole.PROFESSIONAL):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


def make_assessment_context():
    user = make_user("assessment-psychologist", UserRole.PSYCHOLOGIST)
    clinic = Clinic.objects.create(name="Clínica Avaliação")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.PSYCHOLOGIST,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        user=user,
        full_name="Dra. Avaliadora",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Avaliado",
        created_by=user,
    )
    return user, clinic, professional, patient


@pytest.mark.django_db
def test_professional_can_create_psychological_assessment():
    user, clinic, professional, patient = make_assessment_context()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("psychological-assessment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "title": "Avaliação neuropsicológica inicial",
            "reason": "Demanda escolar e familiar.",
            "status": "IN_PROGRESS",
            "started_at": "2026-10-01",
        },
        format="json",
    )

    assessment = Assessment.objects.get(patient=patient)
    assert response.status_code == 201
    assert assessment.created_by == user
    assert assessment.clinic == clinic


@pytest.mark.django_db
def test_receptionist_cannot_create_psychological_assessment():
    receptionist = make_user("assessment-receptionist", UserRole.RECEPTIONIST)
    _user, clinic, professional, patient = make_assessment_context()
    ClinicMembership.objects.create(
        clinic=clinic,
        user=receptionist,
        role=UserRole.RECEPTIONIST,
    )
    client = APIClient()
    client.force_authenticate(user=receptionist)

    response = client.post(
        reverse("psychological-assessment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "title": "Avaliação restrita",
        },
        format="json",
    )

    assert response.status_code == 403
    assert not Assessment.objects.exists()


@pytest.mark.django_db
def test_user_cannot_list_assessments_from_other_tenant():
    user, clinic, professional, patient = make_assessment_context()
    other_clinic = Clinic.objects.create(name="Outra Clínica")
    other_professional = Professional.objects.create(
        clinic=other_clinic,
        full_name="Dra. Outra",
        profession="Psicóloga",
        crp="06/999999",
        crp_state="SP",
    )
    other_patient = Patient.objects.create(
        clinic=other_clinic,
        full_name="Outro Paciente",
        created_by=user,
    )
    own_assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação própria",
        created_by=user,
    )
    other_assessment = Assessment.objects.create(
        clinic=other_clinic,
        patient=other_patient,
        professional=other_professional,
        title="Avaliação externa",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get(
        reverse("psychological-assessment-list"),
        {"clinic": clinic.id},
    )

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.json()}
    assert str(own_assessment.id) in returned_ids
    assert str(other_assessment.id) not in returned_ids


@pytest.mark.django_db
def test_platform_operator_denied_assessments_with_accidental_access():
    platform_operator = make_user("platform-assessment-denial", UserRole.SUPERADMIN)
    clinic = Clinic.objects.create(name="Clínica avaliação protegida")
    ClinicMembership.objects.create(
        clinic=clinic,
        user=platform_operator,
        role=UserRole.CLINIC_ADMIN,
        is_active=True,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        user=platform_operator,
        full_name="Operador com perfil de avaliação",
        profession="Psicólogo",
        is_active=True,
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente de avaliação protegida",
        created_by=platform_operator,
    )
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação protegida",
        created_by=platform_operator,
    )
    session = AssessmentSession.objects.create(
        assessment=assessment,
        session_date="2026-10-02",
        start_time="09:00:00",
        end_time="10:00:00",
    )
    instrument = InstrumentApplication.objects.create(
        assessment=assessment,
        session=session,
        instrument_name="Instrumento protegido",
    )
    result = AssessmentResult.objects.create(
        assessment=assessment,
        summary="Resultado protegido.",
        created_by=platform_operator,
    )

    client = APIClient()
    client.force_authenticate(user=platform_operator)

    assessment_list = client.get(
        reverse("psychological-assessment-list"), {"clinic": clinic.id}
    )
    assessment_detail = client.get(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id})
    )
    assessment_write = client.post(
        reverse("psychological-assessment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "title": "Avaliação não permitida",
        },
        format="json",
    )
    cancel_response = client.post(
        reverse("psychological-assessment-cancel", kwargs={"pk": assessment.id}),
        format="json",
    )
    session_list = client.get(reverse("assessment-session-list"))
    instrument_list = client.get(reverse("instrument-application-list"))
    result_list = client.get(reverse("assessment-result-list"))
    result_detail = client.get(
        reverse("assessment-result-detail", kwargs={"pk": result.id})
    )
    result_write = client.post(
        reverse("assessment-result-list"),
        {
            "assessment": str(assessment.id),
            "summary": "Tentativa de resultado.",
        },
        format="json",
    )

    assert assessment_list.status_code == 403
    assert assessment_detail.status_code == 403
    assert assessment_write.status_code == 403
    assert cancel_response.status_code == 403
    assert session_list.status_code == 403
    assert instrument_list.status_code == 403
    assert result_list.status_code == 403
    assert result_detail.status_code == 403
    assert result_write.status_code == 403
    assessment.refresh_from_db()
    assert assessment.is_active is True
    assert InstrumentApplication.objects.filter(pk=instrument.id).exists()


@pytest.mark.django_db
def test_assessment_rejects_patient_from_another_clinic():
    user, clinic, professional, _patient = make_assessment_context()
    other_clinic = Clinic.objects.create(name="Clínica B")
    other_patient = Patient.objects.create(
        clinic=other_clinic,
        full_name="Paciente de outra clínica",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("psychological-assessment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(other_patient.id),
            "professional": str(professional.id),
            "title": "Avaliação inválida",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not Assessment.objects.exists()


@pytest.mark.django_db
def test_professional_can_register_assessment_session_instrument_result_and_document():
    user, clinic, professional, patient = make_assessment_context()
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação completa",
        created_by=user,
    )
    document = GeneratedDocument.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Relatório de avaliação",
        content="Síntese autorizada para documento psicológico.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    session_response = client.post(
        reverse("assessment-session-list"),
        {
            "assessment": str(assessment.id),
            "session_date": "2026-10-02",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "status": "COMPLETED",
        },
        format="json",
    )
    session = AssessmentSession.objects.get(assessment=assessment)

    instrument_response = client.post(
        reverse("instrument-application-list"),
        {
            "assessment": str(assessment.id),
            "session": str(session.id),
            "instrument_name": "Instrumento autorizado",
            "application_date": "2026-10-02",
            "status": "APPLIED",
            "notes": "Registro sem itens, estímulos ou material protegido.",
        },
        format="json",
    )
    result_response = client.post(
        reverse("assessment-result-list"),
        {
            "assessment": str(assessment.id),
            "status": "FINAL",
            "summary": "Síntese de resultados autorizada.",
            "recommendations": "Encaminhamentos e orientações.",
        },
        format="json",
    )
    document_response = client.post(
        reverse("assessment-document-list"),
        {
            "assessment": str(assessment.id),
            "document": str(document.id),
            "document_type": "REPORT",
        },
        format="json",
    )

    assert session_response.status_code == 201
    assert instrument_response.status_code == 201
    assert result_response.status_code == 201
    assert document_response.status_code == 201
    assert InstrumentApplication.objects.filter(assessment=assessment).exists()
    assert AssessmentDocument.objects.filter(
        assessment=assessment, document=document
    ).exists()
    result = AssessmentResult.objects.get(assessment=assessment)
    assert result.status == AssessmentResultStatus.FINAL
    assert result.finalized_at is not None


@pytest.mark.django_db
def test_destroy_assessment_cancels_and_soft_deletes():
    user, clinic, professional, patient = make_assessment_context()
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação a cancelar",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.delete(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id})
    )
    assessment.refresh_from_db()

    assert response.status_code == 204
    assert assessment.is_active is False
    assert assessment.status == "CANCELLED"
