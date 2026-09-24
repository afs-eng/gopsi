# has_explicit_platform_role

> 30 nodes · cohesion 0.13

## Key Concepts

- **has_explicit_platform_role()** (116 connections) — `apps/accounts/models.py`
- **accounts/models.py** (70 connections) — `apps/accounts/models.py`
- **rest_framework_permissions** (16 connections)
- **audit/selectors.py** (8 connections) — `apps/audit/selectors.py`
- **telehealth/permissions.py** (8 connections) — `apps/telehealth/permissions.py`
- **audit_events_visible_to_user()** (7 connections) — `apps/audit/selectors.py`
- **CanAccessMedicalRecords** (7 connections) — `apps/medical_records/permissions.py`
- **CanManageClinicProfessionals** (7 connections) — `apps/professionals/permissions.py`
- **appointments/permissions.py** (6 connections) — `apps/appointments/permissions.py`
- **billing/permissions.py** (6 connections) — `apps/billing/permissions.py`
- **consents/permissions.py** (6 connections) — `apps/consents/permissions.py`
- **documents/permissions.py** (6 connections) — `apps/documents/permissions.py`
- **notifications/permissions.py** (6 connections) — `apps/notifications/permissions.py`
- **patients/permissions.py** (6 connections) — `apps/patients/permissions.py`
- **privacy/permissions.py** (6 connections) — `apps/privacy/permissions.py`
- **professionals/permissions.py** (6 connections) — `apps/professionals/permissions.py`
- **audit/permissions.py** (5 connections) — `apps/audit/permissions.py`
- **platform_permissions.py** (5 connections) — `apps/clinics/platform_permissions.py`
- **medical_records/permissions.py** (5 connections) — `apps/medical_records/permissions.py`
- **.clean()** (4 connections) — `apps/clinics/models.py`
- **.has_permission()** (3 connections) — `apps/psychological_assessments/permissions.py`
- **.has_object_permission()** (2 connections) — `apps/medical_records/permissions.py`
- **.has_permission()** (2 connections) — `apps/medical_records/permissions.py`
- **.has_object_permission()** (2 connections) — `apps/professionals/permissions.py`
- **.has_permission()** (2 connections) — `apps/professionals/permissions.py`
- *... and 5 more nodes in this community*

## Relationships

- [clinics_visible_to_user](clinics_visible_to_user.md) (21 shared connections)
- [billing/tests.py](billing-tests.py.md) (17 shared connections)
- [UserRole](UserRole.md) (16 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (13 shared connections)
- [clinics/models.py](clinics-models.py.md) (13 shared connections)
- [GeneratedDocument](GeneratedDocument.md) (11 shared connections)
- [consents/views.py](consents-views.py.md) (10 shared connections)
- [notifications/views.py](notifications-views.py.md) (10 shared connections)
- [DataSubjectRequestSerializer](DataSubjectRequestSerializer.md) (9 shared connections)
- [MedicalRecordEntrySerializer](MedicalRecordEntrySerializer.md) (8 shared connections)
- [accounts/views.py](accounts-views.py.md) (6 shared connections)
- [professionals/models.py](professionals-models.py.md) (6 shared connections)

## Source Files

- `apps/accounts/models.py`
- `apps/appointments/permissions.py`
- `apps/audit/permissions.py`
- `apps/audit/selectors.py`
- `apps/billing/permissions.py`
- `apps/clinics/models.py`
- `apps/clinics/platform_permissions.py`
- `apps/consents/permissions.py`
- `apps/documents/permissions.py`
- `apps/medical_records/permissions.py`
- `apps/notifications/permissions.py`
- `apps/patients/permissions.py`
- `apps/privacy/permissions.py`
- `apps/professionals/permissions.py`
- `apps/psychological_assessments/permissions.py`
- `apps/psychological_assessments/serializers.py`
- `apps/telehealth/permissions.py`

## Audit Trail

- EXTRACTED: 259 (98%)
- INFERRED: 6 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*