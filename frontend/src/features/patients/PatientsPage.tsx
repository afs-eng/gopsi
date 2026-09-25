"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { getClinic, listPatients } from "@/lib/api";
import type { Clinic, Patient } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type PatientsPageProps = {
  params: Promise<{ id: string }>;
};

export function PatientsPage({ params }: PatientsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Patient["status"]>("ALL");
  const [professionalFilter, setProfessionalFilter] = useState("ALL");

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), listPatients(id)])
      .then(([clinicData, patientsData]) => {
        setClinic(clinicData);
        setPatients(patientsData);
      })
      .catch(() => setError("Não foi possível carregar os pacientes."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error || !clinic) {
    return (
      <AppShell activeNav="patients" eyebrow="Pacientes" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  const patientStatus = (status: string) =>
    ({ ACTIVE: "Ativo", INACTIVE: "Inativo", ARCHIVED: "Arquivado" }[status] ?? status);
  const professionalOptions = Array.from(new Map(patients.flatMap((patient) => patient.professional_links.map((link) => [link.professional, link.professional_name] as const))).entries())
    .sort((a, b) => a[1].localeCompare(b[1]));
  const normalizedSearch = search.trim().toLowerCase();
  const hasSearchQuery = normalizedSearch.length >= 2;
  const hasActivePatientQuery = hasSearchQuery || statusFilter !== "ALL" || professionalFilter !== "ALL";
  const filteredPatients = patients.filter((patient) => {
    const matchesStatus = statusFilter === "ALL" || patient.status === statusFilter;
    const matchesProfessional = professionalFilter === "ALL" || patient.professional_links.some((link) => link.professional === professionalFilter);
    const searchableFields = [
      patient.full_name,
      patient.social_name,
      patient.email,
      patient.phone,
      patient.cpf,
    ];
    const matchesSearch = !hasSearchQuery || searchableFields
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));

    return matchesStatus && matchesProfessional && matchesSearch;
  });

  return (
    <AppShell
      activeNav="patients"
      currentClinic={clinic}
      eyebrow="Cadastro protegido"
      title="Pacientes"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/patients/new`}>
          Novo paciente
        </Link>
      }
    >
      <section className="panel-card patients-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cadastro</p>
            <h2>Pacientes vinculados</h2>
            <p className="muted">Acompanhe os cadastros administrativos e acesse o prontuário da clínica.</p>
          </div>
          <span className="panel-pill">{hasActivePatientQuery ? `${filteredPatients.length} encontrado(s)` : `${patients.length} cadastrado(s)`}</span>
        </div>

        <div className="patients-toolbar" aria-label="Filtros de pacientes">
          <label className="patients-search-field">
            <span>Buscar paciente</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Digite ao menos 2 caracteres"
            />
          </label>
          <label className="patients-filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | Patient["status"])}
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
              <option value="ARCHIVED">Arquivados</option>
            </select>
          </label>
          <label className="patients-filter-field">
            <span>Profissional</span>
            <select
              value={professionalFilter}
              onChange={(event) => setProfessionalFilter(event.target.value)}
            >
              <option value="ALL">Todos</option>
              {professionalOptions.map(([professionalId, professionalName]) => (
                <option key={professionalId} value={professionalId}>{professionalName}</option>
              ))}
            </select>
          </label>
        </div>

        {hasActivePatientQuery && filteredPatients.length ? (
          <div className="clinic-list patients-list">
            <div className="patients-list-header" aria-hidden="true">
              <span>Paciente</span>
              <span>Contato</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {filteredPatients.map((patient) => {
              const socialName = patient.social_name.trim();
              const showSocialName = socialName && socialName.toLowerCase() !== patient.full_name.trim().toLowerCase();
              const patientSubtitle = showSocialName
                ? `Nome social: ${socialName}`
                : patient.professional_links[0]?.professional_name || "Sem profissional vinculado";

              return (
                <article className="clinic-row patient-row" key={patient.id}>
                  <div className="patient-identity">
                    <span className="patient-avatar" aria-hidden="true">
                      {patient.full_name.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <strong>
                        <Link className="patient-name-link" href={`/clinics/${id}/patients/${patient.id}`}>
                          {patient.full_name}
                        </Link>
                      </strong>
                      <p>{patientSubtitle}</p>
                    </div>
                  </div>
                  <div className="patient-contact">
                    <span>{patient.email ? patient.email : patient.phone ? patient.phone : "Contato não informado"}</span>
                    <small>{patient.guardians.length ? `${patient.guardians.length} responsável(is)` : "Sem responsável"}</small>
                  </div>
                  <span className="status-badge" aria-label={`Status: ${patientStatus(patient.status)}`}>
                    {patientStatus(patient.status)}
                  </span>
                  <div className="row-actions patient-actions">
                    <Link className="button-secondary button-compact" href={`/clinics/${id}/patients/${patient.id}`} aria-label={`Abrir resumo de ${patient.full_name}`}>
                      Resumo
                    </Link>
                    <Link className="button-secondary button-compact" href={`/clinics/${id}/appointments/new`} aria-label={`Agendar consulta para ${patient.full_name}`}>
                      Agendar
                    </Link>
                    <Link className="button-secondary button-compact" href={`/clinics/${id}/medical-records`} aria-label="Abrir lista de prontuários da clínica">
                      Prontuário
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : hasActivePatientQuery && patients.length ? (
          <div className="empty-state">
            <h3>Nenhum paciente encontrado</h3>
            <p>Ajuste a busca ou os filtros para localizar outro cadastro.</p>
          </div>
        ) : patients.length ? null : (
          <div className="empty-state">
            <h3>Nenhum paciente cadastrado</h3>
            <p>Cadastre dados administrativos antes de avançar para agenda.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/patients/new`}>
              Cadastrar paciente
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
