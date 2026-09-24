# accounts/tests.py

> 23 nodes · cohesion 0.20

## Key Concepts

- **accounts/tests.py** (38 connections) — `apps/accounts/tests.py`
- **make_user()** (12 connections) — `apps/accounts/tests.py`
- **django_db** (12 connections)
- **is_platform_operator()** (10 connections) — `apps/accounts/models.py`
- **totp_now()** (8 connections) — `apps/accounts/mfa.py`
- **test_clinic_admin_can_confirm_initial_mfa_from_login()** (8 connections) — `apps/accounts/tests.py`
- **test_clinic_admin_without_mfa_is_blocked_at_login()** (8 connections) — `apps/accounts/tests.py`
- **test_platform_and_clinic_identities_cannot_overlap()** (7 connections) — `apps/accounts/tests.py`
- **test_platform_preflight_reports_identity_findings_without_changing_data()** (7 connections) — `apps/accounts/tests.py`
- **test_user_can_setup_confirm_and_login_with_mfa()** (7 connections) — `apps/accounts/tests.py`
- **test_password_reset_keeps_confirmed_mfa_required()** (6 connections) — `apps/accounts/tests.py`
- **test_login_records_audit_event_for_regular_user()** (5 connections) — `apps/accounts/tests.py`
- **test_platform_identity_requires_explicit_application_role()** (5 connections) — `apps/accounts/tests.py`
- **test_django_superuser_is_not_implicitly_a_platform_operator()** (4 connections) — `apps/accounts/tests.py`
- **test_password_reset_does_not_fail_when_email_delivery_fails()** (4 connections) — `apps/accounts/tests.py`
- **test_password_reset_sends_link_and_updates_password()** (4 connections) — `apps/accounts/tests.py`
- **override_settings** (3 connections)
- **test_password_reset_does_not_reveal_missing_email()** (3 connections) — `apps/accounts/tests.py`
- **Allow platform authority only for a valid, separate platform identity.** (1 connections) — `apps/accounts/models.py`
- **fail_send_mail()** (1 connections) — `apps/accounts/tests.py`
- **django_core** (1 connections)
- **django_core_management** (1 connections)
- **io** (1 connections)

## Relationships

- [UserRole](UserRole.md) (18 shared connections)
- [accounts/views.py](accounts-views.py.md) (13 shared connections)
- [AuditAction](AuditAction.md) (11 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (4 shared connections)
- [User](User.md) (2 shared connections)
- [Professional](Professional.md) (2 shared connections)
- [clinics/models.py](clinics-models.py.md) (1 shared connections)
- [professionals/models.py](professionals-models.py.md) (1 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (1 shared connections)
- [telehealth/tests.py](telehealth-tests.py.md) (1 shared connections)

## Source Files

- `apps/accounts/mfa.py`
- `apps/accounts/models.py`
- `apps/accounts/tests.py`

## Audit Trail

- EXTRACTED: 79 (75%)
- INFERRED: 26 (25%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*