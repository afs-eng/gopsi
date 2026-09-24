# ClinicMembership

> God node · 81 connections · `apps/clinics/models.py`

**Community:** [UserRole](UserRole.md)

## Connections by Relation

### contains
- [clinics/models.py](clinics-models.py.md) `EXTRACTED`
- Meta `EXTRACTED`

### imports
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
- audit/tests.py `EXTRACTED`
- platform_serializers.py `EXTRACTED`
- platform_preflight.py `EXTRACTED`
- [clinics/admin.py](clinics-admin.py.md) `EXTRACTED`

### method
- .clean() `EXTRACTED`
- .__str__() `EXTRACTED`

### uses
- [UserRole](UserRole.md) `INFERRED`
- make_billing_context() `INFERRED`
- make_online_context() `INFERRED`
- make_assessment_context() `INFERRED`
- make_clinic_context() `INFERRED`
- make_context() `INFERRED`
- ClinicStaffSerializer `INFERRED`
- make_context() `INFERRED`
- make_clinic_context() `INFERRED`
- make_context() `INFERRED`
- test_platform_operator_cannot_access_records_or_audit_with_accidental_access() `INFERRED`
- test_platform_operator_denied_assessments_with_accidental_access() `INFERRED`
- test_user_cannot_retrieve_telehealth_session_from_other_tenant() `INFERRED`
- test_platform_operator_denied_schedule_with_accidental_access() `INFERRED`
- PlatformClinicSerializer `INFERRED`
- test_clinic_admin_can_create_patient_with_guardian_and_professional_link() `INFERRED`
- test_clinic_admin_can_update_guardians_and_professional_link() `INFERRED`
- make_context() `INFERRED`
- [Command](Command.md) `INFERRED`
- test_platform_operator_is_denied_consent_list_detail_write_and_revoke() `INFERRED`
- *…and 39 more `uses` connection(s) not listed (lowest-degree first to go)*

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*