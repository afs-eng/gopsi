"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path

from apps.accounts.views import LoginView
from apps.core.views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("api/v1/appointments/", include("apps.appointments.urls")),
    path("api/v1/audit/", include("apps.audit.urls")),
    path("api/v1/auth/login/", LoginView.as_view(), name="api-token-auth"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/billing/", include("apps.billing.urls")),
    path("api/v1/clinics/", include("apps.clinics.urls")),
    path("api/v1/consents/", include("apps.consents.urls")),
    path("api/v1/documents/", include("apps.documents.urls")),
    path("api/v1/medical-records/", include("apps.medical_records.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/patients/", include("apps.patients.urls")),
    path("api/v1/platform/", include("apps.clinics.platform_urls")),
    path("api/v1/privacy/", include("apps.privacy.urls")),
    path("api/v1/professionals/", include("apps.professionals.urls")),
    path(
        "api/v1/psychological-assessments/",
        include("apps.psychological_assessments.urls"),
    ),
    path("api/v1/telehealth/", include("apps.telehealth.urls")),
]
