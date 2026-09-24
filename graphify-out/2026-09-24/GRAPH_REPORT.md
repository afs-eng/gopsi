# Graph Report - plataforma-psi  (2026-09-24)

## Corpus Check
- 341 files · ~425,712 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: (none) 13, .example 2, .conf 1)

## Summary
- 2140 nodes · 5731 edges · 133 communities (82 shown, 51 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 791 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cec330a1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- billing/tests.py
- api.ts
- uuid
- notifications/tests.py
- clinics/models.py
- DashboardPage.tsx
- AppointmentsPage.tsx
- useAuthenticatedData
- types.py
- AssessmentCreatePage.tsx
- django_apps
- telehealth/services.py
- UserRole
- psychological_assessments/views.py
- GeneratedDocument
- apiFetch
- accounts/views.py
- medical_records/tests.py
- consents/views.py
- clinical_assessments_visible_to_user
- Skill Mestre — Plataforma para Psicólogos.md
- package.json
- react
- telehealth/tests.py
- notifications/views.py
- Patient
- BillingPage.tsx
- psychological_assessments/tests.py
- accounts/tests.py
- consents/tests.py
- django_db
- clinics_visible_to_user
- Appointment
- appointments/selectors.py
- patients/views.py
- PatientEditPage.tsx
- next
- What You Must Do When Invoked
- professionals/models.py
- MedicalRecordEntrySerializer
- DataSubjectRequestSerializer
- has_explicit_platform_role
- AuditAction
- TelehealthSessionViewSet
- compilerOptions
- LoginPage
- psychological_assessments/models.py
- Plataforma PSI Design Brief
- Professional
- ClinicStaffFormPage.tsx
- User
- AppointmentDetailPage.tsx
- rest_framework_viewsets
- professionals_visible_to_user
- Notification
- psychological_assessments/admin.py
- AssessmentSession
- os
- TelehealthRoomPage.tsx
- AddInstrumentModal.tsx
- record_audit_event
- AssessmentSerializer
- Deploy de Produção
- Roadmap Comercial GoPsi
- TestModuleError
- MedicalRecordsPage.tsx
- AssessmentDocument
- telehealth/admin.py
- Command
- vercel.json
- clinics/admin.py
- notifications/models.py
- layout.tsx
- opencode.json
- graphify.js
- settings.py
- Product Designer
- test_modules/__init__.py
- entrypoint.prod.sh
- plataforma-psi
- accounts/migrations/0001_initial.py
- graphify reference: extra exports and benchmark
- Deploy Render + Vercel
- graphify reference: query, path, explain
- Plataforma PSI
- frontend/README.md
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- 0003_assessmentcodecounter_assessment_assessment_type_and_more.py
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- ARCHITECTURE.md
- frontend/AGENTS.md
- extraction-spec.md
- SECURITY.md

## God Nodes (most connected - your core abstractions)
1. `UserRole` - 152 edges
2. `Clinic` - 122 edges
3. `has_explicit_platform_role()` - 116 edges
4. `ClinicMembership` - 81 edges
5. `apiFetch()` - 71 edges
6. `Professional` - 68 edges
7. `useAuthenticatedData()` - 67 edges
8. `Patient` - 61 edges
9. `getClinic()` - 46 edges
10. `Appointment` - 45 edges

## Surprising Connections (you probably didn't know these)
- `Command` --uses--> `UserRole`  [INFERRED]
  apps/accounts/management/commands/platform_preflight.py → apps/accounts/models.py
- `Command` --uses--> `Clinic`  [INFERRED]
  apps/accounts/management/commands/platform_preflight.py → apps/clinics/models.py
- `Command` --uses--> `ClinicMembership`  [INFERRED]
  apps/accounts/management/commands/platform_preflight.py → apps/clinics/models.py
- `Command` --uses--> `UserRole`  [INFERRED]
  apps/accounts/management/commands/reset_admin_password.py → apps/accounts/models.py
- `make_user()` --uses--> `UserRole`  [INFERRED]
  apps/accounts/tests.py → apps/accounts/models.py

## Import Cycles
- None detected.

## Communities (133 total, 51 thin omitted)

### Community 0 - "billing/tests.py"
Cohesion: 0.05
Nodes (62): InvoiceAdmin, PaymentAdmin, PlanAdmin, register, SubscriptionAdmin, TransactionAdmin, Invoice, InvoiceStatus (+54 more)

### Community 1 - "api.ts"
Cohesion: 0.06
Nodes (55): PublicTelehealthJoinPage(), handleEnterWaitingRoom(), PublicTelehealthJoinPageProps, statusLabels, enterPublicWaitingRoom(), getPublicTelehealthAccess(), RequestOptions, Appointment (+47 more)

### Community 2 - "uuid"
Cohesion: 0.08
Nodes (22): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+14 more)

