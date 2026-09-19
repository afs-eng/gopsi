"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { PlatformShell } from "@/components/PlatformShell";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { createPlatformClinic } from "@/lib/api";
import { maskPhoneInput } from "@/lib/formMasks";

export function PlatformClinicCreatePage() {
  const { loading, user } = useAuthenticatedData();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const clinic = await createPlatformClinic({
          name: String(data.get("name") || ""),
          legal_name: String(data.get("legal_name") || ""),
          document: String(data.get("document") || ""),
          phone: String(data.get("phone") || ""),
          email: String(data.get("email") || ""),
          admin_user: {
            username: String(data.get("username") || ""),
            email: String(data.get("admin_email") || ""),
            full_name: String(data.get("full_name") || ""),
            password: String(data.get("password") || ""),
          },
        });
        router.replace(`/platform/clinics/${clinic.id}`);
      } catch {
        setError("Não foi possível provisionar o tenant. Confira os dados e suas permissões.");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status">Carregando ambiente seguro...</main>;
  }

  if (!user.is_platform_admin) {
    return <main className="loading-page" role="alert">Acesso não autorizado.</main>;
  }

  return (
    <PlatformShell activeNav="clinics" user={user} title="Provisionar clínica">
      <main className="form-page">
        <section className="form-card" aria-labelledby="provision-title">
          <Link className="back-link" href="/platform">
            Voltar para tenants
          </Link>
          <p className="eyebrow">Novo tenant</p>
          <h2 id="provision-title">Provisionar clínica</h2>
          <p className="muted">
            Crie a identidade da clínica e seu primeiro administrador. Nenhum dado clínico é acessado neste fluxo.
          </p>

          {error ? <div className="alert" role="alert">{error}</div> : null}

          <form className="form-stack" onSubmit={submit}>
            <div className="field-group">
              <label htmlFor="name">Nome da clínica</label>
              <input id="name" name="name" required />
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="legal_name">Razão social</label>
                <input id="legal_name" name="legal_name" />
              </div>
              <div className="field-group">
                <label htmlFor="document">CNPJ/CPF</label>
                <input id="document" name="document" />
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="phone">Telefone</label>
                <input
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  maxLength={14}
                  onInput={maskPhoneInput}
                  placeholder="(00)00000-0000"
                />
              </div>
              <div className="field-group">
                <label htmlFor="email">E-mail da clínica</label>
                <input id="email" name="email" type="email" />
              </div>
            </div>
            <div className="form-section">
              <p className="eyebrow">Provisionamento</p>
              <h3>Administrador inicial</h3>
              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="full_name">Nome completo</label>
                  <input id="full_name" name="full_name" required />
                </div>
                <div className="field-group">
                  <label htmlFor="admin_email">E-mail de acesso</label>
                  <input id="admin_email" name="admin_email" type="email" required />
                </div>
              </div>
              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="username">Usuário</label>
                  <input id="username" name="username" required />
                </div>
                <div className="field-group">
                  <label htmlFor="password">Senha provisória</label>
                  <input id="password" name="password" type="password" minLength={8} required />
                </div>
              </div>
            </div>
            <button className="button-primary" type="submit" disabled={pending}>
              {pending ? "Provisionando..." : "Criar clínica"}
            </button>
          </form>
        </section>
      </main>
    </PlatformShell>
  );
}
