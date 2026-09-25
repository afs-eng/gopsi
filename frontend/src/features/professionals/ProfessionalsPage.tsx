"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { getClinic, listProfessionals } from "@/lib/api";
import type { Clinic, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ProfessionalsPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  BLOCKED: "Bloqueado",
  INACTIVE: "Inativo",
};

const modalityLabels: Record<Professional["appointment_modalities"], string> = {
  HYBRID: "Presencial e online",
  IN_PERSON: "Presencial",
  ONLINE: "Online",
};

export function ProfessionalsPage({ params }: ProfessionalsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), listProfessionals(id)])
      .then(([clinicData, professionalsData]) => {
        setClinic(clinicData);
        setProfessionals(professionalsData);
      })
      .catch(() => setError("Não foi possível carregar os profissionais."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error || !clinic) {
    return (
      <AppShell activeNav="professionals" eyebrow="Profissionais" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  const activeCount = professionals.filter((professional) => professional.is_active).length;

  return (
    <AppShell
      activeNav="professionals"
      currentClinic={clinic}
      eyebrow="Equipe clínica"
      title="Profissionais"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/professionals/new`}>
          Novo profissional
        </Link>
      }
    >
      <section className="panel-card professionals-panel" aria-labelledby="professionals-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cadastro</p>
            <h2 id="professionals-title">Profissionais vinculados</h2>
            <p className="muted">Atuação, modalidade e contato de cada profissional da clínica.</p>
          </div>
          <span className="panel-pill">{activeCount} de {professionals.length} ativo(s)</span>
        </div>

        {professionals.length ? (
          <div className="clinic-list professionals-list">
            <div className="professionals-list-header" aria-hidden="true">
              <span>Profissional</span>
              <span>Atendimento</span>
              <span>Contato</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {professionals.map((professional) => (
              <article className="clinic-row professional-row" key={professional.id}>
                <div className="professional-identity">
                  <span className="professional-avatar" aria-hidden="true">
                    {professional.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>
                      <Link className="professional-name-link" href={`/clinics/${id}/professionals/${professional.id}`}>
                        {professional.full_name}
                      </Link>
                    </strong>
                    <p>{professional.profession} · {professional.crp || "CRP não informado"}</p>
                  </div>
                </div>
                <div className="professional-service">
                  <strong>{modalityLabels[professional.appointment_modalities]}</strong>
                  <p>
                    {Number(professional.appointment_price || 0).toLocaleString("pt-BR", { currency: "BRL", style: "currency" })}
                    {" · "}
                    {professional.default_appointment_duration} min
                  </p>
                </div>
                <div className="professional-contact">
                  <strong>{professional.email || "E-mail não informado"}</strong>
                  <p>{professional.phone || "Telefone não informado"}</p>
                </div>
                <span
                  className={`status-badge professional-status-${professional.status.toLowerCase()}`}
                  aria-label={`Status: ${statusLabels[professional.status] || professional.status}`}
                >
                  {statusLabels[professional.status] || professional.status}
                </span>
                <div className="row-actions professional-actions">
                  <Link
                    className="button-secondary button-compact"
                    href={`/clinics/${id}/professionals/${professional.id}`}
                    aria-label={`Abrir perfil de ${professional.full_name}`}
                  >
                    Ver perfil
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum profissional cadastrado</h3>
            <p>Cadastre a equipe para avançar para pacientes e agenda.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/professionals/new`}>
              Cadastrar profissional
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
