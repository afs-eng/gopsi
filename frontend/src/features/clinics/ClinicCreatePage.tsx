"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

/** Compatibility entry point: tenant provisioning belongs to /platform. */
export function ClinicCreatePage() {
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();

  useEffect(() => {
    if (user?.is_platform_admin) router.replace("/platform/clinics/new");
  }, [router, user]);

  if (loading || !user) return <main className="loading-page" role="status">Carregando ambiente seguro...</main>;
  if (user.is_platform_admin) return <main className="loading-page" role="status">Redirecionando para o workspace da plataforma...</main>;

  return <main className="form-page"><section className="form-card" aria-labelledby="blocked-title"><p className="eyebrow">Acesso restrito</p><h1 id="blocked-title">Cadastro bloqueado</h1><p className="muted">O provisionamento de clínicas acontece somente no workspace da plataforma.</p><Link className="button-secondary button-compact" href="/">Voltar</Link></section></main>;
}
