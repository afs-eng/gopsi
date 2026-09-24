"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { createScheduleBlock, listProfessionals } from "@/lib/api";
import type { Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ScheduleBlockCreatePageProps = {
  params: Promise<{ id: string }>;
};

export function ScheduleBlockCreatePage({ params }: ScheduleBlockCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    listProfessionals(id)
      .then(setProfessionals)
      .catch(() => setError("Cadastre profissionais antes de bloquear a agenda."));
  }, [id, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createScheduleBlock({
          clinic: id,
          professional: String(formData.get("professional") ?? ""),
          date: String(formData.get("date") ?? ""),
          start_time: String(formData.get("start_time") ?? ""),
          end_time: String(formData.get("end_time") ?? ""),
          reason: String(formData.get("reason") ?? ""),
        });
        router.replace(`/clinics/${id}/appointments`);
      } catch {
        setError("Não foi possível bloquear. Verifique horários, profissional e clínica.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  return (
    <main className="form-page">
      <section className="form-card" aria-labelledby="schedule-block-form-title">
        <Link className="back-link" href={`/clinics/${id}/appointments`}>
          Voltar para agenda
        </Link>
        <p className="eyebrow">Disponibilidade</p>
        <h1 id="schedule-block-form-title">Bloquear horário</h1>
        <p className="muted">Bloqueios ativos impedem consultas sobrepostas.</p>

        {error ? <div className="alert" id="block-form-error" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "block-form-error" : undefined}>
          <fieldset className="form-section">
            <legend className="eyebrow">Profissional</legend>
          <div className="field-group">
            <label htmlFor="professional">Profissional</label>
            <select id="professional" name="professional" required defaultValue="">
              <option value="">Selecione</option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.full_name}
                </option>
              ))}
            </select>
          </div>
          </fieldset>
          <fieldset className="form-section">
            <legend className="eyebrow">Período indisponível</legend>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="date">Data</label>
              <input id="date" name="date" type="date" required />
            </div>
            <div className="field-group">
              <label htmlFor="reason">Motivo administrativo</label>
              <input id="reason" name="reason" placeholder="Ex.: férias, reunião, supervisão" />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="start_time">Hora inicial</label>
              <input id="start_time" name="start_time" type="time" required />
            </div>
            <div className="field-group">
              <label htmlFor="end_time">Hora final</label>
              <input id="end_time" name="end_time" type="time" required />
            </div>
          </div>
          </fieldset>
          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Bloqueando..." : "Bloquear horário"}
          </button>
        </form>
      </section>
    </main>
  );
}
