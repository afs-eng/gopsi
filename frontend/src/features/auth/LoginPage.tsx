"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { getCurrentUser, login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaUri, setMfaUri] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function copyMfaSecret() {
    if (!mfaSecret) {
      return;
    }
    await navigator.clipboard.writeText(mfaSecret);
    setCopiedSecret(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const otp = String(formData.get("otp") ?? "");

    startTransition(async () => {
      try {
        const response = await login(username, password, otp || undefined);
        setToken(response.token);
        const currentUser = await getCurrentUser();
        router.replace(currentUser.is_platform_admin ? "/platform" : "/");
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : "Erro ao autenticar.";
        if (message.includes("mfa_required")) {
          setShowOtp(true);
          setError("Informe o código do aplicativo autenticador.");
          return;
        }
        if (message.includes("mfa_setup_required")) {
          const secretMatch = message.match(/"secret"\s*:\s*"([^"]+)"/);
          const uriMatch = message.match(/"provisioning_uri"\s*:\s*"([^"]+)"/);
          setMfaSecret(secretMatch?.[1] ?? "");
          setMfaUri(uriMatch?.[1] ?? "");
          setShowQr(true);
          setShowOtp(true);
          setError(
            "Configure o MFA no aplicativo autenticador e informe o código gerado.",
          );
          return;
        }
        setError("Usuário, senha ou código MFA inválidos.");
      }
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-form-panel">
          <div className="login-heading">
            <div className="brand-mark">PSI</div>
            <div>
              <p className="eyebrow">Ambiente seguro</p>
              <h1 id="login-title">Entrar na plataforma</h1>
              <p className="muted">Acesse sua clínica com segurança.</p>
            </div>
          </div>

          {error ? (
            <div id="login-form-error" className="alert" role="alert" aria-live="assertive">
              {error}
            </div>
          ) : null}

          <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "login-form-error" : undefined}>
            <div className="field-group">
              <label htmlFor="username">Usuário</label>
              <input id="username" name="username" required autoComplete="username" />
            </div>
            <div className="field-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                required
                type="password"
                autoComplete="current-password"
              />
            </div>
            {showOtp ? (
              <div className="field-group">
                <label htmlFor="otp">Código MFA</label>
                <input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  autoComplete="one-time-code"
                  aria-describedby="otp-help"
                />
                <span id="otp-help" className="muted">Use o código de seis dígitos do seu aplicativo autenticador.</span>
              </div>
            ) : null}
            <button className="button-primary" disabled={isPending} type="submit">
              {isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <aside className="auth-security-panel" aria-label="Segurança do acesso">
          <span className="panel-pill">Acesso protegido</span>
          {mfaSecret ? (
            <div className="mfa-setup-card" role="status">
              <div className="mfa-setup-heading">
                <strong>Configure seu autenticador</strong>
                <p className="mfa-help">
                  Escaneie o QR Code ou copie o segredo no seu app autenticador.
                </p>
              </div>
              {mfaUri && showQr ? (
                <div className="mfa-qr-box">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/qr?data=${encodeURIComponent(mfaUri)}`}
                    alt=""
                    onError={() => setShowQr(false)}
                  />
                </div>
              ) : null}
              <div className="mfa-secret-box">
                <span>Segredo MFA</span>
                <code>{mfaSecret}</code>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={copyMfaSecret}
                >
                  {copiedSecret ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="login-trust-card">
              <strong>Dados clínicos exigem cuidado extra.</strong>
              <p>
                Contas administrativas usam MFA, sessões seguras e auditoria de
                eventos sensíveis.
              </p>
              <ul>
                <li>Isolamento por clínica</li>
                <li>Prontuário com controle de acesso</li>
                <li>Auditoria e LGPD desde a base</li>
              </ul>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
