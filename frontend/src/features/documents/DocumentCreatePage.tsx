"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import {
  createDocumentTemplate,
  createGeneratedDocument,
  getClinic,
  listDocumentTemplates,
  listPatients,
  listProfessionals,
} from "@/lib/api";
import type { Clinic, DocumentTemplate, Patient, Professional } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type DocumentCreatePageProps = {
  params: Promise<{ id: string }>;
};

const defaultBody = "Declaro, para os devidos fins, que o atendimento foi registrado nesta clínica conforme as informações administrativas disponíveis.";

export function DocumentCreatePage({ params }: DocumentCreatePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [mode, setMode] = useState<"document" | "template">("document");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([
      getClinic(id),
      listDocumentTemplates(id),
      listPatients(id),
      listProfessionals(id),
    ])
      .then(([clinicData, templatesData, patientsData, professionalsData]) => {
        setClinic(clinicData);
        setTemplates(templatesData);
        setPatients(patientsData);
        setProfessionals(professionalsData);
      })
      .catch(() => setError("Não foi possível carregar os dados da clínica."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (!clinic) {
    return (
      <AppShell activeNav="documents" eyebrow="Documentos" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href={`/clinics/${id}/documents`}>
            Voltar
          </Link>
        </section>
      </AppShell>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    if (mode === "document" && ["FINAL", "SIGNED"].includes(String(form.get("status")))) {
      const status = String(form.get("status")) === "SIGNED" ? "assinado" : "finalizado";
      if (!window.confirm(`Este documento será salvo como ${status}. Essa classificação pode restringir alterações futuras. Deseja continuar?`)) {
        return;
      }
    }

    startTransition(async () => {
      try {
        if (mode === "template") {
          await createDocumentTemplate({
            clinic: id,
            name: String(form.get("name") || ""),
            template_type: String(form.get("template_type") || "DECLARATION") as "DECLARATION",
            body: String(form.get("body") || ""),
          });
        } else {
          await createGeneratedDocument({
            clinic: id,
            template: String(form.get("template") || "") || null,
            patient: String(form.get("patient") || "") || null,
            professional: String(form.get("professional") || "") || null,
            title: String(form.get("title") || ""),
            content: String(form.get("content") || ""),
            status: String(form.get("status") || "DRAFT") as "DRAFT",
          });
        }
        router.push(`/clinics/${id}/documents`);
      } catch {
        setError("Não foi possível salvar o documento.");
      }
    });
  }

  return (
    <AppShell
      activeNav="documents"
      currentClinic={clinic}
      eyebrow="Documentos"
      title="Novo documento"
      user={user}
      actions={
        <Link className="button-secondary button-compact" href={`/clinics/${id}/documents`}>
          Voltar
        </Link>
      }
    >
      <section className="form-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Fase 7</p>
            <h2>{mode === "document" ? "Gerar documento" : "Criar modelo"}</h2>
          </div>
          <button
            className="button-secondary button-compact"
            type="button"
            aria-pressed={mode === "template"}
            onClick={() => setMode((current) => (current === "document" ? "template" : "document"))}
          >
            {mode === "document" ? "Criar modelo" : "Gerar documento"}
          </button>
        </div>

        {error ? <div className="alert" id="document-form-error" role="alert" aria-live="assertive">{error}</div> : null}

        <form className="form-stack" onSubmit={handleSubmit} aria-describedby={error ? "document-form-error" : undefined}>
          {mode === "template" ? (
            <>
              <fieldset className="form-section">
                <legend className="eyebrow">Metadados do modelo</legend>
              <label className="field-group" htmlFor="name">Nome do modelo<input id="name" name="name" required placeholder="Declaração de comparecimento" /></label>
              <label className="field-group" htmlFor="template_type">Tipo<select id="template_type" name="template_type" defaultValue="DECLARATION">
                  <option value="DECLARATION">Declaração</option>
                  <option value="CONSENT">Consentimento</option>
                  <option value="REPORT">Relatório</option>
                  <option value="RECEIPT">Recibo</option>
                  <option value="OTHER">Outro</option>
                </select></label>
              <label className="field-group" htmlFor="body">Texto do modelo<textarea id="body" name="body" required rows={8} defaultValue={defaultBody} /></label>
              </fieldset>
            </>
          ) : (
            <>
              <fieldset className="form-section">
                <legend className="eyebrow">Metadados e acesso</legend>
              <label className="field-group" htmlFor="title">Título<input id="title" name="title" required placeholder="Declaração de comparecimento" /></label>
              <div className="field-grid">
                <label className="field-group" htmlFor="template">Modelo<select id="template" name="template" defaultValue="">
                    <option value="">Documento avulso</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select></label>
                <label className="field-group" htmlFor="status">Status<select id="status" name="status" defaultValue="DRAFT">
                    <option value="DRAFT">Rascunho</option>
                    <option value="FINAL">Finalizado</option>
                    <option value="SIGNED">Assinado</option>
                  </select></label>
              </div>
              <div className="field-grid">
                <label className="field-group" htmlFor="patient">Paciente<select id="patient" name="patient" defaultValue="">
                    <option value="">Sem paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                    ))}
                  </select></label>
                <label className="field-group" htmlFor="professional">Profissional<select id="professional" name="professional" defaultValue="">
                    <option value="">Sem profissional</option>
                    {professionals.map((professional) => (
                      <option key={professional.id} value={professional.id}>{professional.full_name}</option>
                    ))}
                  </select></label>
              </div>
              </fieldset>
              <fieldset className="form-section">
                <legend className="eyebrow">Conteúdo protegido</legend>
              <label className="field-group" htmlFor="content">Conteúdo<textarea id="content" name="content" required rows={10} defaultValue={defaultBody} /></label>
              </fieldset>
            </>
          )}

          <button className="button-primary" disabled={isPending} type="submit">
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
