"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
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

  const activePatients = patients.filter((patient) => patient.is_active).length;
  const archivedPatients = patients.filter((patient) => patient.status === "ARCHIVED").length;
  const patientStatus = (status: string) =>
    ({ ACTIVE: "Ativo", INACTIVE: "Inativo", ARCHIVED: "Arquivado" }[status] ?? status);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredPatients = patients.filter((patient) => {
    const matchesStatus = statusFilter === "ALL" || patient.status === statusFilter;
    const searchableFields = [
      patient.full_name,
      patient.social_name,
      patient.email,
      patient.phone,
      patient.cpf,
    ];
    const matchesSearch = !normalizedSearch || searchableFields
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));

    return matchesStatus && matchesSearch;
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
      <section className="metrics-grid" aria-label="Resumo de pacientes">
        <MetricCard
          label="Pacientes ativos"
          value={activePatients}
          description="Cadastros disponíveis para agenda e prontuário."
        />
        <MetricCard
          label="Arquivados"
          value={archivedPatients}
          description="Histórico preservado sem poluir a rotina diária."
        />
        <MetricCard
          label="Fluxo clínico"
          value="Paciente -> cuidado"
          description="Agenda, prontuário, documentos, financeiro e avaliações."
        />
      </section>

      <section className="panel-card patient-flow-card" aria-labelledby="patient-flow-title">
        <div>
          <p className="eyebrow">Fluxo recomendado</p>
          <h2 id="patient-flow-title">Do cadastro ao acompanhamento</h2>
          <p className="muted">
            Use o paciente como ponto de partida para agendar, registrar evolução, gerar documentos e iniciar avaliações psicológicas.
          </p>
        </div>
        <div className="patient-flow-steps" aria-label="Fluxo comercial do paciente">
          <span>Cadastro</span>
          <span>Agenda</span>
          <span>Prontuário</span>
          <span>Documentos</span>
          <span>Avaliações</span>
        </div>
      </section>

      <section className="panel-card patients-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cadastro</p>
            <h2>Pacientes vinculados</h2>
            <p className="muted">Acompanhe os cadastros administrativos e acesse o prontuário da clínica.</p>
          </div>
          <span className="panel-pill">{filteredPatients.length} de {patients.length} registro(s)</span>
        </div>

        <div className="patients-toolbar" aria-label="Filtros de pacientes">
          <label className="patients-search-field">
            <span>Buscar paciente</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, e-mail, telefone ou CPF"
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
        </div>

        {filteredPatients.length ? (
          <div className="clinic-list patients-list">
            <div className="patients-list-header" aria-hidden="true">
              <span>Paciente</span>
              <span>Contato</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {filteredPatients.map((patient) => (
              <article className="clinic-row patient-row" key={patient.id}>
                <div className="patient-identity">
                  <span className="patient-avatar" aria-hidden="true">
                    {patient.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                  <strong>{patient.full_name}</strong>
                    <p>{patient.social_name ? `Nome social: ${patient.social_name}` : "Cadastro administrativo"}</p>
                  </div>
                </div>
                <p className="patient-contact">
                  {patient.email ? patient.email : patient.phone ? patient.phone : "Contato não informado"}
                </p>
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
                    Prontuários
                  </Link>
                  <Link className="button-secondary button-compact" href={`/clinics/${id}/documents`} aria-label={`Abrir documentos de ${patient.full_name}`}>
                    Documentos
                  </Link>
                  <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments/new`} aria-label={`Iniciar avaliação de ${patient.full_name}`}>
                    Avaliação
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : patients.length ? (
          <div className="empty-state">
            <h3>Nenhum paciente encontrado</h3>
            <p>Ajuste a busca ou os filtros para localizar outro cadastro.</p>
          </div>
        ) : (
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
