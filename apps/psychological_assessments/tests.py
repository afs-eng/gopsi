import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.audit.models import AuditEvent
from apps.clinics.models import Clinic, ClinicMembership
from apps.documents.models import GeneratedDocument
from apps.patients.models import Patient
from apps.professionals.models import Professional
from apps.psychological_assessments.models import (
    Assessment,
    AssessmentDocument,
    AssessmentInstrument,
    AssessmentPlan,
    AssessmentResult,
    AssessmentResultStatus,
    AssessmentSession,
    AssessmentTimelineEvent,
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
            "assessment_type": "NEUROPSYCHOLOGICAL",
            "purpose": "Investigar funcionamento cognitivo.",
            "demand_origin": "Escola",
            "requester": "Coordenação escolar",
            "reason": "Demanda escolar e familiar.",
            "objective": "Responder hipótese de dificuldades atencionais.",
            "status": "IN_PROGRESS",
            "started_at": "2026-10-01",
            "expected_at": "2026-11-01",
        },
        format="json",
    )

    assessment = Assessment.objects.get(patient=patient)
    assert response.status_code == 201
    assert assessment.code.startswith("AV-")
    assert assessment.created_by == user
    assert assessment.clinic == clinic
    assert assessment.assessment_type == "NEUROPSYCHOLOGICAL"
    assert assessment.purpose == "Investigar funcionamento cognitivo."
    assert assessment.demand_origin == "Escola"
    assert assessment.requester == "Coordenação escolar"
    assert assessment.objective == "Responder hipótese de dificuldades atencionais."
    assert str(assessment.expected_at) == "2026-11-01"


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
def test_clinic_admin_can_create_assessment_for_clinic_professional():
    admin_user = make_user("assessment-clinic-admin", UserRole.CLINIC_ADMIN)
    _user, clinic, professional, patient = make_assessment_context()
    ClinicMembership.objects.create(
        clinic=clinic,
        user=admin_user,
        role=UserRole.CLINIC_ADMIN,
    )
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.post(
        reverse("psychological-assessment-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "professional": str(professional.id),
            "title": "Avaliação criada pela administração clínica",
            "reason": "Organização do processo avaliativo.",
            "status": "IN_PROGRESS",
            "started_at": "2026-10-01",
        },
        format="json",
    )

    assert response.status_code == 201
    assessment = Assessment.objects.get(created_by=admin_user)
    assert assessment.professional == professional


