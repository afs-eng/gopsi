"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import {
  deletePatient,
  getClinic,
  getPatient,
  listAppointments,
  listGeneratedDocuments,
  listInvoices,
  listMedicalRecords,
  listPsychologicalAssessments,
} from "@/lib/api";
import type {
  Appointment,
  Clinic,
  GeneratedDocument,
  Invoice,
  MedicalRecordEntry,
  Patient,
  PsychologicalAssessment,
} from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type PatientDetailPageProps = {
  params: Promise<{ id: string; patientId: string }>;
};

function patientStatus(status: Patient["status"]) {
  return { ACTIVE: "Ativo", ARCHIVED: "Arquivado", INACTIVE: "Inativo" }[status];
}

function sexLabel(sex: Patient["sex"]) {
  return {
    FEMALE: "Feminino",
    MALE: "Masculino",
    NOT_INFORMED: "Não informado",
    OTHER: "Outro",
  }[sex];
}

function formatDate(date: string | null) {
  if (!date) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(Number(value));
}

function calculateAge(date: string | null) {
  if (!date) return "--";
  const birthDate = new Date(`${date}T12:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? `${age} anos` : "--";
}

export function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id, patientId } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordEntry[]>([]);
  const [assessments, setAssessments] = useState<PsychologicalAssessment[]>([]);
  const [error, setError] = useState("");
  const [isDeleting, startDeleting] = useTransition();

  useEffect(() => {
    if (!user) return;

    Promise.all([
      getClinic(id),
      getPatient(patientId),
      listAppointments(id, patientId),
      listGeneratedDocuments(id, patientId),
      listInvoices(id, patientId),
      listMedicalRecords(id, patientId),
      listPsychologicalAssessments(id, patientId),
    ])
      .then(([clinicData, patientData, appointmentsData, documentsData, invoicesData, recordsData, assessmentsData]) => {
        setClinic(clinicData);
        setPatient(patientData);
        setAppointments(appointmentsData);
        setDocuments(documentsData);
        setInvoices(invoicesData);
        setMedicalRecords(recordsData);
        setAssessments(assessmentsData);
      })
      .catch(() => setError("Não foi possível carregar o paciente."));
  }, [id, patientId, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error || !clinic || !patient) {
    return (
      <AppShell activeNav="patients" eyebrow="Paciente" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Paciente não encontrado."}</div>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/patients`}>
            Voltar para pacientes
          </Link>
        </section>
      </AppShell>
    );
  }

  const displayName = patient.social_name || patient.full_name;
  const primaryProfessional = patient.professional_links.find((link) => link.is_primary);
  const activeGuardians = patient.guardians.filter((guardian) => guardian.is_active);
  const mainGuardian = activeGuardians[0];
  const today = new Date().toISOString().slice(0, 10);
  const nextAppointment = appointments
    .filter((appointment) => appointment.date >= today && appointment.status !== "CANCELLED")
    .sort((first, second) => `${first.date} ${first.start_time}`.localeCompare(`${second.date} ${second.start_time}`))[0];
  const openInvoices = invoices.filter((invoice) => ["DRAFT", "OPEN", "OVERDUE"].includes(invoice.status));
  const openAmount = openInvoices.reduce((total, invoice) => total + Number(invoice.amount), 0);

  function handleDeletePatient() {
    if (!patient) return;

    const confirmed = window.confirm(`Excluir ${displayName} da lista de pacientes?`);
    if (!confirmed) return;

    setError("");
    startDeleting(async () => {
      try {
        await deletePatient(patient.id);
        router.replace(`/clinics/${id}/patients`);
      } catch {
        setError("Não foi possível excluir o paciente.");
      }
    });
  }

  return (
    <AppShell
      activeNav="patients"
      currentClinic={clinic}
      eyebrow="Cadastro do paciente"
      title={displayName}
      user={user}
      actions={
        <>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/patients`}>
            Pacientes
          </Link>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/patients/${patient.id}/edit`}>
            Atualizar paciente
          </Link>
          <button className="button-secondary button-compact" type="button" onClick={handleDeletePatient} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
          <Link className="button-primary button-compact" href={`/clinics/${id}/appointments/new`}>
            Agendar consulta
          </Link>
        </>
      }
    >
      <section className="patient-profile-page">
        <div className="patient-profile-breadcrumb">
          <Link href={`/clinics/${id}/patients`}>Pacientes</Link>
          <span>/</span>
          <strong>{displayName}</strong>
        </div>

        <section className="patient-profile-hero panel-card" aria-labelledby="patient-detail-title">
          <div className="patient-profile-main">
            <div className="patient-profile-avatar" aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="patient-profile-title-row">
                <h2 id="patient-detail-title">{displayName}</h2>
                <span className="status-badge">{patientStatus(patient.status)}</span>
              </div>
              <p>{calculateAge(patient.birth_date)} · {formatDate(patient.birth_date)} · {sexLabel(patient.sex)}</p>
            </div>
          </div>
          <div className="patient-profile-contact">
            <div><strong>{patient.phone || "Telefone não informado"}</strong><span>Telefone</span></div>
            <div><strong>{patient.email || "E-mail não informado"}</strong><span>E-mail</span></div>
          </div>
        </section>

        <nav className="patient-profile-tabs" aria-label="Áreas do paciente">
          <span className="is-active">Visão geral</span>
          <a href="#patient-agenda">Agenda</a>
          <a href="#patient-records">Prontuário</a>
          <a href="#patient-documents">Documentos</a>
          <a href="#patient-assessments">Avaliação psicológica</a>
          <a href="#patient-billing">Financeiro</a>
        </nav>

        {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        <section className="patient-profile-grid">
          <article className="panel-card patient-profile-card">
            <div className="panel-heading">
              <div><p className="eyebrow">Cadastro</p><h2>Dados do paciente</h2></div>
              <Link className="button-secondary button-compact" href={`/clinics/${id}/patients/${patient.id}/edit`}>Editar</Link>
            </div>
            <dl className="patient-profile-list">
              <div><dt>Nome completo</dt><dd>{patient.full_name}</dd></div>
              <div><dt>Data de nascimento</dt><dd>{formatDate(patient.birth_date)}</dd></div>
              <div><dt>Idade</dt><dd>{calculateAge(patient.birth_date)}</dd></div>
              <div><dt>Sexo</dt><dd>{sexLabel(patient.sex)}</dd></div>
              <div><dt>Estado civil</dt><dd>{patient.marital_status || "-"}</dd></div>
              <div><dt>Profissão</dt><dd>{patient.profession || "-"}</dd></div>
              <div><dt>Escolaridade</dt><dd>{patient.education || "-"}</dd></div>
              <div><dt>Responsável</dt><dd>{mainGuardian ? `${mainGuardian.full_name} (${mainGuardian.relationship})` : "-"}</dd></div>
            </dl>
          </article>

          <article className="panel-card patient-profile-card">
            <div className="panel-heading">
              <div><p className="eyebrow">Contato</p><h2>Contato e endereço</h2></div>
              <Link className="button-secondary button-compact" href={`/clinics/${id}/patients/${patient.id}/edit`}>Editar</Link>
            </div>
            <dl className="patient-profile-list">
              <div><dt>Telefone</dt><dd>{patient.phone || "-"}</dd></div>
              <div><dt>E-mail</dt><dd>{patient.email || "-"}</dd></div>
              <div><dt>Endereço</dt><dd>{patient.address || "-"}</dd></div>
              <div><dt>Contato de emergência</dt><dd>{patient.emergency_contact_name || "-"}</dd></div>
              <div><dt>Telefone de emergência</dt><dd>{patient.emergency_contact_phone || "-"}</dd></div>
              <div><dt>Profissional principal</dt><dd>{primaryProfessional?.professional_name || "-"}</dd></div>
            </dl>
          </article>
        </section>

        <section className="patient-profile-stat-grid" aria-label="Resumo operacional">
          <article className="panel-card patient-profile-stat"><strong>{nextAppointment ? formatDate(nextAppointment.date) : "Não agendada"}</strong><span>Próxima consulta</span><Link href={`/clinics/${id}/appointments/new`}>Agendar agora</Link></article>
          <article className="panel-card patient-profile-stat"><strong>{documents.length}</strong><span>Documentos</span><Link href={`/clinics/${id}/documents`}>Ver documentos</Link></article>
          <article className="panel-card patient-profile-stat"><strong>{assessments.length}</strong><span>Avaliações</span><Link href={`/clinics/${id}/assessments`}>Ver avaliações</Link></article>
        </section>

        <section className="patient-profile-grid">
          <article className="panel-card patient-profile-card" id="patient-agenda">
            <div className="panel-heading">
              <div><p className="eyebrow">Agenda</p><h2>Consultas</h2></div>
              <Link className="button-secondary button-compact" href={`/clinics/${id}/appointments/new`}>Nova consulta</Link>
            </div>
            {appointments.length ? (
              <dl className="patient-profile-list">
                {appointments.slice(0, 4).map((appointment) => (
                  <div key={appointment.id}><dt>{formatDate(appointment.date)}</dt><dd>{appointment.start_time.slice(0, 5)} · {appointment.professional_name} · {appointment.status}</dd></div>
                ))}
              </dl>
            ) : <div className="empty-state"><h3>Nenhuma consulta registrada.</h3><p>Agende o primeiro atendimento deste paciente.</p></div>}
          </article>

          <article className="panel-card patient-profile-card" id="patient-records">
            <div className="panel-heading">
              <div><p className="eyebrow">Prontuário</p><h2>Registros clínicos</h2></div>
              <Link className="button-secondary button-compact" href={`/clinics/${id}/medical-records/new`}>Novo registro</Link>
            </div>
            {medicalRecords.length ? (
              <dl className="patient-profile-list">
                {medicalRecords.slice(0, 4).map((record) => (
                  <div key={record.id}><dt>{formatDate(record.created_at.slice(0, 10))}</dt><dd>{record.entry_type} · {record.status}</dd></div>
                ))}
              </dl>
            ) : <div className="empty-state"><h3>Nenhum registro clínico.</h3><p>O histórico clínico aparecerá aqui.</p></div>}
          </article>

          <article className="panel-card patient-profile-card" id="patient-documents">
            <div className="panel-heading">
              <div><p className="eyebrow">Documentos</p><h2>Documentos gerados</h2></div>
              <Link className="button-secondary button-compact" href={`/clinics/${id}/documents/new`}>Novo documento</Link>
            </div>
            {documents.length ? (
              <dl className="patient-profile-list">
                {documents.slice(0, 4).map((document) => (
                  <div key={document.id}><dt>{document.status}</dt><dd>{document.title}</dd></div>
                ))}
              </dl>
            ) : <div className="empty-state"><h3>Nenhum documento gerado.</h3><p>Declarações, recibos e relatórios aparecerão aqui.</p></div>}
          </article>

          <article className="panel-card patient-profile-card" id="patient-assessments">
            <div className="panel-heading">
              <div><p className="eyebrow">Avaliação</p><h2>Avaliações psicológicas</h2></div>
              <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments/new`}>Nova avaliação</Link>
            </div>
            {assessments.length ? (
              <dl className="patient-profile-list">
                {assessments.slice(0, 4).map((assessment) => (
                  <div key={assessment.id}><dt>{assessment.status}</dt><dd>{assessment.title}</dd></div>
                ))}
              </dl>
            ) : <div className="empty-state"><h3>Nenhuma avaliação registrada.</h3><p>Acompanhe avaliações e devolutivas deste paciente.</p></div>}
          </article>
        </section>

        <section className="panel-card patient-profile-card" id="patient-billing">
          <div className="panel-heading">
            <div><p className="eyebrow">Financeiro</p><h2>Cobranças do paciente</h2></div>
            <Link className="button-secondary button-compact" href={`/clinics/${id}/billing/new`}>Nova cobrança</Link>
          </div>
          {invoices.length ? (
            <dl className="patient-profile-list">
              <div><dt>Pendências abertas</dt><dd>{openInvoices.length} · {formatCurrency(String(openAmount))}</dd></div>
              {invoices.slice(0, 4).map((invoice) => (
                <div key={invoice.id}><dt>{invoice.status}</dt><dd>{invoice.description} · {formatCurrency(invoice.amount)}</dd></div>
              ))}
            </dl>
          ) : <div className="empty-state"><h3>Nenhuma cobrança registrada.</h3><p>As pendências financeiras do paciente aparecerão aqui.</p></div>}
        </section>

        <section className="panel-card patient-profile-observations">
          <div className="panel-heading">
            <div><p className="eyebrow">Observações</p><h2>Observações</h2></div>
            <Link className="button-secondary button-compact" href={`/clinics/${id}/patients/${patient.id}/edit`}>Editar</Link>
          </div>
          <div className="empty-state">
            <h3>Nenhuma observação registrada.</h3>
            <p>Utilize este espaço para informações importantes sobre o paciente.</p>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
