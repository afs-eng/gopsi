# appointments/selectors.py

> 25 nodes · cohesion 0.13

## Key Concepts

- **appointments/selectors.py** (17 connections) — `apps/appointments/selectors.py`
- **appointments_visible_to_user()** (16 connections) — `apps/appointments/selectors.py`
- **appointments/views.py** (14 connections) — `apps/appointments/views.py`
- **telehealth/selectors.py** (11 connections) — `apps/telehealth/selectors.py`
- **CanManageClinicSchedule** (8 connections) — `apps/appointments/permissions.py`
- **appointment_clinic_ids_for_user()** (8 connections) — `apps/appointments/selectors.py`
- **AppointmentViewSet** (8 connections) — `apps/appointments/views.py`
- **ScheduleBlockViewSet** (7 connections) — `apps/appointments/views.py`
- **telehealth_events_visible_to_user()** (7 connections) — `apps/telehealth/selectors.py`
- **telehealth_sessions_visible_to_user()** (7 connections) — `apps/telehealth/selectors.py`
- **blocks_visible_to_user()** (6 connections) — `apps/appointments/selectors.py`
- **appointments/urls.py** (5 connections) — `apps/appointments/urls.py`
- **.has_object_permission()** (2 connections) — `apps/appointments/permissions.py`
- **.has_permission()** (2 connections) — `apps/appointments/permissions.py`
- **QuerySet** (2 connections)
- **.get_queryset()** (2 connections) — `apps/appointments/views.py`
- **ModelViewSet** (2 connections)
- **.get_queryset()** (2 connections) — `apps/appointments/views.py`
- **.validate_appointment()** (2 connections) — `apps/medical_records/serializers.py`
- **QuerySet** (2 connections)
- **.validate_appointment()** (2 connections) — `apps/telehealth/serializers.py`
- **.get_queryset()** (2 connections) — `apps/telehealth/views.py`
- **BasePermission** (1 connections)
- **.perform_destroy()** (1 connections) — `apps/appointments/views.py`
- **.perform_destroy()** (1 connections) — `apps/appointments/views.py`

## Relationships

- [django_db](django_db.md) (14 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (13 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (5 shared connections)
- [Appointment](Appointment.md) (4 shared connections)
- [professionals_visible_to_user](professionals_visible_to_user.md) (4 shared connections)
- [UserRole](UserRole.md) (3 shared connections)
- [billing/tests.py](billing-tests.py.md) (3 shared connections)
- [medical_records/tests.py](medical_records-tests.py.md) (2 shared connections)
- [notifications/views.py](notifications-views.py.md) (2 shared connections)
- [TelehealthSessionViewSet](TelehealthSessionViewSet.md) (2 shared connections)
- [telehealth/tests.py](telehealth-tests.py.md) (2 shared connections)
- [accounts/views.py](accounts-views.py.md) (1 shared connections)

## Source Files

- `apps/appointments/permissions.py`
- `apps/appointments/selectors.py`
- `apps/appointments/urls.py`
- `apps/appointments/views.py`
- `apps/medical_records/serializers.py`
- `apps/telehealth/selectors.py`
- `apps/telehealth/serializers.py`
- `apps/telehealth/views.py`

## Audit Trail

- EXTRACTED: 86 (89%)
- INFERRED: 11 (11%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*