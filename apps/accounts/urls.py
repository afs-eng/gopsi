from django.urls import path

from apps.accounts.views import (
    CurrentUserView,
    MFAConfirmView,
    MFADisableView,
    MFASetupView,
)

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="api-current-user"),
    path("mfa/setup/", MFASetupView.as_view(), name="api-mfa-setup"),
    path("mfa/confirm/", MFAConfirmView.as_view(), name="api-mfa-confirm"),
    path("mfa/disable/", MFADisableView.as_view(), name="api-mfa-disable"),
]
