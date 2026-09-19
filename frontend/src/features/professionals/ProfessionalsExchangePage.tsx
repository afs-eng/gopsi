"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { getClinic, listProfessionals } from "@/lib/api";
import type { Clinic, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ProfessionalsExchangePageProps = {
  params: Promise<{ id: string }>;
};

function modalityLabel(modality: Professional["appointment_modalities"]) {
  return {
    HYBRID: "Híbrido",
    IN_PERSON: "Presencial",
    ONLINE: "Online",
  }[modality];
}

export function ProfessionalsExchangePage({ params }: ProfessionalsExchangePageProps) {
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
      <AppShell activeNav="trueque" eyebrow="Trueque" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  const activeProfessionals = professionals.filter((professional) => professional.is_active);

  return (
    <AppShell
      activeNav="trueque"
      currentClinic={clinic}
      eyebrow="Trueque"
      title="Profissionais disponíveis"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/professionals/new`}>
          Novo profissional
        </Link>
      }
    >
      <section className="panel-card trueque-hero">
        <div>
          <p className="eyebrow">Rede clínica</p>
          <h2>Encontre profissionais da equipe</h2>
          <p className="muted">Use esta área como vitrine interna para visualizar especialidades, modalidade de atendimento e contato da equipe.</p>
        </div>
        <span className="panel-pill">{activeProfessionals.length} ativo(s)</span>
      </section>

      {activeProfessionals.length ? (
        <section className="trueque-grid" aria-label="Profissionais da clínica">
          {activeProfessionals.map((professional) => (
            <article className="panel-card trueque-card" key={professional.id}>
              <div className="professional-avatar" aria-hidden="true">
                {professional.full_name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3>{professional.full_name}</h3>
                <p>{professional.profession}</p>
              </div>
              <dl>
                <div><dt>CRP</dt><dd>{professional.crp || "Não informado"}</dd></div>
                <div><dt>Modalidade</dt><dd>{modalityLabel(professional.appointment_modalities)}</dd></div>
                <div><dt>Duração</dt><dd>{professional.default_appointment_duration} min</dd></div>
                <div><dt>Contato</dt><dd>{professional.email || professional.phone || "Não informado"}</dd></div>
              </dl>
              {professional.biography ? <p className="trueque-bio">{professional.biography}</p> : null}
            </article>
          ))}
        </section>
      ) : (
        <section className="panel-card empty-state">
          <h2>Nenhum profissional para mostrar</h2>
          <p>Cadastre profissionais para preencher o Trueque.</p>
          <Link className="button-primary button-compact" href={`/clinics/${id}/professionals/new`}>
            Cadastrar profissional
          </Link>
        </section>
      )}
    </AppShell>
  );
}
