"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { deleteClinicStaff, getClinic, listClinicStaff } from "@/lib/api";
import type { Clinic, ClinicStaff } from "@/lib/types";

type ClinicStaffPageProps = { params: Promise<{ id: string }> };

export function ClinicStaffPage({ params }: ClinicStaffPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [staff, setStaff] = useState<ClinicStaff[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadStaff = useCallback(function loadStaff() {
    return Promise.all([getClinic(id), listClinicStaff(id)]).then(([clinicData, staffData]) => {
      setClinic(clinicData);
      setStaff(staffData);
    });
  }, [id]);

  useEffect(() => {
    if (!user) return;
    loadStaff().catch(() => setError("Não foi possível carregar os funcionários."));
  }, [loadStaff, user]);

  function deactivateStaff(member: ClinicStaff) {
    const confirmed = window.confirm(`Desativar ${member.full_name}? O acesso será bloqueado.`);
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      try {
        await deleteClinicStaff(member.id);
        await loadStaff();
      } catch {
        setError("Não foi possível desativar o funcionário.");
      }
    });
  }

  if (loading || !user) return <main className="loading-page" role="status">Carregando ambiente seguro...</main>;
  if (error && !clinic) return <main className="loading-page" role="alert">{error}</main>;

  return (
    <AppShell
      activeNav="settings"
      currentClinic={clinic ?? undefined}
      eyebrow="Configurações"
      title="Funcionários e acessos"
      user={user}
      actions={
        <>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/settings`}>Configurações</Link>
          <Link className="button-primary button-compact" href={`/clinics/${id}/settings/staff/new`}>Novo funcionário</Link>
        </>
      }
    >
      {error ? <div className="alert" role="alert">{error}</div> : null}
      <section className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Equipe administrativa e operacional</p>
            <h2>Funcionários da clínica</h2>
            <p className="muted">Controle secretaria, recepção, financeiro, limpeza, contador e outros colaboradores sem perfil clínico.</p>
          </div>
          <span className="panel-pill">{staff.filter((member) => member.is_active).length} ativo(s)</span>
        </div>

        {staff.length ? (
          <div className="clinic-list">
            {staff.map((member) => (
              <article className="clinic-row" key={member.id}>
                <div>
                  <strong>{member.full_name}</strong>
                  <p>{member.role_label} · {member.position || "Cargo não informado"} · {member.email || "E-mail não informado"} · {member.access_enabled ? "com acesso" : "sem acesso"}</p>
                </div>
                <div className="form-actions">
                  <span className="status-badge">{member.status_label}</span>
                  <Link className="button-secondary button-compact" href={`/clinics/${id}/settings/staff/${member.id}/edit`}>Editar</Link>
                  <button className="button-secondary button-compact" disabled={isPending || !member.is_active} type="button" onClick={() => deactivateStaff(member)}>
                    Desativar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum funcionário cadastrado</h3>
            <p>Cadastre colaboradores administrativos separados dos profissionais clínicos.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/settings/staff/new`}>Cadastrar funcionário</Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
