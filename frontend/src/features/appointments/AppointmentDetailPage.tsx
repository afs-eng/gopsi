"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { cancelAppointment, getAppointment, getClinic } from "@/lib/api";
import type { Appointment, Clinic } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type AppointmentDetailPageProps = {
  params: Promise<{ id: string; appointmentId: string }>;
};

function statusLabel(status: Appointment["status"]) {
  return {
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
    CONFIRMED: "Confirmada",
    IN_PROGRESS: "Em atendimento",
    NO_SHOW: "Faltou",
    SCHEDULED: "Agendada",
  }[status];
}

function modalityLabel(modality: Appointment["modality"]) {
  return {
    HYBRID: "Híbrida",
    IN_PERSON: "Presencial",
    ONLINE: "Online",
  }[modality];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(Number(value || 0));
}

export function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const { id, appointmentId } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;

    Promise.all([getClinic(id), getAppointment(appointmentId)])
      .then(([clinicData, appointmentData]) => {
        setClinic(clinicData);
        setAppointment(appointmentData);
      })
      .catch(() => setError("Não foi possível carregar a consulta."));
  }, [appointmentId, id, user]);

  function handleCancel() {
    if (!appointment) return;
    const confirmed = window.confirm(
      `Cancelar a consulta de ${appointment.patient_name} em ${formatDate(appointment.date)}, das ${appointment.start_time.slice(0, 5)} às ${appointment.end_time.slice(0, 5)}?`,
    );
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      try {
        await cancelAppointment(appointment.id);
        router.replace(`/clinics/${id}/appointments`);
      } catch {
        setError("Não foi possível cancelar a consulta.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (!clinic || !appointment) {
    return (
      <AppShell activeNav="appointments" eyebrow="Agenda" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Consulta não encontrada."}</div>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/appointments`}>
            Voltar para agenda
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      activeNav="appointments"
      currentClinic={clinic}
      eyebrow="Detalhe da agenda"
      title={appointment.patient_name}
      user={user}
      actions={
        <Link className="button-secondary button-compact" href={`/clinics/${id}/appointments`}>
          Voltar para agenda
        </Link>
      }
    >
      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

      <section className="appointment-detail-hero panel-card" aria-labelledby="appointment-detail-title">
        <div>
          <p className="eyebrow">Consulta</p>
          <h2 id="appointment-detail-title">{formatDate(appointment.date)}</h2>
          <p className="muted">
            {appointment.start_time.slice(0, 5)} às {appointment.end_time.slice(0, 5)} · {modalityLabel(appointment.modality)}
          </p>
          <div className="patient-detail-badges">
            <span className="status-badge">{statusLabel(appointment.status)}</span>
            <span>{appointment.patient_name}</span>
            <span>{appointment.professional_name}</span>
          </div>
        </div>
        <button
          className="button-secondary button-compact"
          disabled={isPending || appointment.status === "CANCELLED"}
          type="button"
          onClick={handleCancel}
        >
          {isPending ? "Cancelando..." : "Cancelar consulta"}
        </button>
      </section>

      <section className="metrics-grid" aria-label="Resumo da consulta">
        <MetricCard label="Paciente" value={appointment.patient_name} description="Cadastro vinculado à agenda." />
        <MetricCard label="Profissional" value={appointment.professional_name} description="Responsável pelo atendimento." />
        <MetricCard label="Valor" value={formatCurrency(appointment.value)} description="Valor administrativo da sessão." />
      </section>

      <section className="appointment-detail-grid">
        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Fluxo do atendimento</p>
              <h2>Próximas ações</h2>
              <p className="muted">Acesse rapidamente os registros e documentos relacionados a esta consulta.</p>
            </div>
          </div>
          <div className="patient-journey-actions">
            <Link href={`/clinics/${id}/patients/${appointment.patient}`}>
              <strong>Resumo do paciente</strong>
              <span>Dados administrativos, vínculos e rede de cuidado.</span>
            </Link>
            <Link href={`/clinics/${id}/medical-records/new`}>
              <strong>Registrar evolução</strong>
              <span>Criar registro clínico protegido após a sessão.</span>
            </Link>
            <Link href={`/clinics/${id}/documents/new`}>
              <strong>Gerar documento</strong>
              <span>Declaração, relatório, parecer ou recibo.</span>
            </Link>
            <Link href={`/clinics/${id}/billing/new`}>
              <strong>Lançar cobrança</strong>
              <span>Registrar pendência, pagamento ou recibo.</span>
            </Link>
          </div>
        </article>

        <aside className="panel-card appointment-detail-notes">
          <p className="eyebrow">Observações administrativas</p>
          <h2>Notas da agenda</h2>
          <p className="muted">
            {appointment.administrative_notes || "Nenhuma observação administrativa registrada para esta consulta."}
          </p>
        </aside>
      </section>
    </AppShell>
  );
}
