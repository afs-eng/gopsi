import { clearToken, getToken } from "@/lib/auth";
import type {
  Appointment,
  AppointmentPayload,
  Clinic,
  ClinicPayload,
  DocumentTemplate,
  DocumentTemplatePayload,
  GeneratedDocument,
  GeneratedDocumentPayload,
  Invoice,
  InvoicePayload,
  MedicalRecordEntry,
  MedicalRecordPayload,
  Patient,
  PatientPayload,
  Payment,
  PaymentPayload,
  PlatformClinic,
  PlatformClinicPayload,
  Professional,
  ProfessionalPayload,
  PsychologicalAssessment,
  PsychologicalAssessmentPayload,
  PublicTelehealthAccess,
  ScheduleBlock,
  ScheduleBlockPayload,
  TelehealthSession,
  TelehealthSessionPayload,
  Transaction,
  User,
  WaitingRoomPayload,
  WaitingRoomResponse,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type RequestOptions = RequestInit & { authenticated?: boolean };

async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.authenticated !== false) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Token ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erro ao comunicar com a API.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function login(username: string, password: string, otp?: string) {
  return apiFetch<{ token: string }>("/api/v1/auth/login/", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ username, password, otp }),
  });
}

export async function requestPasswordReset(email: string) {
  return apiFetch<{ detail: string }>("/api/v1/auth/password-reset/request/", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword: string,
) {
  return apiFetch<{ detail: string }>("/api/v1/auth/password-reset/confirm/", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ uid, token, new_password: newPassword }),
  });
}

export async function getCurrentUser() {
  return apiFetch<User>("/api/v1/auth/me/");
}

export async function listClinics() {
  return apiFetch<Clinic[]>("/api/v1/clinics/");
}

export async function getClinic(id: string) {
  return apiFetch<Clinic>(`/api/v1/clinics/${id}/`);
}

