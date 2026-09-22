"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { getClinic, listDocumentTemplates, listProfessionals } from "@/lib/api";
import type { Clinic, DocumentTemplate, Professional } from "@/lib/types";

type SettingsPageProps = { params: Promise<{ id: string }> };

export function SettingsPage({ params }: SettingsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    Promise.all([getClinic(id), listProfessionals(id), listDocumentTemplates(id)])
      .then(([clinicData, professionalData, templateData]) => {
        setClinic(clinicData);
        setProfessionals(professionalData);
        setTemplates(templateData);
      })
      .catch(() => setError("Não foi possível carregar as configurações."));
  }, [id, user]);

  if (loading || !user) return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  if (error || !clinic) return <main className="loading-page" role={error ? "alert" : "status"} aria-live={error ? "assertive" : "polite"}>{error || "Carregando configurações..."}</main>;

  return (
    <AppShell activeNav="settings" currentClinic={clinic} eyebrow="Configurações" title="Configurações da clínica" user={user}>
      <section className="settings-hero panel-card" aria-labelledby="settings-title">
        <div>
          <p className="eyebrow">Preparação comercial</p>
          <h2 id="settings-title">Identidade, equipe e segurança de {clinic.name}</h2>
          <p className="muted">Centralize os pontos administrativos da clínica: dados cadastrais, equipe, acessos, documentos e segurança.</p>
        </div>
        <span className="panel-pill">{professionals.filter((professional) => professional.is_active).length} profissional(is)</span>
      </section>

      <section className="settings-grid" aria-label="Áreas de configuração">
        <article className="panel-card settings-card">
          <p className="eyebrow">Identidade da clínica</p>
          <h3>Dados cadastrais e marca</h3>
          <p className="muted">Nome, documento, contatos, logomarca e cabeçalho padrão dos documentos.</p>
          <dl>
            <div><dt>Nome</dt><dd>{clinic.name}</dd></div>
            <div><dt>Email</dt><dd>{clinic.email || "Não informado"}</dd></div>
            <div><dt>Telefone</dt><dd>{clinic.phone || "Não informado"}</dd></div>
          </dl>
          <Link className="button-secondary button-compact" href={`/clinics/${id}`}>Abrir dados da clínica</Link>
        </article>

        <article className="panel-card settings-card">
          <p className="eyebrow">Equipe clínica</p>
          <h3>Profissionais de atendimento</h3>
          <p className="muted">Cadastre psicólogos e outros profissionais responsáveis por agenda, prontuário, documentos e avaliações.</p>
          <dl>
            <div><dt>Ativos</dt><dd>{professionals.filter((professional) => professional.status === "ACTIVE").length}</dd></div>
            <div><dt>Bloqueados</dt><dd>{professionals.filter((professional) => professional.status === "BLOCKED").length}</dd></div>
            <div><dt>Duração padrão</dt><dd>{professionals[0]?.default_appointment_duration ? `${professionals[0].default_appointment_duration} min` : "Não definida"}</dd></div>
          </dl>
          <div className="form-actions">
            <Link className="button-primary button-compact" href={`/clinics/${id}/professionals/new`}>Cadastrar profissional</Link>
            <Link className="button-secondary button-compact" href={`/clinics/${id}/professionals`}>Gerenciar equipe</Link>
          </div>
        </article>

        <article className="panel-card settings-card">
          <p className="eyebrow">Funcionários e acessos</p>
          <h3>Equipe administrativa e operacional</h3>
          <p className="muted">Área separada para secretaria, recepção, financeiro, limpeza, contador e outros colaboradores sem perfil clínico.</p>
          <ul className="settings-checklist">
            <li>Cadastro de funcionário sem CRP obrigatório</li>
            <li>Permissões por função: recepção, financeiro, administrativo e operacional</li>
            <li>Convite, bloqueio e desligamento de acesso</li>
          </ul>
          <span className="panel-pill">Próxima etapa</span>
        </article>

        <article className="panel-card settings-card">
          <p className="eyebrow">Documentos psicológicos</p>
          <h3>Modelos e emissão</h3>
          <p className="muted">Prepare modelos de declaração, relatório, recibo e documentos avulsos para PDF.</p>
          <dl>
            <div><dt>Modelos ativos</dt><dd>{templates.filter((template) => template.is_active).length}</dd></div>
            <div><dt>Tipos usados</dt><dd>{new Set(templates.map((template) => template.template_type)).size}</dd></div>
          </dl>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/documents`}>Ver documentos</Link>
        </article>

        <article className="panel-card settings-card">
          <p className="eyebrow">LGPD e segurança</p>
          <h3>Controles pendentes</h3>
          <p className="muted">Consentimentos, logs visíveis, exportação de dados e política de retenção precisam de endpoints dedicados.</p>
          <ul className="settings-checklist">
            <li>Perfis de acesso por papel</li>
            <li>Consentimento do paciente</li>
            <li>Auditoria de alterações sensíveis</li>
          </ul>
          <span className="panel-pill">Próxima etapa</span>
        </article>
      </section>
    </AppShell>
  );
}
