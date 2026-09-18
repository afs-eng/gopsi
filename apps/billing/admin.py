from django.contrib import admin

from apps.billing.models import Invoice, Payment, Plan, Subscription, Transaction


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "plan_type", "monthly_price", "is_active"]
    list_filter = ["plan_type", "is_active"]
    search_fields = ["name", "code"]


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["clinic", "plan", "status", "starts_at", "ends_at"]
    list_filter = ["status", "plan"]
    search_fields = ["clinic__name", "plan__name"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["description", "clinic", "patient", "amount", "status", "due_date"]
    list_filter = ["status", "clinic"]
    search_fields = ["description", "patient__full_name"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["invoice", "clinic", "amount", "method", "status", "paid_at"]
    list_filter = ["method", "status", "clinic"]
    search_fields = ["invoice__description", "external_payment_id"]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["clinic", "payment", "transaction_type", "amount", "created_at"]
    list_filter = ["transaction_type", "clinic"]
    search_fields = ["external_transaction_id"]
