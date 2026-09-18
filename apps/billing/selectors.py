from django.db.models import QuerySet

from apps.accounts.models import UserRole, has_explicit_platform_role
from apps.billing.models import Invoice, Payment, Plan, Subscription, Transaction


def billing_clinic_ids_for_user(user) -> list[str]:
    return list(
        user.clinic_memberships.filter(
            role__in=[UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST],
            is_active=True,
        ).values_list("clinic_id", flat=True)
    )


def plans_visible_to_user(user) -> QuerySet[Plan]:
    if not user.is_authenticated or has_explicit_platform_role(user):
        return Plan.objects.none()
    return Plan.objects.filter(is_active=True)


def subscriptions_visible_to_user(user) -> QuerySet[Subscription]:
    if not user.is_authenticated or has_explicit_platform_role(user):
        return Subscription.objects.none()
    return Subscription.objects.filter(clinic_id__in=billing_clinic_ids_for_user(user))


def invoices_visible_to_user(user) -> QuerySet[Invoice]:
    if not user.is_authenticated or has_explicit_platform_role(user):
        return Invoice.objects.none()
    return Invoice.objects.filter(
        clinic_id__in=billing_clinic_ids_for_user(user),
        is_active=True,
    )


def payments_visible_to_user(user) -> QuerySet[Payment]:
    if not user.is_authenticated or has_explicit_platform_role(user):
        return Payment.objects.none()
    return Payment.objects.filter(clinic_id__in=billing_clinic_ids_for_user(user))


def transactions_visible_to_user(user) -> QuerySet[Transaction]:
    if not user.is_authenticated or has_explicit_platform_role(user):
        return Transaction.objects.none()
    return Transaction.objects.filter(clinic_id__in=billing_clinic_ids_for_user(user))