### Community 3 - "notifications/tests.py"
Cohesion: 0.31
Nodes (14): NotificationStatus, send_due_notifications(), send_notification(), make_context(), make_user(), django_db, test_clinic_admin_can_create_notification_template(), test_clinic_admin_can_queue_notification() (+6 more)

### Community 4 - "clinics/models.py"
Cohesion: 0.09
Nodes (19): ClinicStaffRole, ClinicStaffStatus, IsClinicAdminForStaff, IsClinicWorkspaceUser, BasePermission, has_active_clinic_membership(), is_clinic_admin(), Check clinic authority from an active membership only. (+11 more)

### Community 5 - "DashboardPage.tsx"
Cohesion: 0.07
Nodes (31): PageProps, MetricCard(), MetricCardProps, AssessmentsPage(), AssessmentsPageProps, formatDate(), statusLabel(), ClinicDetailPage() (+23 more)

### Community 6 - "AppointmentsPage.tsx"
Cohesion: 0.07
Nodes (44): addDays(), addMonths(), AppointmentDraft, AppointmentsPage(), copyEventSummary(), goToNextPeriod(), goToPreviousPeriod(), goToToday() (+36 more)

### Community 7 - "useAuthenticatedData"
Cohesion: 0.07
Nodes (38): ScheduleBlockCreatePage(), handleSubmit(), ScheduleBlockCreatePageProps, ClinicCreatePage(), useAuthenticatedData(), DocumentCreatePage(), handleSubmit(), DocumentCreatePageProps (+30 more)

### Community 8 - "types.py"
Cohesion: 0.07
Nodes (33): InstrumentApplicationStatus, create_instrument_application(), update_instrument_application(), InstrumentReportPayloadService, Any, InstrumentScoringService, Any, ICalculator (+25 more)

### Community 9 - "AssessmentCreatePage.tsx"
Cohesion: 0.08
Nodes (24): PageProps, AppointmentCreatePage(), handleSubmit(), AppointmentCreatePageProps, AssessmentCreatePage(), handleSubmit(), AssessmentCreatePageProps, InvoiceCreatePage() (+16 more)

### Community 10 - "django_apps"
Cohesion: 0.04
Nodes (31): AccountsConfig, AppConfig, AppointmentsConfig, AppConfig, AuditConfig, AppConfig, BillingConfig, AppConfig (+23 more)

### Community 11 - "telehealth/services.py"
Cohesion: 0.07
Nodes (19): atomic, DailyVideoProvider, get_video_provider(), GoogleMeetManualVideoProvider, InternalPlaceholderVideoProvider, ABC, Exception, Create a video room for an appointment. (+11 more)

### Community 12 - "UserRole"
Cohesion: 0.24
Nodes (25): UserRole, Clinic, ClinicMembership, ClinicStaff, Meta, django_db, test_clinic_admin_authority_requires_active_membership(), test_clinic_admin_can_create_staff_with_system_access_and_disable_later() (+17 more)

### Community 13 - "psychological_assessments/views.py"
Cohesion: 0.13
Nodes (11): AssessmentInstrument, CanAccessPsychologicalAssessments, BasePermission, AssessmentDocumentViewSet, AssessmentInstrumentViewSet, AssessmentPlanViewSet, AssessmentSessionViewSet, InstrumentApplicationViewSet (+3 more)

### Community 14 - "GeneratedDocument"
Cohesion: 0.06
Nodes (32): DocumentTemplateAdmin, GeneratedDocumentAdmin, register, DocumentTemplate, DocumentTemplateType, GeneratedDocument, GeneratedDocumentStatus, Meta (+24 more)

### Community 15 - "apiFetch"
Cohesion: 0.12
Nodes (35): PageProps, AssessmentDetailPage(), handleAddInstruments(), handleCancelSubmit(), handleDocumentSubmit(), handleFinalizeResult(), handlePlanSubmit(), handleResultSubmit() (+27 more)

### Community 16 - "accounts/views.py"
Cohesion: 0.05
Nodes (45): Command, BaseCommand, Command, BaseCommand, generate_totp_secret(), _hotp(), provisioning_uri(), verify_totp() (+37 more)

