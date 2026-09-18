import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import UserRole
from apps.appointments.models import Appointment
from apps.billing.models import (
    Invoice,
    InvoiceStatus,
    Payment,
    PaymentStatus,
    Plan,
    Subscription,
    SubscriptionStatus,
    Transaction,
)
from apps.billing.services import FeatureService
from apps.clinics.models import Clinic, ClinicMembership
from apps.patients.models import Patient
from apps.professionals.models import Professional


def make_user(username: str, role: str = UserRole.PROFESSIONAL):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="safe-test-password",
        full_name=username.replace("-", " ").title(),
        global_role=role,
    )


def make_billing_context(username="billing-admin", clinic_name="Clínica Billing"):
    user = make_user(username)
    clinic = Clinic.objects.create(name=clinic_name)
    ClinicMembership.objects.create(
        clinic=clinic,
        user=user,
        role=UserRole.CLINIC_ADMIN,
    )
    professional = Professional.objects.create(
        clinic=clinic,
        full_name="Dra. Billing",
        profession="Psicóloga",
        crp="06/123456",
        crp_state="SP",
    )
    patient = Patient.objects.create(
        clinic=clinic,
        full_name="Paciente Billing",
        created_by=user,
    )
    appointment = Appointment.objects.create(
        clinic=clinic,
        patient=patient,
        professional=professional,
        date="2026-10-01",
        start_time="09:00:00",
        end_time="09:50:00",
        value="250.00",
    )
    return user, clinic, professional, patient, appointment


@pytest.mark.django_db
def test_platform_operator_cannot_create_plan():
    platform_admin = make_user("platform-billing-admin", UserRole.SUPERADMIN)
    client = APIClient()
    client.force_authenticate(user=platform_admin)

    response = client.post(
        reverse("billing-plan-list"),
        {
            "code": "clinic-premium",
            "name": "Clínica Premium",
            "plan_type": "CLINIC",
            "monthly_price": "399.00",
            "max_professionals": 20,
            "features": {"telehealth": True, "billing": True},
        },
        format="json",
    )

    assert response.status_code == 403
    assert not Plan.objects.filter(code="clinic-premium").exists()


