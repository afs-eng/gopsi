from django.utils import timezone

from apps.appointments.models import Appointment
from apps.billing.models import (
    Invoice,
    InvoiceStatus,
    Payment,
    PaymentStatus,
    Subscription,
    SubscriptionStatus,
    Transaction,
    TransactionType,
)


class SubscriptionService:
    active_statuses = [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]

    def get_active_subscription(self, clinic) -> Subscription | None:
        today = timezone.localdate()
        return (
            clinic.subscriptions.filter(
                status__in=self.active_statuses,
                starts_at__lte=today,
            )
            .filter(ends_at__isnull=True)
            .order_by("-created_at")
            .first()
            or clinic.subscriptions.filter(
                status__in=self.active_statuses,
                starts_at__lte=today,
                ends_at__gte=today,
            )
            .order_by("-created_at")
            .first()
        )

    def cancel_subscription(self, subscription: Subscription) -> Subscription:
        subscription.status = SubscriptionStatus.CANCELLED
        subscription.cancelled_at = timezone.now()
        subscription.ends_at = timezone.localdate()
        subscription.save(
            update_fields=["status", "cancelled_at", "ends_at", "updated_at"]
        )
        return subscription


class FeatureService:
    def __init__(self, subscription_service: SubscriptionService | None = None):
        self.subscription_service = subscription_service or SubscriptionService()

    def has_feature(self, clinic, feature: str) -> bool:
        subscription = self.subscription_service.get_active_subscription(clinic)
        if not subscription:
            return False

        features = subscription.plan.features or {}
        if isinstance(features, list):
            return feature in features
        return bool(features.get(feature))


class BillingService:
    def create_invoice_for_appointment(
        self,
        appointment: Appointment,
        created_by,
        due_date=None,
    ) -> Invoice:
        return Invoice.objects.create(
            clinic=appointment.clinic,
            patient=appointment.patient,
            appointment=appointment,
            description=f"Consulta em {appointment.date}",
            amount=appointment.value,
            due_date=due_date,
            created_by=created_by,
        )

    def register_payment(self, invoice: Invoice, created_by, **payment_data) -> Payment:
        payment = Payment.objects.create(
            clinic=invoice.clinic,
            invoice=invoice,
            created_by=created_by,
            **payment_data,
        )
        Transaction.objects.create(
            clinic=invoice.clinic,
            payment=payment,
            transaction_type=TransactionType.CHARGE,
            amount=payment.amount,
            external_transaction_id=payment.external_payment_id,
        )

        if payment.status == PaymentStatus.PAID:
            invoice.status = InvoiceStatus.PAID
            invoice.paid_at = payment.paid_at or timezone.now()
            invoice.save(update_fields=["status", "paid_at", "updated_at"])

        return payment
