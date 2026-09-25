"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { createProfessional, getClinic } from "@/lib/api";
import { maskCpfInput, maskCrpInput, maskPhoneInput } from "@/lib/formMasks";
import type { Clinic } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type ProfessionalCreatePageProps = {
  params: Promise<{ id: string }>;
};

const crpRegions: Record<string, { state: string; label: string }> = {
  "01": { state: "DF", label: "Distrito Federal" },
  "02": { state: "PE", label: "Pernambuco" },
  "03": { state: "BA", label: "Bahia" },
  "04": { state: "MG", label: "Minas Gerais" },
  "05": { state: "RJ", label: "Rio de Janeiro" },
  "06": { state: "SP", label: "São Paulo" },
  "07": { state: "RS", label: "Rio Grande do Sul" },
  "08": { state: "PR", label: "Paraná" },
  "09": { state: "GO", label: "Goiás" },
  "10": { state: "PA", label: "Pará e Amapá" },
  "11": { state: "CE", label: "Ceará" },
  "12": { state: "SC", label: "Santa Catarina" },
  "13": { state: "PB", label: "Paraíba" },
  "14": { state: "MS", label: "Mato Grosso do Sul" },
  "15": { state: "AL", label: "Alagoas" },
  "16": { state: "ES", label: "Espírito Santo" },
  "17": { state: "RN", label: "Rio Grande do Norte" },
  "18": { state: "MT", label: "Mato Grosso" },
  "19": { state: "SE", label: "Sergipe" },
  "20": { state: "AM", label: "Amazonas, Acre, Rondônia e Roraima" },
  "21": { state: "PI", label: "Piauí" },
  "22": { state: "MA", label: "Maranhão" },
  "23": { state: "TO", label: "Tocantins" },
  "24": { state: "RO", label: "Rondônia e Acre" },
};

function crpRegionFromValue(value: string) {
  return value.replace(/\D/g, "").slice(0, 2);
}

export function ProfessionalCreatePage({ params }: ProfessionalCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [crpState, setCrpState] = useState("");
  const [crpRegionLabel, setCrpRegionLabel] = useState("");
  const [invalidCrpRegion, setInvalidCrpRegion] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    getClinic(id)
      .then(setClinic)
      .catch(() => setLoadError("Não foi possível carregar a clínica."));
  }, [id, user]);

  function handleCrpInput(event: FormEvent<HTMLInputElement>) {
    maskCrpInput(event);
    const region = crpRegionFromValue(event.currentTarget.value);
    const regionInfo = crpRegions[region];

    setCrpState(regionInfo?.state ?? "");
    setCrpRegionLabel(regionInfo?.label ?? "");
    setInvalidCrpRegion(region.length === 2 && !regionInfo);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (invalidCrpRegion) {
      setError("Informe uma regional de CRP válida antes de salvar.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createProfessional({
          clinic: id,
          full_name: String(formData.get("full_name") ?? ""),
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

  if (loading || !user || (!clinic && !loadError)) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (loadError || !clinic) {
    return (
      <AppShell activeNav="professionals" eyebrow="Equipe clínica" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{loadError || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      activeNav="professionals"
      currentClinic={clinic}
      eyebrow="Equipe clínica"
      title="Cadastrar profissional"
      user={user}
      actions={
        <Link className="button-secondary button-compact" href={`/clinics/${id}/professionals`}>
          Voltar para profissionais
        </Link>
      }
    >
      <section className="form-card is-compact professional-form-card" aria-labelledby="professional-form-title">
        <div className="form-card-header">
          <div>
            <p className="eyebrow">Cadastro</p>
            <h2 id="professional-form-title">Dados do profissional</h2>
          </div>
          <p className="muted">O profissional será vinculado somente à clínica atual.</p>
        </div>

        {error ? <div id="professional-form-error" className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "professional-form-error" : undefined}>
          <fieldset className="form-section">
            <legend>Dados pessoais</legend>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="full_name">Nome completo</label>
                <input id="full_name" name="full_name" required />
              </div>
              <div className="field-group">
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" name="cpf" inputMode="numeric" maxLength={14} onInput={maskCpfInput} placeholder="000.000.000-00" />
              </div>
              <div className="field-group">
                <label htmlFor="profession">Profissão</label>
                <input id="profession" name="profession" defaultValue="Psicóloga" required />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Registro profissional</legend>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="crp">CRP</label>
                <input
                  id="crp"
                  name="crp"
                  aria-describedby="crp-help"
                  aria-invalid={invalidCrpRegion}
                  className={invalidCrpRegion ? "field-invalid" : undefined}
                  inputMode="numeric"
                  maxLength={12}
                  onInput={handleCrpInput}
                  placeholder="CRP 00/00000"
                />
                <span className={invalidCrpRegion ? "field-error" : "field-hint"} id="crp-help">
                  {invalidCrpRegion ? "Regional do CRP não encontrada." : crpRegionLabel ? `Regional: ${crpRegionLabel}.` : "Digite a regional para preencher a UF automaticamente."}
                </span>
              </div>
              <div className="field-group">
                <label htmlFor="crp_state">UF do CRP</label>
                <input id="crp_state" name="crp_state" maxLength={2} placeholder="SP" readOnly value={crpState} />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="registration_number">Número de registro</label>
              <input id="registration_number" name="registration_number" />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Contato</legend>
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
          </fieldset>

          <fieldset className="form-section">
            <legend>Atendimento</legend>
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
          </fieldset>

          <fieldset className="form-section">
            <legend>Sobre o profissional</legend>
            <div className="field-group">
              <label htmlFor="biography">Biografia profissional</label>
              <textarea id="biography" name="biography" rows={3} />
            </div>
          </fieldset>

          <div className="row-actions">
            <Link className="button-secondary" href={`/clinics/${id}/professionals`}>
              Cancelar
            </Link>
            <button className="button-primary" disabled={isPending} type="submit">
              {isPending ? "Salvando..." : "Salvar profissional"}
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
