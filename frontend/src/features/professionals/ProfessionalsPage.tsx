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
      <section className="professionals-marketplace" aria-label="Lista de profissionais">
        <div className="professionals-marketplace-heading">
          <div>
            <h2>Equipe profissional</h2>
            <p className="muted">Visualize atuação, modalidade e contato de cada profissional da clínica.</p>
          </div>
          <span className="panel-pill">{professionals.filter((professional) => professional.is_active).length} ativo(s)</span>
        </div>

        {professionals.length ? (
          <div className="professionals-offer-list">
            {professionals.map((professional) => (
              <article className="professional-offer-card" key={professional.id}>
                <div className="professional-card-avatar" aria-hidden="true">
                  {professional.full_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="professional-card-body">
                  <div className="professional-card-header">
                    <div>
                      <h3>
                        <Link className="professional-name-link" href={`/clinics/${id}/professionals/${professional.id}`}>
                          {professional.full_name}
                        </Link>
                      </h3>
                      <span className="professional-tag">{professional.profession}</span>
                    </div>
                    <strong className="professional-score">{professional.default_appointment_duration} min</strong>
                  </div>

                  <div className="professional-offer-panels">
                    <div className="professional-offer-box is-primary">
                      <span>Atuação</span>
                      <strong>{professional.crp || "CRP não informado"}</strong>
                      <p>{professional.registration_number || "Registro complementar não informado"}</p>
                    </div>
                    <div className="professional-offer-box is-secondary">
                      <span>Disponibilidade</span>
                      <strong>{modalityLabels[professional.appointment_modalities]}</strong>
                      <p>{Number(professional.appointment_price || 0).toLocaleString("pt-BR", { currency: "BRL", style: "currency" })} por consulta</p>
                    </div>
                  </div>

                  <div className="professional-card-footer">
                    <div className="professional-card-meta">
                      <span aria-hidden="true">♡</span>
                      <span>{professional.email || "E-mail não informado"}</span>
                      <span aria-hidden="true">↗</span>
                      <span>{professional.phone || "Telefone não informado"}</span>
                    </div>
                    <span className="status-badge" aria-label={`Status: ${statusLabels[professional.status] || professional.status}`}>
                      {statusLabels[professional.status] || professional.status}
                    </span>
                  </div>
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