### Community 17 - "medical_records/tests.py"
Cohesion: 0.19
Nodes (20): MedicalRecordAuditEventAdmin, MedicalRecordEntryAdmin, MedicalRecordEntryVersionAdmin, register, MedicalRecordAuditAction, MedicalRecordAuditEvent, MedicalRecordEntry, MedicalRecordEntryStatus (+12 more)

### Community 18 - "consents/views.py"
Cohesion: 0.09
Nodes (14): CanManageConsents, BasePermission, _consent_clinic_filter(), consent_records_visible_to_user(), consent_templates_visible_to_user(), Q, QuerySet, ConsentRecordSerializer (+6 more)

### Community 19 - "clinical_assessments_visible_to_user"
Cohesion: 0.10
Nodes (6): clinical_assessments_visible_to_user(), AssessmentPlanSerializer, AssessmentResultSerializer, AssessmentSessionSerializer, AssessmentTimelineEventSerializer, Meta

### Community 20 - "Skill Mestre — Plataforma para Psicólogos.md"
Cohesion: 0.04
Nodes (44): 10. AGENDA, 11. CONSULTA ONLINE, 12. SALA DE ESPERA, 13. DOCUMENTOS, 14. AVALIAÇÃO PSICOLÓGICA, 15. CONSENTIMENTOS, 16. FINANCEIRO, 17. MODELO SAAS (+36 more)

### Community 21 - "package.json"
Cohesion: 0.07
Nodes (28): eslintConfig, dependencies, next, react, react-dom, devDependencies, eslint, eslint-config-next (+20 more)

### Community 22 - "react"
Cohesion: 0.10
Nodes (25): calculateAge(), PatientCreatePage(), handleSubmit(), PatientCreatePageProps, PlatformClinicCreatePage(), submit(), crpRegionFromValue(), crpRegions (+17 more)

### Community 23 - "telehealth/tests.py"
Cohesion: 0.19
Nodes (18): CareModality, TelehealthSession, make_online_context(), make_user(), django_db, override_settings, test_clinic_admin_can_create_manual_google_meet_session(), test_clinic_admin_can_create_telehealth_session_for_online_appointment() (+10 more)

### Community 24 - "notifications/views.py"
Cohesion: 0.08
Nodes (17): CanManageNotifications, BasePermission, _notification_clinic_filter(), notification_templates_visible_to_user(), notifications_visible_to_user(), Q, QuerySet, Meta (+9 more)

### Community 25 - "Patient"
Cohesion: 0.18
Nodes (21): GuardianAdmin, GuardianInline, PatientAdmin, ProfessionalPatientAdmin, ProfessionalPatientInline, register, Guardian, Meta (+13 more)

### Community 26 - "BillingPage.tsx"
Cohesion: 0.14
Nodes (24): amountInCents(), BillingPage(), handleCancelInvoice(), handlePayment(), loadBillingData(), BillingPageProps, currency, formatDate() (+16 more)

### Community 27 - "psychological_assessments/tests.py"
Cohesion: 0.22
Nodes (22): Assessment, AssessmentPlan, AssessmentResult, AssessmentResultStatus, AssessmentTimelineEvent, Meta, make_assessment_context(), make_user() (+14 more)

### Community 28 - "accounts/tests.py"
Cohesion: 0.20
Nodes (21): totp_now(), is_platform_operator(), Allow platform authority only for a valid, separate platform identity., make_user(), django_db, override_settings, test_clinic_admin_can_confirm_initial_mfa_from_login(), test_clinic_admin_without_mfa_is_blocked_at_login() (+13 more)

### Community 29 - "consents/tests.py"
Cohesion: 0.10
Nodes (29): CustomUserAdmin, register, UserMFADeviceAdmin, ConsentRecordAdmin, ConsentTemplateAdmin, register, ConsentRecord, ConsentStatus (+21 more)

### Community 30 - "django_db"
Cohesion: 0.08
Nodes (26): AppointmentStatus, Migration, Migration, Migration, MedicalRecordEntryType, Migration, Migration, Migration (+18 more)

### Community 31 - "clinics_visible_to_user"
Cohesion: 0.19
Nodes (12): clinics_visible_to_user(), QuerySet, patients_visible_to_user(), QuerySet, GuardianSerializer, Meta, ProfessionalPatientSerializer, DataSubjectRequestType (+4 more)

