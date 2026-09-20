"use client";

import Link from "next/link";
import { type CSSProperties, use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  getClinic,
  listAppointments,
  listScheduleBlocks,
} from "@/lib/api";
import type { Appointment, Clinic, ScheduleBlock } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type AppointmentsPageProps = {
  params: Promise<{ id: string }>;
};

type CalendarItem = {
  id: string;
  type: "appointment" | "block";
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  subtitle: string;
  status?: Appointment["status"];
  modality?: Appointment["modality"];
  source: Appointment | ScheduleBlock;
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const hourStart = 7;
const hourEnd = 19;
const hourHeight = 72;

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function localDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function minutesFromStart(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours - hourStart) * 60 + minutes;
}

function eventStyle(item: CalendarItem) {
  const top = Math.max(0, (minutesFromStart(item.start_time) / 60) * hourHeight);
  const duration = Math.max(30, minutesFromStart(item.end_time) - minutesFromStart(item.start_time));
  const height = Math.max(42, (duration / 60) * hourHeight - 6);
  return { height: `${height}px`, top: `${top}px` };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(localDate(date));
}

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

export function AppointmentsPage({ params }: AppointmentsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [search, setSearch] = useState("");

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

  const today = dateKey(new Date());
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekEnd = addDays(weekStart, 6);
  const hours = Array.from({ length: hourEnd - hourStart }, (_, index) => hourStart + index);
  const normalizedSearch = search.trim().toLowerCase();
  const calendarItems: CalendarItem[] = [
    ...appointments
      .filter((appointment) => appointment.is_active)
      .map((appointment) => ({
        date: appointment.date,
        end_time: appointment.end_time,
        id: appointment.id,
        modality: appointment.modality,
        source: appointment,
        start_time: appointment.start_time,
        status: appointment.status,
        subtitle: appointment.professional_name,
        title: appointment.patient_name,
        type: "appointment" as const,
      })),
    ...scheduleBlocks
      .filter((block) => block.is_active)
      .map((block) => ({
        date: block.date,
        end_time: block.end_time,
        id: block.id,
        source: block,
        start_time: block.start_time,
        subtitle: block.professional_name,
        title: block.reason || "Horário bloqueado",
        type: "block" as const,
      })),
  ].filter((item) => {
    const itemDate = localDate(item.date);
    const isInWeek = itemDate >= weekStart && itemDate <= weekEnd;
    const matchesSearch = !normalizedSearch || [
      item.title,
      item.subtitle,
      item.type === "appointment" ? item.status : "Bloqueio",
      item.type === "appointment" ? item.modality : "",
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    return isInWeek && matchesSearch;
  });
  const todayAppointments = appointments.filter((appointment) => appointment.date === today && appointment.is_active);
  const nextItems = calendarItems
    .filter((item) => `${item.date}T${item.start_time}` >= `${today}T00:00`)
    .sort((a, b) => `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.start_time}`))
    .slice(0, 5);
  const miniMonthDays = Array.from({ length: 35 }, (_, index) => {
    const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1, 12);
    const gridStart = startOfWeek(monthStart);
    return addDays(gridStart, index);
  });
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(weekStart);

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
      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

      <section className="calendar-shell" aria-label="Agenda semanal">
        <aside className="calendar-sidebar" aria-label="Resumo da agenda">
          <div className="calendar-sidebar-window-controls" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="calendar-sidebar-heading">
            <p>{monthLabel}</p>
            <div>
              <button type="button" onClick={() => setWeekStart((current) => addDays(current, -7))} aria-label="Semana anterior">‹</button>
              <button type="button" onClick={() => setWeekStart((current) => addDays(current, 7))} aria-label="Próxima semana">›</button>
            </div>
          </div>

          <div className="mini-calendar" aria-label="Calendário do mês">
            {weekDays.map((day) => <span className="mini-calendar-weekday" key={day}>{day}</span>)}
            {miniMonthDays.map((day) => {
              const key = dateKey(day);
              const hasEvent = appointments.some((appointment) => appointment.date === key && appointment.is_active);
              return (
                <button
                  className={`${key === today ? "is-today" : ""} ${days.some((weekDay) => dateKey(weekDay) === key) ? "is-week" : ""}`}
                  key={key}
                  type="button"
                  onClick={() => setWeekStart(startOfWeek(day))}
                >
                  {day.getDate()}
                  {hasEvent ? <span aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>

          <div className="calendar-sidebar-stats">
            <div><span>Hoje</span><strong>{todayAppointments.length}</strong></div>
            <div><span>Semana</span><strong>{calendarItems.filter((item) => item.type === "appointment").length}</strong></div>
            <div><span>Bloqueios</span><strong>{calendarItems.filter((item) => item.type === "block").length}</strong></div>
          </div>

          <div className="calendar-upcoming">
            <p className="eyebrow">Próximos horários</p>
            {nextItems.length ? nextItems.map((item) => (
              <article key={`${item.type}-${item.id}`}>
                <span className={`calendar-dot ${item.type === "block" ? "is-block" : ""}`} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{formatDate(item.date)} · {item.start_time.slice(0, 5)} às {item.end_time.slice(0, 5)}</p>
                </div>
              </article>
            )) : <p className="calendar-sidebar-empty">Nenhum horário nesta semana.</p>}
          </div>
        </aside>

        <div className="calendar-board">
          <div className="calendar-toolbar">
            <div className="calendar-nav-actions">
              <button type="button" onClick={() => setWeekStart((current) => addDays(current, -7))} aria-label="Semana anterior">‹</button>
              <button type="button" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoje</button>
              <button type="button" onClick={() => setWeekStart((current) => addDays(current, 7))} aria-label="Próxima semana">›</button>
            </div>
            <div className="calendar-view-tabs" aria-label="Visualização atual">
              <span>Dia</span>
              <strong>Semana</strong>
              <span>Mês</span>
              <span>Ano</span>
            </div>
            <label className="calendar-search">
              <span>Buscar</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Paciente, profissional ou status" />
            </label>
          </div>

          <div className="week-calendar" style={{ "--hour-height": `${hourHeight}px` } as CSSProperties}>
            <div className="week-header" style={{ gridTemplateColumns: `4.6rem repeat(7, minmax(8.4rem, 1fr))` }}>
              <span />
              {days.map((day) => (
                <div className={dateKey(day) === today ? "is-today" : ""} key={dateKey(day)}>
                  <span>{weekDays[day.getDay()]}</span>
                  <strong>{day.getDate()}</strong>
                </div>
              ))}
            </div>
            <div className="week-body" style={{ gridTemplateColumns: `4.6rem repeat(7, minmax(8.4rem, 1fr))` }}>
              <div className="time-gutter">
                {hours.map((hour) => <span key={hour}>{hour}:00</span>)}
              </div>
              {days.map((day) => {
                const key = dateKey(day);
                const dayItems = calendarItems.filter((item) => item.date === key);
                return (
                  <div className={`calendar-day-column ${key === today ? "is-today" : ""}`} key={key}>
                    {dayItems.map((item) => (
                      <article
                        className={`calendar-event ${item.type === "block" ? "is-block" : ""} ${item.modality === "ONLINE" ? "is-online" : ""}`}
                        key={`${item.type}-${item.id}`}
                        style={eventStyle(item)}
                      >
                        {item.type === "appointment" ? (
                          <Link className="calendar-event-link" href={`/clinics/${id}/appointments/${item.id}`} aria-label={`Abrir consulta de ${item.title}`}>
                            <time>{item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}</time>
                            <strong>{item.title}</strong>
                            <span>{item.subtitle}</span>
                            <small>{statusLabel(item.status ?? "SCHEDULED")}</small>
                          </Link>
                        ) : (
                          <div className="calendar-event-link">
                            <time>{item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}</time>
                            <strong>{item.title}</strong>
                            <span>{item.subtitle}</span>
                            <small>Bloqueio</small>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
