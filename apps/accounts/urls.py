from django.urls import path

from apps.accounts.views import (
    CurrentUserView,
    MFAConfirmView,
    MFADisableView,
    MFASetupView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
)

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="api-current-user"),
    path(
        "password-reset/request/",
        PasswordResetRequestView.as_view(),
        name="api-password-reset-request",
    ),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="api-password-reset-confirm",
    ),
    path("mfa/setup/", MFASetupView.as_view(), name="api-mfa-setup"),
    path("mfa/confirm/", MFAConfirmView.as_view(), name="api-mfa-confirm"),
    path("mfa/disable/", MFADisableView.as_view(), name="api-mfa-disable"),
]
