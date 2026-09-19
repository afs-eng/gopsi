"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { getClinic, listProfessionals } from "@/lib/api";
import type { Clinic, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ProfessionalProfilePageProps = {
  params: Promise<{ id: string }>;
};

function statusLabel(status: Professional["status"]) {
  return {
    ACTIVE: "Ativo",
    BLOCKED: "Bloqueado",
    INACTIVE: "Inativo",
  }[status];
}

function modalityLabel(modality: Professional["appointment_modalities"]) {
  return {
    HYBRID: "Híbrido",
    IN_PERSON: "Presencial",
    ONLINE: "Online",
  }[modality];
}

export function ProfessionalProfilePage({ params }: ProfessionalProfilePageProps) {
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
      .catch(() => setError("Não foi possível carregar o perfil profissional."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error || !clinic) {
    return (
      <AppShell activeNav="profile" eyebrow="Perfil" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  const professional = professionals.find((item) => item.user === user.id) ?? professionals[0];

  return (
    <AppShell activeNav="profile" currentClinic={clinic} eyebrow="Perfil" title="Dados do profissional" user={user}>
      {professional ? (
        <section className="professional-profile-grid" aria-label="Perfil profissional">
          <article className="panel-card professional-profile-hero">
            <div className="professional-avatar" aria-hidden="true">
              {professional.full_name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="eyebrow">Profissional</p>
              <h2>{professional.full_name}</h2>
              <p className="muted">{professional.profession} · {professional.crp || "CRP não informado"}</p>
              {professional.social_name ? <p className="muted">Nome social: {professional.social_name}</p> : null}
            </div>
            <span className="status-badge">{statusLabel(professional.status)}</span>
          </article>

          <article className="panel-card professional-profile-card">
            <p className="eyebrow">Contato</p>
            <dl className="profile-detail-list">
              <div><dt>E-mail</dt><dd>{professional.email || user.email || "Não informado"}</dd></div>
              <div><dt>Telefone</dt><dd>{professional.phone || "Não informado"}</dd></div>
              <div><dt>CPF</dt><dd>{professional.cpf || "Não informado"}</dd></div>
              <div><dt>Clínica</dt><dd>{clinic.name}</dd></div>
            </dl>
          </article>

          <article className="panel-card professional-profile-card">
            <p className="eyebrow">Atendimento</p>
            <dl className="profile-detail-list">
              <div><dt>Modalidade</dt><dd>{modalityLabel(professional.appointment_modalities)}</dd></div>
              <div><dt>Valor padrão</dt><dd>{Number(professional.appointment_price || 0).toLocaleString("pt-BR", { currency: "BRL", style: "currency" })}</dd></div>
              <div><dt>Duração</dt><dd>{professional.default_appointment_duration} minutos</dd></div>
              <div><dt>Registro</dt><dd>{professional.registration_number || "Não informado"}</dd></div>
            </dl>
          </article>

          <article className="panel-card professional-profile-card professional-profile-bio">
            <p className="eyebrow">Biografia</p>
            <p>{professional.biography || "Biografia profissional ainda não informada."}</p>
          </article>
        </section>
      ) : (
        <section className="panel-card empty-state">
          <h2>Nenhum profissional vinculado</h2>
          <p>Cadastre um profissional para exibir dados completos neste perfil.</p>
          <Link className="button-primary button-compact" href={`/clinics/${id}/professionals/new`}>
            Cadastrar profissional
          </Link>
        </section>
      )}
    </AppShell>
  );
}
