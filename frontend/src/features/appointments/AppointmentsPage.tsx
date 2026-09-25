"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type CSSProperties, type FormEvent, type MouseEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import {
  GRID_END_HOUR,
  GRID_START_HOUR,
  HOUR_HEIGHT,
  calendarEventDurationMinutes,
  layoutCalendarEvents,
  minutesToTime,
} from "@/features/appointments/calendarLayout";
import {
  cancelAppointment,
  createAppointment,
  getClinic,
  listPatients,
  listAppointments,
  listProfessionals,
  listScheduleBlocks,
} from "@/lib/api";
import type { Appointment, Clinic, Patient, Professional, ScheduleBlock } from "@/lib/types";
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

type CalendarView = "week" | "month";

type AppointmentDraft = {
  date: string;
  end_time: string;
  professional: string;
  start_time: string;
};

type EventPopover = {
  contactOpen: boolean;
  item: CalendarItem;
  menuOpen: boolean;
  x: number;
  y: number;
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months, 1);
  return next;
}

function durationMinutes(item: CalendarItem) {
  return calendarEventDurationMinutes(item);
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

function modalityLabel(modality: Appointment["modality"]) {
  return {
    HYBRID: "Híbrida",
    IN_PERSON: "Presencial",
    ONLINE: "Online",
  }[modality];
}

function itemSearchValues(item: CalendarItem) {
  return [
    item.title,
    item.subtitle,
    item.type === "appointment" ? statusLabel(item.status ?? "SCHEDULED") : "Bloqueio",
    item.type === "appointment" ? item.modality : "",
  ];
}

export function AppointmentsPage({ params }: AppointmentsPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const selectedPatientId = searchParams.get("patient") ?? "";
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [appointmentDraft, setAppointmentDraft] = useState<AppointmentDraft | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [calendarView, setCalendarView] = useState<CalendarView>("week");
  const [search, setSearch] = useState("");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [eventPopover, setEventPopover] = useState<EventPopover | null>(null);
  const [isSavingAppointment, startSavingAppointment] = useTransition();
  const [isCancellingAppointment, startCancellingAppointment] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), listAppointments(id), listScheduleBlocks(id), listPatients(id), listProfessionals(id)])
      .then(([clinicData, appointmentsData, blockData, patientData, professionalData]) => {
        setClinic(clinicData);
        setAppointments(appointmentsData);
        setScheduleBlocks(blockData);
        setPatients(patientData);
        setProfessionals(professionalData);
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
  const hours = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, index) => GRID_START_HOUR + index);
  const normalizedSearch = search.trim().toLowerCase();
  const patientInContext = selectedPatientId ? patients.find((patient) => patient.id === selectedPatientId) ?? null : null;
  const searchableCalendarItems: CalendarItem[] = [
    ...appointments
      .filter((appointment) => appointment.is_active && (!selectedPatientId || appointment.patient === selectedPatientId))
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
      .filter((block) => block.is_active && !selectedPatientId)
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
    const matchesSearch = !normalizedSearch || [
      ...itemSearchValues(item),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    return matchesSearch;
  });
  const professionalOptions = professionals
    .filter((professional) => professional.is_active)
    .map((professional) => [professional.id, professional.full_name] as const)
    .sort((a, b) => a[1].localeCompare(b[1]));
  const allCalendarItems = searchableCalendarItems.filter((item) => {
    const sourceProfessional = item.source.professional;
    const matchesProfessional = professionalFilter === "all" || sourceProfessional === professionalFilter;
    const matchesStatus = statusFilter === "all" || (item.type === "appointment" && item.status === statusFilter);
    const matchesModality = modalityFilter === "all" || (item.type === "appointment" && item.modality === modalityFilter);
    return matchesProfessional && matchesStatus && matchesModality;
  });
  const calendarItems = allCalendarItems.filter((item) => {
    const itemDate = localDate(item.date);
    return itemDate >= weekStart && itemDate <= weekEnd;
  });
  const todayAppointments = appointments.filter((appointment) => appointment.date === today && appointment.is_active);
  const nextItems = allCalendarItems
    .filter((item) => `${item.date}T${item.start_time}` >= `${today}T00:00`)
    .sort((a, b) => `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.start_time}`))
    .slice(0, 5);
  const selectedAppointment = eventPopover?.item.type === "appointment"
    ? eventPopover.item.source as Appointment
    : null;
  const selectedPatient = selectedAppointment
    ? patients.find((patient) => patient.id === selectedAppointment.patient) ?? null
    : null;
  const selectedProfessional = eventPopover
    ? professionals.find((professional) => professional.id === eventPopover.item.source.professional) ?? null
    : null;
  const visibleMonth = startOfMonth(calendarView === "month" ? addDays(weekStart, 6) : weekStart);
  const miniMonthDays = Array.from({ length: 35 }, (_, index) => {
    const gridStart = startOfWeek(visibleMonth);
    return addDays(gridStart, index);
  });
  const monthGridDays = Array.from({ length: 42 }, (_, index) => addDays(startOfWeek(visibleMonth), index));
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(visibleMonth);
  const viewTitle = calendarView === "month"
    ? monthLabel
    : `${formatDate(dateKey(weekStart))} – ${formatDate(dateKey(weekEnd))}`;

  function goToPreviousPeriod() {
    setWeekStart((current) => calendarView === "month" ? startOfWeek(addMonths(addDays(current, 6), -1)) : addDays(current, -7));
  }

  function goToNextPeriod() {
    setWeekStart((current) => calendarView === "month" ? startOfWeek(addMonths(addDays(current, 6), 1)) : addDays(current, 7));
  }

  function goToToday() {
    setWeekStart(startOfWeek(new Date()));
  }

  function switchView(view: CalendarView) {
    setCalendarView(view);
    if (view === "month") {
      setWeekStart((current) => startOfWeek(startOfMonth(current)));
    }
  }

  function openCreateAppointmentAt(day: Date, event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = Math.max(0, event.clientY - rect.top);
    const minutesFromStart = Math.round(((clickY / HOUR_HEIGHT) * 60) / 15) * 15;
    const startMinutes = GRID_START_HOUR * 60 + minutesFromStart;
    const endMinutes = Math.min(GRID_END_HOUR * 60, startMinutes + 50);
    setModalError("");
    setEventPopover(null);
    setAppointmentDraft({
      date: dateKey(day),
      end_time: minutesToTime(endMinutes),
      professional: professionalFilter === "all" ? "" : professionalFilter,
      start_time: minutesToTime(startMinutes),
    });
  }

  function openEventPopover(item: CalendarItem, event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    const popoverWidth = 360;
    const popoverHeight = 500;
    setAppointmentDraft(null);
    setEventPopover({
      contactOpen: false,
      item,
      menuOpen: false,
      x: Math.max(16, Math.min(event.clientX + 12, window.innerWidth - popoverWidth)),
      y: Math.max(16, Math.min(event.clientY - 24, window.innerHeight - popoverHeight)),
    });
  }

  function closeEventPopover() {
    setEventPopover(null);
  }

  function toggleEventMenu() {
    setEventPopover((current) => current ? { ...current, menuOpen: !current.menuOpen } : current);
  }

  function toggleEventContact() {
    setEventPopover((current) => current ? { ...current, contactOpen: !current.contactOpen } : current);
  }

  function copyEventSummary() {
    if (!eventPopover) return;
    const item = eventPopover.item;
    const summary = `${item.title}\n${formatDate(item.date)} · ${item.start_time.slice(0, 5)} às ${item.end_time.slice(0, 5)}\n${item.subtitle}`;
    void navigator.clipboard?.writeText(summary);
    setEventPopover((current) => current ? { ...current, menuOpen: false } : current);
  }

  function duplicateEventDraft() {
    if (!eventPopover) return;
    setAppointmentDraft({
      date: eventPopover.item.date,
      end_time: eventPopover.item.end_time.slice(0, 5),
      professional: eventPopover.item.source.professional,
      start_time: eventPopover.item.start_time.slice(0, 5),
    });
    setEventPopover(null);
  }

  function handleCancelSelectedAppointment() {
    if (!selectedAppointment) return;
    const confirmed = window.confirm(`Cancelar a consulta de ${selectedAppointment.patient_name} em ${formatDate(selectedAppointment.date)}, das ${selectedAppointment.start_time.slice(0, 5)} às ${selectedAppointment.end_time.slice(0, 5)}?`);
    if (!confirmed) return;

    startCancellingAppointment(async () => {
      try {
        await cancelAppointment(selectedAppointment.id);
        setAppointments((current) => current.filter((appointment) => appointment.id !== selectedAppointment.id));
        setEventPopover(null);
      } catch {
        setError("Não foi possível cancelar a consulta.");
      }
    });
  }

  function closeAppointmentModal() {
    if (isSavingAppointment) {
      return;
    }

    setAppointmentDraft(null);
    setModalError("");
  }

  function handleQuickAppointmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");
    const formData = new FormData(event.currentTarget);

    startSavingAppointment(async () => {
      try {
        const appointment = await createAppointment({
          clinic: id,
          patient: String(formData.get("patient") ?? ""),
          professional: String(formData.get("professional") ?? ""),
          date: String(formData.get("date") ?? ""),
          start_time: String(formData.get("start_time") ?? ""),
          end_time: String(formData.get("end_time") ?? ""),
          modality: String(formData.get("modality") ?? "IN_PERSON") as "IN_PERSON" | "ONLINE" | "HYBRID",
          value: String(formData.get("value") ?? "0"),
          administrative_notes: String(formData.get("administrative_notes") ?? ""),
        });

        setAppointments((current) => [appointment, ...current]);
        setAppointmentDraft(null);
      } catch {
        setModalError("Não foi possível agendar. Verifique paciente, profissional e conflito de horário.");
      }
    });
  }

  return (
    <AppShell
      activeNav="appointments"
      currentClinic={clinic}
      eyebrow="Agenda clínica"
      title={patientInContext ? `Agenda de ${patientInContext.full_name}` : "Consultas"}
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

      <section className="calendar-shell" aria-label={calendarView === "month" ? "Agenda mensal" : "Agenda semanal"}>
        <aside className="calendar-sidebar" aria-label="Resumo da agenda">
          <div className="calendar-sidebar-heading">
            <p>{monthLabel}</p>
            <div>
              <button type="button" onClick={goToPreviousPeriod} aria-label="Período anterior">‹</button>
              <button type="button" onClick={goToNextPeriod} aria-label="Próximo período">›</button>
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
            <div><span>{calendarView === "month" ? "Mês" : "Semana"}</span><strong>{(calendarView === "month" ? allCalendarItems.filter((item) => localDate(item.date).getMonth() === visibleMonth.getMonth() && localDate(item.date).getFullYear() === visibleMonth.getFullYear()) : calendarItems).filter((item) => item.type === "appointment").length}</strong></div>
            <div><span>Bloqueios</span><strong>{(calendarView === "month" ? allCalendarItems.filter((item) => localDate(item.date).getMonth() === visibleMonth.getMonth() && localDate(item.date).getFullYear() === visibleMonth.getFullYear()) : calendarItems).filter((item) => item.type === "block").length}</strong></div>
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
              <button type="button" onClick={goToPreviousPeriod} aria-label="Período anterior">‹</button>
              <button type="button" onClick={goToToday}>Hoje</button>
              <button type="button" onClick={goToNextPeriod} aria-label="Próximo período">›</button>
              <strong className="calendar-current-range">{viewTitle}</strong>
            </div>
            <div className="calendar-view-tabs" aria-label="Visualização da agenda">
              <button
                className={calendarView === "week" ? "is-active" : ""}
                type="button"
                onClick={() => switchView("week")}
              >
                Semana
              </button>
              <button
                className={calendarView === "month" ? "is-active" : ""}
                type="button"
                onClick={() => switchView("month")}
              >
                Mês
              </button>
            </div>
            <label className="calendar-search">
              <span>Buscar</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Paciente, profissional ou status" />
            </label>
            <div className="calendar-filter-row" aria-label="Filtros da agenda">
              <select value={professionalFilter} onChange={(event) => setProfessionalFilter(event.target.value)} aria-label="Filtrar por profissional">
                <option value="all">Profissionais</option>
                {professionalOptions.map(([professionalId, professionalName]) => (
                  <option key={professionalId} value={professionalId}>{professionalName}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por status">
                <option value="all">Status</option>
                <option value="SCHEDULED">Agendada</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="IN_PROGRESS">Em atendimento</option>
                <option value="COMPLETED">Concluída</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="NO_SHOW">Faltou</option>
              </select>
              <select value={modalityFilter} onChange={(event) => setModalityFilter(event.target.value)} aria-label="Filtrar por modalidade">
                <option value="all">Modalidades</option>
                <option value="IN_PERSON">Presencial</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Híbrida</option>
              </select>
            </div>
          </div>

          {calendarView === "week" ? (
          <div className="week-calendar" style={{ "--hour-height": `${HOUR_HEIGHT}px` } as CSSProperties}>
            <div className="week-header" style={{ gridTemplateColumns: `4.6rem repeat(7, minmax(8.4rem, 1fr))` }}>
              <span />
              {days.map((day) => (
                <div className={dateKey(day) === today ? "is-today" : ""} key={dateKey(day)}>
                  <span>{weekDays[day.getDay()]}</span>
                  <strong><span>{day.getDate()}</span></strong>
                </div>
              ))}
            </div>
            <div className="week-body" style={{ gridTemplateColumns: `4.6rem repeat(7, minmax(8.4rem, 1fr))` }}>
              <div className="time-gutter">
                {hours.map((hour) => <span key={hour}>{String(hour).padStart(2, "0")}:00</span>)}
              </div>
              {days.map((day) => {
                const key = dateKey(day);
                const dayItems = calendarItems.filter((item) => item.date === key);
                const dayItemLayouts = layoutCalendarEvents(dayItems);
                return (
                  <div className={`calendar-day-column ${key === today ? "is-today" : ""}`} key={key} onClick={(event) => openCreateAppointmentAt(day, event)} title="Clique em um horário vazio para agendar">
                    {dayItems.map((item) => {
                      const layout = dayItemLayouts.get(item);
                      return (
                        <article
                          className={`calendar-event ${durationMinutes(item) < 60 ? "is-compact" : ""} ${(layout?.stackedStartCount ?? 0) > 1 ? "is-start-stacked" : ""} ${item.type === "block" ? "is-block" : ""} ${item.modality === "ONLINE" ? "is-online" : ""}`}
                          key={`${item.type}-${item.id}`}
                          style={{
                            height: `${layout?.height ?? 0}px`,
                            left: `calc(${layout?.leftPercent ?? 0}% + 4px)`,
                            right: "auto",
                            top: `${layout?.top ?? 0}px`,
                            width: `calc(${layout?.widthPercent ?? 100}% - 8px)`,
                          }}
                        >
                          {item.type === "appointment" ? (
                            <button className="calendar-event-link" type="button" onClick={(event) => openEventPopover(item, event)} aria-label={`Abrir consulta de ${item.title}`}>
                              <time>{item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}</time>
                              <strong>{item.title}</strong>
                              <span>{item.subtitle}</span>
                              <small>{statusLabel(item.status ?? "SCHEDULED")}</small>
                            </button>
                          ) : (
                            <button className="calendar-event-link" type="button" onClick={(event) => openEventPopover(item, event)} aria-label={`Abrir bloqueio ${item.title}`}>
                              <time>{item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}</time>
                              <strong>{item.title}</strong>
                              <span>{item.subtitle}</span>
                              <small>Bloqueio</small>
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          ) : (
            <div className="month-calendar" aria-label={`Calendário de ${monthLabel}`}>
              <div className="month-weekdays">
                {weekDays.map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="month-grid">
                {monthGridDays.map((day) => {
                  const key = dateKey(day);
                  const dayItems = allCalendarItems
                    .filter((item) => item.date === key)
                    .sort((a, b) => a.start_time.localeCompare(b.start_time));
                  const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                  return (
                    <section className={`month-day ${key === today ? "is-today" : ""} ${!isCurrentMonth ? "is-outside" : ""}`} key={key} aria-label={formatDate(key)}>
                      <button type="button" onClick={() => { setWeekStart(startOfWeek(day)); setCalendarView("week"); }}>
                        {day.getDate()}
                      </button>
                      <div className="month-day-events">
                        {dayItems.slice(0, 3).map((item) => item.type === "appointment" ? (
                          <Link className={`month-event ${item.modality === "ONLINE" ? "is-online" : ""}`} href={`/clinics/${id}/appointments/${item.id}`} key={`${item.type}-${item.id}`}>
                            <time>{item.start_time.slice(0, 5)}</time>
                            <span>{item.title}</span>
                          </Link>
                        ) : (
                          <span className="month-event is-block" key={`${item.type}-${item.id}`}>
                            <time>{item.start_time.slice(0, 5)}</time>
                            <span>{item.title}</span>
                          </span>
                        ))}
                        {dayItems.length > 3 ? <small>+{dayItems.length - 3} mais</small> : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {eventPopover ? (
        <div className="event-popover-layer" role="presentation" onMouseDown={closeEventPopover}>
          <article
            className="event-popover"
            role="dialog"
            aria-label={eventPopover.item.type === "appointment" ? "Detalhes da consulta" : "Detalhes do bloqueio"}
            style={{ left: `${eventPopover.x}px`, top: `${eventPopover.y}px` }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="event-popover-actions" aria-label="Ações do evento">
              {eventPopover.item.type === "appointment" ? (
                <Link href={`/clinics/${id}/appointments/${eventPopover.item.id}`} aria-label="Editar consulta">Editar</Link>
              ) : null}
              {eventPopover.item.type === "appointment" ? (
                <button type="button" onClick={handleCancelSelectedAppointment} disabled={isCancellingAppointment} aria-label="Excluir consulta">Excluir</button>
              ) : null}
              {selectedPatient?.email ? <a href={`mailto:${selectedPatient.email}`} aria-label="Enviar e-mail">E-mail</a> : <button type="button" disabled aria-label="Enviar e-mail">E-mail</button>}
              <div className="event-popover-menu-wrap">
                <button type="button" onClick={toggleEventMenu} aria-expanded={eventPopover.menuOpen} aria-label="Mais opções">Mais</button>
                {eventPopover.menuOpen ? (
                  <div className="event-popover-menu" role="menu">
                    <button type="button" role="menuitem" onClick={() => window.print()}>Imprimir</button>
                    {eventPopover.item.type === "appointment" ? <button type="button" role="menuitem" onClick={duplicateEventDraft}>Duplicar</button> : null}
                    <button type="button" role="menuitem" onClick={copyEventSummary}>Copiar resumo</button>
                    {eventPopover.item.type === "appointment" ? <Link role="menuitem" href={`/clinics/${id}/appointments/${eventPopover.item.id}`}>Publicar evento</Link> : null}
                    {selectedProfessional ? <Link role="menuitem" href={`/clinics/${id}/professionals/${selectedProfessional.id}`}>Alterar responsável</Link> : null}
                  </div>
                ) : null}
              </div>
              <button type="button" onClick={closeEventPopover} aria-label="Fechar">x</button>
            </div>

            <div className="event-popover-body">
              <span className={`event-popover-color ${eventPopover.item.type === "block" ? "is-block" : ""}`} aria-hidden="true" />
              <div>
                <h3>{eventPopover.item.title}</h3>
                <p>{formatDate(eventPopover.item.date)} · {eventPopover.item.start_time.slice(0, 5)} às {eventPopover.item.end_time.slice(0, 5)}</p>
                {selectedAppointment ? <p>{modalityLabel(selectedAppointment.modality)} · {statusLabel(selectedAppointment.status)}</p> : <p>Bloqueio de agenda</p>}
              </div>
            </div>

            {eventPopover.item.type === "appointment" ? (
              <div className="event-popover-info">
                <span aria-hidden="true">Lembrete</span>
                <p>30 minutos antes</p>
              </div>
            ) : null}

            {eventPopover.item.type === "appointment" ? (
              <div className="event-popover-info event-popover-person">
                <span aria-hidden="true">Paciente</span>
                <button type="button" onClick={toggleEventContact} aria-expanded={eventPopover.contactOpen}>
                  {selectedPatient?.full_name ?? eventPopover.item.title}
                </button>
              </div>
            ) : (
              <div className="event-popover-info">
                <span aria-hidden="true">Prof.</span>
                <p>{eventPopover.item.subtitle}</p>
              </div>
            )}

            {selectedAppointment?.administrative_notes ? (
              <div className="event-popover-notes">
                {selectedAppointment.administrative_notes}
              </div>
            ) : null}

            {eventPopover.contactOpen && selectedPatient ? (
              <aside className="event-contact-card" aria-label="Contato do paciente">
                <div className="event-contact-card-header">
                  <div className="event-contact-avatar">{selectedPatient.full_name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong>{selectedPatient.full_name}</strong>
                    <span>{selectedPatient.email || "E-mail não informado"}</span>
                  </div>
                  <Link href={`/clinics/${id}/patients/${selectedPatient.id}`} aria-label="Editar paciente">Editar</Link>
                </div>
                <div className="event-contact-actions">
                  {selectedPatient.email ? <a href={`mailto:${selectedPatient.email}`}>Enviar e-mail</a> : <button type="button" disabled>Enviar e-mail</button>}
                  {selectedPatient.phone ? <a href={`tel:${selectedPatient.phone}`}>Ligar</a> : <button type="button" disabled>Ligar</button>}
                </div>
                <p>{selectedPatient.profession || selectedPatient.occupation || "Paciente"}</p>
                <p>{selectedPatient.phone || "Telefone não informado"}</p>
                <Link href={`/clinics/${id}/patients/${selectedPatient.id}`}>Abrir visualização detalhada</Link>
              </aside>
            ) : null}
          </article>
        </div>
      ) : null}

      {appointmentDraft ? (
        <div className="quick-appointment-backdrop" role="presentation" onMouseDown={closeAppointmentModal}>
          <section className="quick-appointment-modal" aria-labelledby="quick-appointment-title" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="quick-appointment-header">
              <span aria-hidden="true">=</span>
              <button type="button" onClick={closeAppointmentModal} aria-label="Fechar agendamento rápido">x</button>
            </div>

            <form className="quick-appointment-form" onSubmit={handleQuickAppointmentSubmit}>
              <input className="quick-appointment-title" id="quick-appointment-title" value="Nova consulta" readOnly aria-label="Nova consulta" />

              <div className="quick-appointment-tabs" aria-label="Tipo de agendamento">
                <span className="is-active">Consulta</span>
                <span>Bloqueio</span>
                <span>Retorno</span>
              </div>

              {modalError ? <div className="alert" role="alert" aria-live="assertive">{modalError}</div> : null}

              <div className="quick-appointment-row">
                <span aria-hidden="true">Hora</span>
                <div className="quick-appointment-time-grid">
                  <label>
                    <span>Data</span>
                    <input name="date" type="date" required defaultValue={appointmentDraft.date} />
                  </label>
                  <label>
                    <span>Início</span>
                    <input name="start_time" type="time" required defaultValue={appointmentDraft.start_time} />
                  </label>
                  <label>
                    <span>Fim</span>
                    <input name="end_time" type="time" required defaultValue={appointmentDraft.end_time} />
                  </label>
                </div>
              </div>

              <label className="quick-appointment-row">
                <span aria-hidden="true">Paciente</span>
                <select name="patient" required defaultValue="">
                  <option value="">Selecionar paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                  ))}
                </select>
              </label>

              <label className="quick-appointment-row">
                <span aria-hidden="true">Prof.</span>
                <select name="professional" required defaultValue={appointmentDraft.professional}>
                  <option value="">Selecionar profissional</option>
                  {professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>{professional.full_name}</option>
                  ))}
                </select>
              </label>

              <label className="quick-appointment-row">
                <span aria-hidden="true">Modo</span>
                <select name="modality" defaultValue="IN_PERSON">
                  <option value="IN_PERSON">Presencial</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Híbrida</option>
                </select>
              </label>

              <label className="quick-appointment-row">
                <span aria-hidden="true">R$</span>
                <input name="value" type="number" min="0" step="0.01" defaultValue="0" placeholder="Valor" />
              </label>

              <label className="quick-appointment-row">
                <span aria-hidden="true">Nota</span>
                <textarea name="administrative_notes" rows={3} placeholder="Observações administrativas" />
              </label>

              <div className="quick-appointment-footer">
                <Link href={`/clinics/${id}/appointments/new?date=${appointmentDraft.date}&start_time=${appointmentDraft.start_time}&end_time=${appointmentDraft.end_time}`} className="text-link">
                  Mais opções
                </Link>
                <button className="button-primary button-compact" type="submit" disabled={isSavingAppointment || !patients.length || !professionals.length}>
                  {isSavingAppointment ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
