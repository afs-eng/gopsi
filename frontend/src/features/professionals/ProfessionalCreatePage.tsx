"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useState, useTransition } from "react";

import { createProfessional } from "@/lib/api";
import { maskCpfInput, maskCrpInput, maskPhoneInput } from "@/lib/formMasks";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ProfessionalCreatePageProps = {
  params: Promise<{ id: string }>;
};

export function ProfessionalCreatePage({ params }: ProfessionalCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createProfessional({
          clinic: id,
          full_name: String(formData.get("full_name") ?? ""),
          social_name: String(formData.get("social_name") ?? ""),
          cpf: String(formData.get("cpf") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          profession: String(formData.get("profession") ?? ""),
          crp: String(formData.get("crp") ?? ""),
          crp_state: String(formData.get("crp_state") ?? ""),
          registration_number: String(formData.get("registration_number") ?? ""),
          status: "ACTIVE",
          biography: String(formData.get("biography") ?? ""),
          appointment_modalities: String(
            formData.get("appointment_modalities") ?? "IN_PERSON",
          ) as "IN_PERSON" | "ONLINE" | "HYBRID",
          appointment_price: String(formData.get("appointment_price") ?? "0"),
          default_appointment_duration: Number(
            formData.get("default_appointment_duration") ?? 50,
          ),
        });
        router.replace(`/clinics/${id}/professionals`);
      } catch {
        setError("Não foi possível cadastrar o profissional. Confira permissões e CRP.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  return (
    <main className="form-page">
      <section className="form-card" aria-labelledby="professional-form-title">
        <Link className="back-link" href={`/clinics/${id}/professionals`}>
          Voltar para profissionais
        </Link>
        <p className="eyebrow">Equipe clínica</p>
        <h1 id="professional-form-title">Cadastrar profissional</h1>
        <p className="muted">O profissional será vinculado somente à clínica atual.</p>

        {error ? <div id="professional-form-error" className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "professional-form-error" : undefined}>
          <div className="field-group">
            <label htmlFor="full_name">Nome completo</label>
            <input id="full_name" name="full_name" required />
          </div>
          <div className="field-group">
            <label htmlFor="social_name">Nome social</label>
            <input id="social_name" name="social_name" />
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="profession">Profissão</label>
              <input id="profession" name="profession" defaultValue="Psicóloga" required />
            </div>
            <div className="field-group">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" inputMode="numeric" maxLength={14} onInput={maskCpfInput} placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="crp">CRP</label>
              <input id="crp" name="crp" inputMode="numeric" maxLength={12} onInput={maskCrpInput} placeholder="CRP 00/00000" />
            </div>
            <div className="field-group">
              <label htmlFor="crp_state">UF do CRP</label>
              <input id="crp_state" name="crp_state" maxLength={2} placeholder="SP" />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Telefone</label>
              <input id="phone" name="phone" inputMode="numeric" maxLength={14} onInput={maskPhoneInput} placeholder="(00)00000-0000" />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="appointment_modalities">Modalidade</label>
              <select id="appointment_modalities" name="appointment_modalities" defaultValue="IN_PERSON">
                <option value="IN_PERSON">Presencial</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Híbrido</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="appointment_price">Valor da consulta</label>
              <input id="appointment_price" name="appointment_price" type="number" min="0" step="0.01" defaultValue="0" />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="default_appointment_duration">Duração padrão em minutos</label>
            <input id="default_appointment_duration" name="default_appointment_duration" type="number" min="10" defaultValue="50" />
          </div>
          <div className="field-group">
            <label htmlFor="registration_number">Número de registro</label>
            <input id="registration_number" name="registration_number" />
          </div>
          <div className="field-group">
            <label htmlFor="biography">Biografia profissional</label>
            <textarea id="biography" name="biography" rows={4} />
          </div>
          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Salvando..." : "Salvar profissional"}
          </button>
        </form>
      </section>
    </main>
  );
}