@pytest.mark.django_db
def test_clinic_admin_without_professional_profile_cannot_access_clinical_content():
    admin_user = make_user("assessment-admin-no-clinical", UserRole.CLINIC_ADMIN)
    user, clinic, professional, patient = make_assessment_context()
    ClinicMembership.objects.create(
        clinic=clinic,
        user=admin_user,
        role=UserRole.CLINIC_ADMIN,
    )
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação clínica restrita",
        reason="Conteúdo clínico sensível.",
        objective="Objetivo clínico sensível.",
        created_by=user,
    )
    AssessmentPlan.objects.create(
        assessment=assessment,
        question="Pergunta clínica sensível.",
        created_by=user,
    )
    AssessmentResult.objects.create(
        assessment=assessment,
        summary="Síntese clínica sensível.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=admin_user)

    detail_response = client.get(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id})
    )
    session_list_response = client.get(reverse("assessment-session-list"))
    result_create_response = client.post(
        reverse("assessment-result-list"),
        {
            "assessment": str(assessment.id),
            "summary": "Tentativa administrativa.",
        },
        format="json",
    )

    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["reason"] == ""
    assert detail["objective"] == ""
    assert detail["plan"] is None
    assert detail["result"] is None
    assert detail["timeline_events"] == []
    assert session_list_response.status_code == 200
    assert session_list_response.json() == []
    assert result_create_response.status_code == 400


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
            "professional": str(professional.id),
            "session_date": "2026-10-02",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "modality": "IN_PERSON",
            "status": "COMPLETED",
            "objective": "Entrevista inicial do processo.",
            "procedures": "Entrevista e observação clínica.",
            "permitted_observations": "Paciente colaborativo durante a sessão.",
        },
        format="json",
    )
    session = AssessmentSession.objects.get(assessment=assessment)

    plan_response = client.post(
        reverse("assessment-plan-list"),
        {
            "assessment": str(assessment.id),
            "question": "Investigar funcionamento atencional.",
            "hypotheses": "Hipótese de dificuldades executivas.",
            "domains": ["atenção", "funções executivas"],
            "procedures": ["entrevista", "aplicação de instrumentos"],
            "planned_instruments": [],
            "notes": "Planejamento inicial.",
        },
        format="json",
    )

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
    result = AssessmentResult.objects.get(assessment=assessment)
    result_update_response = client.patch(
        reverse("assessment-result-detail", kwargs={"pk": result.id}),
        {"summary": "Tentativa de alterar resultado finalizado."},
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
    assert plan_response.status_code == 201
    assert instrument_response.status_code == 201
    assert result_response.status_code == 201
    assert result_update_response.status_code == 400
    assert document_response.status_code == 201
    assert InstrumentApplication.objects.filter(assessment=assessment).exists()
    assert AssessmentDocument.objects.filter(
        assessment=assessment, document=document
    ).exists()
    plan = AssessmentPlan.objects.get(assessment=assessment)
    session.refresh_from_db()
    assert result.status == AssessmentResultStatus.FINAL
    assert result.finalized_at is not None
    assert session.professional == professional
    assert session.created_by == user
    assert session.objective == "Entrevista inicial do processo."
    assert plan.created_by == user
    assert plan.domains == ["atenção", "funções executivas"]
    audit_actions = set(
        AuditEvent.objects.filter(
            clinic=clinic,
            metadata__assessment=str(assessment.id),
        ).values_list("action", flat=True)
    )
    assert "ASSESSMENT_SESSION_CREATE" in audit_actions
    assert "ASSESSMENT_PLAN_CREATE" in audit_actions
    assert "ASSESSMENT_INSTRUMENT_CREATE" in audit_actions
    assert "ASSESSMENT_DOCUMENT_LINK" in audit_actions
    event_types = set(
        AssessmentTimelineEvent.objects.filter(assessment=assessment).values_list(
            "event_type",
            flat=True,
        )
    )
    assert "SESSION_REGISTERED" in event_types
    assert "PLANNED" in event_types
    assert "RESULT_FINALIZED" in event_types


@pytest.mark.django_db
def test_professional_can_finalize_and_void_assessment_result_with_reason():
    user, clinic, professional, patient = make_assessment_context()
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação com resultado controlado",
        created_by=user,
    )
    result = AssessmentResult.objects.create(
        assessment=assessment,
        summary="Síntese em rascunho.",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    finalize_response = client.post(
        reverse("assessment-result-finalize", kwargs={"pk": result.id}),
        format="json",
    )
    result.refresh_from_db()
    missing_reason_response = client.post(
        reverse("assessment-result-void", kwargs={"pk": result.id}),
        {},
        format="json",
    )
    void_response = client.post(
        reverse("assessment-result-void", kwargs={"pk": result.id}),
        {"reason": "Erro identificado na síntese final."},
        format="json",
    )
    result.refresh_from_db()

    assert finalize_response.status_code == 200
    assert missing_reason_response.status_code == 400
    assert void_response.status_code == 200
    assert result.status == AssessmentResultStatus.VOIDED
    assert result.void_reason == "Erro identificado na síntese final."
    assert result.voided_by == user
    assert AuditEvent.objects.filter(
        action="ASSESSMENT_RESULT_FINALIZE",
        resource_id=str(result.id),
    ).exists()
    assert AuditEvent.objects.filter(
        action="ASSESSMENT_RESULT_VOID",
        resource_id=str(result.id),
    ).exists()
    event_types = set(
        AssessmentTimelineEvent.objects.filter(assessment=assessment).values_list(
            "event_type",
            flat=True,
        )
    )
    assert "RESULT_FINALIZED" in event_types
    assert "RESULT_VOIDED" in event_types


@pytest.mark.django_db
def test_cancel_assessment_requires_reason_and_records_timeline():
    user, clinic, professional, patient = make_assessment_context()
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação com cancelamento justificado",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    missing_reason_response = client.post(
        reverse("psychological-assessment-cancel", kwargs={"pk": assessment.id}),
        {},
        format="json",
    )
    response = client.post(
        reverse("psychological-assessment-cancel", kwargs={"pk": assessment.id}),
        {"reason": "Paciente desistiu do processo avaliativo."},
        format="json",
    )
    assessment.refresh_from_db()

    assert missing_reason_response.status_code == 400
    assert response.status_code == 200
    assert assessment.status == "CANCELLED"
    assert assessment.is_active is False
    assert assessment.cancellation_reason == "Paciente desistiu do processo avaliativo."
    assert assessment.cancelled_by == user
    assert AssessmentTimelineEvent.objects.filter(
        assessment=assessment,
        event_type="CANCELLED",
    ).exists()


