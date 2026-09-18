from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.telehealth.views import (
    PublicTelehealthJoinView,
    TelehealthParticipantEventViewSet,
    TelehealthSessionViewSet,
)

router = DefaultRouter()
router.register(
    "events", TelehealthParticipantEventViewSet, basename="telehealth-event"
)
router.register("", TelehealthSessionViewSet, basename="telehealth-session")

urlpatterns = [
    path(
        "join/<uuid:token>/",
        PublicTelehealthJoinView.as_view(),
        name="public-telehealth-join",
    ),
    path("", include(router.urls)),
]
