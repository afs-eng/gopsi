"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { createPatient, listProfessionals } from "@/lib/api";
import { maskCpfInput, maskPhoneInput } from "@/lib/formMasks";
import type { Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type PatientCreatePageProps = {
  params: Promise<{ id: string }>;
};

export function PatientCreatePage({ params }: PatientCreatePageProps) {
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

    listProfessionals(id).then(setProfessionals).catch(() => setProfessionals([]));
  }, [id, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const professionalId = String(formData.get("professional") ?? "");
    const guardianName = String(formData.get("guardian_full_name") ?? "");

    startTransition(async () => {
      try {
        await createPatient({
          clinic: id,
          full_name: String(formData.get("full_name") ?? ""),
          social_name: String(formData.get("social_name") ?? ""),
          cpf: String(formData.get("cpf") ?? ""),
          birth_date: String(formData.get("birth_date") ?? "") || null,
          sex: String(formData.get("sex") ?? "NOT_INFORMED") as
            | "FEMALE"
            | "MALE"
            | "OTHER"
            | "NOT_INFORMED",
          phone: String(formData.get("phone") ?? ""),
          email: String(formData.get("email") ?? ""),
          address: String(formData.get("address") ?? ""),
          emergency_contact_name: String(
            formData.get("emergency_contact_name") ?? "",
          ),
          emergency_contact_phone: String(
            formData.get("emergency_contact_phone") ?? "",
          ),
          guardians: guardianName
            ? [
                {
                  full_name: guardianName,
                  relationship: String(formData.get("guardian_relationship") ?? ""),
                  cpf: String(formData.get("guardian_cpf") ?? ""),
                  phone: String(formData.get("guardian_phone") ?? ""),
                  email: String(formData.get("guardian_email") ?? ""),
                  has_authorization:
                    formData.get("guardian_has_authorization") === "on",
                },
              ]
            : [],
          professional_links: professionalId
            ? [{ professional: professionalId, is_primary: true }]
            : [],
        });
        router.replace(`/clinics/${id}/patients`);
      } catch {
        setError("Não foi possível cadastrar o paciente. Confira permissões e vínculo.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  return (
    <main className="form-page">
      <section className="form-card" aria-labelledby="patient-form-title">
        <Link className="back-link" href={`/clinics/${id}/patients`}>
          Voltar para pacientes
        </Link>
        <p className="eyebrow">Cadastro administrativo</p>
        <h1 id="patient-form-title">Cadastrar paciente</h1>
        <p className="muted">Depois do cadastro, use o módulo protegido de prontuário para registros clínicos.</p>

        {error ? <div className="alert" id="patient-form-error" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "patient-form-error" : undefined}>
          <fieldset className="form-section">
            <legend className="eyebrow">Identificação</legend>
          <div className="field-group">
            <label htmlFor="full_name">Nome completo</label>
            <input id="full_name" name="full_name" required />
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="social_name">Nome social</label>
              <input id="social_name" name="social_name" />
            </div>
            <div className="field-group">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" inputMode="numeric" maxLength={14} onInput={maskCpfInput} placeholder="000.000.000-00" />
            </div>
          </div>
          </fieldset>
          <fieldset className="form-section">
            <legend className="eyebrow">Contato e segurança</legend>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="birth_date">Data de nascimento</label>
              <input id="birth_date" name="birth_date" type="date" />
            </div>
            <div className="field-group">
              <label htmlFor="sex">Sexo</label>
              <select id="sex" name="sex" defaultValue="NOT_INFORMED">
                <option value="NOT_INFORMED">Não informado</option>
                <option value="FEMALE">Feminino</option>
                <option value="MALE">Masculino</option>
                <option value="OTHER">Outro</option>
              </select>
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
          <div className="field-group">
            <label htmlFor="address">Endereço</label>
            <textarea id="address" name="address" rows={3} />
          </div>
          </fieldset>
          <fieldset className="form-section">
            <legend className="eyebrow">Vínculo e responsável</legend>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="emergency_contact_name">Contato de emergência</label>
              <input id="emergency_contact_name" name="emergency_contact_name" />
            </div>
            <div className="field-group">
              <label htmlFor="emergency_contact_phone">Telefone de emergência</label>
              <input id="emergency_contact_phone" name="emergency_contact_phone" inputMode="numeric" maxLength={14} onInput={maskPhoneInput} placeholder="(00)00000-0000" />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="professional">Profissional responsável</label>
            <select id="professional" name="professional" defaultValue="">
              <option value="">Sem vínculo inicial</option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <p className="eyebrow">Responsável opcional</p>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="guardian_full_name">Nome do responsável</label>
                <input id="guardian_full_name" name="guardian_full_name" />
              </div>
              <div className="field-group">
                <label htmlFor="guardian_relationship">Parentesco</label>
                <input id="guardian_relationship" name="guardian_relationship" />
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="guardian_cpf">CPF do responsável</label>
                <input id="guardian_cpf" name="guardian_cpf" inputMode="numeric" maxLength={14} onInput={maskCpfInput} placeholder="000.000.000-00" />
              </div>
              <div className="field-group">
                <label htmlFor="guardian_phone">Telefone do responsável</label>
                <input id="guardian_phone" name="guardian_phone" inputMode="numeric" maxLength={14} onInput={maskPhoneInput} placeholder="(00)00000-0000" />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="guardian_email">E-mail do responsável</label>
              <input id="guardian_email" name="guardian_email" type="email" />
            </div>
            <label className="checkbox-row" htmlFor="guardian_has_authorization">
              <input id="guardian_has_authorization" name="guardian_has_authorization" type="checkbox" />
              Possui autorização registrada
            </label>
          </div>
          </fieldset>

          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Salvando..." : "Salvar paciente"}
          </button>
        </form>
      </section>
    </main>
  );
}
