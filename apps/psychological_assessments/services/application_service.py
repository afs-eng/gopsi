from __future__ import annotations

from apps.psychological_assessments.models import InstrumentApplication


def create_instrument_application(**data) -> InstrumentApplication:
    if data.get("status") is None:
        data.pop("status", None)
    return InstrumentApplication.objects.create(**data)


def update_instrument_application(
    application: InstrumentApplication,
    **data,
) -> InstrumentApplication:
    for field, value in data.items():
        setattr(application, field, value)
    application.save()
    return application