### Community 32 - "Appointment"
Cohesion: 0.18
Nodes (19): AppointmentAdmin, register, ScheduleBlockAdmin, Appointment, Meta, ScheduleBlock, make_clinic_context(), make_user() (+11 more)

### Community 33 - "appointments/selectors.py"
Cohesion: 0.13
Nodes (12): CanManageClinicSchedule, BasePermission, appointment_clinic_ids_for_user(), appointments_visible_to_user(), blocks_visible_to_user(), QuerySet, AppointmentViewSet, ModelViewSet (+4 more)

### Community 34 - "patients/views.py"
Cohesion: 0.22
Nodes (5): CanManageClinicPatients, BasePermission, PatientViewSet, ModelViewSet, rest_framework_parsers

### Community 35 - "PatientEditPage.tsx"
Cohesion: 0.14
Nodes (15): PageProps, calculateAge(), formatDate(), PatientDetailPage(), handleDeletePatient(), PatientDetailPageProps, patientStatus(), sexLabel() (+7 more)

### Community 36 - "next"
Cohesion: 0.13
Nodes (14): nextConfig, AppShell(), handleLogout(), AppShellProps, PlatformShell(), PlatformClinicDetailPage(), deactivate(), PlatformClinicsPage() (+6 more)

### Community 37 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 38 - "professionals/models.py"
Cohesion: 0.19
Nodes (10): Meta, ProfessionalStatus, Specialty, Meta, ProfessionalSerializer, SpecialtySerializer, ProfessionalViewSet, ModelViewSet (+2 more)

### Community 39 - "MedicalRecordEntrySerializer"
Cohesion: 0.11
Nodes (13): medical_record_audit_visible_to_user(), medical_record_clinic_ids_for_user(), medical_records_visible_to_user(), QuerySet, MedicalRecordAuditEventSerializer, MedicalRecordEntrySerializer, Meta, atomic (+5 more)

### Community 40 - "DataSubjectRequestSerializer"
Cohesion: 0.13
Nodes (9): CanManagePrivacyRequests, BasePermission, data_subject_requests_visible_to_user(), privacy_clinic_ids_for_user(), QuerySet, DataSubjectRequestSerializer, Meta, DataSubjectRequestViewSet (+1 more)

### Community 41 - "has_explicit_platform_role"
Cohesion: 0.13
Nodes (9): has_explicit_platform_role(), Return whether the application role identifies a platform account., audit_events_visible_to_user(), QuerySet, CanAccessMedicalRecords, BasePermission, CanManageClinicProfessionals, BasePermission (+1 more)

### Community 42 - "AuditAction"
Cohesion: 0.14
Nodes (23): AuditEventAdmin, register, AuditAction, AuditEvent, Meta, make_user(), django_db, test_clinic_admin_lists_only_own_audit_events() (+15 more)

### Community 43 - "TelehealthSessionViewSet"
Cohesion: 0.19
Nodes (5): CanManageTelehealth, BasePermission, action, ModelViewSet, TelehealthSessionViewSet

### Community 44 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 45 - "LoginPage"
Cohesion: 0.23
Nodes (11): AuthMode, LoginPage(), extractMfaSetupValue(), handlePasswordResetConfirm(), handlePasswordResetRequest(), handleSubmit(), confirmPasswordReset(), getCurrentUser() (+3 more)

### Community 46 - "psychological_assessments/models.py"
Cohesion: 0.12
Nodes (12): AssessmentCodeCounter, AssessmentDocumentType, AssessmentSessionModality, AssessmentSessionStatus, AssessmentStatus, AssessmentTimelineEventType, AssessmentType, calculate_age_in_months() (+4 more)

### Community 47 - "Plataforma PSI Design Brief"
Cohesion: 0.09
Nodes (21): Acessibilidade, Agenda, Critérios De Aprovação, Dashboard, Direção Visual Preferida, Documentos E Consentimentos, Entregáveis Esperados Do Designer, Estrutura De Navegação (+13 more)

### Community 48 - "Professional"
Cohesion: 0.45
Nodes (11): Professional, make_user(), django_db, test_clinic_admin_can_create_professional_for_own_clinic(), test_clinic_admin_cannot_create_professional_for_other_clinic(), test_destroy_professional_uses_soft_delete(), test_platform_operator_cannot_list_professional_directory(), test_platform_operator_cannot_retrieve_professional_directory_entry() (+3 more)

