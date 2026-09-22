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
  PsychologicalAssessmentType,
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
        const assessment = await createPsychologicalAssessment({
          clinic: id,
          patient: String(formData.get("patient") ?? ""),
          professional: String(formData.get("professional") ?? ""),
          title: String(formData.get("title") ?? ""),
          assessment_type: String(formData.get("assessment_type") ?? "PSYCHOLOGICAL") as PsychologicalAssessmentType,
          purpose: String(formData.get("purpose") ?? ""),
          demand_origin: String(formData.get("demand_origin") ?? ""),
          requester: String(formData.get("requester") ?? ""),
          reason: String(formData.get("reason") ?? ""),
          objective: String(formData.get("objective") ?? ""),
          status: String(formData.get("status") ?? "IN_PROGRESS") as PsychologicalAssessmentStatus,
          started_at: String(formData.get("started_at") ?? "") || null,
          expected_at: String(formData.get("expected_at") ?? "") || null,
          completed_at: String(formData.get("completed_at") ?? "") || null,
        });
        router.replace(`/clinics/${id}/assessments/${assessment.id}`);
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
            <div className="field-grid">
              <label className="field-group" htmlFor="assessment_type">
                Tipo
                <select id="assessment_type" name="assessment_type" defaultValue="PSYCHOLOGICAL">
                  <option value="PSYCHOLOGICAL">Psicológica</option>
                  <option value="NEUROPSYCHOLOGICAL">Neuropsicológica</option>
                  <option value="PSYCHODIAGNOSTIC">Psicodiagnóstica</option>
                  <option value="BEHAVIORAL">Comportamental</option>
                  <option value="DEVELOPMENT">Desenvolvimento</option>
                  <option value="OTHER">Outra</option>
                </select>
              </label>
              <label className="field-group" htmlFor="demand_origin">
                Origem da demanda
                <input id="demand_origin" name="demand_origin" placeholder="Família, escola, médico, demanda própria..." />
              </label>
            </div>
            <label className="field-group" htmlFor="purpose">
              Finalidade
              <textarea id="purpose" name="purpose" rows={3} placeholder="Finalidade clínica, escolar, ocupacional, judicial ou outra." />
            </label>
            <label className="field-group" htmlFor="requester">
              Solicitante, quando aplicável
              <input id="requester" name="requester" placeholder="Nome, instituição ou responsável pela solicitação" />
            </label>
            <label className="field-group" htmlFor="reason">
              Motivo da avaliação
              <textarea id="reason" name="reason" required rows={5} placeholder="Descreva a demanda, objetivo ou encaminhamento informado." />
            </label>
            <label className="field-group" htmlFor="objective">
              Objetivo
              <textarea id="objective" name="objective" rows={4} placeholder="Pergunta clínica ou objetivo principal da avaliação." />
            </label>
            <div className="field-grid">
              <label className="field-group" htmlFor="status">
                Status inicial
                <select id="status" name="status" defaultValue="IN_PROGRESS">
                  <option value="PLANNING">Planejamento</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="WAITING_INFORMATION">Aguardando informação</option>
                </select>
              </label>
              <label className="field-group" htmlFor="started_at">
                Data de início
                <input id="started_at" name="started_at" required type="date" />
              </label>
            </div>
            <div className="field-grid">
              <label className="field-group" htmlFor="expected_at">
                Data prevista
                <input id="expected_at" name="expected_at" type="date" />
              </label>
              <label className="field-group" htmlFor="completed_at">
                Data de conclusão, se já existir
                <input id="completed_at" name="completed_at" type="date" />
              </label>
            </div>
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
