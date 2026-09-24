# UserRole

> 30 nodes · cohesion 0.24

## Key Concepts

- **UserRole** (152 connections) — `apps/accounts/models.py`
- **Clinic** (122 connections) — `apps/clinics/models.py`
- **ClinicMembership** (81 connections) — `apps/clinics/models.py`
- **clinics/tests.py** (31 connections) — `apps/clinics/tests.py`
- **django_db** (19 connections)
- **ClinicStaff** (13 connections) — `apps/clinics/models.py`
- **platform_preflight.py** (9 connections) — `apps/accounts/management/commands/platform_preflight.py`
- **test_clinic_admin_authority_requires_active_membership()** (6 connections) — `apps/clinics/tests.py`
- **test_clinic_admin_can_create_staff_with_system_access_and_disable_later()** (6 connections) — `apps/clinics/tests.py`
- **test_clinic_admin_can_enable_access_for_existing_staff_without_user()** (6 connections) — `apps/clinics/tests.py`
- **test_clinic_admin_can_manage_staff_crud()** (6 connections) — `apps/clinics/tests.py`
- **test_non_admin_cannot_manage_staff()** (6 connections) — `apps/clinics/tests.py`
- **test_clinic_admin_can_update_safe_metadata_for_own_active_clinic()** (5 connections) — `apps/clinics/tests.py`
- **test_clinic_admin_cannot_create_delete_deactivate_or_provision_from_workspace()** (5 connections) — `apps/clinics/tests.py`
- **test_clinic_user_is_denied_platform_control_plane_endpoints()** (5 connections) — `apps/clinics/tests.py`
- **test_non_platform_user_with_invalid_platform_membership_role_cannot_list_clinic()** (5 connections) — `apps/clinics/tests.py`
- **test_platform_admin_can_create_clinic_with_clinic_admin_user()** (5 connections) — `apps/clinics/tests.py`
- **test_platform_role_with_invalid_membership_fails_closed_for_clinic_list()** (5 connections) — `apps/clinics/tests.py`
- **test_user_cannot_retrieve_clinic_from_another_tenant()** (5 connections) — `apps/clinics/tests.py`
- **test_user_lists_only_own_clinics()** (5 connections) — `apps/clinics/tests.py`
- **test_non_platform_admin_cannot_create_clinic_from_api()** (4 connections) — `apps/clinics/tests.py`
- **test_platform_admin_cannot_create_clinic_without_clinic_admin_user()** (4 connections) — `apps/clinics/tests.py`
- **test_platform_operator_can_list_tenant_safe_clinic_metadata()** (4 connections) — `apps/clinics/tests.py`
- **test_platform_operator_can_update_and_deactivate_clinic()** (4 connections) — `apps/clinics/tests.py`
- **test_platform_operator_is_denied_by_clinic_workspace_endpoints()** (4 connections) — `apps/clinics/tests.py`
- *... and 5 more nodes in this community*

## Relationships

- [clinics/models.py](clinics-models.py.md) (29 shared connections)
- [Patient](Patient.md) (27 shared connections)
- [AuditAction](AuditAction.md) (26 shared connections)
- [Professional](Professional.md) (26 shared connections)
- [billing/tests.py](billing-tests.py.md) (22 shared connections)
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) (19 shared connections)
- [accounts/tests.py](accounts-tests.py.md) (18 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (16 shared connections)
- [medical_records/tests.py](medical_records-tests.py.md) (16 shared connections)
- [Appointment](Appointment.md) (15 shared connections)
- [GeneratedDocument](GeneratedDocument.md) (15 shared connections)
- [telehealth/tests.py](telehealth-tests.py.md) (13 shared connections)

## Source Files

- `apps/accounts/management/commands/platform_preflight.py`
- `apps/accounts/models.py`
- `apps/clinics/models.py`
- `apps/clinics/tests.py`

## Audit Trail

- EXTRACTED: 158 (38%)
- INFERRED: 262 (62%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*