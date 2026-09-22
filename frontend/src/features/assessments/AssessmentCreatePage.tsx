"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import {
  createPsychologicalAssessment,
  getClinic,
  listPatients,
  listProfessionals,
} from "@/lib/api";
import type {
  Clinic,
  Patient,
  Professional,
  PsychologicalAssessmentStatus,
} from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type AssessmentCreatePageProps = {
  params: Promise<{ id: string }>;
};

export function AssessmentCreatePage({ params }: AssessmentCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const defaultPatient = searchParams.get("patient") ?? "";

  useEffect(() => {
    if (!user) return;

    Promise.all([getClinic(id), listPatients(id), listProfessionals(id)])
      .then(([clinicData, patientData, professionalData]) => {
        setClinic(clinicData);
        setPatients(patientData);
        setProfessionals(professionalData);
      })
      .catch(() => setError("Não foi possível carregar pacientes e profissionais."));
  }, [id, user]);

  const authorizedProfessionals = user?.global_role === "CLINIC_ADMIN"
    ? professionals
    : user
      ? professionals.filter((professional) => professional.user === user.id)
      : [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createPsychologicalAssessment({
          clinic: id,
          patient: String(formData.get("patient") ?? ""),
          professional: String(formData.get("professional") ?? ""),
          title: String(formData.get("title") ?? ""),
          reason: String(formData.get("reason") ?? ""),
          status: String(formData.get("status") ?? "IN_PROGRESS") as PsychologicalAssessmentStatus,
          started_at: String(formData.get("started_at") ?? "") || null,
          completed_at: String(formData.get("completed_at") ?? "") || null,
        });
        router.replace(`/clinics/${id}/assessments`);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar a avaliação. Verifique paciente, profissional autorizado e datas informadas.",
        );
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error && !clinic) {
    return (
      <AppShell activeNav="assessments" eyebrow="Avaliação" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error}</div>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments`}>
            Voltar para avaliações
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      activeNav="assessments"
      currentClinic={clinic ?? undefined}
      eyebrow="Avaliação psicológica"
      title="Nova avaliação"
      user={user}
      actions={
        <Link className="button-secondary button-compact" href={`/clinics/${id}/assessments`}>
          Voltar
        </Link>
      }
    >
      <section className="form-card assessment-form-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Fluxo especializado</p>
            <h2>Iniciar avaliação psicológica</h2>
            <p className="muted">
              Cadastre o processo avaliativo antes de lançar instrumentos, resultados, síntese e documento final.
            </p>
          </div>
        </div>

        {error ? <div className="alert" id="assessment-form-error" role="alert" aria-live="assertive">{error}</div> : null}

          {authorizedProfessionals.length ? null : (
            <div className="alert" role="alert">
              Seu usuário precisa ser administrador da clínica ou estar vinculado a um perfil profissional ativo para iniciar avaliações psicológicas.
            </div>
          )}

          <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "assessment-form-error" : undefined}>
          <fieldset className="form-section">
            <legend className="eyebrow">Vínculos</legend>
            <div className="field-grid">
              <label className="field-group" htmlFor="patient">
                Paciente
                <select id="patient" name="patient" required defaultValue={defaultPatient}>
                  <option value="">Selecione</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                  ))}
                </select>
              </label>
              <label className="field-group" htmlFor="professional">
                Profissional responsável
                <select id="professional" name="professional" required defaultValue="">
                  <option value="">Selecione</option>
                  {authorizedProfessionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>{professional.full_name}</option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend className="eyebrow">Dados da avaliação</legend>
            <label className="field-group" htmlFor="title">
              Título
              <input id="title" name="title" required placeholder="Avaliação neuropsicológica inicial" />
            </label>
            <label className="field-group" htmlFor="reason">
              Motivo da avaliação
              <textarea id="reason" name="reason" rows={5} placeholder="Descreva a demanda, objetivo ou encaminhamento informado." />
            </label>
            <div className="field-grid">
              <label className="field-group" htmlFor="status">
                Status inicial
                <select id="status" name="status" defaultValue="IN_PROGRESS">
                  <option value="DRAFT">Rascunho</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                </select>
              </label>
              <label className="field-group" htmlFor="started_at">
                Data de início
                <input id="started_at" name="started_at" type="date" />
              </label>
            </div>
            <label className="field-group" htmlFor="completed_at">
              Data de conclusão, se já existir
              <input id="completed_at" name="completed_at" type="date" />
            </label>
          </fieldset>

          <div className="assessment-form-note">
            <strong>Próximo passo</strong>
            <p>Depois de iniciar a avaliação, registre sessões, instrumentos aplicados, resultados e síntese integrativa no acompanhamento do processo.</p>
          </div>

          <button className="button-primary" disabled={isPending || !authorizedProfessionals.length} type="submit">
            {isPending ? "Salvando..." : "Iniciar avaliação"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
