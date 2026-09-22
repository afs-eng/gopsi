"use client";

import Link from "next/link";
import { FormEvent, use, useCallback, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import {
  cancelPsychologicalAssessment,
  createAssessmentDocument,
  createAssessmentPlan,
  createAssessmentResult,
  createAssessmentSession,
  createInstrumentApplication,
  finalizeAssessmentResult,
  getClinic,
  getPsychologicalAssessment,
  listAssessmentInstruments,
  listGeneratedDocuments,
  updateAssessmentPlan,
  voidAssessmentResult,
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

type AssessmentTab = "overview" | "plan" | "sessions" | "instruments" | "result" | "documents" | "timeline";

function statusLabel(status: PsychologicalAssessmentStatus) {
  return {
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
    IN_PROGRESS: "Em andamento",
    PLANNING: "Planejamento",
    WAITING_FEEDBACK: "Aguardando devolutiva",
    WAITING_INFORMATION: "Aguardando informação",
    WRITING: "Em elaboração",
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

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
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

function parseListField(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
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
  const [activeTab, setActiveTab] = useState<AssessmentTab>("overview");
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
          professional: String(data.get("professional") ?? "") || null,
          session_date: String(data.get("session_date") ?? ""),
          start_time: String(data.get("start_time") ?? ""),
          end_time: String(data.get("end_time") ?? ""),
          modality: String(data.get("modality") ?? "IN_PERSON") as "IN_PERSON" | "ONLINE" | "OTHER",
          status: String(data.get("status") ?? "SCHEDULED") as "SCHEDULED" | "COMPLETED" | "CANCELLED",
          objective: String(data.get("objective") ?? ""),
          procedures: String(data.get("procedures") ?? ""),
          administrative_notes: String(data.get("administrative_notes") ?? ""),
          permitted_observations: String(data.get("permitted_observations") ?? ""),
        });
        form.reset();
        await refresh("Sessão registrada.");
      } catch {
        setError("Não foi possível registrar a sessão.");
      }
    });
  }

  function handlePlanSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment) return;
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const payload = {
      assessment: assessment.id,
      question: String(data.get("question") ?? ""),
      hypotheses: String(data.get("hypotheses") ?? ""),
      domains: parseListField(String(data.get("domains") ?? "")),
      procedures: parseListField(String(data.get("procedures") ?? "")),
      planned_instruments: data.getAll("planned_instruments").map(String),
      notes: String(data.get("notes") ?? ""),
    };

    startTransition(async () => {
      try {
        if (assessment.plan) {
          await updateAssessmentPlan(assessment.plan.id, payload);
        } else {
          await createAssessmentPlan(payload);
        }
        await refresh("Planejamento salvo.");
      } catch {
        setError("Não foi possível salvar o planejamento.");
      }
    });
  }

  function handleCancelSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment) return;
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const reason = String(data.get("reason") ?? "").trim();
    if (!reason) {
      setError("Informe o motivo do cancelamento.");
      return;
    }

    startTransition(async () => {
      try {
        await cancelPsychologicalAssessment(assessment.id, reason);
        await refresh("Avaliação cancelada.");
      } catch {
        setError("Não foi possível cancelar a avaliação.");
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
          applied_by: String(data.get("applied_by") ?? "") || null,
          reviewed_by: String(data.get("reviewed_by") ?? "") || null,
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

  function handleFinalizeResult() {
    if (!assessment?.result) return;
    const resultId = assessment.result.id;
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        await finalizeAssessmentResult(resultId);
        await refresh("Resultado finalizado.");
      } catch {
        setError("Não foi possível finalizar o resultado.");
      }
    });
  }

  function handleVoidResultSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment?.result) return;
    const resultId = assessment.result.id;
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const reason = String(data.get("reason") ?? "").trim();
    if (!reason) {
      setError("Informe o motivo da anulação.");
      return;
    }

    startTransition(async () => {
      try {
        await voidAssessmentResult(resultId, reason);
        await refresh("Resultado anulado.");
      } catch {
        setError("Não foi possível anular o resultado.");
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

  const assessmentTabs: Array<{ id: AssessmentTab; label: string; count?: number }> = [
    { id: "overview", label: "Visão geral" },
    { id: "plan", label: "Planejamento" },
    { id: "sessions", label: "Sessões", count: assessment.sessions.length },
    { id: "instruments", label: "Instrumentos", count: assessment.instrument_applications.length },
    { id: "result", label: "Resultado", count: assessment.result ? 1 : 0 },
    { id: "documents", label: "Documentos", count: assessment.assessment_documents.length },
    { id: "timeline", label: "Timeline", count: assessment.timeline_events.length },
  ];

  return (
    <AppShell
      activeNav="assessments"
      currentClinic={clinic}
      eyebrow="Acompanhamento da avaliação"
      title={assessment.code ? `${assessment.code} · ${assessment.title}` : assessment.title}
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
            {assessment.code ? <span>{assessment.code}</span> : null}
            <span>{assessment.assessment_type_label}</span>
            <span>{assessment.patient_name}</span>
            <span>{assessment.professional_name}</span>
            <span>Início: {formatDate(assessment.started_at)}</span>
            <span>Previsão: {formatDate(assessment.expected_at)}</span>
            <span>Conclusão: {formatDate(assessment.completed_at)}</span>
          </div>
        </div>
        <span className="status-badge">{statusLabel(assessment.status)}</span>
      </section>

      {assessment.status === "CANCELLED" ? (
        <section className="panel-card" aria-labelledby="assessment-cancelled-title">
          <p className="eyebrow">Cancelamento</p>
          <h2 id="assessment-cancelled-title">Avaliação cancelada</h2>
          <p>{assessment.cancellation_reason}</p>
          <p className="muted">Cancelada em {assessment.cancelled_at ? formatDateTime(assessment.cancelled_at) : "data não informada"}.</p>
        </section>
      ) : (
        <section className="panel-card" aria-labelledby="assessment-cancel-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Rastreabilidade</p>
              <h2 id="assessment-cancel-title">Cancelar avaliação</h2>
              <p className="muted">O cancelamento exige motivo e fica registrado na timeline clínica.</p>
            </div>
          </div>
          <form className="form-stack" onSubmit={handleCancelSubmit}>
            <label className="field-group" htmlFor="cancel_reason">Motivo do cancelamento<textarea id="cancel_reason" name="reason" rows={3} /></label>
            <button className="button-secondary button-compact" disabled={isPending} type="submit">Cancelar avaliação</button>
          </form>
        </section>
      )}

      <section className="metrics-grid" aria-label="Resumo da avaliação">
        <MetricCard label="Sessões" value={assessment.sessions.length} description="Encontros do processo avaliativo." />
        <MetricCard label="Instrumentos" value={assessment.instrument_applications.length} description="Aplicações registradas." />
        <MetricCard label="Documentos" value={assessment.assessment_documents.length} description="Documentos vinculados ao processo." />
      </section>

      <nav className="assessment-tabs" aria-label="Seções da avaliação">
        {assessmentTabs.map((tab) => (
          <button
            aria-current={activeTab === tab.id ? "page" : undefined}
            className="assessment-tab"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? <strong>{tab.count}</strong> : null}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? <section className="panel-card" aria-labelledby="assessment-context-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Visão geral</p>
            <h2 id="assessment-context-title">Contexto da demanda</h2>
            <p className="muted">Dados que orientam o planejamento e a condução da avaliação.</p>
          </div>
        </div>
        <dl className="patient-profile-list">
          <div><dt>Finalidade</dt><dd>{assessment.purpose || "Não informada"}</dd></div>
          <div><dt>Origem da demanda</dt><dd>{assessment.demand_origin || "Não informada"}</dd></div>
          <div><dt>Solicitante</dt><dd>{assessment.requester || "Não informado"}</dd></div>
          <div><dt>Objetivo</dt><dd>{assessment.objective || "Não informado"}</dd></div>
        </dl>
      </section> : null}

      {activeTab === "plan" ? <section className="panel-card" aria-labelledby="assessment-plan-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Planejamento</p>
            <h2 id="assessment-plan-title">Pergunta, hipóteses e procedimentos</h2>
            <p className="muted">Organize a condução da avaliação antes ou durante as aplicações.</p>
          </div>
        </div>
        <form className="form-stack" onSubmit={handlePlanSubmit}>
          <label className="field-group" htmlFor="question">Pergunta ou objetivo da avaliação<textarea id="question" name="question" rows={3} defaultValue={assessment.plan?.question ?? assessment.objective} /></label>
          <label className="field-group" htmlFor="hypotheses">Hipóteses a investigar<textarea id="hypotheses" name="hypotheses" rows={4} defaultValue={assessment.plan?.hypotheses ?? ""} /></label>
          <div className="field-grid">
            <label className="field-group" htmlFor="domains">Domínios avaliados, um por linha<textarea id="domains" name="domains" rows={5} defaultValue={assessment.plan?.domains.join("\n") ?? ""} placeholder={"Atenção\nMemória\nFunções executivas"} /></label>
            <label className="field-group" htmlFor="procedures">Procedimentos planejados, um por linha<textarea id="procedures" name="procedures" rows={5} defaultValue={assessment.plan?.procedures.join("\n") ?? ""} placeholder={"Entrevista\nAnamnese\nAplicação de instrumentos"} /></label>
          </div>
          <label className="field-group" htmlFor="planned_instruments">Instrumentos planejados<select id="planned_instruments" name="planned_instruments" multiple defaultValue={assessment.plan?.planned_instruments ?? []}>{instruments.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.name}</option>)}</select></label>
          <label className="field-group" htmlFor="plan_notes">Notas do planejamento<textarea id="plan_notes" name="notes" rows={3} defaultValue={assessment.plan?.notes ?? ""} /></label>
          <button className="button-primary button-compact" disabled={isPending} type="submit">Salvar planejamento</button>
        </form>
      </section> : null}

      {activeTab === "sessions" || activeTab === "instruments" || activeTab === "result" || activeTab === "documents" ? <section className="appointment-detail-grid">
        {activeTab === "sessions" ? <article className="panel-card">
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
              <label className="field-group" htmlFor="session_professional">Profissional<select id="session_professional" name="professional" defaultValue={assessment.professional}><option value={assessment.professional}>{assessment.professional_name}</option></select></label>
              <label className="field-group" htmlFor="session_modality">Modalidade<select id="session_modality" name="modality" defaultValue="IN_PERSON"><option value="IN_PERSON">Presencial</option><option value="ONLINE">Online</option><option value="OTHER">Outra</option></select></label>
            </div>
            <div className="field-grid">
              <label className="field-group" htmlFor="start_time">Início<input id="start_time" name="start_time" required type="time" /></label>
              <label className="field-group" htmlFor="end_time">Fim<input id="end_time" name="end_time" required type="time" /></label>
            </div>
            <label className="field-group" htmlFor="session_objective">Objetivo da sessão<textarea id="session_objective" name="objective" rows={3} /></label>
            <label className="field-group" htmlFor="session_procedures">Procedimentos realizados<textarea id="session_procedures" name="procedures" rows={3} /></label>
            <label className="field-group" htmlFor="administrative_notes">Notas administrativas<textarea id="administrative_notes" name="administrative_notes" rows={3} /></label>
            <label className="field-group" htmlFor="permitted_observations">Observações permitidas<textarea id="permitted_observations" name="permitted_observations" rows={3} /></label>
            <button className="button-primary button-compact" disabled={isPending} type="submit">Registrar sessão</button>
          </form>
          <div className="assessments-list">
            {assessment.sessions.map((session) => (
              <div className="clinic-row" key={session.id}>
                <div><strong>{formatDate(session.session_date)}</strong><p>{formatTime(session.start_time)} às {formatTime(session.end_time)} · {session.professional_name || assessment.professional_name} · {session.objective || session.administrative_notes || "Sem notas."}</p></div>
                <span className="status-badge">{session.status}</span>
              </div>
            ))}
            {!assessment.sessions.length ? <p className="muted">Nenhuma sessão registrada ainda. Comece lançando a primeira sessão de avaliação.</p> : null}
          </div>
        </article> : null}

        {activeTab === "instruments" ? <article className="panel-card">
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
            <div className="field-grid">
              <label className="field-group" htmlFor="applied_by">Aplicador<select id="applied_by" name="applied_by" defaultValue={assessment.professional}><option value={assessment.professional}>{assessment.professional_name}</option></select></label>
              <label className="field-group" htmlFor="reviewed_by">Revisor<select id="reviewed_by" name="reviewed_by" defaultValue=""><option value="">Não revisado</option><option value={assessment.professional}>{assessment.professional_name}</option></select></label>
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
                <div><strong>{instrument.instrument_name}</strong><p>{formatDate(instrument.application_date)} · Aplicador: {instrument.applied_by_name || "não informado"} · Revisor: {instrument.reviewed_by_name || "não revisado"} · {instrument.notes || instrument.interpretation_text || "Sem observações."}</p></div>
                <span className="status-badge">{instrument.is_validated ? "Validado" : instrument.status}</span>
              </div>
            ))}
            {!assessment.instrument_applications.length ? <p className="muted">Nenhum instrumento registrado ainda. Adicione os testes e dados autorizados conforme o processo avançar.</p> : null}
          </div>
        </article> : null}

        {activeTab === "result" ? <article className="panel-card">
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
              {assessment.result.void_reason ? <div className="clinic-row"><div><strong>Motivo da anulação</strong><p>{assessment.result.void_reason}</p></div></div> : null}
              {assessment.result.status === "DRAFT" ? (
                <button className="button-primary button-compact" disabled={isPending} type="button" onClick={handleFinalizeResult}>Finalizar resultado</button>
              ) : null}
              {assessment.result.status === "FINAL" ? (
                <form className="form-stack" onSubmit={handleVoidResultSubmit}>
                  <label className="field-group" htmlFor="void_reason">Motivo da anulação<textarea id="void_reason" name="reason" rows={3} /></label>
                  <button className="button-secondary button-compact" disabled={isPending} type="submit">Anular resultado</button>
                </form>
              ) : null}
            </div>
          ) : (
            <form className="form-stack" onSubmit={handleResultSubmit}>
              <label className="field-group" htmlFor="result_status">Status<select id="result_status" name="status" defaultValue="DRAFT"><option value="DRAFT">Rascunho</option><option value="FINAL">Finalizado</option></select></label>
            <label className="field-group" htmlFor="summary">Síntese<textarea id="summary" name="summary" required rows={5} /></label>
            <label className="field-group" htmlFor="recommendations">Recomendações<textarea id="recommendations" name="recommendations" rows={4} /></label>
              <p className="muted">A síntese consolida resultados autorizados. Evite registrar itens, estímulos ou conteúdo restrito de testes.</p>
              <button className="button-primary button-compact" disabled={isPending} type="submit">Registrar síntese</button>
            </form>
          )}
        </article> : null}

        {activeTab === "documents" ? <article className="panel-card">
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
            {!documents.length ? <p className="muted">Nenhum documento do paciente encontrado. Use “Gerar documento” para criar o relatório ou devolutiva antes de vincular.</p> : null}
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
        </article> : null}
      </section> : null}

      {activeTab === "timeline" ? <section className="panel-card" aria-labelledby="assessment-timeline-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Timeline clínica</p>
            <h2 id="assessment-timeline-title">Eventos do processo</h2>
            <p className="muted">Histórico operacional dos principais marcos da avaliação.</p>
          </div>
        </div>
        <div className="clinic-list">
          {assessment.timeline_events.map((event) => (
            <div className="clinic-row" key={event.id}>
              <div>
                <strong>{event.title}</strong>
                <p>{event.description || event.event_type_label} · {formatDateTime(event.created_at)}</p>
              </div>
              <span className="status-badge">{event.event_type_label}</span>
            </div>
          ))}
          {!assessment.timeline_events.length ? <p className="muted">Nenhum evento registrado ainda.</p> : null}
        </div>
      </section> : null}
    </AppShell>
  );
}
