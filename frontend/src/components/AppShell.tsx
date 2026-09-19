"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { clearToken } from "@/lib/auth";
import type { Clinic, User } from "@/lib/types";

type AppShellProps = {
  activeNav:
    | "dashboard"
    | "clinic"
    | "profile"
    | "professionals"
    | "patients"
    | "appointments"
    | "telehealth"
    | "documents"
    | "medicalRecords"
    | "billing"
    | "reports"
    | "settings";
  children: React.ReactNode;
  currentClinic?: Clinic;
  eyebrow: string;
  title: string;
  user: User;
  actions?: React.ReactNode;
};

export function AppShell({
  activeNav,
  children,
  currentClinic,
  eyebrow,
  title,
  user,
  actions,
}: AppShellProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const userName = user.full_name || user.username;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 860px)");
    const updateViewport = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
        if (document.activeElement === menuButtonRef.current) {
          sidebarRef.current?.querySelector<HTMLElement>("a")?.focus();
        }
      }
    };
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!menuOpen || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          sidebarRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [],
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, menuOpen]);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="app-shell">
      <aside
        ref={sidebarRef}
        className={`sidebar ${menuOpen ? "is-open" : ""}`}
        id="primary-navigation"
        aria-hidden={isMobile && !menuOpen ? true : undefined}
        inert={isMobile && !menuOpen ? true : undefined}
      >
        <div className="sidebar-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-marca-sem-fundo.png" alt="GoPsi" />
        </div>
        <nav className="nav-list" aria-label="Menu principal">
          <Link aria-current={activeNav === "dashboard" ? "page" : undefined} className={activeNav === "dashboard" ? "active" : ""} data-icon="grid" href="/" onClick={() => setMenuOpen(false)}>
            <span>Inicio</span>
          </Link>
          {currentClinic ? (
            <>
              <Link
                aria-current={activeNav === "clinic" ? "page" : undefined}
                className={activeNav === "clinic" ? "active" : ""}
                data-icon="clinic"
                href={`/clinics/${currentClinic.id}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Clínica</span>
              </Link>
              <Link
                aria-current={activeNav === "profile" ? "page" : undefined}
                className={activeNav === "profile" ? "active" : ""}
                data-icon="profile"
                href={`/clinics/${currentClinic.id}/profile`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Perfil</span>
              </Link>
              <Link
                aria-current={activeNav === "professionals" ? "page" : undefined}
                className={activeNav === "professionals" ? "active" : ""}
                data-icon="people"
                href={`/clinics/${currentClinic.id}/professionals`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Profissionais</span>
              </Link>
              <Link
                aria-current={activeNav === "patients" ? "page" : undefined}
                className={activeNav === "patients" ? "active" : ""}
                data-icon="patient"
                href={`/clinics/${currentClinic.id}/patients`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Pacientes</span>
              </Link>
              <Link
                aria-current={activeNav === "appointments" ? "page" : undefined}
                className={activeNav === "appointments" ? "active" : ""}
                data-icon="calendar"
                href={`/clinics/${currentClinic.id}/appointments`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Agenda</span>
              </Link>
              <Link
                aria-current={activeNav === "telehealth" ? "page" : undefined}
                className={activeNav === "telehealth" ? "active" : ""}
                data-icon="video"
                href={`/clinics/${currentClinic.id}/telehealth`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Teleatendimento</span>
              </Link>
              <Link
                aria-current={activeNav === "documents" ? "page" : undefined}
                className={activeNav === "documents" ? "active" : ""}
                data-icon="document"
                href={`/clinics/${currentClinic.id}/documents`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Documentos</span>
              </Link>
              <Link
                aria-current={activeNav === "medicalRecords" ? "page" : undefined}
                className={activeNav === "medicalRecords" ? "active" : ""}
                data-icon="records"
                href={`/clinics/${currentClinic.id}/medical-records`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Prontuário</span>
              </Link>
              <Link
                aria-current={activeNav === "billing" ? "page" : undefined}
                className={activeNav === "billing" ? "active" : ""}
                data-icon="billing"
                href={`/clinics/${currentClinic.id}/billing`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Financeiro</span>
              </Link>
            </>
          ) : (
            <Link data-icon="clinic" href="/#clinicas" onClick={() => setMenuOpen(false)}>
              <span>Clínicas</span>
            </Link>
          )}
          <div className="nav-divider" />
          {currentClinic ? (
            <>
              <Link aria-current={activeNav === "reports" ? "page" : undefined} className={activeNav === "reports" ? "active" : ""} data-icon="reports" href={`/clinics/${currentClinic.id}/reports`} onClick={() => setMenuOpen(false)}><span>Relatórios</span></Link>
              <Link aria-current={activeNav === "settings" ? "page" : undefined} className={activeNav === "settings" ? "active" : ""} data-icon="settings" href={`/clinics/${currentClinic.id}/settings`} onClick={() => setMenuOpen(false)}><span>Configurações</span></Link>
            </>
          ) : (
            <>
              <span aria-disabled="true" data-icon="◫">Relatórios</span>
              <span aria-disabled="true" data-icon="⚙">Configurações</span>
            </>
          )}
        </nav>
      </aside>

      {menuOpen ? (
        <button className="drawer-backdrop" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />
      ) : null}
      <main className="content-area">
        <header className="topbar">
          <button
            className="menu-button"
            type="button"
            ref={menuButtonRef}
            tabIndex={isMobile ? 0 : -1}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Fechar menu principal" : "Abrir menu principal"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span aria-hidden="true">☰</span>
            <span>Menu</span>
          </button>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="muted topbar-date">{today}</p>
          </div>
          <div className="topbar-actions">
            <label className="topbar-search">
              <span>Buscar</span>
              <input placeholder="Buscar pacientes, consultas, documentos..." disabled />
            </label>
            {currentClinic ? (
              <Link className="clinic-switcher" href={`/clinics/${currentClinic.id}`}>
                <span aria-hidden="true">▦</span>
                <strong>{currentClinic.name}</strong>
                <small>Goiânia · GO</small>
              </Link>
            ) : null}
            <button
              className="header-icon-button notification-button"
              type="button"
              aria-label="Abrir notificações"
              disabled
            >
              <span aria-hidden="true">◖</span>
            </button>
            <span className="user-chip" aria-label={`Sessão de ${userName}`}>
              {userName.slice(0, 1).toUpperCase()}
            </span>
            {actions}
            <button className="button-secondary" type="button" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
