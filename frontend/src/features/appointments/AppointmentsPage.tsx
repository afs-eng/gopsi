"use client";

import Link from "next/link";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import {
  cancelAppointment,
  getClinic,
  listAppointments,
  listScheduleBlocks,
} from "@/lib/api";
import type { Appointment, Clinic, ScheduleBlock } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type AppointmentsPageProps = {
  params: Promise<{ id: string }>;
};

export function AppointmentsPage({ params }: AppointmentsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), listAppointments(id), listScheduleBlocks(id)])
      .then(([clinicData, appointmentsData, blockData]) => {
        setClinic(clinicData);
        setAppointments(appointmentsData);
        setScheduleBlocks(blockData);
      })
      .catch(() => setError("Não foi possível carregar a agenda."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (!clinic) {
    return (
      <AppShell activeNav="appointments" eyebrow="Agenda" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(`${date}T12:00:00`));
  const statusLabel = (status: string) =>
    ({ SCHEDULED: "Agendada", CONFIRMED: "Confirmada", COMPLETED: "Concluída", CANCELED: "Cancelada" }[status] ?? status);

  function handleCancelAppointment(appointment: Appointment) {
    const confirmed = window.confirm(
      `Você está prestes a cancelar a consulta de ${appointment.patient_name}, em ${formatDate(appointment.date)}, das ${appointment.start_time.slice(0, 5)} às ${appointment.end_time.slice(0, 5)}. Deseja continuar?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setCancelingId(appointment.id);

    startTransition(async () => {
      try {
        await cancelAppointment(appointment.id);
        setAppointments((currentAppointments) =>
          currentAppointments.filter((item) => item.id !== appointment.id),
        );
      } catch {
        setError("Não foi possível cancelar a consulta.");
      } finally {
        setCancelingId("");
      }
    });
  }

  return (
    <AppShell
      activeNav="appointments"
      currentClinic={clinic}
      eyebrow="Agenda clínica"
      title="Consultas"
      user={user}
      actions={
        <>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/appointments/blocks/new`}>
            Bloquear horário
          </Link>
          <Link className="button-primary button-compact" href={`/clinics/${id}/appointments/new`}>
            Nova consulta
          </Link>
        </>
      }
    >
      <section className="metrics-grid" aria-label="Resumo da agenda">
        <MetricCard
          label="Consultas ativas"
          value={appointments.filter((appointment) => appointment.is_active).length}
          description="Cancelamentos usam soft delete lógico."
        />
        <MetricCard
          label="Hoje"
          value={appointments.filter((appointment) => appointment.date === today).length}
          description="Consultas agendadas para a data atual."
        />
        <MetricCard
          label="Bloqueios ativos"
          value={scheduleBlocks.filter((block) => block.is_active).length}
          description="Períodos indisponíveis impedem novos agendamentos."
        />
      </section>

      <section className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Calendário inicial</p>
            <h2>Consultas agendadas</h2>
          </div>
          <span className="panel-pill">{appointments.length} registro(s)</span>
        </div>

        {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        {appointments.length ? (
          <div className="clinic-list">
            {appointments.map((appointment) => (
              <article className="clinic-row" key={appointment.id}>
                <div>
                  <strong>{appointment.patient_name}</strong>
                  <p>
                    <time dateTime={`${appointment.date}T${appointment.start_time}`}>{formatDate(appointment.date)}</time>{" · "}
                    <time dateTime={`${appointment.date}T${appointment.start_time}`}>{appointment.start_time.slice(0, 5)}</time>–{appointment.end_time.slice(0, 5)} · {appointment.professional_name}
                  </p>
                </div>
                <div className="row-actions">
                  <span className="status-badge">{statusLabel(appointment.status)}</span>
                  <button
                    className="button-secondary button-compact"
                    disabled={isPending && cancelingId === appointment.id}
                    type="button"
                    onClick={() => handleCancelAppointment(appointment)}
                    aria-label={`Cancelar consulta de ${appointment.patient_name} em ${formatDate(appointment.date)}`}
                  >
                    {isPending && cancelingId === appointment.id
                      ? "Cancelando..."
                      : "Cancelar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma consulta agendada</h3>
            <p>Crie a primeira consulta vinculando paciente e profissional.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/appointments/new`}>
              Agendar consulta
            </Link>
          </div>
        )}
      </section>

      <section className="panel-card section-gap">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Disponibilidade</p>
            <h2>Bloqueios de agenda</h2>
          </div>
          <span className="panel-pill">{scheduleBlocks.length} registro(s)</span>
        </div>

        {scheduleBlocks.length ? (
          <div className="clinic-list">
            {scheduleBlocks.map((block) => (
              <article className="clinic-row" key={block.id}>
                <div>
                  <strong>{block.professional_name}</strong>
                  <p>
                    <time dateTime={`${block.date}T${block.start_time}`}>{formatDate(block.date)}</time> · {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
                  </p>
                </div>
                <span>{block.reason || "Bloqueio sem motivo informado"}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum bloqueio cadastrado</h3>
            <p>Registre indisponibilidades para evitar conflitos na agenda.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/appointments/blocks/new`}>
              Bloquear horário
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
