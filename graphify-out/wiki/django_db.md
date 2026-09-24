# django_db

> 46 nodes · cohesion 0.08

## Key Concepts

- **django_db** (48 connections)
- **telehealth/serializers.py** (34 connections) — `apps/telehealth/serializers.py`
- **appointments/models.py** (28 connections) — `apps/appointments/models.py`
- **TelehealthSessionSerializer** (24 connections) — `apps/telehealth/serializers.py`
- **telehealth/views.py** (24 connections) — `apps/telehealth/views.py`
- **telehealth/models.py** (21 connections) — `apps/telehealth/models.py`
- **TelehealthAccessToken** (13 connections) — `apps/telehealth/models.py`
- **PublicTelehealthJoinView** (11 connections) — `apps/telehealth/views.py`
- **TelehealthParticipantEventSerializer** (9 connections) — `apps/telehealth/serializers.py`
- **TelehealthParticipantEvent** (8 connections) — `apps/telehealth/models.py`
- **TelehealthSessionStatus** (8 connections) — `apps/telehealth/models.py`
- **AppointmentStatus** (7 connections) — `apps/appointments/models.py`
- **WaitingRoomSerializer** (7 connections) — `apps/telehealth/serializers.py`
- **PublicTelehealthSessionSerializer** (6 connections) — `apps/telehealth/serializers.py`
- **telehealth/urls.py** (6 connections) — `apps/telehealth/urls.py`
- **TelehealthParticipantEventViewSet** (6 connections) — `apps/telehealth/views.py`
- **TelehealthParticipantRole** (4 connections) — `apps/telehealth/models.py`
- **Meta** (4 connections) — `apps/telehealth/serializers.py`
- **TelehealthAccessTokenSerializer** (4 connections) — `apps/telehealth/serializers.py`
- **.post()** (4 connections) — `apps/telehealth/views.py`
- **MedicalRecordEntryType** (3 connections) — `apps/medical_records/models.py`
- **0009_backfill_instrument_age_ranges.py** (3 connections) — `apps/psychological_assessments/migrations/0009_backfill_instrument_age_ranges.py`
- **Meta** (3 connections) — `apps/telehealth/models.py`
- **.get()** (3 connections) — `apps/telehealth/views.py`
- **.get_access_token()** (3 connections) — `apps/telehealth/views.py`
- *... and 21 more nodes in this community*

## Relationships

- [uuid](uuid.md) (22 shared connections)
- [telehealth/tests.py](telehealth-tests.py.md) (16 shared connections)
- [medical_records/tests.py](medical_records-tests.py.md) (16 shared connections)
- [appointments/selectors.py](appointments-selectors.py.md) (14 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (10 shared connections)
- [TelehealthSessionViewSet](TelehealthSessionViewSet.md) (10 shared connections)
- [telehealth/services.py](telehealth-services.py.md) (10 shared connections)
- [Appointment](Appointment.md) (7 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (5 shared connections)
- [clinics/models.py](clinics-models.py.md) (4 shared connections)
- [billing/tests.py](billing-tests.py.md) (4 shared connections)
- [Patient](Patient.md) (3 shared connections)

## Source Files

- `apps/appointments/models.py`
- `apps/audit/migrations/0002_alter_auditevent_action.py`
- `apps/audit/migrations/0003_alter_auditevent_action.py`
- `apps/audit/migrations/0004_alter_auditevent_action.py`
- `apps/medical_records/models.py`
- `apps/patients/migrations/0002_patient_intake_fields.py`
- `apps/psychological_assessments/migrations/0008_add_instrument_age_range.py`
- `apps/psychological_assessments/migrations/0009_backfill_instrument_age_ranges.py`
- `apps/telehealth/models.py`
- `apps/telehealth/serializers.py`
- `apps/telehealth/urls.py`
- `apps/telehealth/views.py`

## Audit Trail

- EXTRACTED: 198 (85%)
- INFERRED: 35 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*