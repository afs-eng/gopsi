# User

> 28 nodes · cohesion 0.09

## Key Concepts

- **User** (17 connections) — `apps/accounts/models.py`
- **platform_views.py** (12 connections) — `apps/clinics/platform_views.py`
- **platform_serializers.py** (11 connections) — `apps/clinics/platform_serializers.py`
- **PlatformClinicSerializer** (10 connections) — `apps/clinics/platform_serializers.py`
- **PlatformClinicViewSet** (8 connections) — `apps/clinics/platform_views.py`
- **IsPlatformOperator** (5 connections) — `apps/clinics/platform_permissions.py`
- **PlatformClinicAdminProvisionSerializer** (4 connections) — `apps/clinics/platform_serializers.py`
- **platform_urls.py** (4 connections) — `apps/clinics/platform_urls.py`
- **ClinicAdminUserSerializer** (4 connections) — `apps/clinics/serializers.py`
- **.is_platform_admin()** (2 connections) — `apps/accounts/models.py`
- **.is_platform_operator()** (2 connections) — `apps/accounts/models.py`
- **.has_permission()** (2 connections) — `apps/clinics/platform_permissions.py`
- **.create()** (2 connections) — `apps/clinics/platform_serializers.py`
- **.deactivate()** (2 connections) — `apps/clinics/platform_views.py`
- **AbstractUser** (1 connections)
- **Backward-compatible name for the explicit platform role.** (1 connections) — `apps/accounts/models.py`
- **.__str__()** (1 connections) — `apps/accounts/models.py`
- **BasePermission** (1 connections)
- **Meta** (1 connections) — `apps/clinics/platform_serializers.py`
- **.validate_email()** (1 connections) — `apps/clinics/platform_serializers.py`
- **.validate_username()** (1 connections) — `apps/clinics/platform_serializers.py`
- **.validate()** (1 connections) — `apps/clinics/platform_serializers.py`
- **atomic** (1 connections)
- **.get_queryset()** (1 connections) — `apps/clinics/platform_views.py`
- **action** (1 connections)
- *... and 3 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (8 shared connections)
- [clinics/models.py](clinics-models.py.md) (6 shared connections)
- [accounts/views.py](accounts-views.py.md) (5 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (4 shared connections)
- [notifications/views.py](notifications-views.py.md) (3 shared connections)
- [accounts/tests.py](accounts-tests.py.md) (2 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (2 shared connections)
- [consents/tests.py](consents-tests.py.md) (1 shared connections)
- [django_db](django_db.md) (1 shared connections)
- [rest_framework_viewsets](rest_framework_viewsets.md) (1 shared connections)

## Source Files

- `apps/accounts/models.py`
- `apps/clinics/platform_permissions.py`
- `apps/clinics/platform_serializers.py`
- `apps/clinics/platform_urls.py`
- `apps/clinics/platform_views.py`
- `apps/clinics/serializers.py`

## Audit Trail

- EXTRACTED: 53 (80%)
- INFERRED: 13 (20%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*