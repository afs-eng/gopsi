# AuditAction

> 33 nodes · cohesion 0.14

## Key Concepts

- **AuditAction** (32 connections) — `apps/audit/models.py`
- **AuditEvent** (27 connections) — `apps/audit/models.py`
- **privacy/tests.py** (25 connections) — `apps/privacy/tests.py`
- **audit/models.py** (21 connections) — `apps/audit/models.py`
- **DataSubjectRequest** (18 connections) — `apps/privacy/models.py`
- **audit/tests.py** (17 connections) — `apps/audit/tests.py`
- **pytest** (14 connections)
- **rest_framework_test** (14 connections)
- **make_context()** (10 connections) — `apps/privacy/tests.py`
- **test_clinic_admin_lists_only_own_audit_events()** (8 connections) — `apps/audit/tests.py`
- **test_platform_operator_is_denied_privacy_request_list_detail_and_write()** (8 connections) — `apps/privacy/tests.py`
- **test_platform_operator_cannot_list_clinical_audit_events()** (7 connections) — `apps/audit/tests.py`
- **test_platform_operator_cannot_retrieve_clinical_audit_event()** (7 connections) — `apps/audit/tests.py`
- **test_updating_privacy_request_sets_handler_completion_and_audit()** (7 connections) — `apps/privacy/tests.py`
- **make_user()** (6 connections) — `apps/audit/tests.py`
- **test_platform_operator_cannot_write_clinical_audit_events()** (6 connections) — `apps/audit/tests.py`
- **test_clinic_admin_can_create_privacy_request_with_audit()** (6 connections) — `apps/privacy/tests.py`
- **AuditEventAdmin** (5 connections) — `apps/audit/admin.py`
- **DataSubjectRequestStatus** (5 connections) — `apps/privacy/models.py`
- **audit/admin.py** (4 connections) — `apps/audit/admin.py`
- **django_db** (4 connections)
- **make_user()** (4 connections) — `apps/privacy/tests.py`
- **django_db** (4 connections)
- **test_privacy_request_rejects_patient_from_other_clinic()** (4 connections) — `apps/privacy/tests.py`
- **.save()** (3 connections) — `apps/privacy/models.py`
- *... and 8 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (26 shared connections)
- [accounts/tests.py](accounts-tests.py.md) (11 shared connections)
- [accounts/views.py](accounts-views.py.md) (9 shared connections)
- [record_audit_event](record_audit_event.md) (8 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (7 shared connections)
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) (6 shared connections)
- [psychological_assessments/views.py](psychological_assessments-views.py.md) (6 shared connections)
- [DataSubjectRequestSerializer](DataSubjectRequestSerializer.md) (6 shared connections)
- [Patient](Patient.md) (6 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (5 shared connections)
- [GeneratedDocument](GeneratedDocument.md) (5 shared connections)
- [consents/tests.py](consents-tests.py.md) (4 shared connections)

## Source Files

- `apps/audit/admin.py`
- `apps/audit/models.py`
- `apps/audit/tests.py`
- `apps/privacy/models.py`
- `apps/privacy/tests.py`

## Audit Trail

- EXTRACTED: 135 (68%)
- INFERRED: 65 (32%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*