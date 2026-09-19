"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken } from "@/lib/auth";
import type { User } from "@/lib/types";

export function PlatformShell({ activeNav, children, title, user }: { activeNav: "clinics"; children: React.ReactNode; title: string; user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Navegação da plataforma">
      <div className="sidebar-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-marca-sem-fundo.png" alt="GoPsi" />
      </div>
      <nav className="nav-list" aria-label="Menu da plataforma">
        <Link className={activeNav === "clinics" ? "active" : ""} aria-current={activeNav === "clinics" ? "page" : undefined} data-icon="clinic" href="/platform" onClick={() => setOpen(false)}><span>Clínicas</span></Link>
      </nav>
      <div className="sidebar-footer"><span className="muted">{user.full_name || user.username}</span><button className="button-secondary button-compact" type="button" onClick={() => { clearToken(); router.replace("/login"); }}>Sair</button></div>
    </aside>
    {open ? <button className="drawer-backdrop" type="button" aria-label="Fechar menu" onClick={() => setOpen(false)} /> : null}
    <main className="content-area"><header className="topbar"><button className="menu-button" type="button" aria-expanded={open} aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>☰ <span>Menu</span></button><div><p className="eyebrow">Administração</p><h1>{title}</h1></div><span className="panel-pill">Gestão da plataforma</span></header>{children}</main>
  </div>;
}
