from rest_framework.viewsets import ModelViewSet

from apps.appointments.models import AppointmentStatus
from apps.appointments.permissions import CanManageClinicSchedule
from apps.appointments.selectors import (
    appointments_visible_to_user,
    blocks_visible_to_user,
)
from apps.appointments.serializers import AppointmentSerializer, ScheduleBlockSerializer


class AppointmentViewSet(ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [CanManageClinicSchedule]

    def get_queryset(self):
        queryset = appointments_visible_to_user(self.request.user).select_related(
            "clinic",
            "patient",
            "professional",
        )
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)

        professional_id = self.request.query_params.get("professional")
        if professional_id:
            queryset = queryset.filter(professional_id=professional_id)

        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        date = self.request.query_params.get("date")
        if date:
            queryset = queryset.filter(date=date)

        if (
            self.action == "list"
            and not clinic_id
        ):
            return queryset.none()

        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.status = AppointmentStatus.CANCELLED
        instance.save(update_fields=["is_active", "status", "updated_at"])


class ScheduleBlockViewSet(ModelViewSet):
    serializer_class = ScheduleBlockSerializer
    permission_classes = [CanManageClinicSchedule]

    def get_queryset(self):
        queryset = blocks_visible_to_user(self.request.user).select_related(
            "clinic",
            "professional",
        )
        clinic_id = self.request.query_params.get("clinic")

        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)

        professional_id = self.request.query_params.get("professional")
        if professional_id:
            queryset = queryset.filter(professional_id=professional_id)

        if (
            self.action == "list"
            and not clinic_id
        ):
            return queryset.none()

        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
