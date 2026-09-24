"use client";

import Link from "next/link";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import {
  getClinic,
  getGeneratedDocumentPdfUrl,
  listDocumentTemplates,
  listGeneratedDocuments,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Clinic, DocumentTemplate, GeneratedDocument } from "@/lib/types";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";

type DocumentsPageProps = {
  params: Promise<{ id: string }>;
};

export function DocumentsPage({ params }: DocumentsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getClinic(id), listDocumentTemplates(id), listGeneratedDocuments(id)])
      .then(([clinicData, templatesData, documentsData]) => {
        setClinic(clinicData);
        setTemplates(templatesData);
        setDocuments(documentsData);
      })
      .catch(() => setError("Não foi possível carregar os documentos."));
  }, [id, user]);

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error || !clinic) {
    return (
      <AppShell activeNav="documents" eyebrow="Documentos" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error || "Clínica não encontrada."}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  const documentStatus = (status: string) =>
    ({ DRAFT: "Rascunho", FINAL: "Finalizado", SIGNED: "Assinado", VOIDED: "Anulado" }[status] ?? status);
  const templateType = (type: string) =>
    ({ DECLARATION: "Declaração", CONSENT: "Consentimento", REPORT: "Relatório", RECEIPT: "Recibo", OTHER: "Outro" }[type] ?? type);

  function handleDownloadPdf(document: GeneratedDocument) {
    setError("");
    setDownloadingId(document.id);

    startTransition(async () => {
      try {
        const response = await fetch(getGeneratedDocumentPdfUrl(document.id), {
          headers: { Authorization: `Token ${getToken()}` },
        });
        if (!response.ok) {
          throw new Error("download-failed");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = `${document.title || "documento"}.pdf`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      } catch {
        setError("Não foi possível baixar o PDF.");
      } finally {
        setDownloadingId("");
      }
    });
  }

  return (
    <AppShell
      activeNav="documents"
      currentClinic={clinic}
      eyebrow="Documentos"
      title="Modelos e PDFs"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/documents/new`}>
          Novo documento
        </Link>
      }
    >
      <section className="metrics-grid" aria-label="Resumo de documentos">
        <MetricCard
          label="Documentos ativos"
          value={documents.filter((document) => document.is_active).length}
          description="Arquivos gerados com vínculo à clínica atual."
        />
        <MetricCard
          label="Modelos"
          value={templates.filter((template) => template.is_active).length}
          description="Textos reutilizáveis para declarações e termos."
        />
        <MetricCard
          label="PDF"
          value="Ativo"
          description="Download autenticado, sem link público direto."
        />
      </section>

      <section className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Geração</p>
            <h2>Documentos emitidos</h2>
          </div>
          <span className="panel-pill">{documents.length} registro(s)</span>
        </div>

        {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}

        {documents.length ? (
          <div className="clinic-list">
            {documents.map((document) => (
              <article className="clinic-row" key={document.id}>
                <div>
                  <strong>{document.title}</strong>
                  <p>
                    Paciente: {document.patient_name || "não vinculado"} · Modelo: {document.template_name || "avulso"}
                  </p>
                </div>
                <div className="row-actions">
                  <span className="status-badge" aria-label={`Status: ${documentStatus(document.status)}`}>
                    {documentStatus(document.status)}
                  </span>
                  <button
                    className="button-secondary button-compact"
                    disabled={isPending && downloadingId === document.id}
                    type="button"
                    onClick={() => handleDownloadPdf(document)}
                    aria-label={`Baixar PDF de ${document.title}`}
                  >
                    {isPending && downloadingId === document.id ? "Baixando..." : "PDF"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum documento gerado</h3>
            <p>Crie um modelo ou gere um documento avulso para o paciente.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/documents/new`}>
              Criar documento
            </Link>
          </div>
        )}
      </section>

      <section className="panel-card section-gap">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Modelos</p>
            <h2>Textos reutilizáveis</h2>
          </div>
          <span className="panel-pill">{templates.length} modelo(s)</span>
        </div>

        {templates.length ? (
          <div className="clinic-list">
            {templates.map((template) => (
              <article className="clinic-row" key={template.id}>
                <div>
                  <strong>{template.name}</strong>
                  <p>{template.body.slice(0, 110)}{template.body.length > 110 ? "..." : ""}</p>
                </div>
                <span className="status-badge">{templateType(template.template_type)}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum modelo cadastrado</h3>
            <p>Você ainda pode gerar documentos avulsos nesta fase.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
