# billing/tests.py

> 113 nodes · cohesion 0.05

## Key Concepts

- **billing/tests.py** (43 connections) — `apps/billing/tests.py`
- **billing/serializers.py** (31 connections) — `apps/billing/serializers.py`
- **Invoice** (30 connections) — `apps/billing/models.py`
- **billing/models.py** (27 connections) — `apps/billing/models.py`
- **Payment** (24 connections) — `apps/billing/models.py`
- **billing/views.py** (23 connections) — `apps/billing/views.py`
- **make_billing_context()** (22 connections) — `apps/billing/tests.py`
- **Subscription** (20 connections) — `apps/billing/models.py`
- **billing/selectors.py** (18 connections) — `apps/billing/selectors.py`
- **Transaction** (17 connections) — `apps/billing/models.py`
- **billing/services.py** (17 connections) — `apps/billing/services.py`
- **django_db** (15 connections)
- **Plan** (13 connections) — `apps/billing/models.py`
- **BillingService** (13 connections) — `apps/billing/services.py`
- **billing/admin.py** (12 connections) — `apps/billing/admin.py`
- **InvoiceSerializer** (12 connections) — `apps/billing/serializers.py`
- **CanManageBilling** (11 connections) — `apps/billing/permissions.py`
- **PaymentSerializer** (11 connections) — `apps/billing/serializers.py`
- **SubscriptionSerializer** (11 connections) — `apps/billing/serializers.py`
- **InvoiceStatus** (9 connections) — `apps/billing/models.py`
- **invoices_visible_to_user()** (9 connections) — `apps/billing/selectors.py`
- **SubscriptionService** (9 connections) — `apps/billing/services.py`
- **make_user()** (9 connections) — `apps/billing/tests.py`
- **PaymentStatus** (8 connections) — `apps/billing/models.py`
- **plans_visible_to_user()** (8 connections) — `apps/billing/selectors.py`
- *... and 88 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (22 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (17 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (14 shared connections)
- [Appointment](Appointment.md) (7 shared connections)
- [Patient](Patient.md) (6 shared connections)
- [django_db](django_db.md) (4 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (3 shared connections)
- [accounts/views.py](accounts-views.py.md) (3 shared connections)
- [notifications/views.py](notifications-views.py.md) (3 shared connections)
- [uuid](uuid.md) (2 shared connections)
- [clinics/models.py](clinics-models.py.md) (2 shared connections)
- [AuditAction](AuditAction.md) (2 shared connections)

## Source Files

- `apps/billing/admin.py`
- `apps/billing/models.py`
- `apps/billing/permissions.py`
- `apps/billing/selectors.py`
- `apps/billing/serializers.py`
- `apps/billing/services.py`
- `apps/billing/tests.py`
- `apps/billing/urls.py`
- `apps/billing/views.py`

## Audit Trail

- EXTRACTED: 316 (77%)
- INFERRED: 92 (23%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*