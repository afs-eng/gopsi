"use client";

import { FormEvent, use, useEffect, useState, useTransition } from "react";

import {
  enterPublicWaitingRoom,
  getPublicTelehealthAccess,
} from "@/lib/api";
import type { PublicTelehealthAccess, WaitingRoomResponse } from "@/lib/types";

type PublicTelehealthJoinPageProps = {
  params: Promise<{ token: string }>;
};

const statusLabels: Record<string, string> = {
  WAITING_ROOM: "Sala de espera aberta",
  IN_PROGRESS: "Consulta em andamento",
  FINISHED: "Consulta finalizada",
  CANCELLED: "Consulta cancelada",
};

export function PublicTelehealthJoinPage({ params }: PublicTelehealthJoinPageProps) {
  const { token } = use(params);
  const [access, setAccess] = useState<PublicTelehealthAccess | null>(null);
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoomResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPublicTelehealthAccess(token)
      .then(setAccess)
      .catch(() => setError("Link da consulta inválido ou expirado."))
      .finally(() => setLoading(false));
  }, [token]);

  function handleEnterWaitingRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const response = await enterPublicWaitingRoom(token, {
          role: access?.role ?? "PATIENT",
          display_name: String(formData.get("display_name") ?? ""),
        });
        setWaitingRoom(response);
      } catch {
        setError("Não foi possível entrar na sala de espera.");
      }
    });
  }

  if (loading) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando sua consulta...</main>;
  }

  if (error && !access) {
    return (
      <main className="form-page">
        <section className="form-card">
          <p className="eyebrow">Minha consulta</p>
          <h1>Acesso indisponível</h1>
          <div className="alert" role="alert" aria-live="assertive">{error}</div>
        </section>
      </main>
    );
  }

  if (!access) {
    return null;
  }

  const session = access.session;
  const isTerminal = session.status === "FINISHED" || session.status === "CANCELLED";

  return (
    <main className="form-page patient-room-page">
      <section className="form-card patient-room-card">
        <p className="eyebrow">Minha consulta</p>
        <h1>Consulta online</h1>
        <p className="muted">
          {session.appointment_date} · {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
        </p>
        <p className="muted">Esta página mostra apenas os dados necessários para sua entrada segura.</p>
        <dl className="detail-list">
          <div>
            <dt>Paciente</dt>
            <dd>{session.patient_name}</dd>
          </div>
          <div>
            <dt>Profissional</dt>
            <dd>{session.professional_name}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{statusLabels[session.status] || "Status da consulta indisponível"}</dd>
          </div>
        </dl>

        {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        {isTerminal ? (
          <div className="alert" role="status" aria-live="polite">
            {session.status === "FINISHED"
              ? "Esta consulta foi finalizada e a sala de espera não está mais disponível."
              : "Esta consulta foi cancelada e a sala de espera não está mais disponível."}
          </div>
        ) : (
          <form className="form-stack" onSubmit={handleEnterWaitingRoom}>
            <div className="field-group">
              <label htmlFor="display_name">Confirme seu nome</label>
              <input
                id="display_name"
                name="display_name"
                required
                defaultValue={access.display_name}
              />
            </div>
            <button className="button-primary" disabled={isPending} type="submit">
              {isPending ? "Entrando..." : "Entrar na sala de espera"}
            </button>
          </form>
        )}

        {!isTerminal && waitingRoom ? (
          <div className="waiting-result" role="status" aria-live="polite">
            <strong>{waitingRoom.message}</strong>
            {waitingRoom.can_join_video ? (
              <a href={waitingRoom.join_url} rel="noreferrer" target="_blank">
                Entrar na consulta
              </a>
            ) : (
              <p className="muted">
                Permaneça nesta página. Quando o profissional liberar, clique novamente em entrar na sala de espera para atualizar.
              </p>
            )}
          </div>
        ) : !isTerminal ? (
          <div className="empty-state">
            <h3>Consulta agendada</h3>
            <p>Entre na sala de espera próximo ao horário combinado.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
