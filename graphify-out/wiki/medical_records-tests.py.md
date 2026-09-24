# medical_records/tests.py

> 29 nodes · cohesion 0.19

## Key Concepts

- **medical_records/tests.py** (29 connections) — `apps/medical_records/tests.py`
- **MedicalRecordEntry** (24 connections) — `apps/medical_records/models.py`
- **medical_records/models.py** (23 connections) — `apps/medical_records/models.py`
- **medical_records/serializers.py** (23 connections) — `apps/medical_records/serializers.py`
- **MedicalRecordAuditEvent** (17 connections) — `apps/medical_records/models.py`
- **make_clinic_context()** (13 connections) — `apps/medical_records/tests.py`
- **MedicalRecordEntryVersion** (12 connections) — `apps/medical_records/models.py`
- **test_platform_operator_cannot_access_records_or_audit_with_accidental_access()** (12 connections) — `apps/medical_records/tests.py`
- **MedicalRecordAuditAction** (10 connections) — `apps/medical_records/models.py`
- **medical_records/admin.py** (8 connections) — `apps/medical_records/admin.py`
- **MedicalRecordEntryStatus** (7 connections) — `apps/medical_records/models.py`
- **test_destroy_medical_record_voids_entry_and_audits()** (7 connections) — `apps/medical_records/tests.py`
- **test_professional_can_create_medical_record_with_history_and_audit()** (7 connections) — `apps/medical_records/tests.py`
- **test_receptionist_cannot_create_medical_record()** (7 connections) — `apps/medical_records/tests.py`
- **test_update_medical_record_creates_new_version_and_audit_event()** (7 connections) — `apps/medical_records/tests.py`
- **test_user_cannot_list_medical_records_from_other_tenant()** (7 connections) — `apps/medical_records/tests.py`
- **django_db** (6 connections)
- **make_user()** (5 connections) — `apps/medical_records/tests.py`
- **register** (3 connections)
- **.save()** (3 connections) — `apps/medical_records/models.py`
- **Meta** (3 connections) — `apps/medical_records/models.py`
- **MedicalRecordEntryVersionSerializer** (3 connections) — `apps/medical_records/serializers.py`
- **MedicalRecordAuditEventAdmin** (2 connections) — `apps/medical_records/admin.py`
- **MedicalRecordEntryAdmin** (2 connections) — `apps/medical_records/admin.py`
- **MedicalRecordEntryVersionAdmin** (2 connections) — `apps/medical_records/admin.py`
- *... and 4 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (16 shared connections)
- [django_db](django_db.md) (16 shared connections)
- [MedicalRecordEntrySerializer](MedicalRecordEntrySerializer.md) (16 shared connections)
- [Patient](Patient.md) (8 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (8 shared connections)
- [Professional](Professional.md) (6 shared connections)
- [Appointment](Appointment.md) (5 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (3 shared connections)
- [uuid](uuid.md) (2 shared connections)
- [professionals/models.py](professionals-models.py.md) (2 shared connections)
- [clinics/models.py](clinics-models.py.md) (2 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (2 shared connections)

## Source Files

- `apps/medical_records/admin.py`
- `apps/medical_records/models.py`
- `apps/medical_records/serializers.py`
- `apps/medical_records/tests.py`

## Audit Trail

- EXTRACTED: 115 (68%)
- INFERRED: 54 (32%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*