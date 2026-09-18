from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.billing.permissions import CanManageBilling
from apps.billing.selectors import (
    invoices_visible_to_user,
    payments_visible_to_user,
    plans_visible_to_user,
    subscriptions_visible_to_user,
    transactions_visible_to_user,
)
from apps.billing.serializers import (
    InvoiceSerializer,
    PaymentSerializer,
    PlanSerializer,
    SubscriptionSerializer,
    TransactionSerializer,
)


class PlanViewSet(ModelViewSet):
    serializer_class = PlanSerializer
    permission_classes = [CanManageBilling]

    def get_queryset(self):
        return plans_visible_to_user(self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class SubscriptionViewSet(ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [CanManageBilling]

    def get_queryset(self):
        queryset = subscriptions_visible_to_user(self.request.user).select_related(
            "clinic",
            "plan",
            "created_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        serializer = self.get_serializer(subscription)
        serializer.cancel(subscription)
        return Response(self.get_serializer(subscription).data)


class InvoiceViewSet(ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [CanManageBilling]

    def get_queryset(self):
        queryset = invoices_visible_to_user(self.request.user).select_related(
            "clinic",
            "patient",
            "appointment",
            "created_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    def perform_destroy(self, instance):
        serializer = self.get_serializer(instance)
        serializer.cancel(instance)


class PaymentViewSet(ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [CanManageBilling]

    def get_queryset(self):
        queryset = payments_visible_to_user(self.request.user).select_related(
            "clinic",
            "invoice",
            "created_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        invoice_id = self.request.query_params.get("invoice")
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset


class TransactionViewSet(ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [CanManageBilling]

    def get_queryset(self):
        queryset = transactions_visible_to_user(self.request.user).select_related(
            "clinic",
            "payment",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        payment_id = self.request.query_params.get("payment")
        if payment_id:
            queryset = queryset.filter(payment_id=payment_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset
