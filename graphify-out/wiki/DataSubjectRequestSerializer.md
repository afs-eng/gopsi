# DataSubjectRequestSerializer

> 20 nodes · cohesion 0.13

## Key Concepts

- **DataSubjectRequestSerializer** (12 connections) — `apps/privacy/serializers.py`
- **privacy/selectors.py** (9 connections) — `apps/privacy/selectors.py`
- **privacy/views.py** (9 connections) — `apps/privacy/views.py`
- **CanManagePrivacyRequests** (7 connections) — `apps/privacy/permissions.py`
- **data_subject_requests_visible_to_user()** (7 connections) — `apps/privacy/selectors.py`
- **DataSubjectRequestViewSet** (6 connections) — `apps/privacy/views.py`
- **privacy_clinic_ids_for_user()** (4 connections) — `apps/privacy/selectors.py`
- **privacy/urls.py** (4 connections) — `apps/privacy/urls.py`
- **.validate()** (3 connections) — `apps/privacy/serializers.py`
- **.has_object_permission()** (2 connections) — `apps/privacy/permissions.py`
- **.has_permission()** (2 connections) — `apps/privacy/permissions.py`
- **.create()** (2 connections) — `apps/privacy/serializers.py`
- **.update()** (2 connections) — `apps/privacy/serializers.py`
- **.validate_clinic()** (2 connections) — `apps/privacy/serializers.py`
- **.validate_patient()** (2 connections) — `apps/privacy/serializers.py`
- **.get_queryset()** (2 connections) — `apps/privacy/views.py`
- **BasePermission** (1 connections)
- **QuerySet** (1 connections)
- **Meta** (1 connections) — `apps/privacy/serializers.py`
- **ModelViewSet** (1 connections)

## Relationships

- [has_explicit_platform_role](has_explicit_platform_role.md) (9 shared connections)
- [AuditAction](AuditAction.md) (6 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (6 shared connections)
- [UserRole](UserRole.md) (3 shared connections)
- [record_audit_event](record_audit_event.md) (2 shared connections)
- [accounts/views.py](accounts-views.py.md) (1 shared connections)
- [notifications/views.py](notifications-views.py.md) (1 shared connections)
- [rest_framework_viewsets](rest_framework_viewsets.md) (1 shared connections)

## Source Files

- `apps/privacy/permissions.py`
- `apps/privacy/selectors.py`
- `apps/privacy/serializers.py`
- `apps/privacy/urls.py`
- `apps/privacy/views.py`

## Audit Trail

- EXTRACTED: 46 (85%)
- INFERRED: 8 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*