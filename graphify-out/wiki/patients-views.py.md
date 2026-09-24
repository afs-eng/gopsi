# patients/views.py

> 11 nodes · cohesion 0.22

## Key Concepts

- **patients/views.py** (12 connections) — `apps/patients/views.py`
- **PatientViewSet** (8 connections) — `apps/patients/views.py`
- **CanManageClinicPatients** (7 connections) — `apps/patients/permissions.py`
- **patients/urls.py** (4 connections) — `apps/patients/urls.py`
- **.has_object_permission()** (2 connections) — `apps/patients/permissions.py`
- **.has_permission()** (2 connections) — `apps/patients/permissions.py`
- **.get_queryset()** (2 connections) — `apps/patients/views.py`
- **BasePermission** (1 connections)
- **.perform_destroy()** (1 connections) — `apps/patients/views.py`
- **ModelViewSet** (1 connections)
- **rest_framework_parsers** (1 connections)

## Relationships

- [has_explicit_platform_role](has_explicit_platform_role.md) (4 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (4 shared connections)
- [Patient](Patient.md) (3 shared connections)
- [professionals_visible_to_user](professionals_visible_to_user.md) (2 shared connections)
- [UserRole](UserRole.md) (1 shared connections)
- [accounts/views.py](accounts-views.py.md) (1 shared connections)
- [notifications/views.py](notifications-views.py.md) (1 shared connections)
- [rest_framework_viewsets](rest_framework_viewsets.md) (1 shared connections)

## Source Files

- `apps/patients/permissions.py`
- `apps/patients/urls.py`
- `apps/patients/views.py`

## Audit Trail

- EXTRACTED: 25 (86%)
- INFERRED: 4 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*