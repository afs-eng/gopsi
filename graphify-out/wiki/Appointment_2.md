# Appointment

> God node · 45 connections · `apps/appointments/models.py`

**Community:** [Appointment](Appointment.md)

## Connections by Relation

### calls
- .validate() `EXTRACTED`

### contains
- appointments/models.py `EXTRACTED`
- Meta `EXTRACTED`

### imports
- [billing/tests.py](billing-tests.py.md) `EXTRACTED`
- [telehealth/tests.py](telehealth-tests.py.md) `EXTRACTED`
- [notifications/tests.py](notifications-tests.py.md) `EXTRACTED`
- appointments/tests.py `EXTRACTED`
- [medical_records/tests.py](medical_records-tests.py.md) `EXTRACTED`
- billing/models.py `EXTRACTED`
- medical_records/models.py `EXTRACTED`
- [notifications/models.py](notifications-models.py.md) `EXTRACTED`
- telehealth/models.py `EXTRACTED`
- [appointments/selectors.py](appointments-selectors.py.md) `EXTRACTED`
- billing/services.py `EXTRACTED`
- appointments/serializers.py `EXTRACTED`
- appointments/admin.py `EXTRACTED`

### method
- .save() `EXTRACTED`
- .__str__() `EXTRACTED`
- .clean() `EXTRACTED`

### references
- .create_invoice_for_appointment() `EXTRACTED`

### uses
- [Clinic](Clinic.md) `INFERRED`
- [Professional](Professional.md) `INFERRED`
- [Patient](Patient.md) `INFERRED`
- [Notification](Notification.md) `INFERRED`
- Invoice `INFERRED`
- TelehealthSession `INFERRED`
- MedicalRecordEntry `INFERRED`
- make_billing_context() `INFERRED`
- make_online_context() `INFERRED`
- appointments_visible_to_user() `INFERRED`
- make_context() `INFERRED`
- BillingService `INFERRED`
- make_clinic_context() `INFERRED`
- test_platform_operator_cannot_access_records_or_audit_with_accidental_access() `INFERRED`
- test_user_cannot_retrieve_telehealth_session_from_other_tenant() `INFERRED`
- CareModality `INFERRED`
- test_platform_operator_denied_schedule_with_accidental_access() `INFERRED`
- AppointmentSerializer `INFERRED`
- test_user_cannot_list_appointments_from_other_tenant() `INFERRED`
- test_user_cannot_retrieve_appointment_from_other_tenant() `INFERRED`
- *…and 5 more `uses` connection(s) not listed (lowest-degree first to go)*

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*