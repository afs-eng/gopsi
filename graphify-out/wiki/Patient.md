# Patient

> 27 nodes · cohesion 0.18

## Key Concepts

- **Patient** (61 connections) — `apps/patients/models.py`
- **patients/models.py** (34 connections) — `apps/patients/models.py`
- **patients/tests.py** (24 connections) — `apps/patients/tests.py`
- **ProfessionalPatient** (12 connections) — `apps/patients/models.py`
- **Guardian** (11 connections) — `apps/patients/models.py`
- **patients/admin.py** (10 connections) — `apps/patients/admin.py`
- **test_clinic_admin_can_create_patient_with_guardian_and_professional_link()** (10 connections) — `apps/patients/tests.py`
- **test_clinic_admin_can_update_guardians_and_professional_link()** (10 connections) — `apps/patients/tests.py`
- **make_user()** (9 connections) — `apps/patients/tests.py`
- **test_destroy_patient_uses_soft_delete()** (8 connections) — `apps/patients/tests.py`
- **test_platform_operator_denied_patients_with_accidental_access()** (8 connections) — `apps/patients/tests.py`
- **django_db** (7 connections)
- **test_clinic_admin_cannot_create_patient_for_other_clinic()** (7 connections) — `apps/patients/tests.py`
- **test_user_cannot_retrieve_patient_from_other_tenant()** (7 connections) — `apps/patients/tests.py`
- **test_user_lists_only_patients_from_own_clinic()** (7 connections) — `apps/patients/tests.py`
- **PatientStatus** (5 connections) — `apps/patients/models.py`
- **register** (3 connections)
- **Meta** (3 connections) — `apps/patients/models.py`
- **GuardianAdmin** (2 connections) — `apps/patients/admin.py`
- **GuardianInline** (2 connections) — `apps/patients/admin.py`
- **PatientAdmin** (2 connections) — `apps/patients/admin.py`
- **ProfessionalPatientAdmin** (2 connections) — `apps/patients/admin.py`
- **ProfessionalPatientInline** (2 connections) — `apps/patients/admin.py`
- **.__str__()** (1 connections) — `apps/patients/models.py`
- **.__str__()** (1 connections) — `apps/patients/models.py`
- *... and 2 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (27 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (11 shared connections)
- [Appointment](Appointment.md) (8 shared connections)
- [medical_records/tests.py](medical_records-tests.py.md) (8 shared connections)
- [consents/tests.py](consents-tests.py.md) (7 shared connections)
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) (7 shared connections)
- [Professional](Professional.md) (6 shared connections)
- [billing/tests.py](billing-tests.py.md) (6 shared connections)
- [GeneratedDocument](GeneratedDocument.md) (6 shared connections)
- [AuditAction](AuditAction.md) (6 shared connections)
- [telehealth/tests.py](telehealth-tests.py.md) (4 shared connections)
- [django_db](django_db.md) (3 shared connections)

## Source Files

- `apps/patients/admin.py`
- `apps/patients/models.py`
- `apps/patients/tests.py`

## Audit Trail

- EXTRACTED: 111 (60%)
- INFERRED: 75 (40%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*