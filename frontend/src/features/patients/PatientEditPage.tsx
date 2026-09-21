"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { getClinic, getPatient, updatePatient } from "@/lib/api";
import type { Clinic, Patient } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type PatientEditPageProps = {
  params: Promise<{ id: string; patientId: string }>;
};

export function PatientEditPage({ params }: PatientEditPageProps) {
  const { id, patientId } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;

    Promise.all([getClinic(id), getPatient(patientId)])
      .then(([clinicData, patientData]) => {
        setClinic(clinicData);
        setPatient(patientData);
      })
      .catch(() => setError("Não foi possível carregar o paciente."));
  }, [id, patientId, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await updatePatient(patientId, {
          full_name: String(formData.get("full_name") ?? ""),
          social_name: String(formData.get("social_name") ?? ""),
          cpf: String(formData.get("cpf") ?? ""),
          birth_date: String(formData.get("birth_date") ?? "") || null,
          sex: String(formData.get("sex") ?? "NOT_INFORMED") as Patient["sex"],
          phone: String(formData.get("phone") ?? ""),
          email: String(formData.get("email") ?? ""),
          address: String(formData.get("address") ?? ""),
          emergency_contact_name: String(formData.get("emergency_contact_name") ?? ""),
          emergency_contact_phone: String(formData.get("emergency_contact_phone") ?? ""),
        });
        router.replace(`/clinics/${id}/patients/${patientId}`);
      } catch {
        setError("Não foi possível atualizar o paciente.");
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

  return (
    <AppShell activeNav="patients" currentClinic={clinic} eyebrow="Paciente" title="Atualizar paciente" user={user}>
      <section className="form-card" aria-labelledby="patient-edit-title">
        <Link className="back-link" href={`/clinics/${id}/patients/${patientId}`}>Voltar para o paciente</Link>
        <h2 id="patient-edit-title">Dados principais</h2>
        {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="full_name">Nome completo</label>
            <input id="full_name" name="full_name" required defaultValue={patient.full_name} />
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="social_name">Nome social</label>
              <input id="social_name" name="social_name" defaultValue={patient.social_name} />
            </div>
            <div className="field-group">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" defaultValue={patient.cpf} />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="birth_date">Data de nascimento</label>
              <input id="birth_date" name="birth_date" type="date" defaultValue={patient.birth_date ?? ""} />
            </div>
            <div className="field-group">
              <label htmlFor="sex">Sexo</label>
              <select id="sex" name="sex" defaultValue={patient.sex}>
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
              <input id="email" name="email" type="email" defaultValue={patient.email} />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Telefone</label>
              <input id="phone" name="phone" defaultValue={patient.phone} />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="address">Endereço</label>
            <textarea id="address" name="address" rows={3} defaultValue={patient.address} />
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="emergency_contact_name">Contato de emergência</label>
              <input id="emergency_contact_name" name="emergency_contact_name" defaultValue={patient.emergency_contact_name} />
            </div>
            <div className="field-group">
              <label htmlFor="emergency_contact_phone">Telefone de emergência</label>
              <input id="emergency_contact_phone" name="emergency_contact_phone" defaultValue={patient.emergency_contact_phone} />
            </div>
          </div>
          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
