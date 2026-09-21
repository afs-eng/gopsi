"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import {
  listAppointments,
  listClinics,
  listGeneratedDocuments,
  listInvoices,
  listPatients,
  listPsychologicalAssessments,
  listScheduleBlocks,
} from "@/lib/api";
import type { Appointment, Clinic, GeneratedDocument, Invoice, Patient, PsychologicalAssessment, ScheduleBlock } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type DashboardClinicData = {
  appointments: Appointment[];
  assessments: PsychologicalAssessment[];
  documents: GeneratedDocument[];
  invoices: Invoice[];
  patients: Patient[];
  scheduleBlocks: ScheduleBlock[];
};

const currency = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function timeLabel(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`;
}

function formatMoney(value: number) {
  return currency.format(value);
}

export function DashboardPage() {
  const { loading, user } = useAuthenticatedData();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicData, setClinicData] = useState<DashboardClinicData | null>(null);
  const [error, setError] = useState("");
  const primaryClinic = clinics[0];
  const today = new Date();
  const todayKey = dateKey(today);
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
      .then(async (clinicList) => {
        setClinics(clinicList);
        const selectedClinic = clinicList[0];

        if (!selectedClinic) {
          setClinicData(null);
          return;
        }

        const [appointments, scheduleBlocks, patients, invoices, assessments, documents] = await Promise.all([
          listAppointments(selectedClinic.id),
          listScheduleBlocks(selectedClinic.id),
          listPatients(selectedClinic.id),
          listInvoices(selectedClinic.id),
          listPsychologicalAssessments(selectedClinic.id),
          listGeneratedDocuments(selectedClinic.id),
        ]);

        setClinicData({ appointments, assessments, documents, invoices, patients, scheduleBlocks });
      })
      .catch(() => setError("Não foi possível carregar as clínicas."));
  }, [user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  const todayAppointments = (clinicData?.appointments ?? [])
    .filter((appointment) => appointment.is_active && appointment.date === todayKey)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const todayBlocks = (clinicData?.scheduleBlocks ?? [])
    .filter((block) => block.is_active && block.date === todayKey)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const activePatients = (clinicData?.patients ?? []).filter((patient) => patient.is_active && patient.status === "ACTIVE").length;
  const openInvoices = (clinicData?.invoices ?? []).filter((invoice) => invoice.status === "OPEN" || invoice.status === "OVERDUE");
  const openAmount = openInvoices.reduce((total, invoice) => total + Number(invoice.amount || 0), 0);
  const inProgressAssessments = (clinicData?.assessments ?? []).filter((assessment) => assessment.status === "IN_PROGRESS");
  const recentDocuments = (clinicData?.documents ?? [])
    .filter((document) => document.is_active)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3);

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
            <p className="muted">Agenda, pacientes, prontuário, documentos, financeiro e avaliação psicológica em um só lugar.</p>
          </div>
          <div className="dashboard-welcome-mark" aria-hidden="true">✦</div>
        </section>

      <section className="metrics-grid dashboard-metrics" aria-label="Resumo administrativo">
        <MetricCard
          label="Pacientes ativos"
          value={clinicData ? activePatients : "-"}
          description="Cadastros ativos na clínica principal."
        />
        <MetricCard
          label="Hoje"
          value={clinicData ? todayAppointments.length : "-"}
          description="Consultas agendadas para esta data."
        />
        <MetricCard
          label="Pendências"
          value={clinicData ? formatMoney(openAmount) : "-"}
          description={`${openInvoices.length} cobrança(s) em aberto ou vencidas.`}
        />
        <MetricCard
          label="Avaliações"
          value={clinicData ? inProgressAssessments.length : "-"}
          description="Processos psicológicos em andamento."
        />
      </section>

      <section className="dashboard-workspace-grid" aria-label="Espaço de trabalho">
        <article className="panel-card agenda-card dashboard-agenda">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Rotina de hoje</h2>
              <p className="muted">Atendimentos, bloqueios e próximos passos da clínica selecionada.</p>
            </div>
            <span className="panel-pill">Hoje</span>
          </div>
          {todayAppointments.length || todayBlocks.length ? (
            <div className="dashboard-today-list" aria-label="Compromissos de hoje">
              {todayAppointments.slice(0, 4).map((appointment) => (
                <Link className="dashboard-today-item" href={`/clinics/${primaryClinic?.id}/appointments/${appointment.id}`} key={appointment.id}>
                  <strong>{timeLabel(appointment.start_time, appointment.end_time)}</strong>
                  <span>{appointment.patient_name}</span>
                  <small>{appointment.professional_name}</small>
                </Link>
              ))}
              {todayBlocks.slice(0, 2).map((block) => (
                <article className="dashboard-today-item is-block" key={block.id}>
                  <strong>{timeLabel(block.start_time, block.end_time)}</strong>
                  <span>{block.reason || "Horário bloqueado"}</span>
                  <small>{block.professional_name}</small>
                </article>
              ))}
              {primaryClinic ? <Link className="text-link" href={`/clinics/${primaryClinic.id}/appointments`}>Ver agenda completa</Link> : null}
            </div>
          ) : (
            <div className="dashboard-agenda-empty" role="status">
              <div className="calendar-placeholder" aria-hidden="true">□</div>
              <div>
                <h3>Nenhum compromisso hoje</h3>
                <p className="muted">Consultas e bloqueios do dia aparecerão aqui.</p>
              </div>
              {primaryClinic ? <Link className="text-link" href={`/clinics/${primaryClinic.id}/appointments`}>Ver agenda completa</Link> : null}
            </div>
          )}
          <div className="dashboard-calendar-card">
            <div className="panel-heading"><div><p className="eyebrow">Calendário</p><h3>{monthLabel}</h3></div><span className="panel-pill">{todayAppointments.length} hoje</span></div>
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
        <article className="panel-card dashboard-assessment-card">
          <p className="eyebrow">Diferencial GoPsi</p>
          <h3>Avaliação psicológica</h3>
          <p className="muted">
            Organize avaliação, instrumentos, resultados, interpretação, síntese integrativa e documento final.
          </p>
          {inProgressAssessments.length ? <p className="panel-pill">{inProgressAssessments.length} em andamento</p> : null}
          <ol className="assessment-flow-list" aria-label="Fluxo de avaliação psicológica">
            <li>Paciente</li>
            <li>Instrumentos</li>
            <li>Resultados</li>
            <li>Síntese</li>
          </ol>
          {primaryClinic ? (
            <Link className="button-secondary button-compact" href={`/clinics/${primaryClinic.id}/assessments/new`}>
              Nova avaliação
            </Link>
          ) : null}
        </article>
      </aside>

      <section className="dashboard-lower-grid">
      <section id="clinicas" className="panel-card dashboard-clinics-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Ambiente clínico</p>
            <h2>Clínicas visíveis</h2>
          </div>
          <span className="panel-pill">Acesso seguro</span>
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
        <h2 id="dashboard-tasks-title">Pendências e recentes</h2>
        <div className="dashboard-task-list">
          <Link className="dashboard-task-item" href={primaryClinic ? `/clinics/${primaryClinic.id}/billing` : "#"}>
            <strong>{openInvoices.length} cobrança(s)</strong>
            <span>{formatMoney(openAmount)} em aberto ou vencido</span>
          </Link>
          <Link className="dashboard-task-item" href={primaryClinic ? `/clinics/${primaryClinic.id}/assessments` : "#"}>
            <strong>{inProgressAssessments.length} avaliação(ões)</strong>
            <span>Processos aguardando evolução ou documento final</span>
          </Link>
          {recentDocuments.length ? recentDocuments.map((document) => (
            <Link className="dashboard-task-item" href={primaryClinic ? `/clinics/${primaryClinic.id}/documents` : "#"} key={document.id}>
              <strong>{document.title}</strong>
              <span>Documento recente de {document.patient_name || "paciente não vinculado"}</span>
            </Link>
          )) : (
            <div className="empty-state">
              <h3>Nenhum documento recente</h3>
              <p>Documentos gerados aparecerão aqui.</p>
            </div>
          )}
        </div>
      </aside>
      </section>
      </div>
    </AppShell>
  );
}
