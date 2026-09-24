# Appointment

> 27 nodes · cohesion 0.18

## Key Concepts

- **Appointment** (45 connections) — `apps/appointments/models.py`
- **appointments/tests.py** (29 connections) — `apps/appointments/tests.py`
- **ScheduleBlock** (19 connections) — `apps/appointments/models.py`
- **make_clinic_context()** (16 connections) — `apps/appointments/tests.py`
- **django_db** (10 connections)
- **test_platform_operator_denied_schedule_with_accidental_access()** (10 connections) — `apps/appointments/tests.py`
- **test_user_cannot_list_appointments_from_other_tenant()** (7 connections) — `apps/appointments/tests.py`
- **test_user_cannot_retrieve_appointment_from_other_tenant()** (7 connections) — `apps/appointments/tests.py`
- **appointments/admin.py** (6 connections) — `apps/appointments/admin.py`
- **test_user_cannot_list_schedule_blocks_from_other_tenant()** (6 connections) — `apps/appointments/tests.py`
- **test_appointment_conflict_for_same_professional_is_rejected()** (5 connections) — `apps/appointments/tests.py`
- **test_appointment_inside_schedule_block_is_rejected()** (5 connections) — `apps/appointments/tests.py`
- **test_destroy_appointment_cancels_and_soft_deletes()** (5 connections) — `apps/appointments/tests.py`
- **.save()** (4 connections) — `apps/appointments/models.py`
- **make_user()** (4 connections) — `apps/appointments/tests.py`
- **test_clinic_admin_can_create_appointment_for_own_clinic()** (4 connections) — `apps/appointments/tests.py`
- **test_clinic_admin_can_create_schedule_block_for_own_clinic()** (4 connections) — `apps/appointments/tests.py`
- **test_destroy_schedule_block_uses_soft_delete()** (4 connections) — `apps/appointments/tests.py`
- **AppointmentAdmin** (2 connections) — `apps/appointments/admin.py`
- **register** (2 connections)
- **ScheduleBlockAdmin** (2 connections) — `apps/appointments/admin.py`
- **.save()** (2 connections) — `apps/appointments/models.py`
- **Meta** (2 connections) — `apps/appointments/models.py`
- **.clean()** (1 connections) — `apps/appointments/models.py`
- **.__str__()** (1 connections) — `apps/appointments/models.py`
- *... and 2 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (15 shared connections)
- [Patient](Patient.md) (8 shared connections)
- [Professional](Professional.md) (8 shared connections)
- [django_db](django_db.md) (7 shared connections)
- [billing/tests.py](billing-tests.py.md) (7 shared connections)
- [telehealth/tests.py](telehealth-tests.py.md) (6 shared connections)
- [medical_records/tests.py](medical_records-tests.py.md) (5 shared connections)
- [professionals_visible_to_user](professionals_visible_to_user.md) (4 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (4 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (2 shared connections)
- [notifications/tests.py](notifications-tests.py.md) (2 shared connections)
- [AuditAction](AuditAction.md) (2 shared connections)

## Source Files

- `apps/appointments/admin.py`
- `apps/appointments/models.py`
- `apps/appointments/tests.py`

## Audit Trail

- EXTRACTED: 86 (61%)
- INFERRED: 55 (39%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*