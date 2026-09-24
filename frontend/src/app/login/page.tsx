import { Suspense } from "react";

import { LoginPage } from "@/features/auth/LoginPage";

export default function Login() {
  return (
    <Suspense fallback={<main className="auth-page loading-page">Carregando...</main>}>
      <LoginPage />
    </Suspense>
  );
}
