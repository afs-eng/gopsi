"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { deletePatient, getClinic, getPatient } from "@/lib/api";
import type { Clinic, Patient } from "@/lib/types";
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

export function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id, patientId } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const [isDeleting, startDeleting] = useTransition();

  useEffect(() => {
    if (!user) return;

    Promise.all([getClinic(id), getPatient(patientId)])
      .then(([clinicData, patientData]) => {
        setClinic(clinicData);
        setPatient(patientData);
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
      <section className="patient-detail-hero panel-card" aria-labelledby="patient-detail-title">
        <div className="patient-detail-avatar" aria-hidden="true">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="eyebrow">Nome do paciente</p>
          <h2 id="patient-detail-title">{displayName}</h2>
          {patient.social_name ? <p className="muted">Nome civil: {patient.full_name}</p> : null}
          <div className="patient-detail-badges" aria-label="Dados principais do paciente">
            <span className="status-badge">{patientStatus(patient.status)}</span>
            <span>{patient.email || "E-mail não informado"}</span>
            <span>{patient.phone || "Telefone não informado"}</span>
          </div>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Resumo do paciente">
        <MetricCard label="Nascimento" value={formatDate(patient.birth_date)} description={`Sexo: ${sexLabel(patient.sex)}`} />
        <MetricCard label="Responsáveis" value={activeGuardians.length} description="Contatos autorizados vinculados ao paciente." />
        <MetricCard label="Profissional principal" value={primaryProfessional?.professional_name || "Não definido"} description="Vínculo clínico de referência." />
      </section>

      <section className="patient-detail-grid">
        <article className="panel-card patient-journey-card patient-journey-card-full">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Fluxo clínico</p>
              <h2>Próximas ações</h2>
              <p className="muted">Parta do paciente para agenda, prontuário, documentos, financeiro e avaliação psicológica.</p>
            </div>
          </div>
          <div className="patient-journey-actions">
            <Link href={`/clinics/${id}/appointments/new`}>
              <strong>Agenda</strong>
              <span>Marcar sessão presencial ou online.</span>
            </Link>
            <Link href={`/clinics/${id}/medical-records`}>
              <strong>Prontuário</strong>
              <span>Registrar evolução, anamnese e plano terapêutico.</span>
            </Link>
            <Link href={`/clinics/${id}/documents/new`}>
              <strong>Documento</strong>
              <span>Preparar declaração, relatório, parecer ou laudo.</span>
            </Link>
            <Link href={`/clinics/${id}/billing`}>
              <strong>Financeiro</strong>
              <span>Acompanhar pagamentos e pendências.</span>
            </Link>
            <Link href={`/clinics/${id}/assessments/new`}>
              <strong>Avaliação psicológica</strong>
              <span>Organizar instrumentos, resultados e síntese integrativa.</span>
            </Link>
          </div>
        </article>

      </section>

      <section className="patient-detail-grid">
        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Cadastro</p>
              <h2>Dados de contato</h2>
            </div>
          </div>
          <dl className="patient-data-list">
            <div><dt>CPF</dt><dd>{patient.cpf || "Não informado"}</dd></div>
            <div><dt>E-mail</dt><dd>{patient.email || "Não informado"}</dd></div>
            <div><dt>Telefone</dt><dd>{patient.phone || "Não informado"}</dd></div>
            <div><dt>Endereço</dt><dd>{patient.address || "Não informado"}</dd></div>
            <div><dt>Contato de emergência</dt><dd>{patient.emergency_contact_name || "Não informado"}</dd></div>
            <div><dt>Telefone de emergência</dt><dd>{patient.emergency_contact_phone || "Não informado"}</dd></div>
          </dl>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Rede de cuidado</p>
              <h2>Responsáveis e profissionais</h2>
            </div>
          </div>
          <div className="patient-related-list">
            <h3>Responsáveis</h3>
            {activeGuardians.length ? activeGuardians.map((guardian) => (
              <div key={guardian.id}>
                <strong>{guardian.full_name}</strong>
                <span>{guardian.relationship} · {guardian.phone || guardian.email || "Contato não informado"}</span>
              </div>
            )) : <p className="muted">Nenhum responsável ativo cadastrado.</p>}
            <h3>Profissionais vinculados</h3>
            {patient.professional_links.length ? patient.professional_links.map((link) => (
              <div key={link.id}>
                <strong>
                  <Link className="patient-name-link" href={`/clinics/${id}/professionals/${link.professional}`}>
                    {link.professional_name}
                  </Link>
                </strong>
                <span>{link.is_primary ? "Profissional principal" : "Profissional vinculado"}</span>
              </div>
            )) : <p className="muted">Nenhum profissional vinculado.</p>}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
