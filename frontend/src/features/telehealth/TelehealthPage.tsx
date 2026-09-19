"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import {
  createTelehealthSession,
  getClinic,
  listAppointments,
  listTelehealthSessions,
} from "@/lib/api";
import type { Appointment, Clinic, TelehealthSession } from "@/lib/types";

type TelehealthPageProps = {
  params: Promise<{ id: string }>;
};

const onlineModalities = new Set(["ONLINE", "HYBRID"]);

const modalityLabels: Record<string, string> = {
  ONLINE: "Online",
  HYBRID: "Híbrido",
};

const appointmentStatusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

export function TelehealthPage({ params }: TelehealthPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);
  const [error, setError] = useState("");
  const [roomFormAppointmentId, setRoomFormAppointmentId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), listAppointments(id), listTelehealthSessions(id)])
      .then(([clinicData, appointmentData, sessionData]) => {
        setClinic(clinicData);
        setAppointments(
          appointmentData.filter((appointment) =>
            onlineModalities.has(appointment.modality),
          ),
        );
        setSessions(sessionData);
      })
      .catch(() => setError("Não foi possível carregar os teleatendimentos."));
  }, [id, user]);

  function sessionForAppointment(appointmentId: string) {
    return sessions.find((session) => session.appointment === appointmentId);
  }

  function handleCreateSession(appointmentId: string, manualJoinUrl: string) {
    setError("");
    startTransition(async () => {
      try {
        const session = await createTelehealthSession({
          appointment: appointmentId,
          manual_join_url: manualJoinUrl,
        });
        router.push(`/clinics/${id}/telehealth/${session.id}`);
      } catch {
        setError(
          "Não foi possível criar a sala. Verifique se o link do Google Meet é válido.",
        );
      } finally {
        setRoomFormAppointmentId("");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error && !clinic) {
    return (
      <AppShell activeNav="telehealth" eyebrow="Teleatendimento" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  if (!clinic) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando clínica...</main>;
  }

  const activeSessions = sessions.filter((session) => session.is_active);
  const waitingPatients = sessions.reduce(
    (count, session) => count + session.participant_events.length,
    0,
  );
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(`${date}T12:00:00`));

  return (
    <AppShell
      activeNav="telehealth"
      currentClinic={clinic}
      eyebrow="Teleatendimento"
      title="Consultas online"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/appointments/new`}>
          Agendar online
        </Link>
      }
    >
      <section className="metrics-grid" aria-label="Resumo do teleatendimento">
        <MetricCard
          label="Consultas online"
          value={appointments.length}
          description="Agenda com modalidade online ou híbrida."
        />
        <MetricCard
          label="Salas ativas"
          value={activeSessions.length}
          description="Sessões ainda disponíveis para atendimento."
        />
        <MetricCard
          label="Entradas na espera"
          value={waitingPatients}
          description="Registros de participantes aguardando ou atendidos."
        />
      </section>

      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

      <section className="panel-card telehealth-sessions-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Fluxo online</p>
            <h2>Salas por consulta</h2>
            <p className="muted">
              Crie o Google Meet fora da plataforma e cole o link ao abrir a sala.
            </p>
          </div>
          <span className="panel-pill">{appointments.length} consulta(s)</span>
        </div>

        {appointments.length ? (
          <div className="telehealth-session-list">
            {appointments.map((appointment) => {
              const session = sessionForAppointment(appointment.id);
              return (
                <article className="telehealth-session-card" key={appointment.id}>
                  <div className="telehealth-session-main">
                    <span className="telehealth-session-icon" aria-hidden="true">◉</span>
                    <div>
                      <div className="telehealth-session-title-row">
                        <strong>{appointment.patient_name}</strong>
                        <span className="status-badge">{appointmentStatusLabels[appointment.status] || appointment.status}</span>
                      </div>
                      <p>
                        {formatDate(appointment.date)} · {appointment.start_time.slice(0, 5)} às {appointment.end_time.slice(0, 5)}
                      </p>
                      <p>
                        {appointment.professional_name} · {modalityLabels[appointment.modality] || appointment.modality}
                      </p>
                    </div>
                  </div>
                  {session ? (
                    <div className="telehealth-session-actions">
                      <span className="telehealth-room-status">Sala criada</span>
                      <Link
                        className="button-primary button-compact"
                        href={`/clinics/${id}/telehealth/${session.id}`}
                      >
                        Abrir sala
                      </Link>
                    </div>
                  ) : roomFormAppointmentId === appointment.id ? (
                    <form
                      className="telehealth-create-room-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        handleCreateSession(
                          appointment.id,
                          String(formData.get("manual_join_url") ?? ""),
                        );
                      }}
                    >
                      <label className="field-group telehealth-room-url-field" htmlFor={`manual-join-url-${appointment.id}`}>
                        <span>Link da sala</span>
                        <input
                          id={`manual-join-url-${appointment.id}`}
                          name="manual_join_url"
                          type="url"
                          required
                          placeholder="https://meet.google.com/..."
                          autoFocus
                        />
                      </label>
                      <div className="telehealth-session-actions">
                        <button className="button-primary button-compact" disabled={isPending} type="submit">
                          {isPending ? "Criando..." : "Abrir sala"}
                        </button>
                        <button className="button-secondary button-compact" type="button" onClick={() => setRoomFormAppointmentId("") }>
                          Fechar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="button-secondary button-compact"
                      type="button"
                      onClick={() => setRoomFormAppointmentId(appointment.id)}
                    >
                      Criar sala
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma consulta online</h3>
            <p>Agende uma consulta com modalidade online ou híbrida para criar a sala.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/appointments/new`}>
              Agendar consulta online
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
