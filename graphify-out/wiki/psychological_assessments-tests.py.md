# psychological_assessments/tests.py

> 28 nodes · cohesion 0.22

## Key Concepts

- **psychological_assessments/tests.py** (42 connections) — `apps/psychological_assessments/tests.py`
- **Assessment** (30 connections) — `apps/psychological_assessments/models.py`
- **make_assessment_context()** (19 connections) — `apps/psychological_assessments/tests.py`
- **AssessmentResult** (17 connections) — `apps/psychological_assessments/models.py`
- **django_db** (13 connections)
- **test_professional_can_register_assessment_session_instrument_result_and_document()** (13 connections) — `apps/psychological_assessments/tests.py`
- **test_platform_operator_denied_assessments_with_accidental_access()** (12 connections) — `apps/psychological_assessments/tests.py`
- **AssessmentTimelineEvent** (11 connections) — `apps/psychological_assessments/models.py`
- **AssessmentPlan** (10 connections) — `apps/psychological_assessments/models.py`
- **AssessmentResultStatus** (10 connections) — `apps/psychological_assessments/models.py`
- **test_clinic_admin_without_professional_profile_cannot_access_clinical_content()** (9 connections) — `apps/psychological_assessments/tests.py`
- **Meta** (8 connections) — `apps/psychological_assessments/models.py`
- **test_professional_can_finalize_and_void_assessment_result_with_reason()** (8 connections) — `apps/psychological_assessments/tests.py`
- **make_user()** (7 connections) — `apps/psychological_assessments/tests.py`
- **test_clinic_admin_can_create_assessment_for_clinic_professional()** (7 connections) — `apps/psychological_assessments/tests.py`
- **test_receptionist_cannot_create_psychological_assessment()** (7 connections) — `apps/psychological_assessments/tests.py`
- **test_user_cannot_list_assessments_from_other_tenant()** (7 connections) — `apps/psychological_assessments/tests.py`
- **test_assessment_rejects_patient_from_another_clinic()** (6 connections) — `apps/psychological_assessments/tests.py`
- **test_assessment_status_transitions_require_final_result_before_completion()** (6 connections) — `apps/psychological_assessments/tests.py`
- **test_professional_can_list_catalog_and_register_catalog_instrument_payload()** (6 connections) — `apps/psychological_assessments/tests.py`
- **test_cancel_assessment_requires_reason_and_records_timeline()** (5 connections) — `apps/psychological_assessments/tests.py`
- **test_destroy_assessment_cancels_and_soft_deletes()** (4 connections) — `apps/psychological_assessments/tests.py`
- **test_professional_can_create_psychological_assessment()** (4 connections) — `apps/psychological_assessments/tests.py`
- **.clean()** (1 connections) — `apps/psychological_assessments/models.py`
- **.__str__()** (1 connections) — `apps/psychological_assessments/models.py`
- *... and 3 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (19 shared connections)
- [psychological_assessments/models.py](psychological_assessments-models.py.md) (17 shared connections)
- [AssessmentSession](AssessmentSession.md) (8 shared connections)
- [psychological_assessments/views.py](psychological_assessments-views.py.md) (8 shared connections)
- [Patient](Patient.md) (7 shared connections)
- [AssessmentSerializer](AssessmentSerializer.md) (6 shared connections)
- [AuditAction](AuditAction.md) (6 shared connections)
- [clinical_assessments_visible_to_user](clinical_assessments_visible_to_user.md) (5 shared connections)
- [Professional](Professional.md) (5 shared connections)
- [psychological_assessments/admin.py](psychological_assessments-admin.py.md) (3 shared connections)
- [record_audit_event](record_audit_event.md) (3 shared connections)
- [AssessmentDocument](AssessmentDocument.md) (3 shared connections)

## Source Files

- `apps/psychological_assessments/models.py`
- `apps/psychological_assessments/tests.py`

## Audit Trail

- EXTRACTED: 108 (59%)
- INFERRED: 74 (41%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*