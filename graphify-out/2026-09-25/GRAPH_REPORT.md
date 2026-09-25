# Graph Report - plataforma-psi  (2026-09-24)

## Corpus Check
- 342 files · ~436,847 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: (none) 13, .example 2, .conf 1)

## Summary
- 2177 nodes · 5767 edges · 136 communities (88 shown, 48 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 791 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e16f0d09`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- billing/tests.py
- useAuthenticatedData
- django_db
- Notification
- clinics/models.py
- api.ts
- AppointmentsPage
- AppointmentsPage.tsx
- types.py
- clinical_assessments_visible_to_user
- django_apps
- telehealth/services.py
- UserRole
- psychological_assessments/views.py
- GeneratedDocument
- apiFetch
- accounts/views.py
- medical_records/tests.py
- package.json
- AssessmentResultSerializer
- Skill Mestre — Plataforma para Psicólogos.md
- BillingPage.tsx
- Patient
- telehealth/tests.py
- notifications/views.py
- ProfessionalCreatePage.tsx
- professionals_visible_to_user
- psychological_assessments/tests.py
- accounts/tests.py
- consents/tests.py
- 0003_assessmentcodecounter_assessment_assessment_type_and_more.py
- listProfessionals
- Appointment
- compilerOptions
- DESIGN.md
- PlatformClinicDetailPage.tsx
- appointments_visible_to_user
- What You Must Do When Invoked
- professionals/models.py
- medical_records/views.py
- DataSubjectRequestSerializer
- has_explicit_platform_role
- django_urls
- medical_records/models.py
- LoginPage
- ClinicStaffFormPage.tsx
- psychological_assessments/models.py
- Plataforma PSI Design Brief
- Professional
- AppointmentDetailPage.tsx
- telehealth/views.py
- User
- audit/views.py
- clinics_visible_to_user
- PatientDetailPage.tsx
- psychological_assessments/admin.py
- AssessmentResult
- TelehealthPage.tsx
- AddInstrumentModal.tsx
- MedicalRecordsPage
- PatientCreatePage
- AssessmentSerializer
- Deploy de Produção
- Roadmap Comercial GoPsi
- TestModuleError
- TelehealthRoomPage
- DocumentCreatePage
- telehealth/serializers.py
- django_contrib_auth
- vercel.json
- clinics/admin.py
- medical_records/admin.py
- layout.tsx
- opencode.json
- graphify.js
- frontend/README.md
- Product Designer
- test_modules/__init__.py
- entrypoint.prod.sh
- plataforma-psi
- accounts/migrations/0001_initial.py
- graphify reference: extra exports and benchmark
- Deploy no Render
- graphify reference: query, path, explain
- Plataforma PSI
- frontend/AGENTS.md
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
- `Command` --uses--> `UserMFADevice`  [INFERRED]
  apps/accounts/management/commands/reset_admin_password.py → apps/accounts/models.py
- `Command` --uses--> `UserRole`  [INFERRED]
  apps/accounts/management/commands/reset_admin_password.py → apps/accounts/models.py

## Import Cycles
- None detected.

## Communities (136 total, 48 thin omitted)

### Community 0 - "billing/tests.py"
Cohesion: 0.05
Nodes (62): InvoiceAdmin, PaymentAdmin, PlanAdmin, register, SubscriptionAdmin, TransactionAdmin, Invoice, InvoiceStatus (+54 more)

### Community 1 - "useAuthenticatedData"
Cohesion: 0.06
Nodes (54): nextConfig, PageProps, AppShell(), AppShellProps, MetricCard(), MetricCardProps, AssessmentCreatePageProps, AssessmentsPage() (+46 more)

### Community 2 - "django_db"
Cohesion: 0.07
Nodes (31): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+23 more)

### Community 3 - "Notification"
Cohesion: 0.07
Nodes (38): NotificationAdmin, NotificationTemplateAdmin, register, Meta, Notification, NotificationChannel, NotificationEventType, NotificationStatus (+30 more)

### Community 4 - "clinics/models.py"
Cohesion: 0.09
Nodes (19): ClinicStaffRole, ClinicStaffStatus, IsClinicAdminForStaff, IsClinicWorkspaceUser, BasePermission, has_active_clinic_membership(), is_clinic_admin(), Check clinic authority from an active membership only. (+11 more)

### Community 5 - "api.ts"
Cohesion: 0.06
Nodes (58): PublicTelehealthJoinPage(), handleEnterWaitingRoom(), PublicTelehealthJoinPageProps, statusLabels, enterPublicWaitingRoom(), getPublicTelehealthAccess(), RequestOptions, AppointmentPayload (+50 more)

### Community 6 - "AppointmentsPage"
Cohesion: 0.07
Nodes (38): addDays(), addMonths(), AppointmentsPage(), copyEventSummary(), goToNextPeriod(), goToPreviousPeriod(), goToToday(), handleCancelSelectedAppointment() (+30 more)

### Community 7 - "AppointmentsPage.tsx"
Cohesion: 0.08
Nodes (35): AppointmentCreatePage(), handleSubmit(), AppointmentCreatePageProps, AppointmentDraft, AppointmentsPageProps, CalendarItem, CalendarView, EventPopover (+27 more)

### Community 8 - "types.py"
Cohesion: 0.12
Nodes (19): ICalculator, IClassifier, IInterpreter, IValidator, ABC, AgeGroup, BaseTestModule, ClassificationResult (+11 more)

### Community 9 - "clinical_assessments_visible_to_user"
Cohesion: 0.13
Nodes (6): assessment_clinic_ids_for_user(), assessments_visible_to_user(), can_access_clinical_assessment_content(), clinical_assessments_visible_to_user(), QuerySet, AssessmentPlanSerializer

### Community 10 - "django_apps"
Cohesion: 0.04
Nodes (31): AccountsConfig, AppConfig, AppointmentsConfig, AppConfig, AuditConfig, AppConfig, BillingConfig, AppConfig (+23 more)

### Community 11 - "telehealth/services.py"
Cohesion: 0.09
Nodes (15): DailyVideoProvider, InternalPlaceholderVideoProvider, ABC, Exception, Create a video room for an appointment., Return a participant join URL for an existing room., Close or expire an existing room., Return the provider-specific availability status for a room. (+7 more)

### Community 12 - "UserRole"
Cohesion: 0.18
Nodes (28): UserRole, Clinic, ClinicMembership, ClinicStaff, Meta, Meta, PlatformClinicSerializer, atomic (+20 more)

### Community 13 - "psychological_assessments/views.py"
Cohesion: 0.10
Nodes (17): AssessmentInstrument, CanAccessPsychologicalAssessments, BasePermission, AssessmentCancelSerializer, AssessmentResultVoidSerializer, AssessmentDocumentViewSet, AssessmentInstrumentViewSet, AssessmentPlanViewSet (+9 more)

### Community 14 - "GeneratedDocument"
Cohesion: 0.06
Nodes (32): DocumentTemplateAdmin, GeneratedDocumentAdmin, register, DocumentTemplate, DocumentTemplateType, GeneratedDocument, GeneratedDocumentStatus, Meta (+24 more)

### Community 15 - "apiFetch"
Cohesion: 0.10
Nodes (39): PageProps, AssessmentDetailPage(), handleAddInstruments(), handleCancelSubmit(), handleDocumentSubmit(), handleFinalizeResult(), handlePlanSubmit(), handleResultSubmit() (+31 more)

### Community 16 - "accounts/views.py"
Cohesion: 0.12
Nodes (21): CurrentUserSerializer, Meta, MFASetupSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, CurrentUserView, LoginView, MFAConfirmView (+13 more)

### Community 17 - "medical_records/tests.py"
Cohesion: 0.32
Nodes (11): MedicalRecordAuditAction, MedicalRecordEntry, make_clinic_context(), make_user(), django_db, test_destroy_medical_record_voids_entry_and_audits(), test_platform_operator_cannot_access_records_or_audit_with_accidental_access(), test_professional_can_create_medical_record_with_history_and_audit() (+3 more)

### Community 18 - "package.json"
Cohesion: 0.07
Nodes (28): eslintConfig, dependencies, next, react, react-dom, devDependencies, eslint, eslint-config-next (+20 more)

### Community 19 - "AssessmentResultSerializer"
Cohesion: 0.12
Nodes (5): AssessmentResultSerializer, AssessmentSessionSerializer, AssessmentTimelineEventSerializer, InstrumentApplicationSerializer, Meta

### Community 20 - "Skill Mestre — Plataforma para Psicólogos.md"
Cohesion: 0.04
Nodes (44): 10. AGENDA, 11. CONSULTA ONLINE, 12. SALA DE ESPERA, 13. DOCUMENTOS, 14. AVALIAÇÃO PSICOLÓGICA, 15. CONSENTIMENTOS, 16. FINANCEIRO, 17. MODELO SAAS (+36 more)

### Community 21 - "BillingPage.tsx"
Cohesion: 0.13
Nodes (25): amountInCents(), BillingPage(), handleCancelInvoice(), handlePayment(), loadBillingData(), BillingPageProps, currency, formatDate() (+17 more)

### Community 22 - "Patient"
Cohesion: 0.18
Nodes (21): GuardianAdmin, GuardianInline, PatientAdmin, ProfessionalPatientAdmin, ProfessionalPatientInline, register, Guardian, Meta (+13 more)

### Community 23 - "telehealth/tests.py"
Cohesion: 0.07
Nodes (37): CareModality, register, TelehealthParticipantEventAdmin, TelehealthSessionAdmin, Meta, TelehealthAccessToken, TelehealthParticipantEvent, TelehealthSession (+29 more)

### Community 24 - "notifications/views.py"
Cohesion: 0.09
Nodes (14): CanManageNotifications, BasePermission, _notification_clinic_filter(), notification_templates_visible_to_user(), notifications_visible_to_user(), Q, QuerySet, Meta (+6 more)

### Community 25 - "ProfessionalCreatePage.tsx"
Cohesion: 0.15
Nodes (19): PlatformClinicCreatePage(), submit(), crpRegionFromValue(), crpRegions, ProfessionalCreatePage(), handleCrpInput(), handleSubmit(), ProfessionalCreatePageProps (+11 more)

### Community 26 - "professionals_visible_to_user"
Cohesion: 0.10
Nodes (11): CanManageClinicPatients, BasePermission, GuardianSerializer, Meta, PatientSerializer, ProfessionalPatientSerializer, PatientViewSet, ModelViewSet (+3 more)

### Community 27 - "psychological_assessments/tests.py"
Cohesion: 0.28
Nodes (19): Assessment, AssessmentResultStatus, AssessmentTimelineEvent, make_assessment_context(), make_user(), django_db, test_assessment_rejects_patient_from_another_clinic(), test_assessment_status_transitions_require_final_result_before_completion() (+11 more)

### Community 28 - "accounts/tests.py"
Cohesion: 0.20
Nodes (21): totp_now(), is_platform_operator(), Allow platform authority only for a valid, separate platform identity., make_user(), django_db, override_settings, test_clinic_admin_can_confirm_initial_mfa_from_login(), test_clinic_admin_without_mfa_is_blocked_at_login() (+13 more)

### Community 29 - "consents/tests.py"
Cohesion: 0.15
Nodes (23): ConsentRecordAdmin, ConsentTemplateAdmin, register, ConsentRecord, ConsentStatus, ConsentTemplate, ConsentTemplateType, Meta (+15 more)

### Community 31 - "listProfessionals"
Cohesion: 0.12
Nodes (14): PageProps, ScheduleBlockCreatePage(), handleSubmit(), ScheduleBlockCreatePageProps, AssessmentCreatePage(), handleSubmit(), calculateAge(), PatientEditPage() (+6 more)

### Community 32 - "Appointment"
Cohesion: 0.17
Nodes (20): AppointmentAdmin, register, ScheduleBlockAdmin, Appointment, AppointmentStatus, Meta, ScheduleBlock, make_clinic_context() (+12 more)

### Community 33 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 34 - "DESIGN.md"
Cohesion: 0.05
Nodes (38): Badges & Chips, Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors (+30 more)

### Community 35 - "PlatformClinicDetailPage.tsx"
Cohesion: 0.19
Nodes (9): handleLogout(), PlatformShell(), PlatformClinicDetailPage(), deactivate(), PlatformClinicsPage(), deactivatePlatformClinic(), getPlatformClinic(), listPlatformClinics() (+1 more)

### Community 36 - "appointments_visible_to_user"
Cohesion: 0.12
Nodes (11): CanManageClinicSchedule, BasePermission, appointments_visible_to_user(), blocks_visible_to_user(), QuerySet, AppointmentViewSet, ModelViewSet, ScheduleBlockViewSet (+3 more)

### Community 37 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 38 - "professionals/models.py"
Cohesion: 0.15
Nodes (13): ProfessionalAdmin, register, SpecialtyAdmin, Meta, ProfessionalStatus, Specialty, Meta, ProfessionalSerializer (+5 more)

### Community 39 - "medical_records/views.py"
Cohesion: 0.13
Nodes (13): MedicalRecordAuditEvent, CanAccessMedicalRecords, BasePermission, medical_record_audit_visible_to_user(), medical_record_clinic_ids_for_user(), medical_records_visible_to_user(), QuerySet, MedicalRecordAuditEventSerializer (+5 more)

### Community 40 - "DataSubjectRequestSerializer"
Cohesion: 0.13
Nodes (9): CanManagePrivacyRequests, BasePermission, data_subject_requests_visible_to_user(), privacy_clinic_ids_for_user(), QuerySet, DataSubjectRequestSerializer, Meta, DataSubjectRequestViewSet (+1 more)

### Community 41 - "has_explicit_platform_role"
Cohesion: 0.17
Nodes (10): has_explicit_platform_role(), Return whether the application role identifies a platform account., appointment_clinic_ids_for_user(), CanManageClinicProfessionals, BasePermission, QuerySet, telehealth_events_visible_to_user(), telehealth_sessions_visible_to_user() (+2 more)

### Community 42 - "django_urls"
Cohesion: 0.14
Nodes (21): AuditEvent, Meta, make_user(), django_db, test_clinic_admin_lists_only_own_audit_events(), test_platform_operator_cannot_list_clinical_audit_events(), test_platform_operator_cannot_retrieve_clinical_audit_event(), test_platform_operator_cannot_write_clinical_audit_events() (+13 more)

### Community 43 - "medical_records/models.py"
Cohesion: 0.21
Nodes (7): MedicalRecordEntryStatus, MedicalRecordEntryVersion, Meta, MedicalRecordEntrySerializer, MedicalRecordEntryVersionSerializer, Meta, atomic

### Community 44 - "LoginPage"
Cohesion: 0.23
Nodes (11): AuthMode, LoginPage(), extractMfaSetupValue(), handlePasswordResetConfirm(), handlePasswordResetRequest(), handleSubmit(), confirmPasswordReset(), getCurrentUser() (+3 more)

### Community 45 - "ClinicStaffFormPage.tsx"
Cohesion: 0.22
Nodes (9): ClinicStaffFormPage(), handleSubmit(), ClinicStaffFormPageProps, roleOptions, createClinicStaff(), getClinicStaff(), updateClinicStaff(), ClinicStaffRole (+1 more)

### Community 46 - "psychological_assessments/models.py"
Cohesion: 0.16
Nodes (11): AssessmentDocumentType, AssessmentPlan, AssessmentSessionModality, AssessmentSessionStatus, AssessmentStatus, AssessmentTimelineEventType, AssessmentType, calculate_age_in_months() (+3 more)

### Community 47 - "Plataforma PSI Design Brief"
Cohesion: 0.09
Nodes (21): Acessibilidade, Agenda, Critérios De Aprovação, Dashboard, Direção Visual Preferida, Documentos E Consentimentos, Entregáveis Esperados Do Designer, Estrutura De Navegação (+13 more)

### Community 48 - "Professional"
Cohesion: 0.45
Nodes (11): Professional, make_user(), django_db, test_clinic_admin_can_create_professional_for_own_clinic(), test_clinic_admin_cannot_create_professional_for_other_clinic(), test_destroy_professional_uses_soft_delete(), test_platform_operator_cannot_list_professional_directory(), test_platform_operator_cannot_retrieve_professional_directory_entry() (+3 more)

### Community 49 - "AppointmentDetailPage.tsx"
Cohesion: 0.27
Nodes (10): PageProps, AppointmentDetailPage(), handleCancel(), AppointmentDetailPageProps, formatCurrency(), formatDate(), modalityLabel(), statusLabel() (+2 more)

### Community 50 - "telehealth/views.py"
Cohesion: 0.07
Nodes (17): IsPlatformOperator, BasePermission, PlatformClinicViewSet, action, GenericViewSet, CanManageConsents, BasePermission, ConsentRecordSerializer (+9 more)

### Community 51 - "User"
Cohesion: 0.17
Nodes (5): AbstractUser, Backward-compatible name for the explicit platform role., User, PlatformClinicAdminProvisionSerializer, ClinicAdminUserSerializer

### Community 52 - "audit/views.py"
Cohesion: 0.22
Nodes (8): CanViewClinicalAudit, BasePermission, audit_events_visible_to_user(), QuerySet, AuditEventSerializer, Meta, AuditEventViewSet, ReadOnlyModelViewSet

### Community 53 - "clinics_visible_to_user"
Cohesion: 0.13
Nodes (13): AppointmentSerializer, Meta, ScheduleBlockSerializer, clinics_visible_to_user(), QuerySet, patients_visible_to_user(), QuerySet, DataSubjectRequestType (+5 more)

### Community 54 - "PatientDetailPage.tsx"
Cohesion: 0.26
Nodes (10): PageProps, calculateAge(), formatDate(), PatientDetailPage(), handleDeletePatient(), PatientDetailPageProps, patientStatus(), sexLabel() (+2 more)

### Community 55 - "psychological_assessments/admin.py"
Cohesion: 0.39
Nodes (8): AssessmentAdmin, AssessmentDocumentAdmin, AssessmentInstrumentAdmin, AssessmentPlanAdmin, AssessmentResultAdmin, AssessmentSessionAdmin, InstrumentApplicationAdmin, register

### Community 56 - "AssessmentResult"
Cohesion: 0.11
Nodes (7): AssessmentCodeCounter, AssessmentDocument, AssessmentResult, AssessmentSession, generate_assessment_code(), Meta, AssessmentDocumentSerializer

### Community 57 - "TelehealthPage.tsx"
Cohesion: 0.23
Nodes (8): appointmentStatusLabels, modalityLabels, onlineModalities, TelehealthPage(), handleCreateSession(), TelehealthPageProps, createTelehealthSession(), listTelehealthSessions()

### Community 58 - "AddInstrumentModal.tsx"
Cohesion: 0.27
Nodes (8): AddInstrumentModal(), getUnavailableReason(), toggleInstrument(), AddInstrumentModalProps, calculateAgeInMonths(), categoryColor(), formatAgeRange(), normalizeMonths()

### Community 59 - "MedicalRecordsPage"
Cohesion: 0.36
Nodes (6): getMedicalRecordData(), MedicalRecordsPage(), handleVoid(), loadRecords(), listMedicalRecords(), voidMedicalRecord()

### Community 60 - "PatientCreatePage"
Cohesion: 0.29
Nodes (4): calculateAge(), PatientCreatePage(), handleSubmit(), createPatientFormData()

### Community 62 - "Deploy de Produção"
Cohesion: 0.17
Nodes (11): Arquivos de Produção, Backups, CI/CD, Configuração Inicial, Deploy de Produção, Health Check, Itens Ainda Externos, Pré-requisitos (+3 more)

### Community 63 - "Roadmap Comercial GoPsi"
Cohesion: 0.17
Nodes (11): Diferencial Principal, Fluxos Que Precisam Parecer Completos, MVP Comercial, Pacote 1, Pacote 2, Pacote 3, Pacotes De Evolução, Posicionamento (+3 more)

### Community 64 - "TestModuleError"
Cohesion: 0.32
Nodes (7): Exception, Raised when scoring cannot be completed., Base exception for instrument module errors., Raised when raw input cannot be validated., TestModuleError, TestScoringError, TestValidationError

### Community 65 - "TelehealthRoomPage"
Cohesion: 0.43
Nodes (5): TelehealthRoomPage(), handleWaitingRoom(), refreshSession(), enterWaitingRoom(), getTelehealthSession()

### Community 66 - "DocumentCreatePage"
Cohesion: 0.47
Nodes (4): DocumentCreatePage(), handleSubmit(), createDocumentTemplate(), createGeneratedDocument()

### Community 67 - "telehealth/serializers.py"
Cohesion: 0.23
Nodes (7): MedicalRecordEntryType, TelehealthParticipantRole, atomic, TelehealthSessionSerializer, WaitingRoomStatusSerializer, get_video_provider(), GoogleMeetManualVideoProvider

### Community 68 - "django_contrib_auth"
Cohesion: 0.17
Nodes (7): Command, BaseCommand, Command, BaseCommand, django_contrib_auth, django_core_management_base, django_utils_crypto

### Community 69 - "vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, devCommand, framework, installCommand, outputDirectory

### Community 70 - "clinics/admin.py"
Cohesion: 0.60
Nodes (4): ClinicAdmin, ClinicMembershipAdmin, ClinicStaffAdmin, register

### Community 71 - "medical_records/admin.py"
Cohesion: 0.60
Nodes (4): MedicalRecordAuditEventAdmin, MedicalRecordEntryAdmin, MedicalRecordEntryVersionAdmin, register

### Community 72 - "layout.tsx"
Cohesion: 0.40
Nodes (3): frontend_src_app_globals, geistSans, metadata

### Community 73 - "opencode.json"
Cohesion: 0.40
Nodes (4): plugin, $schema, skills, paths

### Community 74 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 75 - "frontend/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 76 - "Product Designer"
Cohesion: 0.20
Nodes (9): Design Principles, Healthcare UX Rules, Output Style, Patient-Facing Telehealth Checklist, Product Designer, Role, SaaS Screen Checklist, Visual Direction For Plataforma PSI (+1 more)

### Community 115 - "accounts/migrations/0001_initial.py"
Cohesion: 0.24
Nodes (4): Migration, Migration, django_contrib_auth_models, django_contrib_auth_validators

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
Cohesion: 0.12
Nodes (16): Command, BaseCommand, generate_totp_secret(), _hotp(), provisioning_uri(), verify_totp(), UserMFADevice, resolve_login_username() (+8 more)

### Community 133 - "record_audit_event"
Cohesion: 0.17
Nodes (7): AuditEventAdmin, register, AdminAuditMiddleware, client_ip(), record_audit_event(), sanitize_metadata(), logging

### Community 136 - "InstrumentApplication"
Cohesion: 0.17
Nodes (15): InstrumentApplication, create_instrument_application(), update_instrument_application(), InstrumentReportPayloadService, Any, InstrumentScoringService, Any, Compatibility alias for modules ported from the Neuropsi project. (+7 more)

### Community 138 - "django_contrib"
Cohesion: 0.22
Nodes (8): CustomUserAdmin, register, UserMFADeviceAdmin, DataSubjectRequestAdmin, register, django_contrib, django_contrib_auth_admin, UserAdmin

### Community 139 - "core/views.py"
Cohesion: 0.33
Nodes (4): HealthCheckView, django_http, django_views, View

## Knowledge Gaps
- **353 isolated node(s):** `$schema`, `paths`, `plugin`, `Migration`, `Migration` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 725 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserRole` connect `UserRole` to `billing/tests.py`, `Notification`, `clinics/models.py`, `clinical_assessments_visible_to_user`, `GeneratedDocument`, `medical_records/tests.py`, `Patient`, `telehealth/tests.py`, `notifications/views.py`, `professionals_visible_to_user`, `psychological_assessments/tests.py`, `accounts/tests.py`, `consents/tests.py`, `Appointment`, `appointments_visible_to_user`, `DataSubjectRequestSerializer`, `has_explicit_platform_role`, `django_urls`, `Professional`, `telehealth/views.py`, `audit/views.py`, `clinics_visible_to_user`, `django_contrib_auth`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `Clinic` connect `UserRole` to `billing/tests.py`, `Notification`, `clinics/models.py`, `record_audit_event`, `GeneratedDocument`, `medical_records/tests.py`, `Patient`, `telehealth/tests.py`, `psychological_assessments/tests.py`, `accounts/tests.py`, `consents/tests.py`, `Appointment`, `professionals/models.py`, `medical_records/views.py`, `django_urls`, `medical_records/models.py`, `psychological_assessments/models.py`, `Professional`, `telehealth/views.py`, `clinics_visible_to_user`, `django_contrib_auth`, `clinics/admin.py`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `has_explicit_platform_role()` connect `has_explicit_platform_role` to `billing/tests.py`, `clinics/models.py`, `clinical_assessments_visible_to_user`, `UserRole`, `psychological_assessments/views.py`, `GeneratedDocument`, `medical_records/tests.py`, `AssessmentResultSerializer`, `telehealth/tests.py`, `notifications/views.py`, `professionals_visible_to_user`, `accounts/tests.py`, `consents/tests.py`, `appointments_visible_to_user`, `professionals/models.py`, `medical_records/views.py`, `DataSubjectRequestSerializer`, `medical_records/models.py`, `psychological_assessments/models.py`, `telehealth/views.py`, `audit/views.py`, `clinics_visible_to_user`, `AssessmentResult`, `AssessmentSerializer`, `telehealth/serializers.py`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 112 inferred relationships involving `UserRole` (e.g. with `Command` and `Command`) actually correct?**
  _`UserRole` has 112 INFERRED edges - model-reasoned connections that need verification._
- **Are the 86 inferred relationships involving `Clinic` (e.g. with `Command` and `test_clinic_admin_can_confirm_initial_mfa_from_login()`) actually correct?**
  _`Clinic` has 86 INFERRED edges - model-reasoned connections that need verification._
- **Are the 59 inferred relationships involving `ClinicMembership` (e.g. with `Command` and `test_clinic_admin_can_confirm_initial_mfa_from_login()`) actually correct?**
  _`ClinicMembership` has 59 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `paths`, `plugin` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._