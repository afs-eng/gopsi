# MedicalRecordEntrySerializer

> 29 nodes · cohesion 0.11

## Key Concepts

- **MedicalRecordEntrySerializer** (18 connections) — `apps/medical_records/serializers.py`
- **medical_records/views.py** (18 connections) — `apps/medical_records/views.py`
- **medical_records/selectors.py** (10 connections) — `apps/medical_records/selectors.py`
- **MedicalRecordEntryViewSet** (10 connections) — `apps/medical_records/views.py`
- **medical_record_audit_visible_to_user()** (6 connections) — `apps/medical_records/selectors.py`
- **medical_records_visible_to_user()** (6 connections) — `apps/medical_records/selectors.py`
- **MedicalRecordAuditEventViewSet** (6 connections) — `apps/medical_records/views.py`
- **MedicalRecordAuditEventSerializer** (5 connections) — `apps/medical_records/serializers.py`
- **medical_records/urls.py** (5 connections) — `apps/medical_records/urls.py`
- **medical_record_clinic_ids_for_user()** (4 connections) — `apps/medical_records/selectors.py`
- **._record_change()** (4 connections) — `apps/medical_records/serializers.py`
- **.retrieve()** (4 connections) — `apps/medical_records/views.py`
- **.create()** (3 connections) — `apps/medical_records/serializers.py`
- **.update()** (3 connections) — `apps/medical_records/serializers.py`
- **.validate()** (3 connections) — `apps/medical_records/serializers.py`
- **Meta** (3 connections) — `apps/medical_records/serializers.py`
- **QuerySet** (2 connections)
- **.validate_clinic()** (2 connections) — `apps/medical_records/serializers.py`
- **.validate_patient()** (2 connections) — `apps/medical_records/serializers.py`
- **.validate_professional()** (2 connections) — `apps/medical_records/serializers.py`
- **.void()** (2 connections) — `apps/medical_records/serializers.py`
- **atomic** (2 connections)
- **.get_queryset()** (2 connections) — `apps/medical_records/views.py`
- **.get_queryset()** (2 connections) — `apps/medical_records/views.py`
- **.void()** (2 connections) — `apps/medical_records/views.py`
- *... and 4 more nodes in this community*

## Relationships

- [medical_records/tests.py](medical_records-tests.py.md) (16 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (8 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (3 shared connections)
- [notifications/views.py](notifications-views.py.md) (3 shared connections)
- [AuditAction](AuditAction.md) (3 shared connections)
- [record_audit_event](record_audit_event.md) (3 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (1 shared connections)
- [professionals_visible_to_user](professionals_visible_to_user.md) (1 shared connections)
- [accounts/views.py](accounts-views.py.md) (1 shared connections)
- [rest_framework_viewsets](rest_framework_viewsets.md) (1 shared connections)

## Source Files

- `apps/medical_records/selectors.py`
- `apps/medical_records/serializers.py`
- `apps/medical_records/urls.py`
- `apps/medical_records/views.py`

## Audit Trail

- EXTRACTED: 72 (85%)
- INFERRED: 13 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*