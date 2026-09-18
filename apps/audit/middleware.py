from apps.audit.models import AuditAction
from apps.audit.services import record_audit_event


class AdminAuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/admin/") and request.user.is_authenticated:
            record_audit_event(
                action=AuditAction.ADMIN_ACCESS,
                request=request,
                resource_type="admin",
                resource_id=request.path,
                metadata={
                    "method": request.method,
                    "status_code": response.status_code,
                },
            )
        return response
