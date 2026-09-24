# Patient

> God node · 61 connections · `apps/patients/models.py`

**Community:** [Patient](Patient.md)

## Connections by Relation

### contains
- patients/models.py `EXTRACTED`
- Meta `EXTRACTED`

### imports
- [billing/tests.py](billing-tests.py.md) `EXTRACTED`
- [psychological_assessments/models.py](psychological_assessments-models.py.md) `EXTRACTED`
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) `EXTRACTED`
- [telehealth/tests.py](telehealth-tests.py.md) `EXTRACTED`
- [notifications/tests.py](notifications-tests.py.md) `EXTRACTED`
- appointments/tests.py `EXTRACTED`
- [medical_records/tests.py](medical_records-tests.py.md) `EXTRACTED`
- appointments/models.py `EXTRACTED`
- billing/models.py `EXTRACTED`
- [consents/tests.py](consents-tests.py.md) `EXTRACTED`
- privacy/tests.py `EXTRACTED`
- patients/tests.py `EXTRACTED`
- documents/tests.py `EXTRACTED`
- medical_records/models.py `EXTRACTED`
- documents/models.py `EXTRACTED`
- [notifications/models.py](notifications-models.py.md) `EXTRACTED`
- privacy/models.py `EXTRACTED`
- consents/models.py `EXTRACTED`
- patients/selectors.py `EXTRACTED`
- patients/serializers.py `EXTRACTED`
- *…and 1 more `imports` connection(s) not listed (lowest-degree first to go)*

### method
- .__str__() `EXTRACTED`

### uses
- [Clinic](Clinic.md) `INFERRED`
- [Appointment](Appointment.md) `INFERRED`
- [Notification](Notification.md) `INFERRED`
- Invoice `INFERRED`
- Assessment `INFERRED`
- MedicalRecordEntry `INFERRED`
- patients_visible_to_user() `INFERRED`
- [GeneratedDocument](GeneratedDocument.md) `INFERRED`
- make_billing_context() `INFERRED`
- ConsentRecord `INFERRED`
- make_online_context() `INFERRED`
- make_assessment_context() `INFERRED`
- DataSubjectRequest `INFERRED`
- make_clinic_context() `INFERRED`
- make_context() `INFERRED`
- make_context() `INFERRED`
- make_clinic_context() `INFERRED`
- PatientSerializer `INFERRED`
- make_context() `INFERRED`
- test_platform_operator_cannot_access_records_or_audit_with_accidental_access() `INFERRED`
- *…and 17 more `uses` connection(s) not listed (lowest-degree first to go)*

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*