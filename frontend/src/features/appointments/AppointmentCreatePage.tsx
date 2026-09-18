"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { createAppointment, listPatients, listProfessionals } from "@/lib/api";
import type { Patient, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type AppointmentCreatePageProps = {
  params: Promise<{ id: string }>;
};

export function AppointmentCreatePage({ params }: AppointmentCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([listPatients(id), listProfessionals(id)])
      .then(([patientData, professionalData]) => {
        setPatients(patientData);
        setProfessionals(professionalData);
      })
      .catch(() => setError("Cadastre pacientes e profissionais antes de agendar."));
  }, [id, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createAppointment({
          clinic: id,
          patient: String(formData.get("patient") ?? ""),
          professional: String(formData.get("professional") ?? ""),
          date: String(formData.get("date") ?? ""),
          start_time: String(formData.get("start_time") ?? ""),
          end_time: String(formData.get("end_time") ?? ""),
          modality: String(formData.get("modality") ?? "IN_PERSON") as
            | "IN_PERSON"
            | "ONLINE"
            | "HYBRID",
          value: String(formData.get("value") ?? "0"),
          administrative_notes: String(formData.get("administrative_notes") ?? ""),
        });
        router.replace(`/clinics/${id}/appointments`);
      } catch {
        setError("Não foi possível agendar. Verifique horários, vínculos e conflitos.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  return (
    <main className="form-page">
      <section className="form-card" aria-labelledby="appointment-form-title">
        <Link className="back-link" href={`/clinics/${id}/appointments`}>
          Voltar para agenda
        </Link>
        <p className="eyebrow">Agenda clínica</p>
        <h1 id="appointment-form-title">Agendar consulta</h1>
        <p className="muted">O backend valida tenant e conflito de horário.</p>

        {error ? <div className="alert" id="appointment-form-error" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "appointment-form-error" : undefined}>
          <fieldset className="form-section">
            <legend className="eyebrow">Vínculos</legend>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="patient">Paciente</label>
              <select id="patient" name="patient" required defaultValue="">
                <option value="">Selecione</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="professional">Profissional</label>
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
            <legend className="eyebrow">Data e horário</legend>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="date">Data</label>
              <input id="date" name="date" type="date" required />
            </div>
            <div className="field-group">
              <label htmlFor="modality">Modalidade</label>
              <select id="modality" name="modality" defaultValue="IN_PERSON">
                <option value="IN_PERSON">Presencial</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Híbrido</option>
              </select>
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="start_time">Hora inicial</label>
              <input id="start_time" name="start_time" type="time" required />
            </div>
            <div className="field-group">
              <label htmlFor="end_time">Hora final</label>
              <input id="end_time" name="end_time" type="time" required />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="value">Valor</label>
            <input id="value" name="value" type="number" min="0" step="0.01" defaultValue="0" />
          </div>
          </fieldset>
          <fieldset className="form-section">
            <legend className="eyebrow">Informações administrativas</legend>
          <div className="field-group">
            <label htmlFor="administrative_notes">Observações administrativas</label>
            <textarea id="administrative_notes" name="administrative_notes" rows={4} />
          </div>
          </fieldset>
          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Agendando..." : "Agendar consulta"}
          </button>
        </form>
      </section>
    </main>
  );
}