@pytest.mark.django_db
def test_platform_operator_cannot_list_care_billing_resources():
    platform_operator = make_user("platform-billing-list", UserRole.SUPERADMIN)
    _user, clinic, _professional, patient, _appointment = make_billing_context(
        "billing-list-source"
    )
    invoice = Invoice.objects.create(
        clinic=clinic,
        patient=patient,
        description="Cobrança protegida",
        amount="250.00",
        created_by=_user,
    )
    payment = Payment.objects.create(
        clinic=clinic,
        invoice=invoice,
        amount="250.00",
        created_by=_user,
    )
    Transaction.objects.create(
        clinic=clinic,
        payment=payment,
        amount="250.00",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    for route_name in (
        "billing-invoice-list",
        "billing-payment-list",
        "billing-transaction-list",
    ):
        response = client.get(reverse(route_name), {"clinic": clinic.id})
        assert response.status_code == 403


@pytest.mark.django_db
def test_platform_operator_cannot_retrieve_care_billing_resources():
    platform_operator = make_user("platform-billing-detail", UserRole.SUPERADMIN)
    user, clinic, _professional, patient, _appointment = make_billing_context(
        "billing-detail-source"
    )
    invoice = Invoice.objects.create(
        clinic=clinic,
        patient=patient,
        description="Cobrança protegida",
        amount="250.00",
        created_by=user,
    )
    payment = Payment.objects.create(
        clinic=clinic,
        invoice=invoice,
        amount="250.00",
        created_by=user,
    )
    transaction = Transaction.objects.create(
        clinic=clinic,
        payment=payment,
        amount="250.00",
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    for route_name, instance in (
        ("billing-invoice-detail", invoice),
        ("billing-payment-detail", payment),
        ("billing-transaction-detail", transaction),
    ):
        response = client.get(reverse(route_name, kwargs={"pk": instance.id}))
        assert response.status_code == 403


@pytest.mark.django_db
def test_platform_operator_cannot_write_care_billing_resources():
    platform_operator = make_user("platform-billing-write", UserRole.SUPERADMIN)
    _user, clinic, _professional, patient, _appointment = make_billing_context(
        "billing-write-source"
    )
    invoice = Invoice.objects.create(
        clinic=clinic,
        patient=patient,
        description="Cobrança existente",
        amount="250.00",
        created_by=_user,
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    invoice_response = client.post(
        reverse("billing-invoice-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "description": "Cobrança indevida",
            "amount": "250.00",
        },
        format="json",
    )
    payment_response = client.post(
        reverse("billing-payment-list"),
        {
            "invoice": str(invoice.id),
            "amount": "250.00",
            "method": "PIX",
        },
        format="json",
    )

    assert invoice_response.status_code == 403
    assert payment_response.status_code == 403
    assert not Invoice.objects.filter(description="Cobrança indevida").exists()
    assert not Payment.objects.filter(created_by=platform_operator).exists()


@pytest.mark.django_db
def test_platform_operator_cannot_use_billing_custom_action():
    platform_operator = make_user("platform-billing-action", UserRole.SUPERADMIN)
    user, clinic, _professional, _patient, _appointment = make_billing_context(
        "billing-action-source"
    )
    plan = Plan.objects.create(code="action-plan", name="Plano de ação")
    subscription = Subscription.objects.create(
        clinic=clinic,
        plan=plan,
        status=SubscriptionStatus.ACTIVE,
        starts_at="2026-09-01",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=platform_operator)

    response = client.post(
        reverse("billing-subscription-cancel", kwargs={"pk": subscription.id})
    )

    subscription.refresh_from_db()
    assert response.status_code == 403
    assert subscription.status == SubscriptionStatus.ACTIVE


@pytest.mark.django_db
def test_clinic_admin_can_create_subscription_for_own_clinic():
    user, clinic, _professional, _patient, _appointment = make_billing_context()
    plan = Plan.objects.create(
        code="individual",
        name="Individual",
        plan_type="INDIVIDUAL",
        monthly_price="99.00",
        features={"telehealth": True},
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("billing-subscription-list"),
        {
            "clinic": str(clinic.id),
            "plan": str(plan.id),
            "status": "ACTIVE",
            "starts_at": "2026-09-01",
        },
        format="json",
    )

    subscription = Subscription.objects.get(clinic=clinic)
    assert response.status_code == 201
    assert subscription.created_by == user
    assert FeatureService().has_feature(clinic, "telehealth") is True
    assert FeatureService().has_feature(clinic, "advanced_reports") is False


@pytest.mark.django_db
def test_professional_without_admin_membership_cannot_create_invoice():
    admin, clinic, professional, patient, appointment = make_billing_context()
    professional_user = make_user("billing-professional", UserRole.PSYCHOLOGIST)
    professional.user = professional_user
    professional.save(update_fields=["user", "updated_at"])
    ClinicMembership.objects.create(
        clinic=clinic,
        user=professional_user,
        role=UserRole.PSYCHOLOGIST,
    )
    client = APIClient()
    client.force_authenticate(user=professional_user)

    response = client.post(
        reverse("billing-invoice-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(patient.id),
            "appointment": str(appointment.id),
            "description": "Consulta",
            "amount": "250.00",
        },
        format="json",
    )

    assert response.status_code == 403
    assert not Invoice.objects.filter(created_by=professional_user).exists()
    assert admin != professional_user


@pytest.mark.django_db
def test_user_cannot_list_invoices_from_other_tenant():
    user, clinic, _professional, patient, _appointment = make_billing_context()
    (
        other_user,
        other_clinic,
        _other_professional,
        _other_patient,
        _other_appointment,
    ) = make_billing_context("other-billing-admin", "Outra Clínica Billing")
    Invoice.objects.create(
        clinic=clinic,
        patient=patient,
        description="Cobrança interna",
        amount="250.00",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.get(reverse("billing-invoice-list"), {"clinic": other_clinic.id})

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
def test_invoice_rejects_patient_from_another_clinic():
    user, clinic, _professional, _patient, _appointment = make_billing_context()
    (
        _other_user,
        _other_clinic,
        _other_professional,
        other_patient,
        _other_appointment,
    ) = make_billing_context("other-invoice-patient", "Clínica Paciente Externo")
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("billing-invoice-list"),
        {
            "clinic": str(clinic.id),
            "patient": str(other_patient.id),
            "description": "Cobrança inválida",
            "amount": "250.00",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not Invoice.objects.filter(description="Cobrança inválida").exists()


@pytest.mark.django_db
def test_paid_payment_marks_invoice_paid_and_creates_transaction():
    user, clinic, _professional, patient, _appointment = make_billing_context()
    invoice = Invoice.objects.create(
        clinic=clinic,
        patient=patient,
        description="Consulta paga",
        amount="250.00",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("billing-payment-list"),
        {
            "invoice": str(invoice.id),
            "amount": "250.00",
            "method": "PIX",
            "status": "PAID",
            "external_payment_id": "pay_123",
        },
        format="json",
    )
    invoice.refresh_from_db()

    payment = Payment.objects.get(invoice=invoice)
    assert response.status_code == 201
    assert payment.clinic == clinic
    assert payment.created_by == user
    assert payment.status == PaymentStatus.PAID
    assert invoice.status == InvoiceStatus.PAID
    assert invoice.paid_at is not None
    assert Transaction.objects.filter(payment=payment, amount="250.00").exists()


@pytest.mark.django_db
def test_payment_rejects_full_card_digits():
    user, clinic, _professional, patient, _appointment = make_billing_context()
    invoice = Invoice.objects.create(
        clinic=clinic,
        patient=patient,
        description="Consulta cartão",
        amount="250.00",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("billing-payment-list"),
        {
            "invoice": str(invoice.id),
            "amount": "250.00",
            "method": "CREDIT_CARD",
            "status": "PAID",
            "card_brand": "visa",
            "card_last4": "4111111111111111",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not Payment.objects.exists()


@pytest.mark.django_db
def test_clinic_admin_can_cancel_subscription():
    user, clinic, _professional, _patient, _appointment = make_billing_context()
    plan = Plan.objects.create(code="basic", name="Básico", monthly_price="99.00")
    subscription = Subscription.objects.create(
        clinic=clinic,
        plan=plan,
        status=SubscriptionStatus.ACTIVE,
        starts_at="2026-09-01",
        created_by=user,
    )
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("billing-subscription-cancel", kwargs={"pk": subscription.id})
    )
    subscription.refresh_from_db()

    assert response.status_code == 200
    assert subscription.status == SubscriptionStatus.CANCELLED
    assert subscription.cancelled_at is not None
