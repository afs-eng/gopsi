"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { createClinicStaff, getClinic, getClinicStaff, updateClinicStaff } from "@/lib/api";
import { maskCpfInput, maskPhoneInput } from "@/lib/formMasks";
import type { Clinic, ClinicStaff, ClinicStaffRole, ClinicStaffStatus } from "@/lib/types";

type ClinicStaffFormPageProps = {
  params: Promise<{ id: string; staffId?: string }>;
  mode: "create" | "edit";
};

const roleOptions: Array<{ value: ClinicStaffRole; label: string }> = [
  { value: "RECEPTIONIST", label: "Recepção/Secretaria" },
  { value: "FINANCE", label: "Financeiro" },
  { value: "ADMINISTRATIVE", label: "Administrativo" },
  { value: "OPERATIONAL", label: "Operacional" },
  { value: "ACCOUNTANT", label: "Contador" },
  { value: "CLEANING", label: "Limpeza" },
  { value: "OTHER", label: "Outro" },
];

export function ClinicStaffFormPage({ params, mode }: ClinicStaffFormPageProps) {
  const { id, staffId } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [staff, setStaff] = useState<ClinicStaff | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    const requests: [Promise<Clinic>, Promise<ClinicStaff | null>] = [
      getClinic(id),
      mode === "edit" && staffId ? getClinicStaff(staffId) : Promise.resolve(null),
    ];
    Promise.all(requests)
      .then(([clinicData, staffData]) => {
        setClinic(clinicData);
        setStaff(staffData);
      })
      .catch(() => setError("Não foi possível carregar o formulário de funcionário."));
  }, [id, mode, staffId, user]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const payload = {
      clinic: id,
      user: null,
      full_name: String(data.get("full_name") ?? ""),
      role: String(data.get("role") ?? "ADMINISTRATIVE") as ClinicStaffRole,
      cpf: String(data.get("cpf") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      position: String(data.get("position") ?? ""),
      notes: String(data.get("notes") ?? ""),
      status: String(data.get("status") ?? "ACTIVE") as ClinicStaffStatus,
      access_enabled: data.get("access_enabled") === "on",
    };

    startTransition(async () => {
      try {
        if (mode === "edit" && staffId) {
          await updateClinicStaff(staffId, payload);
        } else {
          await createClinicStaff(payload);
        }
        router.replace(`/clinics/${id}/settings/staff`);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Não foi possível salvar o funcionário.");
      }
    });
  }

  if (loading || !user) return <main className="loading-page" role="status">Carregando ambiente seguro...</main>;

  const title = mode === "edit" ? "Editar funcionário" : "Cadastrar funcionário";

  return (
    <AppShell
      activeNav="settings"
      currentClinic={clinic ?? undefined}
      eyebrow="Funcionários e acessos"
      title={title}
      user={user}
      actions={<Link className="button-secondary button-compact" href={`/clinics/${id}/settings/staff`}>Voltar</Link>}
    >
      <section className="form-card" aria-labelledby="staff-form-title">
        <p className="eyebrow">Equipe administrativa e operacional</p>
        <h2 id="staff-form-title">{title}</h2>
        <p className="muted">Funcionários não precisam de CRP e ficam separados dos profissionais clínicos.</p>

        {error ? <div className="alert" role="alert">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="full_name">Nome completo</label>
              <input id="full_name" name="full_name" required defaultValue={staff?.full_name ?? ""} />
            </div>
            <div className="field-group">
              <label htmlFor="role">Função</label>
              <select id="role" name="role" defaultValue={staff?.role ?? "ADMINISTRATIVE"}>
                {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="position">Cargo ou observação da função</label>
              <input id="position" name="position" defaultValue={staff?.position ?? ""} placeholder="Secretária, contador externo, limpeza..." />
            </div>
            <div className="field-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={staff?.status ?? "ACTIVE"}>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="BLOCKED">Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" inputMode="numeric" maxLength={14} onInput={maskCpfInput} defaultValue={staff?.cpf ?? ""} placeholder="000.000.000-00" />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Telefone</label>
              <input id="phone" name="phone" inputMode="numeric" maxLength={14} onInput={maskPhoneInput} defaultValue={staff?.phone ?? ""} placeholder="(00)00000-0000" />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" defaultValue={staff?.email ?? ""} />
          </div>

          <label className="checkbox-card" htmlFor="access_enabled">
            <input id="access_enabled" name="access_enabled" type="checkbox" defaultChecked={staff?.access_enabled ?? false} disabled />
            Acesso ao sistema será habilitado em etapa separada de convite de usuário.
          </label>

          <div className="field-group">
            <label htmlFor="notes">Notas internas</label>
            <textarea id="notes" name="notes" rows={4} defaultValue={staff?.notes ?? ""} />
          </div>

          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Salvando..." : "Salvar funcionário"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
