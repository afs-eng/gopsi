export type User = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  global_role: string;
  is_platform_admin: boolean;
  mfa_enabled: boolean;
};

export type UserRole = "SUPERADMIN" | "CLINIC_ADMIN" | "PSYCHOLOGIST" | "PROFESSIONAL" | "RECEPTIONIST";

export type PlatformClinic = Pick<Clinic, "id" | "name" | "legal_name" | "document" | "phone" | "email" | "is_active" | "created_at" | "updated_at">;

export type PlatformClinicPayload = Omit<PlatformClinic, "id" | "is_active" | "created_at" | "updated_at"> & {
  admin_user: { username: string; email: string; full_name: string; password: string };
};

export type Clinic = {
  id: string;
  name: string;
  legal_name: string;
  document: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClinicPayload = {
  name: string;
  legal_name: string;
  document: string;
  phone: string;
  email: string;
  admin_user?: {
    username: string;
    email: string;
    full_name: string;
    password: string;
  };
};

export type Professional = {
  id: string;
  clinic: string;
  user: string | null;
  full_name: string;
  social_name: string;
  cpf: string;
  birth_date: string | null;
  email: string;
  phone: string;
  profession: string;
  crp: string;
  crp_state: string;
  registration_number: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  biography: string;
  appointment_modalities: "IN_PERSON" | "ONLINE" | "HYBRID";
  appointment_price: string;
  default_appointment_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfessionalPayload = {
  clinic: string;
  full_name: string;
  social_name: string;
  cpf: string;
  email: string;
  phone: string;
  profession: string;
  crp: string;
  crp_state: string;
  registration_number: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  biography: string;
  appointment_modalities: "IN_PERSON" | "ONLINE" | "HYBRID";
  appointment_price: string;
  default_appointment_duration: number;
};

export type GuardianPayload = {
  full_name: string;
  relationship: string;
  cpf: string;
  phone: string;
  email: string;
  has_authorization: boolean;
};

export type Guardian = GuardianPayload & {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfessionalPatientLink = {
  id: string;
  professional: string;
  professional_name: string;
  is_primary: boolean;
  is_active: boolean;
};

export type Patient = {
  id: string;
  clinic: string;
  full_name: string;
  social_name: string;
  cpf: string;
  birth_date: string | null;
  sex: "FEMALE" | "MALE" | "OTHER" | "NOT_INFORMED";
  gender_identity: string;
  photo: string | null;
  record_number: string;
  marital_status: string;
  education: string;
  profession: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  zip_code: string;
  address_number: string;
  address_complement: string;
  district: string;
  city: string;
  state: string;
  has_health_plan: boolean;
  health_plan: string;
  health_plan_card: string;
  referral_source: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  is_active: boolean;
  guardians: Guardian[];
  professional_links: ProfessionalPatientLink[];
  created_at: string;
  updated_at: string;
};

export type PatientPayload = {
  clinic: string;
  full_name: string;
  social_name: string;
  cpf: string;
  birth_date: string | null;
  sex: "FEMALE" | "MALE" | "OTHER" | "NOT_INFORMED";
  gender_identity?: string;
  record_number?: string;
  marital_status?: string;
  education?: string;
  profession?: string;
  occupation?: string;
  phone: string;
  email: string;
  address: string;
  zip_code?: string;
  address_number?: string;
  address_complement?: string;
  district?: string;
  city?: string;
  state?: string;
  has_health_plan?: boolean;
  health_plan?: string;
  health_plan_card?: string;
  referral_source?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  guardians: GuardianPayload[];
  professional_links: Array<{ professional: string; is_primary: boolean }>;
};

export type Appointment = {
  id: string;
  clinic: string;
  patient: string;
  patient_name: string;
  professional: string;
  professional_name: string;
  date: string;
  start_time: string;
  end_time: string;
  modality: "IN_PERSON" | "ONLINE" | "HYBRID";
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  value: string;
  administrative_notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AppointmentPayload = {
  clinic: string;
  patient: string;
  professional: string;
  date: string;
  start_time: string;
  end_time: string;
  modality: "IN_PERSON" | "ONLINE" | "HYBRID";
  value: string;
  administrative_notes: string;
};

export type ScheduleBlock = {
  id: string;
  clinic: string;
  professional: string;
  professional_name: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ScheduleBlockPayload = {
  clinic: string;
  professional: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
};

export type DocumentTemplate = {
  id: string;
  clinic: string;
  name: string;
  template_type: "DECLARATION" | "CONSENT" | "REPORT" | "RECEIPT" | "OTHER";
  body: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DocumentTemplatePayload = {
  clinic: string;
  name: string;
  template_type: "DECLARATION" | "CONSENT" | "REPORT" | "RECEIPT" | "OTHER";
  body: string;
};

export type GeneratedDocument = {
  id: string;
  clinic: string;
  template: string | null;
  template_name: string;
  patient: string | null;
  patient_name: string;
  professional: string | null;
  professional_name: string;
  title: string;
  content: string;
  status: "DRAFT" | "FINAL" | "SIGNED" | "VOIDED";
  signed_at: string | null;
  created_by: string;
  updated_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GeneratedDocumentPayload = {
  clinic: string;
  template?: string | null;
  patient?: string | null;
  professional?: string | null;
  title: string;
  content: string;
  status: "DRAFT" | "FINAL" | "SIGNED";
};

export type TelehealthParticipantRole =
  | "PROFESSIONAL"
  | "PATIENT"
  | "GUARDIAN"
  | "STAFF";

export type TelehealthSessionStatus =
  | "WAITING_ROOM"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELLED";

export type TelehealthParticipantEvent = {
  id: string;
  session: string;
  role: TelehealthParticipantRole;
  display_name: string;
  user: string | null;
  user_name: string;
  joined_at: string;
  left_at: string | null;
  metadata: Record<string, unknown>;
};

export type TelehealthAccessToken = {
  id: string;
  token: string;
  role: TelehealthParticipantRole;
  display_name: string;
  expires_at: string;
  revoked_at: string | null;
  access_url: string;
  created_at: string;
};

export type TelehealthSession = {
  id: string;
  clinic: string;
  appointment: string;
  patient_name: string;
  professional_name: string;
  status: TelehealthSessionStatus;
  provider: string;
  external_room_id: string;
  join_url: string;
  expires_at: string;
  waiting_room_open: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_by: string;
  participant_events: TelehealthParticipantEvent[];
  access_tokens: TelehealthAccessToken[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TelehealthSessionPayload = {
  appointment: string;
  manual_join_url?: string;
};

export type WaitingRoomPayload = {
  role: TelehealthParticipantRole;
  display_name: string;
  metadata?: Record<string, unknown>;
};

export type WaitingRoomResponse = {
  message: string;
  can_join_video: boolean;
  join_url: string;
  event: TelehealthParticipantEvent;
};

export type PublicTelehealthSession = {
  id: string;
  patient_name: string;
  professional_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: TelehealthSessionStatus;
  expires_at: string;
};

export type PublicTelehealthAccess = {
  session: PublicTelehealthSession;
  role: TelehealthParticipantRole;
  display_name: string;
};

export type Invoice = {
  id: string;
  clinic: string;
  patient: string | null;
  patient_name: string;
  appointment: string | null;
  description: string;
  amount: string;
  due_date: string | null;
  status: "DRAFT" | "OPEN" | "PAID" | "CANCELLED" | "REFUNDED" | "OVERDUE";
  external_invoice_id: string;
  created_by: string;
  paid_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InvoicePayload = {
  clinic: string;
  patient?: string | null;
  appointment?: string | null;
  description: string;
  amount: string;
  due_date?: string | null;
  status: "DRAFT" | "OPEN";
};

export type Payment = {
  id: string;
  clinic: string;
  invoice: string;
  invoice_description: string;
  amount: string;
  method:
    | "CASH"
    | "PIX"
    | "BANK_TRANSFER"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "EXTERNAL_GATEWAY"
    | "OTHER";
  status: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  paid_at: string | null;
  gateway: string;
  external_payment_id: string;
  card_brand: string;
  card_last4: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type PaymentPayload = {
  invoice: string;
  amount: string;
  method: Payment["method"];
  status: Payment["status"];
  external_payment_id?: string;
  card_brand?: string;
  card_last4?: string;
};

export type Transaction = {
  id: string;
  clinic: string;
  payment: string | null;
  transaction_type: "CHARGE" | "REFUND" | "CANCELLATION" | "ADJUSTMENT";
  amount: string;
  external_transaction_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MedicalRecordEntryType = "EVOLUTION" | "SESSION_NOTE" | "INITIAL_ASSESSMENT";

export type MedicalRecordEntryStatus = "DRAFT" | "FINAL" | "VOIDED";

export type MedicalRecordVersion = {
  id: string;
  version: number;
  entry_type: MedicalRecordEntryType;
  status: MedicalRecordEntryStatus;
  content: string;
  changed_by: string;
  changed_by_name: string;
  created_at: string;
};

export type MedicalRecordEntry = {
  id: string;
  clinic: string;
  patient: string;
  patient_name: string;
  professional: string;
  professional_name: string;
  appointment: string | null;
  entry_type: MedicalRecordEntryType;
  status: MedicalRecordEntryStatus;
  content: string;
  versions: MedicalRecordVersion[];
  created_by: string;
  updated_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicalRecordPayload = {
  clinic: string;
  patient: string;
  professional: string;
  appointment?: string | null;
  entry_type: MedicalRecordEntryType;
  status: MedicalRecordEntryStatus;
  content: string;
};

export type PsychologicalAssessmentStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type AssessmentSession = {
  id: string;
  assessment: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  administrative_notes: string;
  created_at: string;
  updated_at: string;
};

export type InstrumentApplication = {
  id: string;
  assessment: string;
  session: string | null;
  instrument_name: string;
  application_date: string | null;
  status: "PLANNED" | "APPLIED" | "CANCELLED";
  notes: string;
  created_at: string;
  updated_at: string;
};

export type AssessmentResult = {
  id: string;
  assessment: string;
  status: "DRAFT" | "FINAL" | "VOIDED";
  summary: string;
  recommendations: string;
  finalized_at: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AssessmentDocument = {
  id: string;
  assessment: string;
  document: string;
  document_title: string;
  document_type: "REPORT" | "DECLARATION" | "FEEDBACK" | "OTHER";
  created_at: string;
};

export type PsychologicalAssessment = {
  id: string;
  clinic: string;
  patient: string;
  patient_name: string;
  professional: string;
  professional_name: string;
  title: string;
  reason: string;
  status: PsychologicalAssessmentStatus;
  started_at: string | null;
  completed_at: string | null;
  sessions: AssessmentSession[];
  instrument_applications: InstrumentApplication[];
  result: AssessmentResult | null;
  assessment_documents: AssessmentDocument[];
  created_by: string;
  updated_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PsychologicalAssessmentPayload = {
  clinic: string;
  patient: string;
  professional: string;
  title: string;
  reason: string;
  status: PsychologicalAssessmentStatus;
  started_at?: string | null;
  completed_at?: string | null;
};

export type AssessmentSessionPayload = {
  assessment: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: AssessmentSession["status"];
  administrative_notes: string;
};

export type InstrumentApplicationPayload = {
  assessment: string;
  session?: string | null;
  instrument_name: string;
  application_date?: string | null;
  status: InstrumentApplication["status"];
  notes: string;
};

export type AssessmentResultPayload = {
  assessment: string;
  status: AssessmentResult["status"];
  summary: string;
  recommendations: string;
};

export type AssessmentDocumentPayload = {
  assessment: string;
  document: string;
  document_type: AssessmentDocument["document_type"];
};
