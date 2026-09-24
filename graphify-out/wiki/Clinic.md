# Clinic

> God node · 122 connections · `apps/clinics/models.py`

**Community:** [UserRole](UserRole.md)

## Connections by Relation

### contains
- [clinics/models.py](clinics-models.py.md) `EXTRACTED`
- Meta `EXTRACTED`

### imports
- [billing/tests.py](billing-tests.py.md) `EXTRACTED`
- [psychological_assessments/models.py](psychological_assessments-models.py.md) `EXTRACTED`
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) `EXTRACTED`
- [accounts/tests.py](accounts-tests.py.md) `EXTRACTED`
- [telehealth/tests.py](telehealth-tests.py.md) `EXTRACTED`
- patients/models.py `EXTRACTED`
- [notifications/tests.py](notifications-tests.py.md) `EXTRACTED`
- clinics/tests.py `EXTRACTED`
- [professionals/models.py](professionals-models.py.md) `EXTRACTED`
- appointments/tests.py `EXTRACTED`
- [medical_records/tests.py](medical_records-tests.py.md) `EXTRACTED`
- appointments/models.py `EXTRACTED`
- billing/models.py `EXTRACTED`
- [consents/tests.py](consents-tests.py.md) `EXTRACTED`
- privacy/tests.py `EXTRACTED`
- patients/tests.py `EXTRACTED`
- documents/tests.py `EXTRACTED`
- medical_records/models.py `EXTRACTED`
- audit/models.py `EXTRACTED`
- documents/models.py `EXTRACTED`
- *…and 13 more `imports` connection(s) not listed (lowest-degree first to go)*

### method
- .__str__() `EXTRACTED`

### uses
- [Professional](Professional.md) `INFERRED`
- [Patient](Patient.md) `INFERRED`
- [Appointment](Appointment.md) `INFERRED`
- [Notification](Notification.md) `INFERRED`
- clinics_visible_to_user() `INFERRED`
- Invoice `INFERRED`
- Assessment `INFERRED`
- AuditEvent `INFERRED`
- TelehealthSession `INFERRED`
- Payment `INFERRED`
- MedicalRecordEntry `INFERRED`
- [GeneratedDocument](GeneratedDocument.md) `INFERRED`
- make_billing_context() `INFERRED`
- Subscription `INFERRED`
- ConsentRecord `INFERRED`
- make_online_context() `INFERRED`
- ScheduleBlock `INFERRED`
- make_assessment_context() `INFERRED`
- DataSubjectRequest `INFERRED`
- Transaction `INFERRED`
- *…and 66 more `uses` connection(s) not listed (lowest-degree first to go)*

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*