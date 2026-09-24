# Notification

> 16 nodes · cohesion 0.24

## Key Concepts

- **Notification** (32 connections) — `apps/notifications/models.py`
- **notifications/services.py** (14 connections) — `apps/notifications/services.py`
- **NotificationService** (11 connections) — `apps/notifications/services.py`
- **NotificationProvider** (6 connections) — `apps/notifications/services.py`
- **InternalNotificationProvider** (5 connections) — `apps/notifications/services.py`
- **get_notification_provider()** (4 connections) — `apps/notifications/services.py`
- **.send()** (4 connections) — `apps/notifications/services.py`
- **.save()** (3 connections) — `apps/notifications/models.py`
- **.send()** (3 connections) — `apps/notifications/services.py`
- **NotificationDelivery** (3 connections) — `apps/notifications/services.py`
- **.send_notification()** (3 connections) — `apps/notifications/services.py`
- **.queue_notification()** (2 connections) — `apps/notifications/services.py`
- **ABC** (2 connections)
- **.clean()** (1 connections) — `apps/notifications/models.py`
- **.__str__()** (1 connections) — `apps/notifications/models.py`
- **Send a notification through a concrete provider.** (1 connections) — `apps/notifications/services.py`

## Relationships

- [notifications/tests.py](notifications-tests.py.md) (15 shared connections)
- [notifications/views.py](notifications-views.py.md) (7 shared connections)
- [notifications/models.py](notifications-models.py.md) (4 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (4 shared connections)
- [Appointment](Appointment.md) (1 shared connections)
- [UserRole](UserRole.md) (1 shared connections)
- [Patient](Patient.md) (1 shared connections)
- [telehealth/services.py](telehealth-services.py.md) (1 shared connections)
- [uuid](uuid.md) (1 shared connections)

## Source Files

- `apps/notifications/models.py`
- `apps/notifications/services.py`

## Audit Trail

- EXTRACTED: 46 (71%)
- INFERRED: 19 (29%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*