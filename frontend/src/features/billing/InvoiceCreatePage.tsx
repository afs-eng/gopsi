"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { createInvoice, getClinic, listAppointments, listPatients } from "@/lib/api";
import type { Appointment, Clinic, Patient } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type InvoiceCreatePageProps = {
  params: Promise<{ id: string }>;
};

export function InvoiceCreatePage({ params }: InvoiceCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), listPatients(id), listAppointments(id)])
      .then(([clinicData, patientData, appointmentData]) => {
        setClinic(clinicData);
        setPatients(patientData);
        setAppointments(appointmentData);
      })
      .catch(() => setError("Não foi possível carregar pacientes e consultas."));
  }, [id, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const patient = String(formData.get("patient") ?? "");
    const appointment = String(formData.get("appointment") ?? "");
    const dueDate = String(formData.get("due_date") ?? "");

    startTransition(async () => {
      try {
        await createInvoice({
          clinic: id,
          patient: patient || null,
          appointment: appointment || null,
          description: String(formData.get("description") ?? ""),
          amount: String(formData.get("amount") ?? "0"),
          due_date: dueDate || null,
          status: String(formData.get("status") ?? "OPEN") as "DRAFT" | "OPEN",
        });
        router.replace(`/clinics/${id}/billing`);
      } catch {
        setError("Não foi possível criar a cobrança. Verifique vínculos e valor.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (!clinic) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando financeiro...</main>;
  }

  return (
    <AppShell activeNav="billing" currentClinic={clinic} eyebrow="Financeiro" title="Nova cobrança" user={user}>
    <main className="form-page">
      <section className="form-card" aria-labelledby="invoice-form-title">
        <Link className="back-link" href={`/clinics/${id}/billing`}>
          Voltar para financeiro
        </Link>
        <p className="eyebrow">Financeiro</p>
        <h1 id="invoice-form-title">Nova cobrança</h1>
        <p className="muted">Registre uma cobrança administrativa para acompanhar recebimentos.</p>

        {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="description">Descrição</label>
            <input id="description" name="description" placeholder="Consulta, pacote ou taxa" required />
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="amount">Valor</label>
              <input id="amount" name="amount" type="number" min="0" step="0.01" required />
            </div>
            <div className="field-group">
              <label htmlFor="due_date">Vencimento</label>
              <input id="due_date" name="due_date" type="date" />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="patient">Paciente</label>
              <select id="patient" name="patient" defaultValue="">
                <option value="">Sem paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="appointment">Consulta</label>
              <select id="appointment" name="appointment" defaultValue="">
                <option value="">Sem consulta</option>
                {appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.date} · {appointment.start_time.slice(0, 5)} · {appointment.patient_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="status">Status inicial</label>
            <select id="status" name="status" defaultValue="OPEN">
              <option value="OPEN">Aberta</option>
              <option value="DRAFT">Rascunho</option>
            </select>
          </div>
          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Criando..." : "Criar cobrança"}
          </button>
        </form>
      </section>
    </main>
    </AppShell>
  );
}