### Community 49 - "ClinicStaffFormPage.tsx"
Cohesion: 0.22
Nodes (9): ClinicStaffFormPage(), handleSubmit(), ClinicStaffFormPageProps, roleOptions, createClinicStaff(), getClinicStaff(), updateClinicStaff(), ClinicStaffRole (+1 more)

### Community 50 - "User"
Cohesion: 0.09
Nodes (13): AbstractUser, Backward-compatible name for the explicit platform role., User, IsPlatformOperator, BasePermission, Meta, PlatformClinicAdminProvisionSerializer, PlatformClinicSerializer (+5 more)

### Community 51 - "AppointmentDetailPage.tsx"
Cohesion: 0.27
Nodes (10): PageProps, AppointmentDetailPage(), handleCancel(), AppointmentDetailPageProps, formatCurrency(), formatDate(), modalityLabel(), statusLabel() (+2 more)

### Community 52 - "rest_framework_viewsets"
Cohesion: 0.23
Nodes (7): CanViewClinicalAudit, BasePermission, AuditEventSerializer, Meta, AuditEventViewSet, ReadOnlyModelViewSet, rest_framework_viewsets

### Community 53 - "professionals_visible_to_user"
Cohesion: 0.12
Nodes (6): AppointmentSerializer, Meta, ScheduleBlockSerializer, PatientSerializer, professionals_visible_to_user(), QuerySet

### Community 54 - "Notification"
Cohesion: 0.24
Nodes (8): Notification, get_notification_provider(), InternalNotificationProvider, NotificationDelivery, NotificationProvider, NotificationService, ABC, Send a notification through a concrete provider.

### Community 55 - "psychological_assessments/admin.py"
Cohesion: 0.39
Nodes (8): AssessmentAdmin, AssessmentDocumentAdmin, AssessmentInstrumentAdmin, AssessmentPlanAdmin, AssessmentResultAdmin, AssessmentSessionAdmin, InstrumentApplicationAdmin, register

### Community 57 - "os"
Cohesion: 0.13
Nodes (9): ASGI config for config project. It exposes the ASGI callable as a module-level…, WSGI config for config project. It exposes the WSGI callable as a module-level…, django_core_asgi, django_core_wsgi, main(), Django's command-line utility for administrative tasks., Run administrative tasks., os (+1 more)

### Community 58 - "TelehealthRoomPage.tsx"
Cohesion: 0.22
Nodes (12): statusLabels, TelehealthRoomPage(), handleAction(), handleWaitingRoom(), refreshSession(), TelehealthRoomPageProps, cancelTelehealthSession(), enterWaitingRoom() (+4 more)

### Community 59 - "AddInstrumentModal.tsx"
Cohesion: 0.22
Nodes (10): AddInstrumentModal(), getUnavailableReason(), toggleInstrument(), AddInstrumentModalProps, calculateAgeInMonths(), categoryColor(), formatAgeRange(), normalizeMonths() (+2 more)

### Community 60 - "record_audit_event"
Cohesion: 0.14
Nodes (11): AdminAuditMiddleware, client_ip(), record_audit_event(), sanitize_metadata(), AssessmentCancelSerializer, AssessmentResultVoidSerializer, AssessmentResultViewSet, AssessmentViewSet (+3 more)

### Community 61 - "AssessmentSerializer"
Cohesion: 0.16
Nodes (5): assessment_clinic_ids_for_user(), assessments_visible_to_user(), can_access_clinical_assessment_content(), QuerySet, AssessmentSerializer

### Community 62 - "Deploy de Produção"
Cohesion: 0.17
Nodes (11): Arquivos de Produção, Backups, CI/CD, Configuração Inicial, Deploy de Produção, Health Check, Itens Ainda Externos, Pré-requisitos (+3 more)

### Community 63 - "Roadmap Comercial GoPsi"
Cohesion: 0.17
Nodes (11): Diferencial Principal, Fluxos Que Precisam Parecer Completos, MVP Comercial, Pacote 1, Pacote 2, Pacote 3, Pacotes De Evolução, Posicionamento (+3 more)

### Community 64 - "TestModuleError"
Cohesion: 0.32
Nodes (7): Exception, Raised when scoring cannot be completed., Base exception for instrument module errors., Raised when raw input cannot be validated., TestModuleError, TestScoringError, TestValidationError

### Community 65 - "MedicalRecordsPage.tsx"
Cohesion: 0.27
Nodes (9): entryTypeLabels, getMedicalRecordData(), MedicalRecordsPage(), handleVoid(), loadRecords(), MedicalRecordsPageProps, statusLabels, listMedicalRecords() (+1 more)

