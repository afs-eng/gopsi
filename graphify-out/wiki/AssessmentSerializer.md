# AssessmentSerializer

> 14 nodes · cohesion 0.16

## Key Concepts

- **AssessmentSerializer** (17 connections) — `apps/psychological_assessments/serializers.py`
- **psychological_assessments/selectors.py** (13 connections) — `apps/psychological_assessments/selectors.py`
- **assessments_visible_to_user()** (6 connections) — `apps/psychological_assessments/selectors.py`
- **can_access_clinical_assessment_content()** (6 connections) — `apps/psychological_assessments/selectors.py`
- **.has_object_permission()** (4 connections) — `apps/psychological_assessments/permissions.py`
- **assessment_clinic_ids_for_user()** (4 connections) — `apps/psychological_assessments/selectors.py`
- **.to_representation()** (4 connections) — `apps/psychological_assessments/serializers.py`
- **.validate()** (4 connections) — `apps/psychological_assessments/serializers.py`
- **QuerySet** (2 connections)
- **._validate_status_transition()** (2 connections) — `apps/psychological_assessments/serializers.py`
- **.get_queryset()** (2 connections) — `apps/psychological_assessments/views.py`
- **.cancel()** (1 connections) — `apps/psychological_assessments/serializers.py`
- **.create()** (1 connections) — `apps/psychological_assessments/serializers.py`
- **.update()** (1 connections) — `apps/psychological_assessments/serializers.py`

## Relationships

- [has_explicit_platform_role](has_explicit_platform_role.md) (6 shared connections)
- [psychological_assessments/views.py](psychological_assessments-views.py.md) (6 shared connections)
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) (6 shared connections)
- [psychological_assessments/models.py](psychological_assessments-models.py.md) (5 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (3 shared connections)
- [clinical_assessments_visible_to_user](clinical_assessments_visible_to_user.md) (3 shared connections)
- [UserRole](UserRole.md) (2 shared connections)
- [record_audit_event](record_audit_event.md) (2 shared connections)
- [clinics/models.py](clinics-models.py.md) (1 shared connections)
- [professionals_visible_to_user](professionals_visible_to_user.md) (1 shared connections)

## Source Files

- `apps/psychological_assessments/permissions.py`
- `apps/psychological_assessments/selectors.py`
- `apps/psychological_assessments/serializers.py`
- `apps/psychological_assessments/views.py`

## Audit Trail

- EXTRACTED: 44 (86%)
- INFERRED: 7 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*