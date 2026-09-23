from __future__ import annotations

from datetime import date
from typing import Any

from apps.psychological_assessments.models import InstrumentApplication, InstrumentApplicationStatus
from apps.psychological_assessments.services.report_payload_service import InstrumentReportPayloadService
from apps.psychological_assessments.test_modules.base import TestContext
from apps.psychological_assessments.test_modules.registry import get_test_module


class InstrumentScoringService:
    @staticmethod
    def _patient_age(application: InstrumentApplication) -> int:
        patient = application.assessment.patient
        if not patient.birth_date:
            return 0
        reference_date = (
            application.application_date
            or application.assessment.started_at
            or application.assessment.completed_at
            or date.today()
        )
        years = reference_date.year - patient.birth_date.year
        if (reference_date.month, reference_date.day) < (patient.birth_date.month, patient.birth_date.day):
            years -= 1
        return max(years, 0)

    @classmethod
    def process(cls, application: InstrumentApplication) -> dict[str, Any]:
        instrument = application.instrument
        if not instrument:
            return {"ok": False, "errors": ["Aplicação sem instrumento vinculado."]}

        module = get_test_module(instrument.code)
        if not module:
            return {
                "ok": False,
                "errors": [f"Nenhum módulo registrado para {instrument.code}."],
            }

        context = TestContext(
            patient_name=application.assessment.patient.full_name,
            assessment_id=str(application.assessment_id),
            instrument_code=instrument.code,
            patient_age=cls._patient_age(application),
            raw_scores=application.raw_payload or {},
            reviewed_scores=application.reviewed_payload or {},
        )

        errors = module.validate(context)
        if errors:
            return {"ok": False, "errors": errors}

        try:
            computed = module.compute(context)
            classified = module.classify(computed)
            interpretation = module.interpret(context, {**computed, **classified})
        except Exception as exc:
            return {"ok": False, "errors": [str(exc)]}

        application.computed_payload = computed
        application.classified_payload = classified
        application.interpretation_text = interpretation
        if application.status == InstrumentApplicationStatus.PLANNED:
            application.status = InstrumentApplicationStatus.APPLIED
        application.save(
            update_fields=[
                "computed_payload",
                "classified_payload",
                "interpretation_text",
                "status",
                "updated_at",
            ]
        )

        return {
            "ok": True,
            "computed_payload": computed,
            "classified_payload": classified,
            "interpretation_text": interpretation,
            "report_payload": InstrumentReportPayloadService.build_for_application(application),
        }
