# GeneratedDocument

> 63 nodes · cohesion 0.06

## Key Concepts

- **GeneratedDocument** (23 connections) — `apps/documents/models.py`
- **documents/tests.py** (23 connections) — `apps/documents/tests.py`
- **documents/views.py** (23 connections) — `apps/documents/views.py`
- **documents/models.py** (21 connections) — `apps/documents/models.py`
- **GeneratedDocumentSerializer** (14 connections) — `apps/documents/serializers.py`
- **documents/selectors.py** (13 connections) — `apps/documents/selectors.py`
- **DocumentTemplate** (12 connections) — `apps/documents/models.py`
- **make_context()** (12 connections) — `apps/documents/tests.py`
- **GeneratedDocumentViewSet** (11 connections) — `apps/documents/views.py`
- **document_templates_visible_to_user()** (9 connections) — `apps/documents/selectors.py`
- **generated_documents_visible_to_user()** (9 connections) — `apps/documents/selectors.py`
- **test_platform_operator_denied_documents_crud_download_and_finalize()** (9 connections) — `apps/documents/tests.py`
- **CanManageClinicDocuments** (8 connections) — `apps/documents/permissions.py`
- **DocumentTemplateSerializer** (8 connections) — `apps/documents/serializers.py`
- **DocumentTemplateViewSet** (7 connections) — `apps/documents/views.py`
- **documents/admin.py** (6 connections) — `apps/documents/admin.py`
- **GeneratedDocumentStatus** (5 connections) — `apps/documents/models.py`
- **_document_clinic_filter()** (5 connections) — `apps/documents/selectors.py`
- **django_db** (5 connections)
- **documents/urls.py** (5 connections) — `apps/documents/urls.py`
- **make_user()** (4 connections) — `apps/documents/tests.py`
- **test_authenticated_user_can_download_document_pdf()** (4 connections) — `apps/documents/tests.py`
- **test_clinic_admin_can_create_document_template()** (4 connections) — `apps/documents/tests.py`
- **test_document_rejects_patient_from_another_clinic()** (4 connections) — `apps/documents/tests.py`
- **test_user_cannot_list_documents_from_other_tenant()** (4 connections) — `apps/documents/tests.py`
- *... and 38 more nodes in this community*

## Relationships

- [UserRole](UserRole.md) (15 shared connections)
- [clinics_visible_to_user](clinics_visible_to_user.md) (14 shared connections)
- [has_explicit_platform_role](has_explicit_platform_role.md) (11 shared connections)
- [Patient](Patient.md) (6 shared connections)
- [Professional](Professional.md) (5 shared connections)
- [AuditAction](AuditAction.md) (5 shared connections)
- [psychological_assessments/models.py](psychological_assessments-models.py.md) (4 shared connections)
- [accounts/views.py](accounts-views.py.md) (4 shared connections)
- [psychological_assessments/tests.py](psychological_assessments-tests.py.md) (3 shared connections)
- [notifications/views.py](notifications-views.py.md) (3 shared connections)
- [record_audit_event](record_audit_event.md) (3 shared connections)
- [uuid](uuid.md) (2 shared connections)

## Source Files

- `apps/documents/admin.py`
- `apps/documents/models.py`
- `apps/documents/pdf.py`
- `apps/documents/permissions.py`
- `apps/documents/selectors.py`
- `apps/documents/serializers.py`
- `apps/documents/tests.py`
- `apps/documents/urls.py`
- `apps/documents/views.py`
- `apps/psychological_assessments/serializers.py`

## Audit Trail

- EXTRACTED: 167 (83%)
- INFERRED: 34 (17%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*