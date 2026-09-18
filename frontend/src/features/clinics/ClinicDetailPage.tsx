"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { getClinic } from "@/lib/api";
import type { Clinic } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ClinicDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    getClinic(id)
      .then(setClinic)
      .catch(() => setError("Clínica não encontrada ou sem permissão de acesso."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error) {
    return (
      <AppShell activeNav="clinic" eyebrow="Clínica" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  if (!clinic) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando clínica...</main>;
  }

  return (
    <AppShell
      activeNav="clinic"
      currentClinic={clinic}
      eyebrow="Clínica"
      title={clinic.name}
      user={user}
      actions={
        <>
          <Link
            className="button-primary button-compact"
            href={`/clinics/${clinic.id}/appointments`}
          >
            Agenda
          </Link>
          <Link
            className="button-secondary button-compact"
            href={`/clinics/${clinic.id}/patients`}
          >
            Pacientes
          </Link>
          <Link
            className="button-secondary button-compact"
            href={`/clinics/${clinic.id}/professionals`}
          >
            Profissionais
          </Link>
          <Link className="button-secondary button-compact" href="/">
            Voltar
          </Link>
        </>
      }
    >
      <section className="metrics-grid" aria-label="Resumo da clínica">
        <MetricCard
          label="Status"
          value={clinic.is_active ? "Ativa" : "Inativa"}
          description="Controle lógico, sem exclusão física por padrão."
        />
        <MetricCard
          label="Tenant"
          value="UUID"
          description={clinic.id}
        />
        <MetricCard
          label="Próxima fase"
          value="Profissionais"
          description="Cadastre e gerencie a equipe vinculada à clínica."
        />
      </section>

      <section className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Dados administrativos</p>
            <h2>Informações da clínica</h2>
          </div>
          <span className="panel-pill">Acesso por vínculo</span>
        </div>

        <dl className="detail-list">
          <div>
            <dt>Razão social</dt>
            <dd>{clinic.legal_name || "Não informada"}</dd>
          </div>
          <div>
            <dt>CNPJ/CPF</dt>
            <dd>{clinic.document || "Não informado"}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{clinic.phone || "Não informado"}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{clinic.email || "Não informado"}</dd>
          </div>
        </dl>
      </section>
    </AppShell>
  );
}
