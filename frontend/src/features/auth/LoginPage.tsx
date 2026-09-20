"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import {
  confirmPasswordReset,
  getCurrentUser,
  login,
  requestPasswordReset,
} from "@/lib/api";
import { setToken } from "@/lib/auth";

type AuthMode = "login" | "password-request" | "password-confirm";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetUid = searchParams.get("reset_uid") ?? "";
  const resetToken = searchParams.get("reset_token") ?? "";
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>(
    resetUid && resetToken ? "password-confirm" : "login",
  );
  const [showOtp, setShowOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    setNotice("");

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

  function handlePasswordResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    startTransition(async () => {
      try {
        const response = await requestPasswordReset(email);
        setNotice(response.detail);
      } catch {
        setError("Não foi possível solicitar a redefinição agora.");
      }
    });
  }

  function handlePasswordResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError("As senhas informadas não conferem.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await confirmPasswordReset(resetUid, resetToken, newPassword);
        setNotice(`${response.detail} Entre novamente com sua nova senha.`);
        setAuthMode("login");
        router.replace("/login");
      } catch {
        setError("Link inválido, expirado ou senha fora dos critérios de segurança.");
      }
    });
  }

  function backToLogin() {
    setAuthMode("login");
    setError("");
    setNotice("");
    router.replace("/login");
  }

  return (
    <main className="auth-page login-visual-page">
      <div className="login-top-note">
        <span>Plataforma para<br />psicólogos e clínicas</span>
      </div>

      <section className="login-visual-shell" aria-labelledby="login-title">
        <div className="login-logo-area" aria-label="GoPsi">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-marca-sem-fundo.png" alt="GoPsi" />
        </div>

        <aside className="login-hero-copy" aria-label="Mensagem da plataforma">
          <p>
            Cuidar<br />
            de pessoas<br />
            <span>é acreditar<br />em novos<br />começos.</span>
          </p>
        </aside>

        <section className="auth-card login-card" aria-label="Formulário de login">
          <div className="auth-form-panel login-form-panel">
            <div className="login-heading">
              <h1 id="login-title">
                {authMode === "login" ? "Entrar" : "Redefinir senha"}
              </h1>
              <p>
                {authMode === "login"
                  ? "Acesse sua conta profissional."
                  : "Recupere o acesso com segurança."}
              </p>
            </div>

          {error ? (
            <div id="login-form-error" className="alert" role="alert" aria-live="assertive">
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="success-alert login-status-alert" role="status" aria-live="polite">
              {notice}
            </div>
          ) : null}

          {authMode === "password-request" ? (
            <form className="form-stack" onSubmit={handlePasswordResetRequest} aria-describedby={error ? "login-form-error" : undefined}>
              <div className="field-group login-field-group">
                <label htmlFor="reset-email">E-mail cadastrado</label>
                <div className="login-input-wrap">
                  <span aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M4.75 6.75h14.5v10.5H4.75z" />
                      <path d="m5.25 7.25 6.75 5.5 6.75-5.5" />
                    </svg>
                  </span>
                  <input
                    id="reset-email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="seu@e-mail.com"
                    type="email"
                  />
                </div>
              </div>
              <button className="button-primary login-submit-button" disabled={isPending} type="submit">
                <span>{isPending ? "Enviando..." : "Enviar instruções"}</span>
                <span aria-hidden="true">→</span>
              </button>
              <button className="login-link-button" type="button" onClick={backToLogin}>
                Voltar para o login
              </button>
            </form>
          ) : null}

          {authMode === "password-confirm" ? (
            <form className="form-stack" onSubmit={handlePasswordResetConfirm} aria-describedby={error ? "login-form-error" : undefined}>
              <div className="field-group login-field-group">
                <label htmlFor="new-password">Nova senha</label>
                <div className="login-input-wrap">
                  <span aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <rect x="5.75" y="10.25" width="12.5" height="8" rx="1.5" />
                      <path d="M8.25 10.25V7.9a3.75 3.75 0 0 1 7.5 0v2.35" />
                      <path d="M12 13.5v2" />
                    </svg>
                  </span>
                  <input
                    id="new-password"
                    name="newPassword"
                    required
                    minLength={8}
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Digite a nova senha"
                  />
                  <button
                    className="login-icon-button"
                    type="button"
                    onClick={() => setShowNewPassword((current) => !current)}
                    aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" />
                      <circle cx="12" cy="12" r="2.5" />
                      {showNewPassword ? null : <path d="m4 20 16-16" />}
                    </svg>
                  </button>
                </div>
              </div>
              <div className="field-group login-field-group">
                <label htmlFor="confirm-password">Confirmar senha</label>
                <div className="login-input-wrap">
                  <span aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M6 12.5 10.2 16.5 18.5 7.5" />
                    </svg>
                  </span>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>
              <p className="login-reset-help">
                Depois da redefinição, contas com MFA continuarão solicitando o código do aplicativo autenticador no login.
              </p>
              <button className="button-primary login-submit-button" disabled={isPending} type="submit">
                <span>{isPending ? "Salvando..." : "Redefinir senha"}</span>
                <span aria-hidden="true">→</span>
              </button>
              <button className="login-link-button" type="button" onClick={backToLogin}>
                Voltar para o login
              </button>
            </form>
          ) : null}

          {authMode === "login" ? (
          <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "login-form-error" : undefined}>
            <div className="field-group login-field-group">
              <label htmlFor="username">E-mail ou usuário</label>
              <div className="login-input-wrap">
                <span aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M4.75 6.75h14.5v10.5H4.75z" />
                    <path d="m5.25 7.25 6.75 5.5 6.75-5.5" />
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  placeholder="seu@e-mail.com ou admin"
                  type="text"
                />
              </div>
            </div>
            <div className="field-group login-field-group">
              <label htmlFor="password">Senha</label>
              <div className="login-input-wrap">
                <span aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <rect x="5.75" y="10.25" width="12.5" height="8" rx="1.5" />
                    <path d="M8.25 10.25V7.9a3.75 3.75 0 0 1 7.5 0v2.35" />
                    <path d="M12 13.5v2" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                />
                <button
                  className="login-icon-button"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" />
                    <circle cx="12" cy="12" r="2.5" />
                    {showPassword ? null : <path d="m4 20 16-16" />}
                  </svg>
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="login-checkbox-row">
                <input type="checkbox" name="remember" />
                <span>Manter-me conectado</span>
              </label>
              <button
                className="login-inline-link"
                type="button"
                onClick={() => {
                  setAuthMode("password-request");
                  setError("");
                  setNotice("");
                }}
              >
                Esqueci minha senha
              </button>
            </div>

            {showOtp ? (
              <div className="field-group login-field-group">
                <label htmlFor="otp">Código MFA</label>
                <div className="login-input-wrap">
                  <span aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M7 7h4v4H7zM13 7h4v4h-4zM7 13h4v4H7zM14 14h1.5v1.5H14zM17 13h1.5v1.5H17zM16 16h2v2h-2zM13 17h1.5v1.5H13z" />
                    </svg>
                  </span>
                  <input
                    id="otp"
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    aria-describedby="otp-help"
                  />
                </div>
                <span id="otp-help" className="muted">Use o código de seis dígitos do seu aplicativo autenticador.</span>
              </div>
            ) : null}
            <button className="button-primary login-submit-button" disabled={isPending} type="submit">
              <span>{isPending ? "Entrando..." : "Entrar"}</span>
              <span aria-hidden="true">→</span>
            </button>

            <div className="login-divider"><span>ou</span></div>

            <button
              className="login-mfa-button"
              type="button"
              onClick={() => setShowOtp((current) => !current)}
              aria-expanded={showOtp}
            >
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM15 15h1.5v1.5H15zM18 14h1.5v1.5H18zM17.5 17.5H20V20h-2.5zM13.5 18h1.5v1.5h-1.5z" />
              </svg>
              <span>{showOtp ? "Ocultar código MFA" : "Usar código MFA"}</span>
            </button>
          </form>
          ) : null}

            {authMode === "login" && mfaSecret ? (
              <div className="mfa-setup-card login-mfa-setup" role="status">
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
            ) : null}

            <div className="login-secure-note">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <rect x="5.75" y="10.25" width="12.5" height="8" rx="1.5" />
                <path d="M8.25 10.25V7.9a3.75 3.75 0 0 1 7.5 0v2.35" />
              </svg>
              <div>
                <strong>Ambiente seguro para dados clínicos.</strong>
                <p>Seus dados são protegidos com criptografia e seguem a LGPD.</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="login-right-art" aria-hidden="true">
          <div className="login-petal login-petal-one" />
          <div className="login-petal login-petal-two" />
          <p>Aqui a psicologia<br />ganha movimento.</p>
        </aside>

        <footer className="login-footer">
          <span>© 2026 GoPsi. Todos os direitos reservados.</span>
          <nav aria-label="Links institucionais">
            <a href="#privacy">Privacidade</a>
            <a href="#terms">Termos de uso</a>
            <a href="#support">Suporte</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
