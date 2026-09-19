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
  const activeProfessionals = professionals.filter((item) => item.is_active).length;

  return (
    <AppShell activeNav="profile" currentClinic={clinic} eyebrow="Perfil" title="Dados do profissional" user={user}>
      {professional ? (
        <section className="profile-showcase" aria-label="Perfil profissional">
          <article className="profile-showcase-hero">
            <div className="profile-photo" aria-hidden="true">
              {professional.full_name.slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-showcase-copy">
              <h2>{professional.full_name}</h2>
              <div className="profile-badges">
                <span>{statusLabel(professional.status)}</span>
                <strong>★ 4.8</strong>
                <small>{professional.crp || "CRP não informado"}</small>
              </div>
              <p>{professional.biography || `${professional.profession} da equipe ${clinic.name}. Perfil pronto para centralizar dados profissionais, contato e parâmetros de atendimento.`}</p>
              <Link className="button-secondary button-compact" href={`/clinics/${id}/professionals/new`}>Editar perfil</Link>
            </div>
          </article>

          <div className="profile-showcase-grid">
            <article className="profile-showcase-card">
              <h3>Atividade</h3>
              <dl>
                <div><dt>Equipe ativa</dt><dd>{activeProfessionals}</dd></div>
                <div><dt>Modalidade</dt><dd>{modalityLabel(professional.appointment_modalities)}</dd></div>
                <div><dt>Duração padrão</dt><dd>{professional.default_appointment_duration} min</dd></div>
                <div><dt>Status</dt><dd>{statusLabel(professional.status)}</dd></div>
              </dl>
            </article>

            <article className="profile-showcase-card">
              <h3>Logros</h3>
              <div className="profile-achievements">
                <div><span>🏆</span><p><strong>Perfil completo</strong><small>Dados profissionais centralizados</small></p></div>
                <div><span>💚</span><p><strong>Equipe vinculada</strong><small>Atende em {clinic.name}</small></p></div>
                <div><span>🤝</span><p><strong>Cuidado organizado</strong><small>Agenda e pacientes integrados</small></p></div>
              </div>
            </article>

            <article className="profile-showcase-card reputation-card">
              <h3>Reputação</h3>
              <strong>4.8</strong>
              <p aria-label="Avaliação cinco estrelas">★ ★ ★ ★ ☆</p>
              <span>Excelente organização</span>
              <dl>
                <div><dt>Dados cadastrais</dt><dd>100%</dd></div>
                <div><dt>Atendimentos</dt><dd>{modalityLabel(professional.appointment_modalities)}</dd></div>
                <div><dt>Participação</dt><dd>Alta</dd></div>
              </dl>
            </article>
          </div>

          <article className="profile-business-card">
            <h3>Minha atuação</h3>
            <div>
              <div className="profile-business-icon" aria-hidden="true">⚕</div>
              <div>
                <h4>{professional.profession}</h4>
                <p>{professional.email || user.email || "E-mail não informado"} · {professional.phone || "Telefone não informado"}</p>
                <div className="profile-tags">
                  <span>{professional.crp || "CRP não informado"}</span>
                  <span>{modalityLabel(professional.appointment_modalities)}</span>
                  <span>{Number(professional.appointment_price || 0).toLocaleString("pt-BR", { currency: "BRL", style: "currency" })}</span>
                  <span>{clinic.name}</span>
                </div>
              </div>
            </div>
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
