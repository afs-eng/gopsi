"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlatformShell } from "@/components/PlatformShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { listPlatformClinics } from "@/lib/api";
import type { PlatformClinic } from "@/lib/types";

export function PlatformClinicsPage() {
  const { loading, user } = useAuthenticatedData();
  const [clinics, setClinics] = useState<PlatformClinic[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { if (user) listPlatformClinics().then(setClinics).catch(() => setError("Não foi possível carregar os tenants.")); }, [user]);
  if (loading || !user) return <main className="loading-page" role="status">Carregando ambiente seguro...</main>;
  if (!user.is_platform_admin) return <main className="loading-page" role="alert">Acesso não autorizado.</main>;
  return <PlatformShell activeNav="clinics" user={user} title="Tenants">
    <section className="panel-card" aria-labelledby="platform-clinics-title"><div className="panel-heading"><div><p className="eyebrow">Ciclo de vida</p><h2 id="platform-clinics-title">Clínicas da plataforma</h2><p className="muted">Visualize somente identidade e estado dos tenants.</p></div><Link className="button-primary button-compact" href="/platform/clinics/new">Provisionar clínica</Link></div>
      {error ? <div className="alert" role="alert">{error}</div> : null}
      {clinics.length ? <div className="clinic-list">{clinics.map((clinic) => <Link className="clinic-row" href={`/platform/clinics/${clinic.id}`} key={clinic.id}><div><strong>{clinic.name}</strong><p>{clinic.legal_name || "Razão social não informada"} · Criada em {new Date(clinic.created_at).toLocaleDateString("pt-BR")}</p></div><span className="status-badge">{clinic.is_active ? "Ativa" : "Inativa"}</span></Link>)}</div> : <div className="empty-state"><h3>Nenhuma clínica provisionada</h3><p>Use o fluxo de provisionamento para criar o primeiro tenant.</p><Link className="button-primary button-compact" href="/platform/clinics/new">Provisionar clínica</Link></div>}
    </section>
  </PlatformShell>;
}
