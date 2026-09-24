"use client";

import Link from "next/link";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import {
  cancelTelehealthSession,
  enterWaitingRoom,
  finishTelehealthSession,
  getClinic,
  getTelehealthSession,
  startTelehealthSession,
} from "@/lib/api";
import type {
  Clinic,
  TelehealthParticipantRole,
  TelehealthSession,
  WaitingRoomResponse,
} from "@/lib/types";

type TelehealthRoomPageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

const statusLabels: Record<string, string> = {
  WAITING_ROOM: "Sala de espera",
  IN_PROGRESS: "Em atendimento",
  FINISHED: "Finalizada",
  CANCELLED: "Cancelada",
};

export function TelehealthRoomPage({ params }: TelehealthRoomPageProps) {
  const { id, sessionId } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [session, setSession] = useState<TelehealthSession | null>(null);
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoomResponse | null>(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), getTelehealthSession(sessionId)])
      .then(([clinicData, sessionData]) => {
        setClinic(clinicData);
        setSession(sessionData);
      })
      .catch(() => setError("Não foi possível carregar a sala online."));
  }, [id, sessionId, user]);

  function refreshSession() {
    return getTelehealthSession(sessionId).then(setSession);
  }

  function handleWaitingRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const response = await enterWaitingRoom(sessionId, {
          role: String(formData.get("role") ?? "PATIENT") as TelehealthParticipantRole,
          display_name: String(formData.get("display_name") ?? ""),
        });
        setWaitingRoom(response);
        await refreshSession();
      } catch {
        setError("Não foi possível entrar na sala de espera.");
      }
    });
  }

  function handleAction(action: "start" | "finish" | "cancel") {
    if (
      (action === "cancel" && !window.confirm("Cancelar esta sala de teleatendimento?")) ||
      (action === "finish" && !window.confirm("Finalizar esta sessão de teleatendimento?"))
    ) {
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const updatedSession = await {
          start: startTelehealthSession,
          finish: finishTelehealthSession,
          cancel: cancelTelehealthSession,
        }[action](sessionId);
        setSession(updatedSession);
        setWaitingRoom(null);
      } catch {
        setError("Não foi possível atualizar a sessão online.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (!clinic || !session) {
    return (
      <main className="loading-page">
        {error || "Carregando sala de teleatendimento..."}
      </main>
    );
  }

  const canStart = session.status === "WAITING_ROOM";
  const canFinish = session.status === "IN_PROGRESS";
  const canCancel = session.status === "WAITING_ROOM" || session.status === "IN_PROGRESS";
  const patientAccessToken = session.access_tokens.find(
    (accessToken) => accessToken.role === "PATIENT" && !accessToken.revoked_at,
  );
  const patientAccessUrl = patientAccessToken
    ? `${window.location.origin}${patientAccessToken.access_url}`
    : "";
  const whatsappMessage = patientAccessUrl
    ? encodeURIComponent(
        `Olá, ${session.patient_name}. Acesse sua consulta online pela Plataforma GoPsi: ${patientAccessUrl}`,
      )
    : "";

  return (
    <AppShell
      activeNav="telehealth"
      currentClinic={clinic}
      eyebrow="Sala online"
      title={session.patient_name || "Teleatendimento"}
      user={user}
      actions={
        <Link className="button-secondary button-compact" href={`/clinics/${id}/telehealth`}>
          Voltar
        </Link>
      }
    >
      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

      <section className="panel-card telehealth-room">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Controle da consulta</p>
            <h2>{statusLabels[session.status]}</h2>
            <p className="muted">
              Profissional: {session.professional_name} · Expira em {new Date(session.expires_at).toLocaleString("pt-BR")}
            </p>
          </div>
          <span className="status-badge">{session.provider}</span>
        </div>

        <div className="telehealth-actions">
          <button
            className="button-primary button-compact"
            disabled={!canStart || isPending}
            type="button"
            onClick={() => handleAction("start")}
          >
            Liberar consulta
          </button>
          <button
            className="button-secondary button-compact"
            disabled={!canFinish || isPending}
            type="button"
            onClick={() => handleAction("finish")}
          >
            Finalizar
          </button>
          <button
            className="button-secondary button-compact"
            disabled={!canCancel || isPending}
            type="button"
            onClick={() => handleAction("cancel")}
          >
            Cancelar sala
          </button>
        </div>

        {session.status === "IN_PROGRESS" ? (
          <a className="video-link" href={session.join_url} rel="noreferrer" target="_blank">
            Entrar na videoconsulta
          </a>
        ) : null}
      </section>

      <section className="panel-card section-gap">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Minha consulta</p>
            <h2>Link do paciente</h2>
            <p className="muted">
              Envie este endereço para o paciente acessar a sala de espera sem entrar no painel.
            </p>
          </div>
        </div>
        {patientAccessUrl ? (
          <div className="copy-box">
            <code>{patientAccessUrl}</code>
            <div className="copy-box-actions">
              <a
                className="button-primary button-compact"
                href={`https://wa.me/?text=${whatsappMessage}`}
                rel="noreferrer"
                target="_blank"
              >
                Enviar WhatsApp
              </a>
              <button
                className="button-secondary button-compact"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(patientAccessUrl);
                    setCopyStatus("Link copiado para a área de transferência.");
                  } catch {
                    setCopyStatus("Não foi possível copiar o link. Selecione e copie o endereço manualmente.");
                  }
                }}
              >
                Copiar link
              </button>
            </div>
          </div>
        ) : (
          <div className="alert" role="alert">Link público do paciente não encontrado.</div>
        )}
        {copyStatus ? <p className="success-alert" role="status" aria-live="polite">{copyStatus}</p> : null}
      </section>

      <section className="panel-card section-gap">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Sala de espera</p>
            <h2>Entrada de participante</h2>
            <p className="muted">
              Use o link do paciente acima para testar a entrada real da sala de espera.
            </p>
          </div>
          <span className="panel-pill">
            {session.participant_events.length} registro(s)
          </span>
        </div>

        <form className="form-stack waiting-form" onSubmit={handleWaitingRoom}>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="display_name">Nome exibido</label>
              <input
                id="display_name"
                name="display_name"
                required
                defaultValue={session.patient_name}
              />
            </div>
            <div className="field-group">
              <label htmlFor="role">Perfil</label>
              <select id="role" name="role" defaultValue="PATIENT">
                <option value="PATIENT">Paciente</option>
                <option value="GUARDIAN">Responsável</option>
                <option value="PROFESSIONAL">Profissional</option>
                <option value="STAFF">Equipe</option>
              </select>
            </div>
          </div>
          <button className="button-primary button-compact" disabled={isPending} type="submit">
            Entrar na sala de espera
          </button>
        </form>

        {waitingRoom ? (
          <div className="waiting-result" role="status" aria-live="polite">
            <strong>{waitingRoom.message}</strong>
            {waitingRoom.can_join_video ? (
              <a href={waitingRoom.join_url} rel="noreferrer" target="_blank">
                Abrir videoconsulta
              </a>
            ) : null}
          </div>
        ) : null}

        {session.participant_events.length ? (
          <div className="clinic-list">
            {session.participant_events.map((event) => (
              <article className="clinic-row" key={event.id}>
                <div>
                  <strong>{event.display_name}</strong>
                  <p>
                    {event.role} · entrou em {new Date(event.joined_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Ninguém entrou ainda</h3>
            <p>Quando o paciente acessar a espera, o registro aparece aqui.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
