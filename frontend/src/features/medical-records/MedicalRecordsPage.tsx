"use client";

import Link from "next/link";
import { use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import { getClinic, listMedicalRecords, voidMedicalRecord } from "@/lib/api";
import type { Clinic, MedicalRecordEntry } from "@/lib/types";

type MedicalRecordsPageProps = {
  params: Promise<{ id: string }>;
};

const entryTypeLabels: Record<string, string> = {
  EVOLUTION: "Evolução",
  INITIAL_ASSESSMENT: "Avaliação inicial",
  SESSION_NOTE: "Nota de sessão",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  FINAL: "Finalizado",
  VOIDED: "Anulado",
};

async function getMedicalRecordData(clinicId: string) {
  const [clinicData, recordData] = await Promise.all([
    getClinic(clinicId),
    listMedicalRecords(clinicId),
  ]);
  return { clinicData, recordData };
}

export function MedicalRecordsPage({ params }: MedicalRecordsPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [records, setRecords] = useState<MedicalRecordEntry[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeRecordId, setActiveRecordId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    getMedicalRecordData(id)
      .then(({ clinicData, recordData }) => {
        setClinic(clinicData);
        setRecords(recordData);
      })
      .catch(() => setError("Não foi possível carregar o prontuário."));
  }, [id, user]);

  async function loadRecords() {
    const { clinicData, recordData } = await getMedicalRecordData(id);
    setClinic(clinicData);
    setRecords(recordData);
  }

  function handleVoid(record: MedicalRecordEntry) {
    if (!window.confirm(`Você está prestes a anular o registro de ${record.patient_name}, ${entryTypeLabels[record.entry_type] ?? "registro clínico"}. Esta ação será auditada e não poderá ser desfeita. Deseja continuar?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setActiveRecordId(record.id);

    startTransition(async () => {
      try {
        await voidMedicalRecord(record.id);
        await loadRecords();
        setSuccess("Registro anulado e auditado.");
      } catch {
        setError("Não foi possível anular o registro.");
      } finally {
        setActiveRecordId("");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error && !clinic) {
    return (
      <AppShell activeNav="medicalRecords" eyebrow="Prontuário" title="Acesso bloqueado" user={user}>
        <section className="panel-card">
          <div className="alert" role="alert" aria-live="assertive">{error}</div>
          <Link className="button-secondary button-compact" href="/">
            Voltar ao dashboard
          </Link>
        </section>
      </AppShell>
    );
  }

  if (!clinic) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando prontuário...</main>;
  }

  const activeRecords = records.filter((record) => record.is_active);
  const finalRecords = records.filter((record) => record.status === "FINAL");
  const draftRecords = records.filter((record) => record.status === "DRAFT");

  return (
    <AppShell
      activeNav="medicalRecords"
      currentClinic={clinic}
      eyebrow="Prontuário protegido"
      title="Registros clínicos"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/medical-records/new`}>
          Novo registro
        </Link>
      }
    >
      <section className="metrics-grid" aria-label="Resumo do prontuário">
        <MetricCard label="Registros ativos" value={activeRecords.length} description="Entradas clínicas disponíveis para consulta." />
        <MetricCard label="Finalizados" value={finalRecords.length} description="Registros bloqueados como versão clínica." />
        <MetricCard label="Rascunhos" value={draftRecords.length} description="Entradas ainda em elaboração." />
      </section>

      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}
      {success ? <div className="success-alert" role="status" aria-live="polite">{success}</div> : null}

      <section className="panel-card privacy-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Acesso sensível</p>
            <h2>Entradas do prontuário</h2>
            <p className="muted">A abertura e alteração de registros é controlada por permissão e auditoria.</p>
          </div>
          <span className="panel-pill">{records.length} registro(s)</span>
        </div>

        {records.length ? (
          <div className="clinic-list">
            {records.map((record) => (
              <article className="clinic-row record-row" key={record.id}>
                <div>
                  <strong>{record.patient_name}</strong>
                  <p>Tipo: {entryTypeLabels[record.entry_type]} · Profissional: {record.professional_name}</p>
                  <p className="record-preview" aria-label="Prévia do conteúdo clínico">{record.content.slice(0, 180)}{record.content.length > 180 ? "..." : ""}</p>
                  <p>Metadados: {record.versions.length} versão(ões) · atualizado em {new Date(record.updated_at).toLocaleString("pt-BR")}</p>
                </div>
                <div className="row-actions">
                  <span className="status-badge">{statusLabels[record.status]}</span>
                  {record.status !== "VOIDED" ? (
                    <button className="button-secondary button-compact" disabled={isPending && activeRecordId === record.id} type="button" onClick={() => handleVoid(record)}>
                      {isPending && activeRecordId === record.id ? "Anulando..." : "Anular registro"}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum registro clínico</h3>
            <p>Crie a primeira evolução, avaliação ou nota de sessão para um paciente.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/medical-records/new`}>
              Criar registro
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
