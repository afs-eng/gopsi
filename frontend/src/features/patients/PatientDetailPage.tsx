"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import {
  deletePatient,
  getClinic,
  getPatient,
} from "@/lib/api";
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
  const mainGuardian = activeGuardians[0];
  const patientQuery = `?patient=${patient.id}`;

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
          <Link className="button-secondary button-compact" href={`/clinics/${id}/medical-records${patientQuery}`}>
            Prontuário
          </Link>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/documents${patientQuery}`}>
            Documento
          </Link>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments${patientQuery}`}>
            Avaliação
          </Link>
          <Link className="button-primary button-compact" href={`/clinics/${id}/appointments/new${patientQuery}`}>
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
          <Link href={`/clinics/${id}/appointments${patientQuery}`}>Agenda</Link>
          <Link href={`/clinics/${id}/medical-records${patientQuery}`}>Prontuário</Link>
          <Link href={`/clinics/${id}/documents${patientQuery}`}>Documentos</Link>
          <Link href={`/clinics/${id}/assessments${patientQuery}`}>Avaliação psicológica</Link>
          <Link href={`/clinics/${id}/billing${patientQuery}`}>Financeiro</Link>
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

      </section>
    </AppShell>
  );
}
