from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.telehealth.models import TelehealthAccessToken, TelehealthSessionStatus
from apps.telehealth.permissions import CanManageTelehealth
from apps.telehealth.selectors import (
    telehealth_events_visible_to_user,
    telehealth_sessions_visible_to_user,
)
from apps.telehealth.serializers import (
    PublicTelehealthSessionSerializer,
    TelehealthParticipantEventSerializer,
    TelehealthSessionSerializer,
    WaitingRoomSerializer,
)


class TelehealthSessionViewSet(ModelViewSet):
    serializer_class = TelehealthSessionSerializer
    permission_classes = [CanManageTelehealth]

    def get_queryset(self):
        queryset = (
            telehealth_sessions_visible_to_user(self.request.user)
            .select_related(
                "clinic",
                "appointment__patient",
                "appointment__professional",
                "created_by",
            )
            .prefetch_related("participant_events")
        )
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)

        appointment_id = self.request.query_params.get("appointment")
        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)

        if self.action == "list" and not clinic_id:
            return queryset.none()

        return queryset

    @action(detail=True, methods=["post"], url_path="waiting-room")
    def waiting_room(self, request, pk=None):
        session = self.get_object()
        serializer = WaitingRoomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = session.participant_events.create(
            role=serializer.validated_data["role"],
            display_name=serializer.validated_data["display_name"],
            user=request.user if request.user.is_authenticated else None,
            metadata=serializer.validated_data.get("metadata", {}),
        )

        can_join_video = (
            session.status == TelehealthSessionStatus.IN_PROGRESS
            and session.expires_at > timezone.now()
        )
        if can_join_video:
            message = "Entrar na consulta."
            join_url = session.join_url
        elif session.status == TelehealthSessionStatus.WAITING_ROOM:
            message = "Consulta agendada. Aguarde liberação do profissional."
            join_url = ""
        else:
            message = "Consulta online indisponível."
            join_url = ""

        return Response(
            {
                "message": message,
                "can_join_video": can_join_video,
                "join_url": join_url,
                "event": TelehealthParticipantEventSerializer(event).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        session = self.get_object()
        serializer = self.get_serializer(session)
        serializer.start(session)
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        session = self.get_object()
        serializer = self.get_serializer(session)
        serializer.finish(session)
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        session = self.get_object()
        serializer = self.get_serializer(session)
        serializer.cancel(session)
        return Response(self.get_serializer(session).data)

    def perform_destroy(self, instance):
        serializer = self.get_serializer(instance)
        serializer.cancel(instance)


class TelehealthParticipantEventViewSet(ReadOnlyModelViewSet):
    serializer_class = TelehealthParticipantEventSerializer
    permission_classes = [CanManageTelehealth]

    def get_queryset(self):
        queryset = telehealth_events_visible_to_user(self.request.user).select_related(
            "session__clinic",
            "user",
        )
        session_id = self.request.query_params.get("session")
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        return queryset


class PublicTelehealthJoinView(APIView):
    permission_classes = [AllowAny]

    def get_access_token(self, token):
        return (
            TelehealthAccessToken.objects.select_related(
                "session__appointment__patient",
                "session__appointment__professional",
            )
            .filter(token=token)
            .first()
        )

    def get(self, request, token):
        access_token = self.get_access_token(token)
        if not access_token or not access_token.is_valid:
            return Response(
                {"detail": "Link de acesso inválido ou expirado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "session": PublicTelehealthSessionSerializer(
                    access_token.session,
                ).data,
                "role": access_token.role,
                "display_name": access_token.display_name,
            }
        )

    def post(self, request, token):
        access_token = self.get_access_token(token)
        if not access_token or not access_token.is_valid:
            return Response(
                {"detail": "Link de acesso inválido ou expirado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = WaitingRoomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = access_token.session
        role = access_token.role
        display_name = serializer.validated_data["display_name"]

        event = session.participant_events.create(
            role=role,
            display_name=display_name,
            metadata={"access_token": str(access_token.id), "public_access": True},
        )

        can_join_video = (
            session.status == TelehealthSessionStatus.IN_PROGRESS
            and session.expires_at > timezone.now()
        )
        if can_join_video:
            message = "Entrar na consulta."
            join_url = session.join_url
        elif session.status == TelehealthSessionStatus.WAITING_ROOM:
            message = "Consulta agendada. Aguarde liberação do profissional."
            join_url = ""
        else:
            message = "Consulta online indisponível."
            join_url = ""

        return Response(
            {
                "message": message,
                "can_join_video": can_join_video,
                "join_url": join_url,
                "event": TelehealthParticipantEventSerializer(event).data,
            },
            status=status.HTTP_201_CREATED,
        )
