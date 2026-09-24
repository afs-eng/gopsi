# record_audit_event

> 25 nodes · cohesion 0.14

## Key Concepts

- **record_audit_event()** (25 connections) — `apps/audit/services.py`
- **AssessmentResultViewSet** (15 connections) — `apps/psychological_assessments/views.py`
- **audit/services.py** (13 connections) — `apps/audit/services.py`
- **AssessmentViewSet** (13 connections) — `apps/psychological_assessments/views.py`
- **record_timeline_event()** (13 connections) — `apps/psychological_assessments/views.py`
- **middleware.py** (5 connections) — `apps/audit/middleware.py`
- **.void()** (5 connections) — `apps/psychological_assessments/views.py`
- **.cancel()** (5 connections) — `apps/psychological_assessments/views.py`
- **AdminAuditMiddleware** (4 connections) — `apps/audit/middleware.py`
- **AssessmentCancelSerializer** (4 connections) — `apps/psychological_assessments/serializers.py`
- **AssessmentResultVoidSerializer** (4 connections) — `apps/psychological_assessments/serializers.py`
- **.finalize()** (4 connections) — `apps/psychological_assessments/views.py`
- **.perform_create()** (3 connections) — `apps/psychological_assessments/views.py`
- **.perform_destroy()** (3 connections) — `apps/psychological_assessments/views.py`
- **.perform_update()** (3 connections) — `apps/psychological_assessments/views.py`
- **action** (3 connections)
- **.post()** (2 connections) — `apps/accounts/views.py`
- **.__call__()** (2 connections) — `apps/audit/middleware.py`
- **client_ip()** (2 connections) — `apps/audit/services.py`
- **sanitize_metadata()** (2 connections) — `apps/audit/services.py`
- **.get_queryset()** (2 connections) — `apps/psychological_assessments/views.py`
- **.perform_create()** (2 connections) — `apps/psychological_assessments/views.py`
- **.perform_update()** (2 connections) — `apps/psychological_assessments/views.py`
- **logging** (2 connections)
- **.__init__()** (1 connections) — `apps/audit/middleware.py`

## Relationships

- [psychological_assessments/views.py](psychological_assessments-views.py.md) (17 shared connections)
- [AuditAction](AuditAction.md) (8 shared connections)
- [accounts/views.py](accounts-views.py.md) (6 shared connections)
- [psychological_assessments/models.py](psychological_assessments-models.py.md) (4 shared connections)
- [GeneratedDocument](GeneratedDocument.md) (3 shared connections)
- [MedicalRecordEntrySerializer](MedicalRecordEntrySerializer.md) (3 shared connections)
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) (3 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (2 shared connections)
- [DataSubjectRequestSerializer](DataSubjectRequestSerializer.md) (2 shared connections)
- [clinical_assessments_visible_to_user](clinical_assessments_visible_to_user.md) (2 shared connections)
- [AssessmentSerializer](AssessmentSerializer.md) (2 shared connections)
- [django_db](django_db.md) (1 shared connections)

## Source Files

- `apps/accounts/views.py`
- `apps/audit/middleware.py`
- `apps/audit/services.py`
- `apps/psychological_assessments/serializers.py`
- `apps/psychological_assessments/views.py`

## Audit Trail

- EXTRACTED: 81 (84%)
- INFERRED: 15 (16%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*