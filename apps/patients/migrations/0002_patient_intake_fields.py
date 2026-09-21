from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("patients", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="patient",
            name="address_complement",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="address_number",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="patient",
            name="city",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="district",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="education",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="gender_identity",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="patient",
            name="has_health_plan",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="patient",
            name="health_plan",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="health_plan_card",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="marital_status",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="patient",
            name="occupation",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="photo",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="patients/photos/",
            ),
        ),
        migrations.AddField(
            model_name="patient",
            name="profession",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="record_number",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="patient",
            name="referral_source",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="patient",
            name="state",
            field=models.CharField(blank=True, max_length=2),
        ),
        migrations.AddField(
            model_name="patient",
            name="zip_code",
            field=models.CharField(blank=True, max_length=16),
        ),
    ]