### Community 67 - "telehealth/admin.py"
Cohesion: 0.67
Nodes (3): register, TelehealthParticipantEventAdmin, TelehealthSessionAdmin

### Community 69 - "vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, devCommand, framework, installCommand, outputDirectory

### Community 70 - "clinics/admin.py"
Cohesion: 0.60
Nodes (4): ClinicAdmin, ClinicMembershipAdmin, ClinicStaffAdmin, register

### Community 71 - "notifications/models.py"
Cohesion: 0.24
Nodes (7): NotificationAdmin, NotificationTemplateAdmin, register, Meta, NotificationChannel, NotificationEventType, NotificationTemplate

### Community 72 - "layout.tsx"
Cohesion: 0.40
Nodes (3): frontend_src_app_globals, geistSans, metadata

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

### Community 117 - "Deploy Render + Vercel"
Cohesion: 0.25
Nodes (7): 1. Backend No Render, 2. Criar Ou Resetar Admin, 3. Frontend No Vercel, 4. Ordem Correta, 5. Observações, Deploy Render + Vercel, Sem Shell No Plano Free

### Community 118 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 119 - "Plataforma PSI"
Cohesion: 0.33
Nodes (5): Desenvolvimento, Endpoints iniciais, Frontend, Plataforma PSI, Qualidade

### Community 120 - "frontend/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 121 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 122 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 123 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **325 isolated node(s):** `$schema`, `paths`, `plugin`, `Migration`, `Migration` (+320 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 697 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserRole` connect `UserRole` to `billing/tests.py`, `notifications/tests.py`, `clinics/models.py`, `GeneratedDocument`, `accounts/views.py`, `medical_records/tests.py`, `consents/views.py`, `telehealth/tests.py`, `notifications/views.py`, `Patient`, `psychological_assessments/tests.py`, `accounts/tests.py`, `consents/tests.py`, `clinics_visible_to_user`, `Appointment`, `appointments/selectors.py`, `patients/views.py`, `DataSubjectRequestSerializer`, `has_explicit_platform_role`, `AuditAction`, `TelehealthSessionViewSet`, `Professional`, `User`, `AssessmentSerializer`, `Command`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `Clinic` connect `UserRole` to `billing/tests.py`, `notifications/tests.py`, `clinics/models.py`, `GeneratedDocument`, `medical_records/tests.py`, `telehealth/tests.py`, `Patient`, `psychological_assessments/tests.py`, `accounts/tests.py`, `consents/tests.py`, `django_db`, `clinics_visible_to_user`, `Appointment`, `professionals/models.py`, `AuditAction`, `psychological_assessments/models.py`, `Professional`, `User`, `Notification`, `Command`, `clinics/admin.py`, `notifications/models.py`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `has_explicit_platform_role()` connect `has_explicit_platform_role` to `billing/tests.py`, `clinics/models.py`, `psychological_assessments/views.py`, `GeneratedDocument`, `medical_records/tests.py`, `consents/views.py`, `clinical_assessments_visible_to_user`, `telehealth/tests.py`, `notifications/views.py`, `accounts/tests.py`, `django_db`, `clinics_visible_to_user`, `appointments/selectors.py`, `patients/views.py`, `professionals/models.py`, `MedicalRecordEntrySerializer`, `DataSubjectRequestSerializer`, `TelehealthSessionViewSet`, `psychological_assessments/models.py`, `rest_framework_viewsets`, `professionals_visible_to_user`, `AssessmentSerializer`, `AssessmentDocument`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 112 inferred relationships involving `UserRole` (e.g. with `Command` and `Command`) actually correct?**
  _`UserRole` has 112 INFERRED edges - model-reasoned connections that need verification._
- **Are the 86 inferred relationships involving `Clinic` (e.g. with `Command` and `test_clinic_admin_can_confirm_initial_mfa_from_login()`) actually correct?**
  _`Clinic` has 86 INFERRED edges - model-reasoned connections that need verification._
- **Are the 59 inferred relationships involving `ClinicMembership` (e.g. with `Command` and `test_clinic_admin_can_confirm_initial_mfa_from_login()`) actually correct?**
  _`ClinicMembership` has 59 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `paths`, `plugin` to the rest of the system?**
  _325 weakly-connected nodes found - possible documentation gaps or missing edges._