"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { getClinic } from "@/lib/api";
import type { Clinic } from "@/lib/types";

type SettingsPageProps = { params: Promise<{ id: string }> };

export function SettingsPage({ params }: SettingsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) getClinic(id).then(setClinic).catch(() => setError("Não foi possível carregar a clínica."));
  }, [id, user]);

  if (loading || !user) return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  if (error || !clinic) return <main className="loading-page" role={error ? "alert" : "status"} aria-live={error ? "assertive" : "polite"}>{error || "Carregando configurações..."}</main>;

  return (
    <AppShell activeNav="settings" currentClinic={clinic} eyebrow="Configurações" title="Configurações da clínica" user={user}>
      <section className="panel-card" aria-labelledby="settings-title">
        <p className="eyebrow">Espaço da clínica</p>
        <h2 id="settings-title">Configurações em construção</h2>
        <p className="muted">As configurações de {clinic.name} serão organizadas aqui quando houver suporte de gravação no servidor.</p>
        <div className="clinic-list">
          <article className="clinic-row">
            <div><strong>Dados cadastrais</strong><p>Gerencie nome, contatos e identificação da clínica.</p></div>
            <Link className="button-secondary button-compact" href={`/clinics/${id}`}>Abrir clínica</Link>
          </article>
          <article className="clinic-row">
            <div><strong>Equipe e acessos</strong><p>Consulte os profissionais vinculados ao espaço atual.</p></div>
            <Link className="button-secondary button-compact" href={`/clinics/${id}/professionals`}>Ver profissionais</Link>
          </article>
        </div>
        <div className="empty-state"><h3>Nenhuma preferência salva</h3><p>Não há controles editáveis nesta versão. Esta indicação evita a impressão de que uma alteração foi aplicada.</p></div>
      </section>
    </AppShell>
  );
}
