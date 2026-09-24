# telehealth/tests.py

> 27 nodes · cohesion 0.19

## Key Concepts

- **telehealth/tests.py** (35 connections) — `apps/telehealth/tests.py`
- **TelehealthSession** (27 connections) — `apps/telehealth/models.py`
- **make_online_context()** (20 connections) — `apps/telehealth/tests.py`
- **test_user_cannot_retrieve_telehealth_session_from_other_tenant()** (12 connections) — `apps/telehealth/tests.py`
- **django_db** (11 connections)
- **CareModality** (10 connections) — `apps/professionals/models.py`
- **test_create_telehealth_session_uses_daily_provider()** (9 connections) — `apps/telehealth/tests.py`
- **test_platform_operator_is_denied_telehealth_list_detail_write_events_and_actions()** (9 connections) — `apps/telehealth/tests.py`
- **test_in_person_appointment_cannot_create_telehealth_session()** (6 connections) — `apps/telehealth/tests.py`
- **make_user()** (5 connections) — `apps/telehealth/tests.py`
- **test_clinic_admin_can_create_telehealth_session_for_online_appointment()** (5 connections) — `apps/telehealth/tests.py`
- **test_public_patient_link_shows_session_without_authentication()** (5 connections) — `apps/telehealth/tests.py`
- **test_public_patient_waiting_room_does_not_reveal_video_before_start()** (5 connections) — `apps/telehealth/tests.py`
- **test_public_patient_waiting_room_releases_video_after_start()** (5 connections) — `apps/telehealth/tests.py`
- **test_clinic_admin_can_create_manual_google_meet_session()** (4 connections) — `apps/telehealth/tests.py`
- **test_start_session_releases_video_url_to_waiting_room()** (4 connections) — `apps/telehealth/tests.py`
- **test_waiting_room_records_patient_without_revealing_video_before_start()** (4 connections) — `apps/telehealth/tests.py`
- **.save()** (3 connections) — `apps/telehealth/models.py`
- **.validate()** (3 connections) — `apps/telehealth/serializers.py`
- **django_test** (2 connections)
- **.clean()** (1 connections) — `apps/telehealth/models.py`
- **.__str__()** (1 connections) — `apps/telehealth/models.py`
- **override_settings** (1 connections)
- **__enter__()** (1 connections) — `apps/telehealth/tests.py`
- **__exit__()** (1 connections) — `apps/telehealth/tests.py`
- *... and 2 more nodes in this community*

## Relationships

- [django_db](django_db.md) (16 shared connections)
- [UserRole](UserRole.md) (13 shared connections)
- [Appointment](Appointment.md) (6 shared connections)
- [Patient](Patient.md) (4 shared connections)
- [Professional](Professional.md) (4 shared connections)
- [professionals/models.py](professionals-models.py.md) (2 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (2 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (2 shared connections)
- [AuditAction](AuditAction.md) (2 shared connections)
- [accounts/views.py](accounts-views.py.md) (2 shared connections)
- [telehealth/admin.py](telehealth-admin.py.md) (1 shared connections)
- [telehealth/services.py](telehealth-services.py.md) (1 shared connections)

## Source Files

- `apps/professionals/models.py`
- `apps/telehealth/models.py`
- `apps/telehealth/serializers.py`
- `apps/telehealth/tests.py`

## Audit Trail

- EXTRACTED: 80 (65%)
- INFERRED: 44 (35%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*