import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import timedelta
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from django.conf import settings
from django.utils import timezone


@dataclass(frozen=True)
class VideoRoom:
    provider: str
    external_room_id: str
    join_url: str
    expires_at: object


class VideoProvider(ABC):
    name = "internal"

    @abstractmethod
    def create_room(self, appointment) -> VideoRoom:
        """Create a video room for an appointment."""

    @abstractmethod
    def get_join_url(self, room_id: str) -> str:
        """Return a participant join URL for an existing room."""

    @abstractmethod
    def close_room(self, room_id: str) -> None:
        """Close or expire an existing room."""

    @abstractmethod
    def get_room_status(self, room_id: str) -> str:
        """Return the provider-specific availability status for a room."""


class VideoProviderError(Exception):
    """Raised when a video provider cannot complete an operation."""


class InternalPlaceholderVideoProvider(VideoProvider):
    name = "internal"

    def create_room(self, appointment) -> VideoRoom:
        room_id = str(uuid4())
        return VideoRoom(
            provider=self.name,
            external_room_id=room_id,
            join_url=self.get_join_url(room_id),
            expires_at=timezone.now() + timedelta(hours=3),
        )

    def get_join_url(self, room_id: str) -> str:
        base_url = getattr(
            settings,
            "TELEHEALTH_INTERNAL_BASE_URL",
            "https://telehealth.local/rooms",
        )
        return f"{base_url.rstrip('/')}/{room_id}"

    def close_room(self, room_id: str) -> None:
        return None

    def get_room_status(self, room_id: str) -> str:
        return "available"


class GoogleMeetManualVideoProvider(VideoProvider):
    name = "google_meet_manual"

    def create_room_from_url(self, appointment, join_url: str) -> VideoRoom:
        return VideoRoom(
            provider=self.name,
            external_room_id=str(uuid4()),
            join_url=join_url,
            expires_at=timezone.now() + timedelta(hours=3),
        )

    def create_room(self, appointment) -> VideoRoom:
        raise VideoProviderError("Informe o link manual do Google Meet.")

    def get_join_url(self, room_id: str) -> str:
        raise VideoProviderError("Link manual não pode ser recuperado por API.")

    def close_room(self, room_id: str) -> None:
        return None

    def get_room_status(self, room_id: str) -> str:
        return "manual"


class DailyVideoProvider(VideoProvider):
    name = "daily"

    def __init__(self):
        self.api_key = settings.DAILY_API_KEY
        self.api_base_url = settings.DAILY_API_BASE_URL.rstrip("/")

    def create_room(self, appointment) -> VideoRoom:
        expires_at = timezone.now() + timedelta(
            minutes=settings.DAILY_ROOM_DURATION_MINUTES,
        )
        room_name = f"psi-{appointment.id}-{uuid4().hex[:8]}"
        payload = {
            "name": room_name,
            "privacy": "public",
            "properties": {
                "exp": int(expires_at.timestamp()),
                "eject_at_room_exp": True,
                "enable_chat": False,
                "enable_recording": "off",
            },
        }
        response = self._request("POST", "/rooms", payload)
        room_id = response.get("id") or response.get("name") or room_name
        join_url = response.get("url")

        if not join_url:
            raise VideoProviderError("Daily não retornou URL da sala.")

        return VideoRoom(
            provider=self.name,
            external_room_id=room_id,
            join_url=join_url,
            expires_at=expires_at,
        )

    def get_join_url(self, room_id: str) -> str:
        response = self._request("GET", f"/rooms/{room_id}")
        join_url = response.get("url")
        if not join_url:
            raise VideoProviderError("Daily não retornou URL da sala.")
        return join_url

    def close_room(self, room_id: str) -> None:
        self._request("DELETE", f"/rooms/{room_id}")

    def get_room_status(self, room_id: str) -> str:
        response = self._request("GET", f"/rooms/{room_id}")
        return "available" if response.get("url") else "unavailable"

    def _request(self, method: str, path: str, payload: dict | None = None) -> dict:
        data = None
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")

        request = Request(
            f"{self.api_base_url}{path}",
            data=data,
            headers=headers,
            method=method,
        )
        try:
            with urlopen(
                request, timeout=settings.DAILY_API_TIMEOUT_SECONDS
            ) as response:
                body = response.read().decode("utf-8")
        except HTTPError as error:
            body = error.read().decode("utf-8")
            raise VideoProviderError(f"Erro Daily ({error.code}): {body}") from error
        except URLError as error:
            raise VideoProviderError("Não foi possível conectar ao Daily.") from error

        if not body:
            return {}
        return json.loads(body)


def get_video_provider(provider: str | None = None) -> VideoProvider:
    if provider == GoogleMeetManualVideoProvider.name:
        return GoogleMeetManualVideoProvider()

    if provider == InternalPlaceholderVideoProvider.name:
        return InternalPlaceholderVideoProvider()

    if provider == DailyVideoProvider.name:
        return DailyVideoProvider()

    if settings.DAILY_API_KEY:
        return DailyVideoProvider()
    return InternalPlaceholderVideoProvider()