export async function createClinic(payload: ClinicPayload) {
  return apiFetch<Clinic>("/api/v1/clinics/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Platform-only tenant lifecycle clients. Never use these for clinical data. */
export async function listPlatformClinics() {
  return apiFetch<PlatformClinic[]>("/api/v1/platform/clinics/");
}

export async function getPlatformClinic(id: string) {
  return apiFetch<PlatformClinic>(`/api/v1/platform/clinics/${id}/`);
}

export async function createPlatformClinic(payload: PlatformClinicPayload) {
  return apiFetch<PlatformClinic>("/api/v1/platform/clinics/", { method: "POST", body: JSON.stringify(payload) });
}

export async function updatePlatformClinic(id: string, payload: Partial<Omit<PlatformClinicPayload, "admin_user">>) {
  return apiFetch<PlatformClinic>(`/api/v1/platform/clinics/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deactivatePlatformClinic(id: string) {
  return apiFetch<PlatformClinic>(`/api/v1/platform/clinics/${id}/deactivate/`, { method: "POST" });
}

export async function listProfessionals(clinicId: string) {
  return apiFetch<Professional[]>(`/api/v1/professionals/?clinic=${clinicId}`);
}

export async function createProfessional(payload: ProfessionalPayload) {
  return apiFetch<Professional>("/api/v1/professionals/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listPatients(clinicId: string) {
  return apiFetch<Patient[]>(`/api/v1/patients/?clinic=${clinicId}`);
}

export async function getPatient(id: string) {
  return apiFetch<Patient>(`/api/v1/patients/${id}/`);
}

export async function createPatient(payload: PatientPayload) {
  return apiFetch<Patient>("/api/v1/patients/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createPatientFormData(payload: FormData) {
  return apiFetch<Patient>("/api/v1/patients/", {
    method: "POST",
    body: payload,
  });
}

export async function deletePatient(id: string) {
  return apiFetch<void>(`/api/v1/patients/${id}/`, {
    method: "DELETE",
  });
}

export async function updatePatient(id: string, payload: Partial<PatientPayload>) {
  return apiFetch<Patient>(`/api/v1/patients/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function listAppointments(clinicId: string) {
  return apiFetch<Appointment[]>(`/api/v1/appointments/?clinic=${clinicId}`);
}

export async function getAppointment(id: string) {
  return apiFetch<Appointment>(`/api/v1/appointments/${id}/`);
}

export async function createAppointment(payload: AppointmentPayload) {
  return apiFetch<Appointment>("/api/v1/appointments/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelAppointment(id: string) {
  return apiFetch<void>(`/api/v1/appointments/${id}/`, {
    method: "DELETE",
  });
}

export async function listPsychologicalAssessments(clinicId: string) {
  return apiFetch<PsychologicalAssessment[]>(
    `/api/v1/psychological-assessments/?clinic=${clinicId}`,
  );
}

export async function createPsychologicalAssessment(
  payload: PsychologicalAssessmentPayload,
) {
  return apiFetch<PsychologicalAssessment>("/api/v1/psychological-assessments/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listScheduleBlocks(clinicId: string) {
  return apiFetch<ScheduleBlock[]>(`/api/v1/appointments/blocks/?clinic=${clinicId}`);
}

export async function createScheduleBlock(payload: ScheduleBlockPayload) {
  return apiFetch<ScheduleBlock>("/api/v1/appointments/blocks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listDocumentTemplates(clinicId: string) {
  return apiFetch<DocumentTemplate[]>(`/api/v1/documents/templates/?clinic=${clinicId}`);
}

export async function createDocumentTemplate(payload: DocumentTemplatePayload) {
  return apiFetch<DocumentTemplate>("/api/v1/documents/templates/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listGeneratedDocuments(clinicId: string) {
  return apiFetch<GeneratedDocument[]>(`/api/v1/documents/?clinic=${clinicId}`);
}

export async function createGeneratedDocument(payload: GeneratedDocumentPayload) {
  return apiFetch<GeneratedDocument>("/api/v1/documents/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getGeneratedDocumentPdfUrl(id: string) {
  return `${API_BASE_URL}/api/v1/documents/${id}/pdf/`;
}

export async function listTelehealthSessions(clinicId: string) {
  return apiFetch<TelehealthSession[]>(`/api/v1/telehealth/?clinic=${clinicId}`);
}

export async function getTelehealthSession(id: string) {
  return apiFetch<TelehealthSession>(`/api/v1/telehealth/${id}/`);
}

export async function createTelehealthSession(payload: TelehealthSessionPayload) {
  return apiFetch<TelehealthSession>("/api/v1/telehealth/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function enterWaitingRoom(
  sessionId: string,
  payload: WaitingRoomPayload,
) {
  return apiFetch<WaitingRoomResponse>(
    `/api/v1/telehealth/${sessionId}/waiting-room/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function startTelehealthSession(id: string) {
  return apiFetch<TelehealthSession>(`/api/v1/telehealth/${id}/start/`, {
    method: "POST",
  });
}

export async function finishTelehealthSession(id: string) {
  return apiFetch<TelehealthSession>(`/api/v1/telehealth/${id}/finish/`, {
    method: "POST",
  });
}

export async function cancelTelehealthSession(id: string) {
  return apiFetch<TelehealthSession>(`/api/v1/telehealth/${id}/cancel/`, {
    method: "POST",
  });
}

export async function getPublicTelehealthAccess(token: string) {
  return apiFetch<PublicTelehealthAccess>(`/api/v1/telehealth/join/${token}/`, {
    authenticated: false,
  });
}

export async function enterPublicWaitingRoom(
  token: string,
  payload: WaitingRoomPayload,
) {
  return apiFetch<WaitingRoomResponse>(`/api/v1/telehealth/join/${token}/`, {
    authenticated: false,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listInvoices(clinicId: string) {
  return apiFetch<Invoice[]>(`/api/v1/billing/invoices/?clinic=${clinicId}`);
}

export async function createInvoice(payload: InvoicePayload) {
  return apiFetch<Invoice>("/api/v1/billing/invoices/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelInvoice(id: string) {
  return apiFetch<void>(`/api/v1/billing/invoices/${id}/`, {
    method: "DELETE",
  });
}

export async function listPayments(clinicId: string) {
  return apiFetch<Payment[]>(`/api/v1/billing/payments/?clinic=${clinicId}`);
}

export async function createPayment(payload: PaymentPayload) {
  return apiFetch<Payment>("/api/v1/billing/payments/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listTransactions(clinicId: string) {
  return apiFetch<Transaction[]>(`/api/v1/billing/transactions/?clinic=${clinicId}`);
}

export async function listMedicalRecords(clinicId: string) {
  return apiFetch<MedicalRecordEntry[]>(`/api/v1/medical-records/?clinic=${clinicId}`);
}

export async function createMedicalRecord(payload: MedicalRecordPayload) {
  return apiFetch<MedicalRecordEntry>("/api/v1/medical-records/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function voidMedicalRecord(id: string) {
  return apiFetch<MedicalRecordEntry>(`/api/v1/medical-records/${id}/void/`, {
    method: "POST",
  });
}
