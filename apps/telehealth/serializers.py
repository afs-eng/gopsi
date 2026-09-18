from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import has_explicit_platform_role
from apps.appointments.selectors import appointments_visible_to_user
from apps.telehealth.models import (
    TelehealthAccessToken,
    TelehealthParticipantEvent,
    TelehealthParticipantRole,
    TelehealthSession,
    TelehealthSessionStatus,
)
from apps.telehealth.services import (
    GoogleMeetManualVideoProvider,
    VideoProviderError,
    get_video_provider,
)


class TelehealthParticipantEventSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = TelehealthParticipantEvent
        fields = [
            "id",
            "session",
            "role",
            "display_name",
            "user",
            "user_name",
            "joined_at",
            "left_at",
            "metadata",
        ]
        read_only_fields = ["id", "session", "user", "user_name", "joined_at"]


class WaitingRoomSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=TelehealthParticipantRole.choices)
    display_name = serializers.CharField(max_length=255)
    metadata = serializers.JSONField(required=False)


class TelehealthAccessTokenSerializer(serializers.ModelSerializer):
    access_url = serializers.SerializerMethodField()

    class Meta:
        model = TelehealthAccessToken
        fields = [
            "id",
            "token",
            "role",
            "display_name",
            "expires_at",
            "revoked_at",
            "access_url",
            "created_at",
        ]
        read_only_fields = fields

    def get_access_url(self, obj) -> str:
        return f"/telehealth/join/{obj.token}"


class PublicTelehealthSessionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="appointment.patient.full_name",
        read_only=True,
    )
    professional_name = serializers.CharField(
        source="appointment.professional.full_name",
        read_only=True,
    )
    appointment_date = serializers.DateField(source="appointment.date", read_only=True)
    start_time = serializers.TimeField(source="appointment.start_time", read_only=True)
    end_time = serializers.TimeField(source="appointment.end_time", read_only=True)

    class Meta:
        model = TelehealthSession
        fields = [
            "id",
            "patient_name",
            "professional_name",
            "appointment_date",
            "start_time",
            "end_time",
            "status",
            "expires_at",
        ]
        read_only_fields = fields


class TelehealthSessionSerializer(serializers.ModelSerializer):
    manual_join_url = serializers.URLField(write_only=True, required=False)
    patient_name = serializers.CharField(
        source="appointment.patient.full_name",
        read_only=True,
    )
    professional_name = serializers.CharField(
        source="appointment.professional.full_name",
        read_only=True,
    )
    participant_events = TelehealthParticipantEventSerializer(many=True, read_only=True)
    access_tokens = TelehealthAccessTokenSerializer(many=True, read_only=True)

    class Meta:
        model = TelehealthSession
        fields = [
            "id",
            "clinic",
            "appointment",
            "manual_join_url",
            "patient_name",
            "professional_name",
            "status",
            "provider",
            "external_room_id",
            "join_url",
            "expires_at",
            "waiting_room_open",
            "started_at",
            "ended_at",
            "created_by",
            "participant_events",
            "access_tokens",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "clinic",
            "status",
            "provider",
            "external_room_id",
            "join_url",
            "expires_at",
            "started_at",
            "ended_at",
            "created_by",
            "participant_events",
            "access_tokens",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_appointment(self, appointment):
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

        appointment = attrs.get("appointment") or getattr(
            self.instance,
            "appointment",
            None,
        )
        data = {}

        if self.instance:
            for field in TelehealthSession._meta.fields:
                data[field.name] = getattr(self.instance, field.name)

        if appointment:
            data["clinic"] = appointment.clinic
            data["appointment"] = appointment

        if not self.instance:
            data["created_by"] = self.context["request"].user

        session = TelehealthSession(**data)
        if self.instance:
            session.pk = self.instance.pk

        try:
            session.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        appointment = validated_data["appointment"]
        manual_join_url = validated_data.pop("manual_join_url", "")
        try:
            if manual_join_url:
                room = GoogleMeetManualVideoProvider().create_room_from_url(
                    appointment,
                    manual_join_url,
                )
            else:
                room = get_video_provider().create_room(appointment)
        except VideoProviderError as error:
            raise serializers.ValidationError(str(error)) from error
        session = TelehealthSession.objects.create(
            clinic=appointment.clinic,
            appointment=appointment,
            provider=room.provider,
            external_room_id=room.external_room_id,
            join_url=room.join_url,
            expires_at=room.expires_at,
            created_by=self.context["request"].user,
        )
        TelehealthAccessToken.objects.create(
            session=session,
            role=TelehealthParticipantRole.PATIENT,
            display_name=appointment.patient.full_name,
            expires_at=room.expires_at,
        )
        return session

    def start(self, instance):
        if instance.expires_at <= timezone.now():
            raise serializers.ValidationError("Link da sala expirado.")
        instance.status = TelehealthSessionStatus.IN_PROGRESS
        instance.waiting_room_open = False
        instance.started_at = timezone.now()
        instance.save(
            update_fields=["status", "waiting_room_open", "started_at", "updated_at"]
        )
        return instance

    def finish(self, instance):
        try:
            get_video_provider(instance.provider).close_room(instance.external_room_id)
        except VideoProviderError as error:
            raise serializers.ValidationError(str(error)) from error
        instance.status = TelehealthSessionStatus.FINISHED
        instance.waiting_room_open = False
        instance.ended_at = timezone.now()
        instance.is_active = False
        instance.save(
            update_fields=[
                "status",
                "waiting_room_open",
                "ended_at",
                "is_active",
                "updated_at",
            ]
        )
        return instance

    def cancel(self, instance):
        try:
            get_video_provider(instance.provider).close_room(instance.external_room_id)
        except VideoProviderError as error:
            raise serializers.ValidationError(str(error)) from error
        instance.status = TelehealthSessionStatus.CANCELLED
        instance.waiting_room_open = False
        instance.ended_at = timezone.now()
        instance.is_active = False
        instance.save(
            update_fields=[
                "status",
                "waiting_room_open",
                "ended_at",
                "is_active",
                "updated_at",
            ]
        )
        return instance


class WaitingRoomStatusSerializer(serializers.Serializer):
    message = serializers.CharField()
    can_join_video = serializers.BooleanField()
    join_url = serializers.URLField(allow_blank=True)
    event = TelehealthParticipantEventSerializer()
