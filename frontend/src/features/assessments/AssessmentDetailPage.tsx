"use client";

import Link from "next/link";
import { FormEvent, use, useCallback, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import {
  createAssessmentDocument,
  createAssessmentResult,
  createAssessmentSession,
  createInstrumentApplication,
  getClinic,
  getPsychologicalAssessment,
  listAssessmentInstruments,
  listGeneratedDocuments,
} from "@/lib/api";
import type {
  AssessmentInstrument,
  Clinic,
  GeneratedDocument,
  PsychologicalAssessment,
  PsychologicalAssessmentStatus,
} from "@/lib/types";

type AssessmentDetailPageProps = {
  params: Promise<{ id: string; assessmentId: string }>;
};

function statusLabel(status: PsychologicalAssessmentStatus) {
  return {
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
    DRAFT: "Rascunho",
    IN_PROGRESS: "Em andamento",
  }[status];
}

function formatDate(date: string | null) {
  if (!date) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function parseOptionalJsonObject(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return {};
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON inválido");
  }
  return parsed as Record<string, unknown>;
}

export function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  const { id, assessmentId } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [assessment, setAssessment] = useState<PsychologicalAssessment | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [instruments, setInstruments] = useState<AssessmentInstrument[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadAssessment = useCallback(function loadAssessment() {
    return Promise.all([
      getClinic(id),
      getPsychologicalAssessment(assessmentId),
    ]).then(([clinicData, assessmentData]) => {
      setClinic(clinicData);
      setAssessment(assessmentData);
      return assessmentData;
    });
  }, [assessmentId, id]);

  useEffect(() => {
    if (!user) return;

    Promise.all([loadAssessment(), listAssessmentInstruments()])
      .then(([assessmentData, instrumentData]) => {
        setInstruments(instrumentData);
        return listGeneratedDocuments(id, assessmentData.patient);
      })
      .then(setDocuments)
      .catch(() => setError("Não foi possível carregar a avaliação."));
  }, [id, loadAssessment, user]);

  function refresh(successMessage: string) {
    return loadAssessment().then(() => {
      setMessage(successMessage);
    });
  }

  function handleSessionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment) return;
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startTransition(async () => {
      try {
        await createAssessmentSession({
          assessment: assessment.id,
          session_date: String(data.get("session_date") ?? ""),
          start_time: String(data.get("start_time") ?? ""),
          end_time: String(data.get("end_time") ?? ""),
          status: String(data.get("status") ?? "SCHEDULED") as "SCHEDULED" | "COMPLETED" | "CANCELLED",
          administrative_notes: String(data.get("administrative_notes") ?? ""),
        });
        form.reset();
        await refresh("Sessão registrada.");
      } catch {
        setError("Não foi possível registrar a sessão.");
      }
    });
  }

  function handleInstrumentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment) return;
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;
    const session = String(data.get("session") ?? "");
    const applicationDate = String(data.get("application_date") ?? "");
    const instrument = String(data.get("instrument") ?? "");
    const otherInstrumentName = String(data.get("other_instrument_name") ?? "");
    const selectedInstrument = instruments.find((item) => item.id === instrument);

    startTransition(async () => {
      try {
        await createInstrumentApplication({
          assessment: assessment.id,
          session: session || null,
          instrument: instrument || null,
          instrument_name: selectedInstrument?.name || otherInstrumentName,
          application_date: applicationDate || null,
          status: String(data.get("status") ?? "PLANNED") as "PLANNED" | "APPLIED" | "CANCELLED",
          notes: String(data.get("notes") ?? ""),
          raw_payload: parseOptionalJsonObject(String(data.get("raw_payload") ?? "")),
          reviewed_payload: parseOptionalJsonObject(String(data.get("reviewed_payload") ?? "")),
          interpretation_text: String(data.get("interpretation_text") ?? ""),
          is_validated: data.get("is_validated") === "on",
        });
        form.reset();
        await refresh("Instrumento registrado.");
      } catch {
        setError("Não foi possível registrar o instrumento. Confira o instrumento selecionado e o JSON informado.");
      }
    });
  }

  function handleResultSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment || assessment.result) return;
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createAssessmentResult({
          assessment: assessment.id,
          status: String(data.get("status") ?? "DRAFT") as "DRAFT" | "FINAL" | "VOIDED",
          summary: String(data.get("summary") ?? ""),
          recommendations: String(data.get("recommendations") ?? ""),
        });
        await refresh("Síntese registrada.");
      } catch {
        setError("Não foi possível registrar a síntese.");
      }
    });
  }

  function handleDocumentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment) return;
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startTransition(async () => {
      try {
        await createAssessmentDocument({
          assessment: assessment.id,
          document: String(data.get("document") ?? ""),
          document_type: String(data.get("document_type") ?? "REPORT") as "REPORT" | "DECLARATION" | "FEEDBACK" | "OTHER",
        });
        form.reset();
        await refresh("Documento vinculado.");
      } catch {
        setError("Não foi possível vincular o documento.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (!clinic || !assessment) {
    return (
      <AppShell activeNav="assessments" eyebrow="Avaliação" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Avaliação não encontrada."}</div>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments`}>
            Voltar para avaliações
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      activeNav="assessments"
      currentClinic={clinic}
      eyebrow="Acompanhamento da avaliação"
      title={assessment.title}
      user={user}
      actions={
        <>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments`}>
            Avaliações
          </Link>
          <Link className="button-primary button-compact" href={`/clinics/${id}/documents/new?patient=${assessment.patient}`}>
            Gerar documento
          </Link>
        </>
      }
    >
      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}
      {message ? <div className="success-banner" role="status" aria-live="polite">{message}</div> : null}

      <section className="assessment-hero panel-card" aria-labelledby="assessment-detail-title">
        <div>
          <p className="eyebrow">Processo avaliativo</p>
          <h2 id="assessment-detail-title">{assessment.title}</h2>
          <p className="muted">{assessment.reason || "Motivo não informado."}</p>
          <div className="assessment-row-meta">
            <span>{assessment.patient_name}</span>
            <span>{assessment.professional_name}</span>
            <span>Início: {formatDate(assessment.started_at)}</span>
            <span>Conclusão: {formatDate(assessment.completed_at)}</span>
          </div>
        </div>
        <span className="status-badge">{statusLabel(assessment.status)}</span>
      </section>

      <section className="metrics-grid" aria-label="Resumo da avaliação">
        <MetricCard label="Sessões" value={assessment.sessions.length} description="Encontros do processo avaliativo." />
        <MetricCard label="Instrumentos" value={assessment.instrument_applications.length} description="Aplicações registradas." />
        <MetricCard label="Documentos" value={assessment.assessment_documents.length} description="Documentos vinculados ao processo." />
      </section>

      <section className="appointment-detail-grid">
        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Sessões</p>
              <h2>Agenda avaliativa</h2>
              <p className="muted">Registre encontros usados no processo, sem misturar com o prontuário terapêutico.</p>
            </div>
          </div>
          <form className="form-stack" onSubmit={handleSessionSubmit}>
            <div className="field-grid">
              <label className="field-group" htmlFor="session_date">Data<input id="session_date" name="session_date" required type="date" /></label>
              <label className="field-group" htmlFor="session_status">Status<select id="session_status" name="status" defaultValue="SCHEDULED"><option value="SCHEDULED">Agendada</option><option value="COMPLETED">Concluída</option><option value="CANCELLED">Cancelada</option></select></label>
            </div>
            <div className="field-grid">
              <label className="field-group" htmlFor="start_time">Início<input id="start_time" name="start_time" required type="time" /></label>
              <label className="field-group" htmlFor="end_time">Fim<input id="end_time" name="end_time" required type="time" /></label>
            </div>
            <label className="field-group" htmlFor="administrative_notes">Notas administrativas<textarea id="administrative_notes" name="administrative_notes" rows={3} /></label>
            <button className="button-primary button-compact" disabled={isPending} type="submit">Registrar sessão</button>
          </form>
          <div className="assessments-list">
            {assessment.sessions.map((session) => (
              <div className="clinic-row" key={session.id}>
                <div><strong>{formatDate(session.session_date)}</strong><p>{formatTime(session.start_time)} às {formatTime(session.end_time)} · {session.administrative_notes || "Sem notas."}</p></div>
                <span className="status-badge">{session.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Instrumentos</p>
              <h2>Aplicações</h2>
              <p className="muted">Registre somente identificação, datas e observações autorizadas.</p>
            </div>
          </div>
          <form className="form-stack" onSubmit={handleInstrumentSubmit}>
            <label className="field-group" htmlFor="instrument">Instrumento<select id="instrument" name="instrument" defaultValue=""><option value="">Outro / não catalogado</option>{instruments.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.name}</option>)}</select></label>
            <label className="field-group" htmlFor="other_instrument_name">Nome livre, se não estiver no catálogo<input id="other_instrument_name" name="other_instrument_name" placeholder="Nome do instrumento aplicado" /></label>
            <div className="field-grid">
              <label className="field-group" htmlFor="instrument_session">Sessão<select id="instrument_session" name="session" defaultValue=""><option value="">Sem vínculo</option>{assessment.sessions.map((session) => <option key={session.id} value={session.id}>{formatDate(session.session_date)}</option>)}</select></label>
              <label className="field-group" htmlFor="application_date">Data<input id="application_date" name="application_date" type="date" /></label>
            </div>
            <label className="field-group" htmlFor="instrument_status">Status<select id="instrument_status" name="status" defaultValue="PLANNED"><option value="PLANNED">Planejada</option><option value="APPLIED">Aplicada</option><option value="CANCELLED">Cancelada</option></select></label>
            <label className="field-group" htmlFor="instrument_notes">Observações<textarea id="instrument_notes" name="notes" rows={3} /></label>
            <label className="field-group" htmlFor="raw_payload">Dados/escores autorizados em JSON<textarea id="raw_payload" name="raw_payload" rows={4} placeholder={'{"escore_total": 12, "classificacao": "..."}'} /></label>
            <label className="field-group" htmlFor="reviewed_payload">Dados revisados em JSON<textarea id="reviewed_payload" name="reviewed_payload" rows={3} /></label>
            <label className="field-group" htmlFor="interpretation_text">Interpretação autorizada<textarea id="interpretation_text" name="interpretation_text" rows={4} /></label>
            <label className="checkbox-card" htmlFor="is_validated"><input id="is_validated" name="is_validated" type="checkbox" /> Marcar como validado/revisado</label>
            <button className="button-primary button-compact" disabled={isPending} type="submit">Registrar instrumento</button>
          </form>
          <div className="assessments-list">
            {assessment.instrument_applications.map((instrument) => (
              <div className="clinic-row" key={instrument.id}>
                <div><strong>{instrument.instrument_name}</strong><p>{formatDate(instrument.application_date)} · {instrument.notes || instrument.interpretation_text || "Sem observações."}</p></div>
                <span className="status-badge">{instrument.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Resultado</p>
              <h2>Síntese integrativa</h2>
              <p className="muted">Registre o resumo autorizado e recomendações do processo.</p>
            </div>
          </div>
          {assessment.result ? (
            <div className="clinic-list">
              <div className="clinic-row"><div><strong>Status</strong><p>{assessment.result.status}</p></div></div>
              <div className="clinic-row"><div><strong>Síntese</strong><p>{assessment.result.summary}</p></div></div>
              <div className="clinic-row"><div><strong>Recomendações</strong><p>{assessment.result.recommendations || "Não informadas."}</p></div></div>
            </div>
          ) : (
            <form className="form-stack" onSubmit={handleResultSubmit}>
              <label className="field-group" htmlFor="result_status">Status<select id="result_status" name="status" defaultValue="DRAFT"><option value="DRAFT">Rascunho</option><option value="FINAL">Finalizado</option></select></label>
              <label className="field-group" htmlFor="summary">Síntese<textarea id="summary" name="summary" required rows={5} /></label>
              <label className="field-group" htmlFor="recommendations">Recomendações<textarea id="recommendations" name="recommendations" rows={4} /></label>
              <button className="button-primary button-compact" disabled={isPending} type="submit">Registrar síntese</button>
            </form>
          )}
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Documento final</p>
              <h2>Vínculos</h2>
              <p className="muted">Vincule relatórios, declarações ou devolutivas já gerados para o paciente.</p>
            </div>
          </div>
          <form className="form-stack" onSubmit={handleDocumentSubmit}>
            <label className="field-group" htmlFor="document">Documento<select id="document" name="document" required defaultValue=""><option value="">Selecione</option>{documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}</select></label>
            <label className="field-group" htmlFor="document_type">Tipo<select id="document_type" name="document_type" defaultValue="REPORT"><option value="REPORT">Relatório</option><option value="DECLARATION">Declaração</option><option value="FEEDBACK">Devolutiva</option><option value="OTHER">Outro</option></select></label>
            <button className="button-primary button-compact" disabled={isPending || !documents.length} type="submit">Vincular documento</button>
          </form>
          <div className="patient-journey-actions">
            {assessment.assessment_documents.map((document) => (
              <Link href={`/clinics/${id}/documents`} key={document.id}>
                <strong>{document.document_title}</strong>
                <span>{document.document_type}</span>
              </Link>
            ))}
            {!assessment.assessment_documents.length ? <p className="muted">Nenhum documento vinculado ainda.</p> : null}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
