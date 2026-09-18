from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.billing.views import (
    InvoiceViewSet,
    PaymentViewSet,
    PlanViewSet,
    SubscriptionViewSet,
    TransactionViewSet,
)

router = DefaultRouter()
router.register("plans", PlanViewSet, basename="billing-plan")
router.register("subscriptions", SubscriptionViewSet, basename="billing-subscription")
router.register("invoices", InvoiceViewSet, basename="billing-invoice")
router.register("payments", PaymentViewSet, basename="billing-payment")
router.register("transactions", TransactionViewSet, basename="billing-transaction")

urlpatterns = [path("", include(router.urls))]
