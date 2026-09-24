"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import {
  createMedicalRecord,
  listAppointments,
  listPatients,
  listProfessionals,
} from "@/lib/api";
import type { Appointment, MedicalRecordEntryType, MedicalRecordEntryStatus, Patient, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type MedicalRecordCreatePageProps = {
  params: Promise<{ id: string }>;
};

export function MedicalRecordCreatePage({ params }: MedicalRecordCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, user } = useAuthenticatedData();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const defaultPatient = searchParams.get("patient") ?? "";

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([listPatients(id), listProfessionals(id), listAppointments(id)])
      .then(([patientData, professionalData, appointmentData]) => {
        setPatients(patientData);
        setProfessionals(professionalData);
        setAppointments(appointmentData);
      })
      .catch(() => setError("Não foi possível carregar dados clínicos."));
  }, [id, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const appointment = String(formData.get("appointment") ?? "");

    startTransition(async () => {
      try {
        await createMedicalRecord({
          clinic: id,
          patient: String(formData.get("patient") ?? ""),
          professional: String(formData.get("professional") ?? ""),
          appointment: appointment || null,
          entry_type: String(formData.get("entry_type") ?? "EVOLUTION") as MedicalRecordEntryType,
          status: String(formData.get("status") ?? "DRAFT") as MedicalRecordEntryStatus,
          content: String(formData.get("content") ?? ""),
        });
        router.replace(`/clinics/${id}/medical-records`);
      } catch {
        setError("Não foi possível salvar. Verifique se o profissional está autorizado e se os vínculos pertencem à clínica.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  return (
    <main className="form-page">
      <section className="form-card clinical-form-card" aria-labelledby="medical-record-form-title">
        <Link className="back-link" href={`/clinics/${id}/medical-records`}>
          Voltar para prontuário
        </Link>
        <p className="eyebrow">Prontuário protegido</p>
        <h1 id="medical-record-form-title">Novo registro clínico</h1>
        <p className="muted">Use linguagem objetiva. O sistema cria versão e trilha de auditoria ao salvar.</p>

        {error ? <div className="alert" id="medical-record-form-error" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "medical-record-form-error" : undefined}>
          <fieldset className="form-section">
            <legend className="eyebrow">Vínculos clínicos</legend>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="patient">Paciente</label>
              <select id="patient" name="patient" required defaultValue={defaultPatient}>
                <option value="">Selecione</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="professional">Profissional responsável</label>
              <select id="professional" name="professional" required defaultValue="">
                <option value="">Selecione</option>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>{professional.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          </fieldset>
          <fieldset className="form-section">
            <legend className="eyebrow">Classificação e status</legend>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="entry_type">Tipo de registro</label>
              <select id="entry_type" name="entry_type" defaultValue="EVOLUTION">
                <option value="EVOLUTION">Evolução</option>
                <option value="INITIAL_ASSESSMENT">Avaliação inicial</option>
                <option value="SESSION_NOTE">Nota de sessão</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue="DRAFT">
                <option value="DRAFT">Rascunho</option>
                <option value="FINAL">Finalizado</option>
              </select>
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="appointment">Consulta vinculada</label>
            <select id="appointment" name="appointment" defaultValue="">
              <option value="">Sem consulta vinculada</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.date} · {appointment.start_time.slice(0, 5)} · {appointment.patient_name} · {appointment.professional_name}
                </option>
              ))}
            </select>
          </div>
          </fieldset>
          <fieldset className="form-section">
            <legend className="eyebrow">Conteúdo clínico protegido</legend>
          <div className="field-group">
            <label htmlFor="content">Conteúdo clínico</label>
            <textarea id="content" name="content" rows={10} required placeholder="Registre evolução, avaliação ou nota de sessão." />
          </div>
          </fieldset>
          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Salvando..." : "Salvar registro"}
          </button>
        </form>
      </section>
    </main>
  );
}
