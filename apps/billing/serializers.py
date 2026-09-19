from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.appointments.selectors import appointments_visible_to_user
from apps.billing.models import (
    Invoice,
    InvoiceStatus,
    Payment,
    PaymentStatus,
    Plan,
    Subscription,
    Transaction,
)
from apps.billing.selectors import invoices_visible_to_user, plans_visible_to_user
from apps.billing.services import BillingService, SubscriptionService
from apps.clinics.selectors import clinics_visible_to_user
from apps.patients.selectors import patients_visible_to_user


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id",
            "code",
            "name",
            "plan_type",
            "monthly_price",
            "max_professionals",
            "features",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    clinic_name = serializers.CharField(source="clinic.name", read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "id",
            "clinic",
            "clinic_name",
            "plan",
            "plan_name",
            "status",
            "starts_at",
            "ends_at",
            "trial_ends_at",
            "external_subscription_id",
            "created_by",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "clinic_name",
            "plan_name",
            "created_by",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate_plan(self, plan):
        request = self.context["request"]
        if not plans_visible_to_user(request.user).filter(id=plan.id).exists():
            raise serializers.ValidationError("Plano não encontrado.")
        return plan

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Acesso de operador de plataforma negado.")

        data = {}
        for field in Subscription._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        if not self.instance:
            data["created_by"] = self.context["request"].user

        subscription = Subscription(**data)
        if self.instance:
            subscription.pk = self.instance.pk

        try:
            subscription.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    def create(self, validated_data):
        return Subscription.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

    def cancel(self, instance):
        return SubscriptionService().cancel_subscription(instance)


class InvoiceSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "clinic",
            "patient",
            "patient_name",
            "appointment",
            "description",
            "amount",
            "due_date",
            "status",
            "external_invoice_id",
            "created_by",
            "paid_at",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient_name",
            "created_by",
            "paid_at",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate_patient(self, patient):
        if patient is None:
            return patient
        request = self.context["request"]
        if not patients_visible_to_user(request.user).filter(id=patient.id).exists():
            raise serializers.ValidationError("Paciente não encontrado.")
        return patient

    def validate_appointment(self, appointment):
        if appointment is None:
            return appointment
        request = self.context["request"]
        if (
            not appointments_visible_to_user(request.user)
            .filter(id=appointment.id)
            .exists()
        ):
            raise serializers.ValidationError("Consulta não encontrada.")
        return appointment

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Acesso de operador de plataforma negado.")

        data = {}
        for field in Invoice._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        if not self.instance:
            data["created_by"] = self.context["request"].user

        invoice = Invoice(**data)
        if self.instance:
            invoice.pk = self.instance.pk

        try:
            invoice.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    def create(self, validated_data):
        return Invoice.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )

    def cancel(self, instance):
        instance.status = InvoiceStatus.CANCELLED
        instance.is_active = False
        instance.save(update_fields=["status", "is_active", "updated_at"])
        return instance


class PaymentSerializer(serializers.ModelSerializer):
    invoice_description = serializers.CharField(
        source="invoice.description",
        read_only=True,
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "clinic",
            "invoice",
            "invoice_description",
            "amount",
            "method",
            "status",
            "paid_at",
            "gateway",
            "external_payment_id",
            "card_brand",
            "card_last4",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "clinic",
            "invoice_description",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate_invoice(self, invoice):
        request = self.context["request"]
        if not invoices_visible_to_user(request.user).filter(id=invoice.id).exists():
            raise serializers.ValidationError("Cobrança não encontrada.")
        return invoice

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Acesso de operador de plataforma negado.")

        data = {}
        for field in Payment._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        invoice = attrs.get("invoice") or getattr(self.instance, "invoice", None)
        if invoice:
            data["clinic"] = invoice.clinic

            if not self.instance:
                if invoice.status not in [InvoiceStatus.OPEN, InvoiceStatus.OVERDUE]:
                    raise serializers.ValidationError(
                        "Somente cobranças abertas ou vencidas podem receber pagamento."
                    )
                if invoice.payments.filter(status=PaymentStatus.PAID).exists():
                    raise serializers.ValidationError("Cobrança já possui pagamento registrado.")

            status = attrs.get("status") or getattr(self.instance, "status", None)
            amount = attrs.get("amount") or getattr(self.instance, "amount", None)
            if status == PaymentStatus.PAID and amount != invoice.amount:
                raise serializers.ValidationError(
                    "Pagamentos parciais não são suportados. Informe o valor integral da cobrança."
                )

        if not self.instance:
            data["created_by"] = self.context["request"].user

        payment = Payment(**data)
        if self.instance:
            payment.pk = self.instance.pk

        try:
            payment.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    def create(self, validated_data):
        invoice = validated_data.pop("invoice")
        if validated_data.get(
            "status"
        ) == PaymentStatus.PAID and not validated_data.get("paid_at"):
            validated_data["paid_at"] = timezone.now()
        return BillingService().register_payment(
            invoice=invoice,
            created_by=self.context["request"].user,
            **validated_data,
        )


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "clinic",
            "payment",
            "transaction_type",
            "amount",
            "external_transaction_id",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
