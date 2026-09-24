# Graph Report - plataforma-psi  (2026-09-24)

## Corpus Check
- 251 files · ~275,495 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 10, .example 2, .conf 1)

## Summary
- 1610 nodes · 4247 edges · 127 communities (67 shown, 60 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 787 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1549b085`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- billing/views.py
- billing/tests.py
- uuid
- Notification
- clinics/models.py
- documents/views.py
- ref_node_assert
- TelehealthSessionViewSet
- types.py
- is_clinic_admin
- django_apps
- telehealth/services.py
- UserRole
- psychological_assessments/views.py
- clinics_visible_to_user
- billing/selectors.py
- accounts/views.py
- medical_records/tests.py
- django_urls
- AssessmentPlanSerializer
- Skill Mestre — Plataforma para Psicólogos.md
- telehealth/serializers.py
- os
- telehealth/tests.py
- CanManageNotifications
- Subscription
- has_explicit_platform_role
- psychological_assessments/tests.py
- accounts/tests.py
- consents/tests.py
- django_db
- Transaction
- Appointment
- telehealth/views.py
- DESIGN.md
- billing/admin.py
- CanManageClinicSchedule
- What You Must Do When Invoked
- professionals/views.py
- MedicalRecordEntryViewSet
- privacy/selectors.py
- accounts/models.py
- privacy/tests.py
- CanManageConsents
- CanManageClinicDocuments
- AuditAction
- psychological_assessments/models.py
- Plataforma PSI Design Brief
- CanAccessMedicalRecords
- CanManageTelehealth
- rest_framework
- ClinicAdminUserSerializer
- audit/views.py
- billing/serializers.py
- 0002_assessmentinstrument_and_more.py
- psychological_assessments/admin.py
- AssessmentDocument
- ref_node_test
- AssessmentResultViewSet
- AssessmentSerializer
- Deploy de Produção
- Roadmap Comercial GoPsi
- TestModuleError
- TelehealthSessionSerializer
- django_contrib_auth
- clinics/admin.py
- frontend_src_app_globals
- opencode.json
- graphify.js
- Product Designer
- test_modules/__init__.py
- entrypoint.prod.sh
- plataforma-psi
- accounts/migrations/0001_initial.py
- graphify reference: extra exports and benchmark
- Deploy no Render
- graphify reference: query, path, explain
- Plataforma PSI
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- mfa.py
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- ARCHITECTURE.md
- extraction-spec.md
- SECURITY.md
- record_audit_event
- InstrumentApplication
- django_contrib
- core/views.py

## God Nodes (most connected - your core abstractions)
1. `UserRole` - 152 edges
2. `Clinic` - 122 edges
3. `has_explicit_platform_role()` - 116 edges
4. `ClinicMembership` - 81 edges
5. `Professional` - 68 edges
6. `Patient` - 61 edges
7. `Appointment` - 45 edges
8. `AuditAction` - 32 edges
9. `Notification` - 32 edges
10. `clinics_visible_to_user()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Command` --uses--> `UserRole`  [INFERRED]
  apps/accounts/management/commands/reset_admin_password.py → apps/accounts/models.py
- `make_user()` --uses--> `UserRole`  [INFERRED]
  apps/accounts/tests.py → apps/accounts/models.py
- `test_clinic_admin_can_confirm_initial_mfa_from_login()` --uses--> `UserRole`  [INFERRED]
  apps/accounts/tests.py → apps/accounts/models.py
- `test_clinic_admin_without_mfa_is_blocked_at_login()` --uses--> `UserRole`  [INFERRED]
  apps/accounts/tests.py → apps/accounts/models.py
- `test_django_superuser_is_not_implicitly_a_platform_operator()` --uses--> `UserRole`  [INFERRED]
  apps/accounts/tests.py → apps/accounts/models.py

## Import Cycles
- None detected.

## Communities (127 total, 60 thin omitted)

### Community 0 - "billing/views.py"
Cohesion: 0.13
Nodes (14): CanManageBilling, BasePermission, InvoiceSerializer, Meta, PlanSerializer, TransactionSerializer, InvoiceViewSet, PaymentViewSet (+6 more)

### Community 1 - "billing/tests.py"
Cohesion: 0.29
Nodes (19): Invoice, make_billing_context(), make_user(), django_db, test_clinic_admin_can_cancel_subscription(), test_clinic_admin_can_create_subscription_for_own_clinic(), test_invoice_rejects_patient_from_another_clinic(), test_paid_payment_marks_invoice_paid_and_creates_transaction() (+11 more)

### Community 2 - "uuid"
Cohesion: 0.10
Nodes (20): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+12 more)

### Community 3 - "Notification"
Cohesion: 0.07
Nodes (41): NotificationAdmin, NotificationTemplateAdmin, register, Meta, Notification, NotificationChannel, NotificationEventType, NotificationStatus (+33 more)

### Community 4 - "clinics/models.py"
Cohesion: 0.11
Nodes (13): ClinicStaff, ClinicStaffRole, ClinicStaffStatus, ClinicMembershipSerializer, ClinicStaffSerializer, ClinicWorkspaceSerializer, Meta, atomic (+5 more)

### Community 5 - "documents/views.py"
Cohesion: 0.13
Nodes (12): build_simple_pdf(), DocumentTemplateViewSet, GeneratedDocumentViewSet, action, ModelViewSet, MedicalRecordAuditEventViewSet, ReadOnlyModelViewSet, rest_framework_decorators (+4 more)

### Community 7 - "TelehealthSessionViewSet"
Cohesion: 0.16
Nodes (10): Meta, PublicTelehealthSessionSerializer, TelehealthAccessTokenSerializer, TelehealthParticipantEventSerializer, WaitingRoomSerializer, PublicTelehealthJoinView, action, APIView (+2 more)

### Community 8 - "types.py"
Cohesion: 0.07
Nodes (33): InstrumentApplicationStatus, create_instrument_application(), update_instrument_application(), InstrumentReportPayloadService, Any, InstrumentScoringService, Any, ICalculator (+25 more)

### Community 9 - "is_clinic_admin"
Cohesion: 0.17
Nodes (10): IsClinicAdminForStaff, IsClinicWorkspaceUser, BasePermission, has_active_clinic_membership(), is_clinic_admin(), Check clinic authority from an active membership only., CanAccessPsychologicalAssessments, BasePermission (+2 more)

### Community 10 - "django_apps"
Cohesion: 0.04
Nodes (31): AccountsConfig, AppConfig, AppointmentsConfig, AppConfig, AuditConfig, AppConfig, BillingConfig, AppConfig (+23 more)

### Community 11 - "telehealth/services.py"
Cohesion: 0.09
Nodes (17): DailyVideoProvider, get_video_provider(), GoogleMeetManualVideoProvider, InternalPlaceholderVideoProvider, ABC, Exception, Create a video room for an appointment., Return a participant join URL for an existing room. (+9 more)

### Community 12 - "UserRole"
Cohesion: 0.06
Nodes (70): Command, BaseCommand, UserRole, Clinic, ClinicMembership, Meta, ClinicSerializer, django_db (+62 more)

### Community 13 - "psychological_assessments/views.py"
Cohesion: 0.11
Nodes (12): AssessmentInstrument, assessments_visible_to_user(), clinical_assessments_visible_to_user(), QuerySet, AssessmentDocumentViewSet, AssessmentInstrumentViewSet, AssessmentPlanViewSet, AssessmentSessionViewSet (+4 more)

### Community 14 - "clinics_visible_to_user"
Cohesion: 0.08
Nodes (26): clinics_visible_to_user(), QuerySet, DocumentTemplateAdmin, GeneratedDocumentAdmin, register, DocumentTemplate, DocumentTemplateType, GeneratedDocument (+18 more)

### Community 15 - "billing/selectors.py"
Cohesion: 0.20
Nodes (8): Plan, billing_clinic_ids_for_user(), invoices_visible_to_user(), payments_visible_to_user(), plans_visible_to_user(), QuerySet, subscriptions_visible_to_user(), transactions_visible_to_user()

### Community 16 - "accounts/views.py"
Cohesion: 0.11
Nodes (23): generate_totp_secret(), provisioning_uri(), CurrentUserSerializer, Meta, MFASetupSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, CurrentUserView (+15 more)

### Community 17 - "medical_records/tests.py"
Cohesion: 0.11
Nodes (28): MedicalRecordAuditEventAdmin, MedicalRecordEntryAdmin, MedicalRecordEntryVersionAdmin, register, MedicalRecordAuditAction, MedicalRecordAuditEvent, MedicalRecordEntry, MedicalRecordEntryStatus (+20 more)

### Community 18 - "django_urls"
Cohesion: 0.21
Nodes (5): ConsentRecordViewSet, ConsentTemplateViewSet, action, ModelViewSet, django_urls

### Community 19 - "AssessmentPlanSerializer"
Cohesion: 0.11
Nodes (5): AssessmentPlanSerializer, AssessmentResultSerializer, AssessmentSessionSerializer, AssessmentTimelineEventSerializer, Meta

### Community 20 - "Skill Mestre — Plataforma para Psicólogos.md"
Cohesion: 0.04
Nodes (44): 10. AGENDA, 11. CONSULTA ONLINE, 12. SALA DE ESPERA, 13. DOCUMENTOS, 14. AVALIAÇÃO PSICOLÓGICA, 15. CONSENTIMENTOS, 16. FINANCEIRO, 17. MODELO SAAS (+36 more)

### Community 21 - "telehealth/serializers.py"
Cohesion: 0.18
Nodes (10): MedicalRecordEntryType, register, TelehealthParticipantEventAdmin, TelehealthSessionAdmin, Meta, TelehealthAccessToken, TelehealthParticipantEvent, TelehealthParticipantRole (+2 more)

### Community 22 - "os"
Cohesion: 0.13
Nodes (9): ASGI config for config project. It exposes the ASGI callable as a module-level…, WSGI config for config project. It exposes the WSGI callable as a module-level…, django_core_asgi, django_core_wsgi, main(), Django's command-line utility for administrative tasks., Run administrative tasks., os (+1 more)

### Community 23 - "telehealth/tests.py"
Cohesion: 0.21
Nodes (17): CareModality, TelehealthSession, make_online_context(), make_user(), django_db, override_settings, test_clinic_admin_can_create_manual_google_meet_session(), test_clinic_admin_can_create_telehealth_session_for_online_appointment() (+9 more)

### Community 25 - "Subscription"
Cohesion: 0.20
Nodes (4): Subscription, SubscriptionSerializer, FeatureService, SubscriptionService

### Community 26 - "has_explicit_platform_role"
Cohesion: 0.18
Nodes (6): has_explicit_platform_role(), Return whether the application role identifies a platform account., CanManageClinicPatients, BasePermission, CanManageClinicProfessionals, BasePermission

### Community 27 - "psychological_assessments/tests.py"
Cohesion: 0.23
Nodes (21): Assessment, AssessmentPlan, AssessmentResult, AssessmentResultStatus, AssessmentTimelineEvent, make_assessment_context(), make_user(), django_db (+13 more)

### Community 28 - "accounts/tests.py"
Cohesion: 0.19
Nodes (22): totp_now(), is_platform_operator(), Allow platform authority only for a valid, separate platform identity., make_user(), django_db, override_settings, test_clinic_admin_can_confirm_initial_mfa_from_login(), test_clinic_admin_without_mfa_is_blocked_at_login() (+14 more)

### Community 29 - "consents/tests.py"
Cohesion: 0.08
Nodes (29): ConsentRecordAdmin, ConsentTemplateAdmin, register, ConsentRecord, ConsentStatus, ConsentTemplate, ConsentTemplateType, Meta (+21 more)

### Community 30 - "django_db"
Cohesion: 0.11
Nodes (9): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+1 more)

### Community 32 - "Appointment"
Cohesion: 0.08
Nodes (31): AppointmentAdmin, register, ScheduleBlockAdmin, Appointment, AppointmentStatus, Meta, ScheduleBlock, appointments_visible_to_user() (+23 more)

### Community 33 - "telehealth/views.py"
Cohesion: 0.27
Nodes (8): appointment_clinic_ids_for_user(), QuerySet, telehealth_events_visible_to_user(), telehealth_sessions_visible_to_user(), ReadOnlyModelViewSet, TelehealthParticipantEventViewSet, django_db_models, rest_framework_views

### Community 34 - "DESIGN.md"
Cohesion: 0.05
Nodes (38): Badges & Chips, Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors (+30 more)

### Community 35 - "billing/admin.py"
Cohesion: 0.48
Nodes (6): InvoiceAdmin, PaymentAdmin, PlanAdmin, register, SubscriptionAdmin, TransactionAdmin

### Community 37 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 38 - "professionals/views.py"
Cohesion: 0.15
Nodes (12): ProfessionalAdmin, register, SpecialtyAdmin, Meta, Specialty, Meta, ProfessionalSerializer, SpecialtySerializer (+4 more)

### Community 39 - "MedicalRecordEntryViewSet"
Cohesion: 0.33
Nodes (3): MedicalRecordEntryViewSet, action, ModelViewSet

### Community 40 - "privacy/selectors.py"
Cohesion: 0.22
Nodes (7): CanManagePrivacyRequests, BasePermission, data_subject_requests_visible_to_user(), privacy_clinic_ids_for_user(), QuerySet, DataSubjectRequestViewSet, ModelViewSet

### Community 42 - "privacy/tests.py"
Cohesion: 0.18
Nodes (14): DataSubjectRequestAdmin, register, DataSubjectRequest, DataSubjectRequestStatus, DataSubjectRequestType, Meta, make_context(), make_user() (+6 more)

### Community 45 - "AuditAction"
Cohesion: 0.24
Nodes (12): AuditEventAdmin, register, AuditAction, AuditEvent, Meta, make_user(), django_db, test_clinic_admin_lists_only_own_audit_events() (+4 more)

### Community 46 - "psychological_assessments/models.py"
Cohesion: 0.20
Nodes (9): AssessmentDocumentType, AssessmentSessionModality, AssessmentSessionStatus, AssessmentStatus, AssessmentTimelineEventType, AssessmentType, calculate_age_in_months(), AssessmentInstrumentSerializer (+1 more)

### Community 47 - "Plataforma PSI Design Brief"
Cohesion: 0.09
Nodes (21): Acessibilidade, Agenda, Critérios De Aprovação, Dashboard, Direção Visual Preferida, Documentos E Consentimentos, Entregáveis Esperados Do Designer, Estrutura De Navegação (+13 more)

### Community 50 - "rest_framework"
Cohesion: 0.10
Nodes (13): AbstractUser, Backward-compatible name for the explicit platform role., User, IsPlatformOperator, BasePermission, Meta, PlatformClinicAdminProvisionSerializer, PlatformClinicSerializer (+5 more)

### Community 52 - "audit/views.py"
Cohesion: 0.22
Nodes (8): CanViewClinicalAudit, BasePermission, audit_events_visible_to_user(), QuerySet, AuditEventSerializer, Meta, AuditEventViewSet, ReadOnlyModelViewSet

### Community 53 - "billing/serializers.py"
Cohesion: 0.22
Nodes (10): InvoiceStatus, Payment, PaymentMethod, PaymentStatus, PlanType, SubscriptionStatus, TransactionType, PaymentSerializer (+2 more)

### Community 55 - "psychological_assessments/admin.py"
Cohesion: 0.39
Nodes (8): AssessmentAdmin, AssessmentDocumentAdmin, AssessmentInstrumentAdmin, AssessmentPlanAdmin, AssessmentResultAdmin, AssessmentSessionAdmin, InstrumentApplicationAdmin, register

### Community 56 - "AssessmentDocument"
Cohesion: 0.12
Nodes (6): AssessmentCodeCounter, AssessmentDocument, AssessmentSession, generate_assessment_code(), Meta, AssessmentDocumentSerializer

### Community 60 - "AssessmentResultViewSet"
Cohesion: 0.25
Nodes (6): AssessmentCancelSerializer, AssessmentResultVoidSerializer, AssessmentResultViewSet, AssessmentViewSet, action, record_timeline_event()

### Community 62 - "Deploy de Produção"
Cohesion: 0.17
Nodes (11): Arquivos de Produção, Backups, CI/CD, Configuração Inicial, Deploy de Produção, Health Check, Itens Ainda Externos, Pré-requisitos (+3 more)

### Community 63 - "Roadmap Comercial GoPsi"
Cohesion: 0.17
Nodes (11): Diferencial Principal, Fluxos Que Precisam Parecer Completos, MVP Comercial, Pacote 1, Pacote 2, Pacote 3, Pacotes De Evolução, Posicionamento (+3 more)

### Community 64 - "TestModuleError"
Cohesion: 0.32
Nodes (7): Exception, Raised when scoring cannot be completed., Base exception for instrument module errors., Raised when raw input cannot be validated., TestModuleError, TestScoringError, TestValidationError

### Community 68 - "django_contrib_auth"
Cohesion: 0.19
Nodes (8): Command, BaseCommand, Command, BaseCommand, UserMFADevice, django_contrib_auth, django_core_management_base, django_utils_crypto

### Community 70 - "clinics/admin.py"
Cohesion: 0.60
Nodes (4): ClinicAdmin, ClinicMembershipAdmin, ClinicStaffAdmin, register

### Community 73 - "opencode.json"
Cohesion: 0.40
Nodes (4): plugin, $schema, skills, paths

### Community 74 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 76 - "Product Designer"
Cohesion: 0.20
Nodes (9): Design Principles, Healthcare UX Rules, Output Style, Patient-Facing Telehealth Checklist, Product Designer, Role, SaaS Screen Checklist, Visual Direction For Plataforma PSI (+1 more)

### Community 115 - "accounts/migrations/0001_initial.py"
Cohesion: 0.22
Nodes (6): Migration, Migration, Migration, django_contrib_auth_models, django_contrib_auth_validators, django_utils_timezone

### Community 116 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 117 - "Deploy no Render"
Cohesion: 0.29
Nodes (6): 1. Backend No Render, 2. Criar Ou Resetar Admin, 3. Ordem Correta, 4. Observações, Deploy no Render, Sem Shell No Plano Free

### Community 118 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 119 - "Plataforma PSI"
Cohesion: 0.40
Nodes (4): Desenvolvimento, Endpoints iniciais, Plataforma PSI, Qualidade

### Community 121 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 122 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 123 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 124 - "mfa.py"
Cohesion: 0.22
Nodes (9): _hotp(), verify_totp(), base64, hashlib, hmac, secrets, struct, time (+1 more)

### Community 133 - "record_audit_event"
Cohesion: 0.16
Nodes (7): AdminAuditMiddleware, client_ip(), record_audit_event(), sanitize_metadata(), DataSubjectRequestSerializer, Meta, logging

### Community 138 - "django_contrib"
Cohesion: 0.33
Nodes (6): CustomUserAdmin, register, UserMFADeviceAdmin, django_contrib, django_contrib_auth_admin, UserAdmin

### Community 139 - "core/views.py"
Cohesion: 0.33
Nodes (4): HealthCheckView, django_http, django_views, View

## Knowledge Gaps
- **224 isolated node(s):** `$schema`, `paths`, `plugin`, `Migration`, `Migration` (+219 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 539 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Clinic` connect `UserRole` to `billing/tests.py`, `Notification`, `clinics/models.py`, `record_audit_event`, `is_clinic_admin`, `clinics_visible_to_user`, `medical_records/tests.py`, `telehealth/serializers.py`, `telehealth/tests.py`, `Subscription`, `psychological_assessments/tests.py`, `accounts/tests.py`, `consents/tests.py`, `Transaction`, `Appointment`, `privacy/tests.py`, `AuditAction`, `psychological_assessments/models.py`, `rest_framework`, `billing/serializers.py`, `clinics/admin.py`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `has_explicit_platform_role()` connect `has_explicit_platform_role` to `billing/views.py`, `Notification`, `clinics/models.py`, `record_audit_event`, `InstrumentApplication`, `is_clinic_admin`, `UserRole`, `psychological_assessments/views.py`, `clinics_visible_to_user`, `billing/selectors.py`, `medical_records/tests.py`, `AssessmentPlanSerializer`, `telehealth/serializers.py`, `CanManageNotifications`, `Subscription`, `accounts/tests.py`, `consents/tests.py`, `Appointment`, `telehealth/views.py`, `CanManageClinicSchedule`, `professionals/views.py`, `privacy/selectors.py`, `accounts/models.py`, `CanManageConsents`, `CanManageClinicDocuments`, `psychological_assessments/models.py`, `CanAccessMedicalRecords`, `CanManageTelehealth`, `audit/views.py`, `billing/serializers.py`, `AssessmentDocument`, `AssessmentSerializer`, `TelehealthSessionSerializer`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `UserRole` connect `UserRole` to `billing/views.py`, `billing/tests.py`, `Notification`, `clinics/models.py`, `is_clinic_admin`, `clinics_visible_to_user`, `billing/selectors.py`, `medical_records/tests.py`, `telehealth/tests.py`, `CanManageNotifications`, `has_explicit_platform_role`, `psychological_assessments/tests.py`, `accounts/tests.py`, `consents/tests.py`, `Appointment`, `telehealth/views.py`, `CanManageClinicSchedule`, `privacy/selectors.py`, `accounts/models.py`, `privacy/tests.py`, `CanManageConsents`, `CanManageClinicDocuments`, `AuditAction`, `CanManageTelehealth`, `rest_framework`, `audit/views.py`, `django_contrib_auth`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 112 inferred relationships involving `UserRole` (e.g. with `Command` and `Command`) actually correct?**
  _`UserRole` has 112 INFERRED edges - model-reasoned connections that need verification._
- **Are the 86 inferred relationships involving `Clinic` (e.g. with `Command` and `test_clinic_admin_can_confirm_initial_mfa_from_login()`) actually correct?**
  _`Clinic` has 86 INFERRED edges - model-reasoned connections that need verification._
- **Are the 59 inferred relationships involving `ClinicMembership` (e.g. with `Command` and `test_clinic_admin_can_confirm_initial_mfa_from_login()`) actually correct?**
  _`ClinicMembership` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Are the 45 inferred relationships involving `Professional` (e.g. with `test_platform_preflight_reports_identity_findings_without_changing_data()` and `Appointment`) actually correct?**
  _`Professional` has 45 INFERRED edges - model-reasoned connections that need verification._