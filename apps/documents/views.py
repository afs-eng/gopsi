from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.audit.models import AuditAction
from apps.audit.services import record_audit_event
from apps.documents.models import GeneratedDocumentStatus
from apps.documents.pdf import build_simple_pdf
from apps.documents.permissions import CanManageClinicDocuments
from apps.documents.selectors import (
    document_templates_visible_to_user,
    generated_documents_visible_to_user,
)
from apps.documents.serializers import (
    DocumentTemplateSerializer,
    GeneratedDocumentSerializer,
)


class DocumentTemplateViewSet(ModelViewSet):
    serializer_class = DocumentTemplateSerializer
    permission_classes = [CanManageClinicDocuments]

    def get_queryset(self):
        queryset = document_templates_visible_to_user(self.request.user).select_related(
            "clinic",
            "created_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class GeneratedDocumentViewSet(ModelViewSet):
    serializer_class = GeneratedDocumentSerializer
    permission_classes = [CanManageClinicDocuments]

    def get_queryset(self):
        visible_documents = generated_documents_visible_to_user(self.request.user)
        queryset = visible_documents.select_related(
            "clinic",
            "template",
            "patient",
            "professional",
            "created_by",
            "updated_by",
        )
        clinic_id = self.request.query_params.get("clinic")
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if self.action == "list" and not clinic_id:
            return queryset.none()
        return queryset

    @action(detail=True, methods=["post"])
    def finalize(self, request, pk=None):
        document = self.get_object()
        document.status = GeneratedDocumentStatus.FINAL
        document.updated_by = request.user
        document.save(update_fields=["status", "updated_by", "updated_at"])
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=["get"], url_path="pdf")
    def pdf(self, request, pk=None):
        document = self.get_object()
        record_audit_event(
            action=AuditAction.DOCUMENT_DOWNLOADED,
            request=request,
            clinic=document.clinic,
            resource_type="GeneratedDocument",
            resource_id=document.id,
        )
        response = HttpResponse(
            build_simple_pdf(document.title, document.content),
            content_type="application/pdf",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="documento-{document.id}.pdf"'
        )
        return response

    def perform_destroy(self, instance):
        serializer = self.get_serializer(instance)
        serializer.void(instance)
