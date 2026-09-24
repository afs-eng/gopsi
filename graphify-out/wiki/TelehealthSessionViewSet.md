# TelehealthSessionViewSet

> 13 nodes · cohesion 0.19

## Key Concepts

- **TelehealthSessionViewSet** (14 connections) — `apps/telehealth/views.py`
- **CanManageTelehealth** (8 connections) — `apps/telehealth/permissions.py`
- **action** (4 connections)
- **.waiting_room()** (4 connections) — `apps/telehealth/views.py`
- **.has_permission()** (3 connections) — `apps/telehealth/permissions.py`
- **.has_object_permission()** (2 connections) — `apps/telehealth/permissions.py`
- **.cancel()** (2 connections) — `apps/telehealth/views.py`
- **.finish()** (2 connections) — `apps/telehealth/views.py`
- **.get_queryset()** (2 connections) — `apps/telehealth/views.py`
- **.start()** (2 connections) — `apps/telehealth/views.py`
- **BasePermission** (1 connections)
- **ModelViewSet** (1 connections)
- **.perform_destroy()** (1 connections) — `apps/telehealth/views.py`

## Relationships

- [django_db](django_db.md) (10 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (3 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (2 shared connections)
- [UserRole](UserRole.md) (1 shared connections)

## Source Files

- `apps/telehealth/permissions.py`
- `apps/telehealth/views.py`

## Audit Trail

- EXTRACTED: 24 (77%)
- INFERRED: 7 (23%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*