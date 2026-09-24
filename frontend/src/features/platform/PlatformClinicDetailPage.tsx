"use client";
import Link from "next/link";
import { use, useEffect, useState, useTransition } from "react";
import { PlatformShell } from "@/components/PlatformShell";
import { deactivatePlatformClinic, getPlatformClinic } from "@/lib/api";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import type { PlatformClinic } from "@/lib/types";
export function PlatformClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { loading, user } = useAuthenticatedData(); const [clinic, setClinic] = useState<PlatformClinic | null>(null); const [error, setError] = useState(""); const [pending, startTransition] = useTransition();
  useEffect(() => { if (user) getPlatformClinic(id).then(setClinic).catch(() => setError("Não foi possível carregar este tenant.")); }, [id, user]);
  function deactivate() { if (!window.confirm("Desativar este tenant? Esta ação altera apenas o estado da clínica.")) return; startTransition(async () => { try { setClinic(await deactivatePlatformClinic(id)); } catch { setError("Não foi possível desativar o tenant."); } }); }
  if (loading || !user) return <main className="loading-page" role="status">Carregando ambiente seguro...</main>;
  if (!user.is_platform_admin) return <main className="loading-page" role="alert">Acesso não autorizado.</main>;
  if (error || !clinic) return <PlatformShell activeNav="clinics" user={user} title="Tenant"><section className="panel-card"><div className="alert" role="alert">{error || "Carregando tenant..."}</div><Link className="button-secondary button-compact" href="/platform">Voltar</Link></section></PlatformShell>;
  return <PlatformShell activeNav="clinics" user={user} title={clinic.name}><section className="panel-card" aria-labelledby="tenant-title"><Link className="back-link" href="/platform">Voltar para tenants</Link><p className="eyebrow">Detalhes do tenant</p><h2 id="tenant-title">{clinic.name}</h2><p className="muted">Informações de ciclo de vida e identificação. Dados clínicos não estão disponíveis neste workspace.</p>{error ? <div className="alert" role="alert">{error}</div> : null}<div className="clinic-list"><div className="clinic-row"><div><strong>Estado</strong><p>{clinic.is_active ? "Ativo para uso" : "Inativo"}</p></div><span className="status-badge">{clinic.is_active ? "Ativa" : "Inativa"}</span></div><div className="clinic-row"><div><strong>Identificação</strong><p>{clinic.legal_name || "Razão social não informada"} · {clinic.document || "Documento não informado"}</p></div></div><div className="clinic-row"><div><strong>Contato cadastrado</strong><p>{clinic.email || "E-mail não informado"} · {clinic.phone || "Telefone não informado"}</p></div></div><div className="clinic-row"><div><strong>Criada em</strong><p>{new Date(clinic.created_at).toLocaleString("pt-BR")}</p></div><div><strong>Atualizada em</strong><p>{new Date(clinic.updated_at).toLocaleString("pt-BR")}</p></div></div></div>{clinic.is_active ? <button className="button-secondary" disabled={pending} type="button" onClick={deactivate}>{pending ? "Desativando..." : "Desativar tenant"}</button> : null}</section></PlatformShell>;
}
