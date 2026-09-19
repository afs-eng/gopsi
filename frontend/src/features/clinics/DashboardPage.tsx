"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { listClinics } from "@/lib/api";
import type { Clinic } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

export function DashboardPage() {
  const { loading, user } = useAuthenticatedData();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [error, setError] = useState("");
  const primaryClinic = clinics[0];
  const activeClinics = clinics.filter((clinic) => clinic.is_active).length;
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(today);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(today);
  const firstWeekday = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.is_platform_admin) {
      window.location.replace("/platform");
      return;
    }

    listClinics()
      .then(setClinics)
      .catch(() => setError("Não foi possível carregar as clínicas."));
  }, [user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  return (
    <AppShell
      activeNav="dashboard"
      currentClinic={primaryClinic}
      eyebrow="Dashboard"
      title="Visão geral"
      user={user}
      actions={
        null
      }
    >
      <div className="dashboard-page">
        <section className="dashboard-welcome" aria-labelledby="dashboard-welcome-title">
          <div>
            <p className="eyebrow">{dateLabel}</p>
            <h2 id="dashboard-welcome-title">Bom dia, {user.full_name || user.username}.</h2>
            <p className="muted">Acompanhe o que importa para sua clínica em um só lugar.</p>
          </div>
          <div className="dashboard-welcome-mark" aria-hidden="true">✦</div>
        </section>

      <section className="metrics-grid dashboard-metrics" aria-label="Resumo administrativo">
        <MetricCard
          label="Clínicas acessíveis"
          value={clinics.length}
          description="Somente vínculos ativos aparecem aqui."
        />
        <MetricCard
          label="Clínicas ativas"
          value={activeClinics}
          description="Locais prontos para agenda, pacientes e equipe."
        />
        <MetricCard
          label="Perfil"
          value={user.global_role}
          description="Permissões específicas dependem do vínculo por clínica."
        />
        <MetricCard
          label="Clínicas inativas"
          value={clinics.length - activeClinics}
          description="Vínculos que não estão disponíveis no momento."
        />
      </section>

      <section className="dashboard-workspace-grid" aria-label="Espaço de trabalho">
        <article className="panel-card agenda-card dashboard-agenda">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Compromissos</h2>
              <p className="muted">A agenda da clínica selecionada aparece aqui.</p>
            </div>
            <span className="panel-pill">Hoje</span>
          </div>
          <div className="dashboard-agenda-empty" role="status">
            <div className="calendar-placeholder" aria-hidden="true">□</div>
            <div>
              <h3>Nenhum compromisso para mostrar</h3>
              <p className="muted">Selecione uma clínica para consultar a agenda real.</p>
            </div>
            {primaryClinic ? <Link className="text-link" href={`/clinics/${primaryClinic.id}/appointments`}>Ver agenda completa</Link> : null}
          </div>
          <div className="dashboard-calendar-card">
            <div className="panel-heading"><div><p className="eyebrow">Calendário</p><h3>{monthLabel}</h3></div><span className="panel-pill">Sem compromissos</span></div>
            <div className="calendar-grid" aria-label={`Calendário de ${monthLabel}`}>
              {['D','S','T','Q','Q','S','S'].map((day, index) => <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>)}
              {Array.from({ length: firstWeekday }, (_, index) => <span className="calendar-day calendar-day-empty" aria-hidden="true" key={`empty-${index}`} />)}
              {Array.from({ length: daysInMonth }, (_, index) => <span className={`calendar-day ${index + 1 === today.getDate() ? "is-today" : ""}`} key={index}>{index + 1}</span>)}
            </div>
          </div>
        </article>
      </section>

      <aside className="dashboard-actions-column" aria-label="Ações da clínica">
        <article className="panel-card dashboard-primary-action">
          <p className="eyebrow">Ação principal</p>
          <h3>Nova consulta</h3>
          <p className="muted">Agende um horário para um paciente e profissional vinculados.</p>
          {primaryClinic ? <Link className="button-primary button-compact" href={`/clinics/${primaryClinic.id}/appointments/new`}>Agendar consulta</Link> : <Link className="button-primary button-compact" href="/#clinicas">Escolher clínica</Link>}
        </article>
        <article className="panel-card dashboard-quick-actions">
          <div className="panel-heading"><div><p className="eyebrow">Atalhos</p><h3>Ações rápidas</h3></div></div>
          {primaryClinic ? <div className="quick-actions dashboard-quick-grid">
            <Link className="button-secondary button-compact" href={`/clinics/${primaryClinic.id}/patients/new`}>Novo paciente</Link>
            <Link className="button-secondary button-compact" href={`/clinics/${primaryClinic.id}/professionals/new`}>Novo profissional</Link>
            <Link className="button-secondary button-compact" href={`/clinics/${primaryClinic.id}/appointments`}>Agenda</Link>
            <Link className="button-secondary button-compact" href={`/clinics/${primaryClinic.id}/medical-records`}>Prontuários</Link>
            <Link className="button-secondary button-compact" href={`/clinics/${primaryClinic.id}/documents`}>Documentos</Link>
            <Link className="button-secondary button-compact" href={`/clinics/${primaryClinic.id}/billing`}>Financeiro</Link>
          </div> : <p className="muted">Escolha uma clínica para liberar os atalhos.</p>}
        </article>
      </aside>

      <section className="dashboard-lower-grid">
      <section id="clinicas" className="panel-card dashboard-clinics-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Tenant atual</p>
            <h2>Clínicas visíveis</h2>
          </div>
          <span className="panel-pill">Protegido por token</span>
        </div>

        {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        {clinics.length ? (
          <div className="clinic-list">
            {clinics.map((clinic) => (
              <Link className="clinic-row" href={`/clinics/${clinic.id}`} key={clinic.id}>
                <div>
                  <strong>{clinic.name}</strong>
                  <p>{clinic.email || "E-mail não informado"}</p>
                </div>
                <span>Acessar clínica</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma clínica vinculada</h3>
            <p>Peça para um administrador vincular seu usuário a uma clínica.</p>
          </div>
        )}
      </section>
      <aside className="panel-card dashboard-tasks-panel" aria-labelledby="dashboard-tasks-title">
        <p className="eyebrow">Rotina</p>
        <h2 id="dashboard-tasks-title">Atividades</h2>
        <div className="empty-state">
          <h3>Nenhuma atividade recente</h3>
          <p>As atividades aparecerão aqui conforme sua clínica for utilizada.</p>
        </div>
      </aside>
      </section>
      </div>
    </AppShell>
  );
}
