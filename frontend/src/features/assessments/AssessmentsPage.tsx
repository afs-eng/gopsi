"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { getClinic, listPsychologicalAssessments } from "@/lib/api";
import type {
  Clinic,
  PsychologicalAssessment,
  PsychologicalAssessmentStatus,
} from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type AssessmentsPageProps = {
  params: Promise<{ id: string }>;
};

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

export function AssessmentsPage({ params }: AssessmentsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [assessments, setAssessments] = useState<PsychologicalAssessment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | PsychologicalAssessmentStatus>("ALL");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    Promise.all([getClinic(id), listPsychologicalAssessments(id)])
      .then(([clinicData, assessmentsData]) => {
        setClinic(clinicData);
        setAssessments(assessmentsData);
      })
      .catch(() => setError("Não foi possível carregar as avaliações."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error || !clinic) {
    return (
      <AppShell activeNav="assessments" eyebrow="Avaliação" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredAssessments = assessments.filter((assessment) => {
    const matchesStatus = statusFilter === "ALL" || assessment.status === statusFilter;
    const matchesSearch = !normalizedSearch || [
      assessment.title,
      assessment.code || "",
      assessment.patient_name,
      assessment.professional_name,
      assessment.reason,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
    return matchesStatus && matchesSearch;
  });
  const inProgressCount = assessments.filter((assessment) => assessment.status === "IN_PROGRESS").length;
  const completedCount = assessments.filter((assessment) => assessment.status === "COMPLETED").length;
  const instrumentsCount = assessments.reduce(
    (total, assessment) => total + assessment.instrument_applications.length,
    0,
  );

  return (
    <AppShell
      activeNav="assessments"
      currentClinic={clinic}
      eyebrow="Diferencial GoPsi"
      title="Avaliação psicológica"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/assessments/new`}>
          Nova avaliação
        </Link>
      }
    >
      <section className="assessment-hero panel-card" aria-labelledby="assessment-hero-title">
        <div>
          <p className="eyebrow">Fluxo especializado</p>
          <h2 id="assessment-hero-title">Do instrumento ao documento final</h2>
          <p className="muted">
            Acompanhe avaliações, instrumentos aplicados, resultados, síntese integrativa e documentos vinculados sem misturar com a rotina administrativa.
          </p>
        </div>
        <div className="assessment-flow-track" aria-label="Fluxo de avaliação psicológica">
          <span>Paciente</span>
          <span>Avaliação</span>
          <span>Instrumentos</span>
          <span>Resultados</span>
          <span>Síntese</span>
          <span>Documento</span>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Resumo de avaliações">
        <MetricCard label="Em andamento" value={inProgressCount} description="Avaliações abertas que precisam de acompanhamento." />
        <MetricCard label="Concluídas" value={completedCount} description="Processos já finalizados ou documentados." />
        <MetricCard label="Instrumentos" value={instrumentsCount} description="Aplicações registradas nas avaliações visíveis." />
      </section>

      <section className="panel-card assessments-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Avaliações</p>
            <h2>Processos em acompanhamento</h2>
            <p className="muted">Busque por paciente, profissional, motivo ou título da avaliação.</p>
          </div>
          <span className="panel-pill">{filteredAssessments.length} de {assessments.length} registro(s)</span>
        </div>

        <div className="patients-toolbar" aria-label="Filtros de avaliações">
          <label className="patients-search-field">
            <span>Buscar avaliação</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Paciente, profissional ou motivo"
            />
          </label>
          <label className="patients-filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | PsychologicalAssessmentStatus)}
            >
              <option value="ALL">Todos</option>
              <option value="PLANNING">Planejamento</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="WAITING_INFORMATION">Aguardando informação</option>
              <option value="WRITING">Em elaboração</option>
              <option value="WAITING_FEEDBACK">Aguardando devolutiva</option>
              <option value="COMPLETED">Concluídas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </label>
        </div>

        {filteredAssessments.length ? (
          <div className="assessments-list">
            {filteredAssessments.map((assessment) => (
              <article className="assessment-row" key={assessment.id}>
                <div>
                  <div className="assessment-row-heading">
                    <h3>{assessment.code ? `${assessment.code} · ${assessment.title}` : assessment.title}</h3>
                    <span className="status-badge">{statusLabel(assessment.status)}</span>
                  </div>
                  <p className="muted">{assessment.reason || "Motivo não informado."}</p>
                  <div className="assessment-row-meta">
                    <span>{assessment.patient_name}</span>
                    <span>{assessment.professional_name}</span>
                    <span>{assessment.assessment_type_label}</span>
                    <span>Início: {formatDate(assessment.started_at)}</span>
                  </div>
                </div>
                <div className="assessment-row-stats" aria-label="Andamento da avaliação">
                  <span><strong>{assessment.sessions.length}</strong> sessões</span>
                  <span><strong>{assessment.instrument_applications.length}</strong> instrumentos</span>
                  <span><strong>{assessment.result ? 1 : 0}</strong> resultado</span>
                  <span><strong>{assessment.assessment_documents.length}</strong> documentos</span>
                  <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments/${assessment.id}`}>
                    Acompanhar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : assessments.length ? (
          <div className="empty-state">
            <h3>Nenhuma avaliação encontrada</h3>
            <p>Ajuste a busca ou o status para localizar outro processo.</p>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma avaliação registrada</h3>
            <p>Comece pelo cadastro do paciente para organizar instrumentos, resultados e documento final.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/assessments/new`}>
              Iniciar avaliação
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
