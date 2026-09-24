# notifications/tests.py

> 17 nodes · cohesion 0.31

## Key Concepts

- **notifications/tests.py** (32 connections) — `apps/notifications/tests.py`
- **make_context()** (15 connections) — `apps/notifications/tests.py`
- **tasks.py** (11 connections) — `apps/notifications/tasks.py`
- **NotificationStatus** (9 connections) — `apps/notifications/models.py`
- **test_platform_operator_is_denied_notification_list_detail_write_and_actions()** (9 connections) — `apps/notifications/tests.py`
- **send_notification()** (8 connections) — `apps/notifications/tasks.py`
- **test_send_due_notifications_enqueues_due_items()** (8 connections) — `apps/notifications/tests.py`
- **django_db** (7 connections)
- **send_due_notifications()** (6 connections) — `apps/notifications/tasks.py`
- **test_send_notification_task_marks_notification_sent()** (6 connections) — `apps/notifications/tests.py`
- **test_clinic_admin_can_queue_notification()** (5 connections) — `apps/notifications/tests.py`
- **make_user()** (4 connections) — `apps/notifications/tests.py`
- **test_clinic_admin_can_create_notification_template()** (4 connections) — `apps/notifications/tests.py`
- **test_notification_rejects_patient_from_another_clinic()** (4 connections) — `apps/notifications/tests.py`
- **test_user_cannot_list_notifications_from_other_tenant()** (4 connections) — `apps/notifications/tests.py`
- **shared_task** (2 connections)
- **fake_delay()** (1 connections) — `apps/notifications/tests.py`

## Relationships

- [Notification](Notification.md) (15 shared connections)
- [UserRole](UserRole.md) (9 shared connections)
- [notifications/models.py](notifications-models.py.md) (6 shared connections)
- [Patient](Patient.md) (3 shared connections)
- [Professional](Professional.md) (3 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (2 shared connections)
- [notifications/views.py](notifications-views.py.md) (2 shared connections)
- [AuditAction](AuditAction.md) (2 shared connections)
- [Appointment](Appointment.md) (2 shared connections)
- [accounts/views.py](accounts-views.py.md) (2 shared connections)
- [os](os.md) (1 shared connections)
- [professionals/models.py](professionals-models.py.md) (1 shared connections)

## Source Files

- `apps/notifications/models.py`
- `apps/notifications/tasks.py`
- `apps/notifications/tests.py`

## Audit Trail

- EXTRACTED: 65 (70%)
- INFERRED: 28 (30%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*