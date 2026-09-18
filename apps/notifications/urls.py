from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.notifications.views import NotificationTemplateViewSet, NotificationViewSet

router = DefaultRouter()
router.register(
    "templates",
    NotificationTemplateViewSet,
    basename="notification-template",
)
router.register("", NotificationViewSet, basename="notification")

urlpatterns = [path("", include(router.urls))]
