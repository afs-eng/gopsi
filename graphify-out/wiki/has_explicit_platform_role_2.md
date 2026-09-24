# has_explicit_platform_role()

> God node · 116 connections · `apps/accounts/models.py`

**Community:** [has_explicit_platform_role](has_explicit_platform_role.md)

## Connections by Relation

### calls
- clinics_visible_to_user() `EXTRACTED`
- patients_visible_to_user() `EXTRACTED`
- professionals_visible_to_user() `EXTRACTED`
- clinical_assessments_visible_to_user() `EXTRACTED`
- is_platform_operator() `EXTRACTED`
- invoices_visible_to_user() `EXTRACTED`
- consent_templates_visible_to_user() `EXTRACTED`
- document_templates_visible_to_user() `EXTRACTED`
- generated_documents_visible_to_user() `EXTRACTED`
- notification_templates_visible_to_user() `EXTRACTED`
- appointment_clinic_ids_for_user() `EXTRACTED`
- plans_visible_to_user() `EXTRACTED`
- audit_events_visible_to_user() `EXTRACTED`
- payments_visible_to_user() `EXTRACTED`
- subscriptions_visible_to_user() `EXTRACTED`
- transactions_visible_to_user() `EXTRACTED`
- consent_records_visible_to_user() `EXTRACTED`
- notifications_visible_to_user() `EXTRACTED`
- data_subject_requests_visible_to_user() `EXTRACTED`
- telehealth_events_visible_to_user() `EXTRACTED`
- *…and 55 more `calls` connection(s) not listed (lowest-degree first to go)*

### contains
- accounts/models.py `EXTRACTED`

### imports
- [clinics/models.py](clinics-models.py.md) `EXTRACTED`
- psychological_assessments/serializers.py `EXTRACTED`
- telehealth/serializers.py `EXTRACTED`
- billing/serializers.py `EXTRACTED`
- medical_records/serializers.py `EXTRACTED`
- documents/serializers.py `EXTRACTED`
- notifications/serializers.py `EXTRACTED`
- billing/selectors.py `EXTRACTED`
- clinics/selectors.py `EXTRACTED`
- consents/serializers.py `EXTRACTED`
- privacy/serializers.py `EXTRACTED`
- [appointments/selectors.py](appointments-selectors.py.md) `EXTRACTED`
- appointments/serializers.py `EXTRACTED`
- patients/selectors.py `EXTRACTED`
- patients/serializers.py `EXTRACTED`
- documents/selectors.py `EXTRACTED`
- psychological_assessments/selectors.py `EXTRACTED`
- consents/selectors.py `EXTRACTED`
- notifications/selectors.py `EXTRACTED`
- professionals/selectors.py `EXTRACTED`
- *…and 19 more `imports` connection(s) not listed (lowest-degree first to go)*

### rationale_for
- Return whether the application role identifies a platform account. `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*