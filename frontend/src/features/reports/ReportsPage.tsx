"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { getClinic } from "@/lib/api";
import type { Clinic } from "@/lib/types";

type ReportsPageProps = { params: Promise<{ id: string }> };

export function ReportsPage({ params }: ReportsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) getClinic(id).then(setClinic).catch(() => setError("Não foi possível carregar a clínica."));
  }, [id, user]);

  if (loading || !user) return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  if (error || !clinic) return <main className="loading-page" role={error ? "alert" : "status"} aria-live={error ? "assertive" : "polite"}>{error || "Carregando relatórios..."}</main>;

  return (
    <AppShell activeNav="reports" currentClinic={clinic} eyebrow="Relatórios" title="Visão da clínica" user={user}>
      <section className="panel-card" aria-labelledby="reports-title">
        <p className="eyebrow">Em preparação</p>
        <h2 id="reports-title">Relatórios clínicos e financeiros</h2>
        <p className="muted">Este espaço será o ponto de partida para acompanhar a operação de {clinic.name} com segurança.</p>
        <div className="empty-state">
          <h3>Dados confiáveis antes de gráficos</h3>
          <p>Ainda não há uma rota de dados de relatórios disponível. Por isso, nenhum número ou tendência é estimado nesta tela.</p>
          <p>Enquanto isso, consulte os registros reais da clínica:</p>
          <div className="row-actions">
            <Link className="button-primary button-compact" href={`/clinics/${id}/billing`}>Ver financeiro</Link>
            <Link className="button-secondary button-compact" href={`/clinics/${id}/appointments`}>Ver agenda</Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
