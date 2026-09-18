from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.appointments.selectors import appointments_visible_to_user
from apps.clinics.selectors import clinics_visible_to_user
from apps.notifications.models import Notification, NotificationTemplate
from apps.notifications.selectors import notification_templates_visible_to_user
from apps.notifications.services import NotificationService
from apps.patients.selectors import patients_visible_to_user


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = [
            "id",
            "clinic",
            "name",
            "event_type",
            "channel",
            "subject",
            "body",
            "is_active",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Operador da plataforma sem acesso.")
        return attrs

    def create(self, validated_data):
        return NotificationTemplate.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )


class NotificationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "clinic",
            "template",
            "template_name",
            "patient",
            "patient_name",
            "appointment",
            "recipient_user",
            "event_type",
            "channel",
            "recipient",
            "subject",
            "body",
            "status",
            "scheduled_at",
            "sent_at",
            "failed_at",
            "failure_reason",
            "provider",
            "provider_message_id",
            "metadata",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "template_name",
            "patient_name",
            "sent_at",
            "failed_at",
            "failure_reason",
            "provider",
            "provider_message_id",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate_clinic(self, clinic):
        request = self.context["request"]
        if not clinics_visible_to_user(request.user).filter(id=clinic.id).exists():
            raise serializers.ValidationError("Clínica não encontrada.")
        return clinic

    def validate_template(self, template):
        if template is None:
            return template
        request = self.context["request"]
        if (
            not notification_templates_visible_to_user(request.user)
            .filter(id=template.id)
            .exists()
        ):
            raise serializers.ValidationError("Modelo não encontrado.")
        return template

    def validate_patient(self, patient):
        if patient is None:
            return patient
        request = self.context["request"]
        if not patients_visible_to_user(request.user).filter(id=patient.id).exists():
            raise serializers.ValidationError("Paciente não encontrado.")
        return patient

    def validate_appointment(self, appointment):
        if appointment is None:
            return appointment
        request = self.context["request"]
        if (
            not appointments_visible_to_user(request.user)
            .filter(id=appointment.id)
            .exists()
        ):
            raise serializers.ValidationError("Consulta não encontrada.")
        return appointment

    def validate(self, attrs):
        if has_explicit_platform_role(self.context["request"].user):
            raise serializers.ValidationError("Operador da plataforma sem acesso.")

        data = {}
        for field in Notification._meta.fields:
            if field.name in attrs:
                data[field.name] = attrs[field.name]
            elif self.instance:
                data[field.name] = getattr(self.instance, field.name)

        if not self.instance:
            data["created_by"] = self.context["request"].user

        notification = Notification(**data)
        if self.instance:
            notification.pk = self.instance.pk

        try:
            notification.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    def create(self, validated_data):
        notification = Notification.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
        )
        if notification.status == "QUEUED":
            NotificationService().queue_notification(notification)
        return notification

    def queue(self, instance):
        return NotificationService().queue_notification(instance)
