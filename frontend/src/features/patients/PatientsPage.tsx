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
  const patientStatus = (status: string) =>
    ({ ACTIVE: "Ativo", INACTIVE: "Inativo", ARCHIVED: "Arquivado" }[status] ?? status);

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
          description="Dados cadastrais vinculados à clínica."
        />
        <MetricCard label="Clínica" value={clinic.name} description="Tenant em uso." />
        <MetricCard
          label="Próxima fase"
          value="Prontuário"
          description="Registros clínicos ficam no módulo protegido."
        />
      </section>

      <section className="panel-card patients-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cadastro</p>
            <h2>Pacientes vinculados</h2>
            <p className="muted">Acompanhe os cadastros administrativos e acesse o prontuário da clínica.</p>
          </div>
          <span className="panel-pill">{patients.length} registro(s)</span>
        </div>

        {patients.length ? (
          <div className="clinic-list patients-list">
            <div className="patients-list-header" aria-hidden="true">
              <span>Paciente</span>
              <span>Contato</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {patients.map((patient) => (
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
                  <Link className="button-secondary button-compact" href={`/clinics/${id}/medical-records`} aria-label="Abrir lista de prontuários da clínica">
                    Prontuários
                  </Link>
                </div>
              </article>
            ))}
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
