"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { getClinic, listProfessionals } from "@/lib/api";
import type { Clinic, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ProfessionalsPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
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
      <section className="metrics-grid" aria-label="Resumo de profissionais">
        <MetricCard
          label="Profissionais ativos"
          value={professionals.filter((professional) => professional.is_active).length}
          description="Equipe visível dentro da clínica selecionada."
        />
        <MetricCard
          label="Clínica"
          value={clinic.name}
          description="Tenant lógico em uso nesta tela."
        />
        <MetricCard
          label="Permissões"
          value="RBAC"
          description="Cadastro restrito a administradores da clínica."
        />
      </section>

      <section className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cadastro</p>
            <h2>Profissionais vinculados</h2>
          </div>
          <span className="panel-pill">{professionals.length} registro(s)</span>
        </div>

        {professionals.length ? (
          <div className="clinic-list">
            {professionals.map((professional) => (
              <article className="clinic-row" key={professional.id}>
                <div>
                  <strong>{professional.full_name}</strong>
                  <p>
                    {professional.profession} · {professional.crp || "CRP não informado"}
                  </p>
                </div>
                <span className="status-badge" aria-label={`Status: ${statusLabels[professional.status] || professional.status}`}>
                  {statusLabels[professional.status] || professional.status}
                </span>
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
