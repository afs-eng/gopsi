"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { getClinic, getPatient, listProfessionals, updatePatientFormData } from "@/lib/api";
import { maskCpfInput, maskPhoneInput } from "@/lib/formMasks";
import type { Clinic, Patient, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type PatientEditPageProps = {
  params: Promise<{ id: string; patientId: string }>;
};

function calculateAge(birthDate: string) {
  if (!birthDate) return "--";
  const date = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "--";
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age -= 1;
  return age >= 0 ? String(age) : "--";
}

export function PatientEditPage({ params }: PatientEditPageProps) {
  const { id, patientId } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [preview, setPreview] = useState({ birth_date: "", cpf: "", full_name: "", phone: "" });
  const [isPending, startTransition] = useTransition();
  const age = calculateAge(preview.birth_date);

  useEffect(() => {
    if (!user) return;

    Promise.all([getClinic(id), getPatient(patientId), listProfessionals(id)])
      .then(([clinicData, patientData, professionalsData]) => {
        setClinic(clinicData);
        setPatient(patientData);
        setProfessionals(professionalsData);
        setPhotoPreview(patientData.photo ?? "");
        setPreview({
          birth_date: patientData.birth_date ?? "",
          cpf: patientData.cpf,
          full_name: patientData.full_name,
          phone: patientData.phone,
        });
      })
      .catch(() => setError("Não foi possível carregar o paciente."));
  }, [id, patientId, user]);

  useEffect(() => () => {
    if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

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
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const professionalId = String(formData.get("professional") ?? "");
    const fatherName = String(formData.get("father_full_name") ?? "").trim();
    const motherName = String(formData.get("mother_full_name") ?? "").trim();
    const guardians = [
      fatherName
        ? { full_name: fatherName, relationship: "Pai", cpf: "", phone: "", email: "", has_authorization: false }
        : null,
      motherName
        ? { full_name: motherName, relationship: "Mãe", cpf: "", phone: "", email: "", has_authorization: false }
        : null,
    ].filter((guardian) => guardian !== null);

    formData.set("clinic", id);
    formData.set("has_health_plan", formData.get("has_health_plan") === "yes" ? "true" : "false");
    formData.set("is_active", formData.get("is_active") === "on" ? "true" : "false");
    formData.set("guardians_json", JSON.stringify(guardians));
    formData.set(
      "professional_links_json",
      JSON.stringify(professionalId ? [{ professional: professionalId, is_primary: true }] : []),
    );
    formData.delete("father_full_name");
    formData.delete("mother_full_name");
    formData.delete("professional");

    if (!String(formData.get("birth_date") ?? "")) formData.delete("birth_date");

    const photo = formData.get("patient_photo");
    if (photo instanceof File && photo.name) {
      formData.set("photo", photo);
    }
    formData.delete("patient_photo");

    startTransition(async () => {
      try {
        await updatePatientFormData(patientId, formData);
        router.replace(`/clinics/${id}/patients/${patientId}`);
      } catch (submitError) {
        const detail = submitError instanceof Error ? submitError.message : "";
        setError(`Não foi possível atualizar o paciente. ${detail || "Confira os campos."}`);
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error && !patient) {
    return <main className="loading-page" role="alert" aria-live="assertive">{error}</main>;
  }

  if (!clinic || !patient) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando paciente...</main>;
  }

  const mother = patient.guardians.find((guardian) => guardian.relationship === "Mãe");
  const father = patient.guardians.find((guardian) => guardian.relationship === "Pai");
  const primaryProfessional = patient.professional_links.find((link) => link.is_primary);

  return (
    <AppShell
      activeNav="patients"
      currentClinic={clinic}
      eyebrow="Paciente"
      title="Atualizar paciente"
      user={user}
      actions={<Link className="button-secondary button-compact" href={`/clinics/${id}/patients/${patientId}`}>Voltar para o paciente</Link>}
    >
      <section className="patient-intake-page">
        <section className="patient-intake-shell" aria-label="Formulário de atualização de paciente">
          <div className="patient-intake-topline">
            <p className="patient-breadcrumb">Pacientes / {patient.full_name} / Atualizar</p>
          </div>

          <nav className="patient-intake-tabs" aria-label="Etapas do cadastro">
            <span className="is-active">Dados pessoais</span>
            <span>Contato</span>
            <span>Dados clínicos</span>
            <span>Responsáveis</span>
            <span>Documentos</span>
            <span>Observações</span>
          </nav>

          {error ? <div className="alert" id="patient-edit-error" role="alert" aria-live="assertive">{error}</div> : null}

          <div className="patient-intake-layout">
            <form className="patient-intake-form" onSubmit={handleSubmit} aria-describedby={error ? "patient-edit-error" : undefined}>
              <fieldset>
                <legend>Informações básicas</legend>
                <div className="patient-intake-field is-full">
                  <label htmlFor="full_name">Nome completo <span>*</span></label>
                  <input id="full_name" name="full_name" required defaultValue={patient.full_name} onChange={updatePreview} />
                </div>
                <div className="patient-intake-grid cols-4">
                  <div className="patient-intake-field">
                    <label htmlFor="birth_date">Data de nascimento</label>
                    <input id="birth_date" name="birth_date" type="date" defaultValue={patient.birth_date ?? ""} onChange={updatePreview} />
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="patient_age">Idade</label>
                    <input id="patient_age" value={age} readOnly aria-label="Idade gerada automaticamente" />
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="sex">Sexo biológico</label>
                    <select id="sex" name="sex" defaultValue={patient.sex}>
                      <option value="NOT_INFORMED">Selecione</option>
                      <option value="FEMALE">Feminino</option>
                      <option value="MALE">Masculino</option>
                      <option value="OTHER">Outro</option>
                    </select>
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="gender_identity">Identidade de gênero</label>
                    <select id="gender_identity" name="gender_identity" defaultValue={patient.gender_identity}>
                      <option value="">Selecione</option>
                      <option>Feminina</option>
                      <option>Masculina</option>
                      <option>Não binária</option>
                      <option>Prefere não informar</option>
                    </select>
                  </div>
                </div>
                <div className="patient-intake-grid cols-2">
                  <div className="patient-intake-field">
                    <label htmlFor="mother_full_name">Nome da mãe</label>
                    <input id="mother_full_name" name="mother_full_name" defaultValue={mother?.full_name ?? ""} />
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="father_full_name">Nome do pai</label>
                    <input id="father_full_name" name="father_full_name" defaultValue={father?.full_name ?? ""} />
                  </div>
                </div>
                <div className="patient-intake-grid cols-3">
                  <div className="patient-intake-field">
                    <label htmlFor="cpf">CPF</label>
                    <input id="cpf" name="cpf" inputMode="numeric" maxLength={14} defaultValue={patient.cpf} onChange={updatePreview} onInput={maskCpfInput} />
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="record_number">Nº de cadastro</label>
                    <input id="record_number" name="record_number" defaultValue={patient.record_number} />
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="marital_status">Estado civil</label>
                    <select id="marital_status" name="marital_status" defaultValue={patient.marital_status}>
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
                    <select id="education" name="education" defaultValue={patient.education}>
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
                    <input id="profession" name="profession" defaultValue={patient.profession} />
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="occupation">Ocupação atual</label>
                    <input id="occupation" name="occupation" defaultValue={patient.occupation} />
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend>Contato e endereço</legend>
                <div className="patient-intake-grid cols-2">
                  <div className="patient-intake-field">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" name="email" type="email" defaultValue={patient.email} />
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="phone">Telefone</label>
                    <input id="phone" name="phone" inputMode="numeric" maxLength={14} defaultValue={patient.phone} onChange={updatePreview} onInput={maskPhoneInput} />
                  </div>
                </div>
                <div className="patient-intake-grid cols-address">
                  <div className="patient-intake-field"><label htmlFor="zip_code">CEP</label><input id="zip_code" name="zip_code" defaultValue={patient.zip_code} /></div>
                  <div className="patient-intake-field"><label htmlFor="address">Logradouro</label><input id="address" name="address" defaultValue={patient.address} /></div>
                  <div className="patient-intake-field"><label htmlFor="address_number">Número</label><input id="address_number" name="address_number" defaultValue={patient.address_number} /></div>
                  <div className="patient-intake-field"><label htmlFor="address_complement">Complemento</label><input id="address_complement" name="address_complement" defaultValue={patient.address_complement} /></div>
                </div>
                <div className="patient-intake-grid cols-3">
                  <div className="patient-intake-field"><label htmlFor="district">Bairro</label><input id="district" name="district" defaultValue={patient.district} /></div>
                  <div className="patient-intake-field"><label htmlFor="city">Cidade</label><input id="city" name="city" defaultValue={patient.city} /></div>
                  <div className="patient-intake-field">
                    <label htmlFor="state">Estado</label>
                    <select id="state" name="state" defaultValue={patient.state}>
                      <option value="">Selecione</option>
                      <option>GO</option><option>SP</option><option>RJ</option><option>MG</option><option>DF</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend>Planos, vínculo e segurança</legend>
                <div className="patient-intake-grid cols-3">
                  <div className="patient-intake-field">
                    <label>Possui plano de saúde?</label>
                    <div className="patient-radio-row">
                      <label><input name="has_health_plan" type="radio" value="yes" defaultChecked={patient.has_health_plan} /> Sim</label>
                      <label><input name="has_health_plan" type="radio" value="no" defaultChecked={!patient.has_health_plan} /> Não</label>
                    </div>
                  </div>
                  <div className="patient-intake-field">
                    <label htmlFor="health_plan">Convênio</label>
                    <select id="health_plan" name="health_plan" defaultValue={patient.health_plan}>
                      <option value="">Selecione o convênio</option>
                      <option>Particular</option><option>Unimed</option><option>Bradesco Saúde</option>
                    </select>
                  </div>
                  <div className="patient-intake-field"><label htmlFor="health_plan_card">Carteirinha</label><input id="health_plan_card" name="health_plan_card" defaultValue={patient.health_plan_card} /></div>
                </div>
                <div className="patient-intake-grid cols-2">
                  <div className="patient-intake-field">
                    <label htmlFor="professional">Profissional responsável</label>
                    <select id="professional" name="professional" defaultValue={primaryProfessional?.professional ?? ""}>
                      <option value="">Sem vínculo</option>
                      {professionals.map((professional) => <option key={professional.id} value={professional.id}>{professional.full_name}</option>)}
                    </select>
                  </div>
                  <div className="patient-intake-field"><label htmlFor="emergency_contact_name">Contato de emergência</label><input id="emergency_contact_name" name="emergency_contact_name" defaultValue={patient.emergency_contact_name} /></div>
                </div>
                <div className="patient-intake-grid cols-2">
                  <div className="patient-intake-field"><label htmlFor="emergency_contact_phone">Telefone de emergência</label><input id="emergency_contact_phone" name="emergency_contact_phone" inputMode="numeric" maxLength={14} defaultValue={patient.emergency_contact_phone} onInput={maskPhoneInput} /></div>
                  <div className="patient-intake-field">
                    <label htmlFor="referral_source">Como nos conheceu?</label>
                    <select id="referral_source" name="referral_source" defaultValue={patient.referral_source}>
                      <option value="">Selecione uma opção</option>
                      <option>Indicação</option><option>Instagram</option><option>Google</option><option>Outro</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <div className="patient-intake-footer">
                <label className="patient-active-toggle">
                  <input name="is_active" type="checkbox" defaultChecked={patient.is_active} />
                  <span>Paciente ativo</span>
                  <small>Permite agendamentos e atendimentos.</small>
                </label>
                <div>
                  <Link className="button-secondary" href={`/clinics/${id}/patients/${patientId}`}>Cancelar</Link>
                  <button className="button-primary" disabled={isPending} type="submit">
                    {isPending ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </div>
            </form>

            <aside className="patient-intake-sidebar" aria-label="Resumo do paciente">
              <article className="patient-photo-card">
                <h2>Foto do paciente</h2>
                <div className="patient-photo-placeholder" style={photoPreview ? { backgroundImage: `url(${photoPreview})` } : undefined} aria-hidden="true">
                  {photoPreview ? null : patient.full_name.slice(0, 1).toUpperCase()}
                </div>
                <label className="button-secondary button-compact patient-photo-button" htmlFor="patient_photo">
                  Alterar foto
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
                  <div><dt>Status</dt><dd>{patient.is_active ? "Ativo" : "Inativo"}</dd></div>
                </dl>
              </article>
            </aside>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