@pytest.mark.django_db
def test_assessment_status_transitions_require_final_result_before_completion():
    user, clinic, professional, patient = make_assessment_context()
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação com transições controladas",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    direct_completion_response = client.patch(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id}),
        {"status": "COMPLETED", "completed_at": "2026-10-10"},
        format="json",
    )
    progress_response = client.patch(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id}),
        {"status": "IN_PROGRESS"},
        format="json",
    )
    writing_response = client.patch(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id}),
        {"status": "WRITING"},
        format="json",
    )
    completion_without_result_response = client.patch(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id}),
        {"status": "COMPLETED", "completed_at": "2026-10-10"},
        format="json",
    )
    AssessmentResult.objects.create(
        assessment=assessment,
        status=AssessmentResultStatus.FINAL,
        summary="Resultado finalizado para conclusão.",
        created_by=user,
    )
    completion_response = client.patch(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id}),
        {"status": "COMPLETED", "completed_at": "2026-10-10"},
        format="json",
    )
    reopen_response = client.patch(
        reverse("psychological-assessment-detail", kwargs={"pk": assessment.id}),
        {"status": "WRITING"},
        format="json",
    )

    assert direct_completion_response.status_code == 400
    assert progress_response.status_code == 200
    assert writing_response.status_code == 200
    assert completion_without_result_response.status_code == 400
    assert completion_response.status_code == 200
    assert reopen_response.status_code == 400


@pytest.mark.django_db
def test_professional_can_list_catalog_and_register_catalog_instrument_payload():
    user, clinic, professional, patient = make_assessment_context()
    assessment = Assessment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        title="Avaliação com instrumento catalogado",
        created_by=user,
    )
    instrument = AssessmentInstrument.objects.create(
        code="bai-test",
        name="BAI Teste",
        category="Ansiedade",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    catalog_response = client.get(reverse("assessment-instrument-list"))
    application_response = client.post(
        reverse("instrument-application-list"),
        {
            "assessment": str(assessment.id),
            "instrument": str(instrument.id),
            "applied_by": str(professional.id),
            "reviewed_by": str(professional.id),
            "application_date": "2026-10-02",
            "status": "APPLIED",
            "raw_payload": {"escore_total": 12},
            "reviewed_payload": {"observacao": "resultado revisado"},
            "interpretation_text": "Interpretação autorizada.",
            "is_validated": True,
        },
        format="json",
    )

    application = InstrumentApplication.objects.get(assessment=assessment)
    update_response = client.patch(
        reverse("instrument-application-detail", kwargs={"pk": application.id}),
        {"notes": "Tentativa de editar aplicação validada."},
        format="json",
    )
    assert catalog_response.status_code == 200
    assert any(item["code"] == "bai-test" for item in catalog_response.json())
    assert application_response.status_code == 201
    assert update_response.status_code == 400
    assert application.instrument == instrument
    assert application.instrument_name == "BAI Teste"
    assert application.applied_by == professional
    assert application.reviewed_by == professional
    assert application.reviewed_at is not None
    assert application.raw_payload == {"escore_total": 12}
    assert application.is_validated is True


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
    assert assessment.cancellation_reason == "Cancelamento por remoção via API."
