from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("professionals", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="professional",
            name="social_name",
        ),
    ]
