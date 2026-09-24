# accounts/views.py

> 71 nodes · cohesion 0.05

## Key Concepts

- **accounts/views.py** (40 connections) — `apps/accounts/views.py`
- **django_urls** (31 connections)
- **django_contrib_auth** (20 connections)
- **mfa.py** (17 connections) — `apps/accounts/mfa.py`
- **UserMFADevice** (16 connections) — `apps/accounts/models.py`
- **accounts/serializers.py** (15 connections) — `apps/accounts/serializers.py`
- **bootstrap_mfa.py** (10 connections) — `apps/accounts/management/commands/bootstrap_mfa.py`
- **MFASetupSerializer** (9 connections) — `apps/accounts/serializers.py`
- **accounts/urls.py** (8 connections) — `apps/accounts/urls.py`
- **reset_admin_password.py** (7 connections) — `apps/accounts/management/commands/reset_admin_password.py`
- **provisioning_uri()** (7 connections) — `apps/accounts/mfa.py`
- **CurrentUserSerializer** (7 connections) — `apps/accounts/serializers.py`
- **.post()** (7 connections) — `apps/accounts/views.py`
- **APIView** (7 connections)
- **config/urls.py** (7 connections) — `config/urls.py`
- **Command** (6 connections) — `apps/accounts/management/commands/reset_admin_password.py`
- **generate_totp_secret()** (6 connections) — `apps/accounts/mfa.py`
- **LoginView** (6 connections) — `apps/accounts/views.py`
- **MFAConfirmView** (6 connections) — `apps/accounts/views.py`
- **MFASetupView** (6 connections) — `apps/accounts/views.py`
- **Command** (5 connections) — `apps/accounts/management/commands/bootstrap_mfa.py`
- **verify_totp()** (5 connections) — `apps/accounts/mfa.py`
- **PasswordResetConfirmSerializer** (5 connections) — `apps/accounts/serializers.py`
- **PasswordResetRequestSerializer** (5 connections) — `apps/accounts/serializers.py`
- **CurrentUserView** (5 connections) — `apps/accounts/views.py`
- *... and 46 more nodes in this community*

## Relationships

- [accounts/tests.py](accounts-tests.py.md) (13 shared connections)
- [AuditAction](AuditAction.md) (9 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (6 shared connections)
- [UserRole](UserRole.md) (6 shared connections)
- [record_audit_event](record_audit_event.md) (6 shared connections)
- [User](User.md) (5 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (4 shared connections)
- [consents/tests.py](consents-tests.py.md) (4 shared connections)
- [GeneratedDocument](GeneratedDocument.md) (4 shared connections)
- [billing/tests.py](billing-tests.py.md) (3 shared connections)
- [uuid](uuid.md) (2 shared connections)
- [notifications/views.py](notifications-views.py.md) (2 shared connections)

## Source Files

- `apps/accounts/management/commands/bootstrap_mfa.py`
- `apps/accounts/management/commands/reset_admin_password.py`
- `apps/accounts/mfa.py`
- `apps/accounts/models.py`
- `apps/accounts/serializers.py`
- `apps/accounts/urls.py`
- `apps/accounts/views.py`
- `apps/core/tests.py`
- `apps/core/views.py`
- `config/urls.py`

## Audit Trail

- EXTRACTED: 203 (91%)
- INFERRED: 19 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*