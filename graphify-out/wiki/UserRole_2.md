# UserRole

> God node · 152 connections · `apps/accounts/models.py`

**Community:** [UserRole](UserRole.md)

## Connections by Relation

### contains
- accounts/models.py `EXTRACTED`

### imports
- [clinics/models.py](clinics-models.py.md) `EXTRACTED`
- [billing/tests.py](billing-tests.py.md) `EXTRACTED`
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) `EXTRACTED`
- [accounts/tests.py](accounts-tests.py.md) `EXTRACTED`
- [telehealth/tests.py](telehealth-tests.py.md) `EXTRACTED`
- [notifications/tests.py](notifications-tests.py.md) `EXTRACTED`
- clinics/tests.py `EXTRACTED`
- appointments/tests.py `EXTRACTED`
- [medical_records/tests.py](medical_records-tests.py.md) `EXTRACTED`
- [consents/tests.py](consents-tests.py.md) `EXTRACTED`
- privacy/tests.py `EXTRACTED`
- patients/tests.py `EXTRACTED`
- documents/tests.py `EXTRACTED`
- professionals/tests.py `EXTRACTED`
- clinics/serializers.py `EXTRACTED`
- billing/selectors.py `EXTRACTED`
- clinics/selectors.py `EXTRACTED`
- [appointments/selectors.py](appointments-selectors.py.md) `EXTRACTED`
- audit/tests.py `EXTRACTED`
- patients/selectors.py `EXTRACTED`
- *…and 19 more `imports` connection(s) not listed (lowest-degree first to go)*

### uses
- [ClinicMembership](ClinicMembership.md) `INFERRED`
- patients_visible_to_user() `INFERRED`
- make_billing_context() `INFERRED`
- make_online_context() `INFERRED`
- make_assessment_context() `INFERRED`
- make_clinic_context() `INFERRED`
- is_clinic_admin() `INFERRED`
- make_context() `INFERRED`
- ClinicStaffSerializer `INFERRED`
- make_context() `INFERRED`
- make_clinic_context() `INFERRED`
- make_user() `INFERRED`
- make_context() `INFERRED`
- test_platform_operator_cannot_access_records_or_audit_with_accidental_access() `INFERRED`
- test_platform_operator_denied_assessments_with_accidental_access() `INFERRED`
- test_user_cannot_retrieve_telehealth_session_from_other_tenant() `INFERRED`
- CanManageBilling `INFERRED`
- test_platform_operator_denied_schedule_with_accidental_access() `INFERRED`
- PlatformClinicSerializer `INFERRED`
- test_clinic_admin_can_create_patient_with_guardian_and_professional_link() `INFERRED`
- *…and 92 more `uses` connection(s) not listed (lowest-degree first to go)*

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*