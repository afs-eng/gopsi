from django.db import migrations


INSTRUMENT_AGE_RULES = {
    "wisc4": {"min_age": 6, "max_age": 16},
    "wais3": {"min_age": 16, "max_age": 89},
    "wasi": {"min_age": 6, "max_age": 89},
    "fdt": {"min_age": 6, "max_age": 92},
    "bpa2": {"min_age": 6, "max_age": 94},
    "bai": {"min_age": 18, "max_age": None},
    "ebadep_a": {"min_age": 17, "max_age": 81},
    "ebadep_ij": {"min_age": 7, "max_age": 18},
    "ebaped_ij": {"min_age": 7, "max_age": 18},
    "epq_j": {"min_age": 10, "max_age": 16},
    "etdah_ad": {"min_age": 12, "max_age": None},
    "etdah_pais": {"min_age": 2, "max_age": 17},
    "scared": {"min_age": None, "max_age": 18},
}


def backfill_instrument_age_ranges(apps, schema_editor):
    AssessmentInstrument = apps.get_model(
        "psychological_assessments",
        "AssessmentInstrument",
    )
    for code, rule in INSTRUMENT_AGE_RULES.items():
        AssessmentInstrument.objects.filter(code=code).update(
            min_age_months=None if rule["min_age"] is None else rule["min_age"] * 12,
            max_age_months=None if rule["max_age"] is None else rule["max_age"] * 12 + 11,
        )


class Migration(migrations.Migration):
    dependencies = [
        ("psychological_assessments", "0008_add_instrument_age_range"),
    ]

    operations = [
        migrations.RunPython(backfill_instrument_age_ranges, migrations.RunPython.noop),
    ]
