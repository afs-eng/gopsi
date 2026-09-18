from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.clinics.models import Clinic
from apps.patients.models import Patient


class PlanType(models.TextChoices):
    INDIVIDUAL = "INDIVIDUAL", "Individual"
    CLINIC = "CLINIC", "Clínica"
    PROFESSIONAL = "PROFESSIONAL", "Profissional"


class SubscriptionStatus(models.TextChoices):
    TRIALING = "TRIALING", "Em teste"
    ACTIVE = "ACTIVE", "Ativa"
    PAST_DUE = "PAST_DUE", "Em atraso"
    CANCELLED = "CANCELLED", "Cancelada"
    EXPIRED = "EXPIRED", "Expirada"


class InvoiceStatus(models.TextChoices):
    DRAFT = "DRAFT", "Rascunho"
    OPEN = "OPEN", "Aberta"
    PAID = "PAID", "Paga"
    CANCELLED = "CANCELLED", "Cancelada"
    REFUNDED = "REFUNDED", "Reembolsada"
    OVERDUE = "OVERDUE", "Vencida"


class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Pendente"
    AUTHORIZED = "AUTHORIZED", "Autorizado"
    PAID = "PAID", "Pago"
    FAILED = "FAILED", "Falhou"
    CANCELLED = "CANCELLED", "Cancelado"
    REFUNDED = "REFUNDED", "Reembolsado"


class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Dinheiro"
    PIX = "PIX", "Pix"
    BANK_TRANSFER = "BANK_TRANSFER", "Transferência"
    CREDIT_CARD = "CREDIT_CARD", "Cartão de crédito"
    DEBIT_CARD = "DEBIT_CARD", "Cartão de débito"
    EXTERNAL_GATEWAY = "EXTERNAL_GATEWAY", "Gateway externo"
    OTHER = "OTHER", "Outro"


class TransactionType(models.TextChoices):
    CHARGE = "CHARGE", "Cobrança"
    REFUND = "REFUND", "Reembolso"
    CANCELLATION = "CANCELLATION", "Cancelamento"
    ADJUSTMENT = "ADJUSTMENT", "Ajuste"


class Plan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=120)
    plan_type = models.CharField(
        max_length=16,
        choices=PlanType.choices,
        default=PlanType.CLINIC,
    )
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_professionals = models.PositiveIntegerField(default=1)
    features = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["monthly_price", "name"]

    def __str__(self) -> str:
        return self.name


class Subscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(
        Plan, on_delete=models.PROTECT, related_name="subscriptions"
    )
    status = models.CharField(
        max_length=16,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE,
    )
    starts_at = models.DateField(default=timezone.localdate)
    ends_at = models.DateField(blank=True, null=True)
    trial_ends_at = models.DateField(blank=True, null=True)
    external_subscription_id = models.CharField(max_length=120, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_subscriptions",
    )
    cancelled_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["clinic", "status"])]

    def __str__(self) -> str:
        return f"{self.clinic} - {self.plan}"

    def clean(self):
        if self.ends_at and self.ends_at < self.starts_at:
            raise ValidationError("Término não pode ocorrer antes do início.")
        if self.trial_ends_at and self.trial_ends_at < self.starts_at:
            raise ValidationError("Teste não pode terminar antes do início.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="invoices",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="invoices",
        blank=True,
        null=True,
    )
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.PROTECT,
        related_name="invoices",
        blank=True,
        null=True,
    )
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=16,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.OPEN,
    )
    external_invoice_id = models.CharField(max_length=120, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_invoices",
    )
    paid_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["clinic", "status", "is_active"]),
            models.Index(fields=["patient", "created_at"]),
        ]

    def __str__(self) -> str:
        return self.description

    def clean(self):
        if self.amount < 0:
            raise ValidationError("Valor da cobrança não pode ser negativo.")
        if self.patient_id and self.patient.clinic_id != self.clinic_id:
            raise ValidationError("Paciente não pertence à clínica da cobrança.")
        if self.appointment_id and self.appointment.clinic_id != self.clinic_id:
            raise ValidationError("Consulta não pertence à clínica da cobrança.")
        if self.appointment_id and self.patient_id:
            if self.appointment.patient_id != self.patient_id:
                raise ValidationError("Consulta não pertence ao paciente da cobrança.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="payments",
    )
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.PROTECT,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(
        max_length=24,
        choices=PaymentMethod.choices,
        default=PaymentMethod.PIX,
    )
    status = models.CharField(
        max_length=16,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    paid_at = models.DateTimeField(blank=True, null=True)
    gateway = models.CharField(max_length=80, blank=True)
    external_payment_id = models.CharField(max_length=120, blank=True)
    card_brand = models.CharField(max_length=32, blank=True)
    card_last4 = models.CharField(max_length=4, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["clinic", "status", "paid_at"])]

    def __str__(self) -> str:
        return f"Pagamento {self.amount} - {self.status}"

    def clean(self):
        if self.amount < 0:
            raise ValidationError("Valor do pagamento não pode ser negativo.")
        if self.invoice_id and self.invoice.clinic_id != self.clinic_id:
            raise ValidationError("Cobrança não pertence à clínica do pagamento.")
        if self.card_last4 and len(self.card_last4) != 4:
            raise ValidationError("Informe apenas os 4 últimos dígitos do cartão.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.PROTECT,
        related_name="transactions",
        blank=True,
        null=True,
    )
    transaction_type = models.CharField(
        max_length=16,
        choices=TransactionType.choices,
        default=TransactionType.CHARGE,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    external_transaction_id = models.CharField(max_length=120, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["clinic", "transaction_type", "created_at"])]

    def __str__(self) -> str:
        return f"{self.transaction_type} {self.amount}"

    def clean(self):
        if self.amount < 0:
            raise ValidationError("Valor da transação não pode ser negativo.")
        if self.payment_id and self.payment.clinic_id != self.clinic_id:
            raise ValidationError("Pagamento não pertence à clínica da transação.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
