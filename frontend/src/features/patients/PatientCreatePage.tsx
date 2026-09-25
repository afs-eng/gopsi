"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { createPatientFormData, listProfessionals } from "@/lib/api";
import { maskCpfInput, maskPhoneInput } from "@/lib/formMasks";
import type { Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type PatientCreatePageProps = {
  params: Promise<{ id: string }>;
};

function calculateAge(birthDate: string) {
  if (!birthDate) return "--";

  const date = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "--";

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "--";
}

export function PatientCreatePage({ params }: PatientCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [error, setError] = useState("");
  const [healthPlanOpen, setHealthPlanOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [preview, setPreview] = useState({ birth_date: "", cpf: "", full_name: "", phone: "" });
  const [isPending, startTransition] = useTransition();
  const age = calculateAge(preview.birth_date);

  function updatePreview(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget;
    if (name in preview) {
      setPreview((current) => ({ ...current, [name]: value }));
    }
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    listProfessionals(id).then(setProfessionals).catch(() => setProfessionals([]));
  }, [id, user]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const professionalId = String(formData.get("professional") ?? "");
    const fatherName = String(formData.get("father_full_name") ?? "").trim();
    const motherName = String(formData.get("mother_full_name") ?? "").trim();
    const guardians = [
      fatherName
        ? {
            full_name: fatherName,
            relationship: "Pai",
            cpf: "",
            phone: "",
            email: "",
            has_authorization: false,
          }
        : null,
      motherName
        ? {
            full_name: motherName,
            relationship: "Mãe",
            cpf: "",
            phone: "",
            email: "",
            has_authorization: false,
          }
        : null,
    ].filter((guardian) => guardian !== null);

    formData.set("clinic", id);
    formData.set("has_health_plan", healthPlanOpen ? "true" : "false");
    if (!healthPlanOpen) {
      formData.set("health_plan", "");
      formData.set("health_plan_card", "");
    }
    formData.set("guardians_json", JSON.stringify(guardians));
    formData.set("professional_links_json", JSON.stringify(professionalId ? [{ professional: professionalId, is_primary: true }] : []));
    formData.delete("father_full_name");
    formData.delete("mother_full_name");
    formData.delete("professional");

    if (!String(formData.get("birth_date") ?? "")) {
      formData.delete("birth_date");
    }

    const photo = formData.get("patient_photo");
    if (photo instanceof File && !photo.name) {
      formData.delete("patient_photo");
    } else if (photo instanceof File) {
      formData.set("photo", photo);
      formData.delete("patient_photo");
    }

    startTransition(async () => {
      try {
        await createPatientFormData(formData);
        router.replace(`/clinics/${id}/patients`);
      } catch (submitError) {
        const detail = submitError instanceof Error ? submitError.message : "";
        setError(`Não foi possível cadastrar o paciente. ${detail || "Confira permissões e vínculo."}`);
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  return (
    <AppShell
      activeNav="patients"
      eyebrow="Cadastro protegido"
      title="Cadastrar paciente"
      user={user}
      actions={
        <Link className="button-secondary button-compact" href={`/clinics/${id}/patients`}>
          Voltar para pacientes
        </Link>
      }
    >
    <section className="patient-intake-page">
      <section className="patient-intake-shell" aria-label="Formulário de cadastro de paciente">
        <div className="patient-intake-topline">
          <p className="patient-breadcrumb">Pacientes / Novo paciente</p>
        </div>

        <nav className="patient-intake-tabs" aria-label="Etapas do cadastro">
          <span className="is-active">Dados pessoais</span>
          <span>Contato</span>
          <span>Dados clínicos</span>
          <span>Responsáveis</span>
          <span>Documentos</span>
          <span>Observações</span>
        </nav>

        {error ? <div className="alert" id="patient-form-error" role="alert" aria-live="assertive">{error}</div> : null}

        <div className="patient-intake-layout">
          <form className="patient-intake-form" onSubmit={handleSubmit} aria-describedby={error ? "patient-form-error" : undefined}>
            <fieldset>
              <legend>Informações básicas</legend>
              <div className="patient-intake-field is-full">
                <label htmlFor="full_name">Nome completo <span>*</span></label>
                <input id="full_name" name="full_name" required placeholder="Digite o nome completo" onChange={updatePreview} />
              </div>
              <div className="patient-intake-grid cols-3">
                <div className="patient-intake-field">
                  <label htmlFor="birth_date">Data de nascimento</label>
                  <input id="birth_date" name="birth_date" type="date" onChange={updatePreview} />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="patient_age">Idade</label>
                  <input id="patient_age" value={age} readOnly aria-label="Idade gerada automaticamente" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="sex">Sexo biológico</label>
                  <select id="sex" name="sex" defaultValue="NOT_INFORMED">
                    <option value="NOT_INFORMED">Selecione</option>
                    <option value="FEMALE">Feminino</option>
                    <option value="MALE">Masculino</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
              </div>
              <div className="patient-intake-grid cols-2">
                <div className="patient-intake-field">
                  <label htmlFor="mother_full_name">Nome da mãe <small>(opcional)</small></label>
                  <input id="mother_full_name" name="mother_full_name" placeholder="Digite o nome da mãe" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="father_full_name">Nome do pai <small>(opcional)</small></label>
                  <input id="father_full_name" name="father_full_name" placeholder="Digite o nome do pai" />
                </div>
              </div>
              <div className="patient-intake-grid cols-3">
                <div className="patient-intake-field">
                  <label htmlFor="cpf">CPF</label>
                  <input id="cpf" name="cpf" inputMode="numeric" maxLength={14} onChange={updatePreview} onInput={maskCpfInput} placeholder="000.000.000-00" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="patient_record_number">Nº de cadastro do paciente</label>
                  <input id="patient_record_number" placeholder="Será gerado automaticamente" readOnly />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="marital_status">Estado civil</label>
                  <select id="marital_status" name="marital_status" defaultValue="">
                    <option value="">Selecione</option>
                    <option>Solteiro(a)</option>
                    <option>Casado(a)</option>
                    <option>Divorciado(a)</option>
                    <option>Viúvo(a)</option>
                  </select>
                </div>
              </div>
              <div className="patient-intake-grid cols-3">
                <div className="patient-intake-field">
                  <label htmlFor="education">Escolaridade</label>
                  <select id="education" name="education" defaultValue="">
                    <option value="">Selecione</option>
                    <option>Educação Infantil</option>
                    <option>Ensino Fundamental Incompleto</option>
                    <option>Ensino Fundamental Completo</option>
                    <option>Ensino Médio Incompleto</option>
                    <option>Ensino Médio Completo</option>
                    <option>Ensino Técnico</option>
                    <option>Ensino Superior Incompleto</option>
                    <option>Ensino Superior Completo</option>
                    <option>Pós-Graduação / Especialização / MBA</option>
                    <option>Mestrado</option>
                    <option>Doutorado / Pós-Doutorado</option>
                  </select>
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="profession">Profissão</label>
                  <input id="profession" name="profession" placeholder="Digite a profissão" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="occupation">Ocupação atual</label>
                  <input id="occupation" name="occupation" placeholder="Digite a ocupação" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Contato e endereço</legend>
              <div className="patient-intake-grid cols-2">
                <div className="patient-intake-field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" name="email" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="phone">Telefone</label>
                  <input id="phone" name="phone" inputMode="numeric" maxLength={14} onChange={updatePreview} onInput={maskPhoneInput} placeholder="(00)00000-0000" />
                </div>
              </div>
              <div className="patient-intake-grid cols-address">
                <div className="patient-intake-field">
                  <label htmlFor="zip_code">CEP</label>
                  <input id="zip_code" name="zip_code" placeholder="00000-000" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="address">Logradouro</label>
                  <input id="address" name="address" placeholder="Digite o endereço" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="address_number">Número</label>
                  <input id="address_number" name="address_number" placeholder="Nº" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="address_complement">Complemento</label>
                  <input id="address_complement" name="address_complement" placeholder="Apartamento, sala..." />
                </div>
              </div>
              <div className="patient-intake-grid cols-3">
                <div className="patient-intake-field">
                  <label htmlFor="district">Bairro</label>
                  <input id="district" name="district" placeholder="Digite o bairro" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="city">Cidade</label>
                  <input id="city" name="city" placeholder="Digite a cidade" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="state">Estado</label>
                  <select id="state" name="state" defaultValue="">
                    <option value="">Selecione</option>
                    <option>GO</option>
                    <option>SP</option>
                    <option>RJ</option>
                    <option>MG</option>
                    <option>DF</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Planos, vínculo e segurança</legend>
              <input name="has_health_plan" type="hidden" value={healthPlanOpen ? "true" : "false"} />
              <div className="patient-health-plan-card">
                <div>
                  <strong>Convênio</strong>
                  <p>Opcional. Adicione apenas quando o paciente usar plano de saúde.</p>
                </div>
                <button className="button-secondary button-compact" type="button" onClick={() => setHealthPlanOpen((current) => !current)}>
                  {healthPlanOpen ? "Remover convênio" : "Adicionar convênio"}
                </button>
              </div>
              {healthPlanOpen ? (
                <div className="patient-intake-grid cols-2 patient-health-plan-fields">
                  <div className="patient-intake-field">
                    <label htmlFor="health_plan">Convênio</label>
                    <select id="health_plan" name="health_plan" defaultValue="">
                      <option value="">Selecione o convênio</option>
                      <option>Particular</option>
                      <option>Unimed</option>
                      <option>Bradesco Saúde</option>
                    </select>
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="health_plan_card">Carteirinha</label>
                    <input id="health_plan_card" name="health_plan_card" placeholder="Digite o número" />
                  </div>
                </div>
              ) : null}
              <div className="patient-intake-grid cols-2">
                <div className="patient-intake-field">
                  <label htmlFor="professional">Profissional responsável</label>
                  <select id="professional" name="professional" defaultValue="">
                    <option value="">Sem vínculo inicial</option>
                    {professionals.map((professional) => (
                      <option key={professional.id} value={professional.id}>{professional.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="emergency_contact_name">Contato de emergência</label>
                  <input id="emergency_contact_name" name="emergency_contact_name" placeholder="Nome do contato" />
                </div>
              </div>
              <div className="patient-intake-grid cols-2">
                <div className="patient-intake-field">
                  <label htmlFor="emergency_contact_phone">Telefone de emergência</label>
                  <input id="emergency_contact_phone" name="emergency_contact_phone" inputMode="numeric" maxLength={14} onInput={maskPhoneInput} placeholder="(00)00000-0000" />
                </div>
                <div className="patient-intake-field">
                  <label htmlFor="referral_source">Como nos conheceu?</label>
                  <select id="referral_source" name="referral_source" defaultValue="">
                    <option value="">Selecione uma opção</option>
                    <option>Indicação</option>
                    <option>Instagram</option>
                    <option>Google</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <div className="patient-intake-footer">
              <label className="patient-active-toggle">
                <input type="checkbox" defaultChecked />
                <span>Paciente ativo</span>
                <small>Permite agendamentos e atendimentos.</small>
              </label>
              <div>
                <Link className="button-secondary" href={`/clinics/${id}/patients`}>Cancelar</Link>
                <button className="button-primary" disabled={isPending} type="submit">
                  {isPending ? "Salvando..." : "Salvar paciente"}
                </button>
              </div>
            </div>
          </form>

          <aside className="patient-intake-sidebar" aria-label="Resumo do cadastro">
            <article className="patient-photo-card">
              <h2>Foto do paciente</h2>
              <div
                className="patient-photo-placeholder"
                style={photoPreview ? { backgroundImage: `url(${photoPreview})` } : undefined}
                aria-hidden="true"
              >
                {photoPreview ? null : "P"}
              </div>
              <label className="button-secondary button-compact patient-photo-button" htmlFor="patient_photo">
                Adicionar foto
                <input id="patient_photo" name="patient_photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
              </label>
              <p>JPG, PNG ou WEBP (máx. 5MB)</p>
            </article>

            <article className="patient-summary-card">
              <h2>Resumo</h2>
              <dl>
                <div><dt>Nome</dt><dd>{preview.full_name || "Não preenchido"}</dd></div>
                <div><dt>Data de nascimento</dt><dd>{preview.birth_date || "--"}</dd></div>
                <div><dt>Idade</dt><dd>{age === "--" ? "--" : `${age} anos`}</dd></div>
                <div><dt>CPF</dt><dd>{preview.cpf || "--"}</dd></div>
                <div><dt>Contato</dt><dd>{preview.phone || "--"}</dd></div>
                <div><dt>Paciente ativo</dt><dd>Sim</dd></div>
              </dl>
            </article>

            <article className="patient-quote-card">
              <p>“Cada pessoa tem uma história. Aqui, ela é acolhida.”</p>
            </article>
          </aside>
        </div>
      </section>
    </section>
    </AppShell>
  );
}
