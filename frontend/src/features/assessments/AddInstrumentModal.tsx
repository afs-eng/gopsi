"use client";

import { useMemo, useState } from "react";

import type { AssessmentInstrument, InstrumentApplication } from "@/lib/types";

type AddInstrumentModalProps = {
  instruments: AssessmentInstrument[];
  existingApplications: InstrumentApplication[];
  isSubmitting: boolean;
  patientBirthDate: string | null;
  onAdd: (instruments: AssessmentInstrument[]) => void;
  onClose: () => void;
};

function normalizeMonths(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatAgeRange(minMonthsValue: number | null | undefined, maxMonthsValue: number | null | undefined): string {
  const minMonths = normalizeMonths(minMonthsValue);
  const maxMonths = normalizeMonths(maxMonthsValue);
  const formatMonths = (months: number) => {
    if (months < 12) return `${months} mese${months === 1 ? "s" : ""}`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} ano${years > 1 ? "s" : ""}`;
    return `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} mese${remainingMonths === 1 ? "s" : ""}`;
  };

  if (minMonths !== null && maxMonths !== null) return `${formatMonths(minMonths)} – ${formatMonths(maxMonths)}`;
  if (minMonths !== null) return `A partir de ${formatMonths(minMonths)}`;
  if (maxMonths !== null) return `Até ${formatMonths(maxMonths)}`;
  return "Faixa etária não definida";
}

function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return Number.NaN;
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const age = years * 12 + months - (now.getDate() < birth.getDate() ? 1 : 0);
  return age >= 0 ? age : Number.NaN;
}

function categoryColor(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes("cogni") || normalized.includes("inteligência")) return "category-cognition";
  if (normalized.includes("atenção")) return "category-attention";
  if (normalized.includes("comportamento") || normalized.includes("personalidade")) return "category-behavior";
  if (normalized.includes("desenvolvimento")) return "category-development";
  if (normalized.includes("memória")) return "category-memory";
  if (normalized.includes("emocion") || normalized.includes("ansiedade") || normalized.includes("depressão")) return "category-emotional";
  if (normalized.includes("autismo") || normalized.includes("tea") || normalized.includes("espectro")) return "category-autism";
  return "category-default";
}

export function AddInstrumentModal({
  instruments,
  existingApplications,
  isSubmitting,
  patientBirthDate,
  onAdd,
  onClose,
}: AddInstrumentModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const patientAgeMonths = useMemo(() => {
    if (!patientBirthDate) return null;
    const age = calculateAgeInMonths(patientBirthDate);
    return Number.isFinite(age) ? age : null;
  }, [patientBirthDate]);

  const existingInstrumentIds = useMemo(() => {
    return new Set(
      existingApplications
        .map((application) => application.instrument)
        .filter((value): value is string => Boolean(value)),
    );
  }, [existingApplications]);

  const filteredInstruments = useMemo(() => {
    const term = search.toLowerCase();
    return instruments.filter((inst) => {
      const minAgeMonths = normalizeMonths(inst.min_age_months);
      const maxAgeMonths = normalizeMonths(inst.max_age_months);
      const matchesSearch =
        !term ||
        inst.name.toLowerCase().includes(term) ||
        inst.code.toLowerCase().includes(term) ||
        inst.description.toLowerCase().includes(term) ||
        inst.category.toLowerCase().includes(term);

      if (!inst.is_active) return false;
      if (!matchesSearch) return false;
      if (patientAgeMonths !== null && minAgeMonths === null && maxAgeMonths === null) return false;
      if (patientAgeMonths !== null && minAgeMonths !== null && patientAgeMonths < minAgeMonths) return false;
      if (patientAgeMonths !== null && maxAgeMonths !== null && patientAgeMonths > maxAgeMonths) return false;
      return true;
    });
  }, [instruments, patientAgeMonths, search]);

  const selectedInstruments = useMemo(() => {
    return selectedIds
      .map((id) => instruments.find((instrument) => instrument.id === id))
      .filter((instrument): instrument is AssessmentInstrument => Boolean(instrument));
  }, [instruments, selectedIds]);

  function formatPatientAge(): string {
    if (patientAgeMonths === null) return "";
    if (patientAgeMonths < 12) return `${patientAgeMonths} mese${patientAgeMonths === 1 ? "s" : ""}`;
    const years = Math.floor(patientAgeMonths / 12);
    const months = patientAgeMonths % 12;
    if (months === 0) return `${years} ${years === 1 ? "ano" : "anos"}`;
    return `${years} ${years === 1 ? "ano" : "anos"} e ${months} mese${months === 1 ? "s" : ""}`;
  }

  function getUnavailableReason(instrument: AssessmentInstrument): string | null {
    const minAgeMonths = normalizeMonths(instrument.min_age_months);
    const maxAgeMonths = normalizeMonths(instrument.max_age_months);
    if (existingInstrumentIds.has(instrument.id)) return "Já adicionado";
    if (patientAgeMonths !== null && minAgeMonths === null && maxAgeMonths === null) return "Sem faixa etária";
    if (patientAgeMonths !== null) {
      if (minAgeMonths !== null && patientAgeMonths < minAgeMonths) return "Idade incompatível";
      if (maxAgeMonths !== null && patientAgeMonths > maxAgeMonths) return "Idade incompatível";
    }
    return null;
  }

  function toggleInstrument(instrument: AssessmentInstrument) {
    if (getUnavailableReason(instrument)) return;
    setSelectedIds((current) => (
      current.includes(instrument.id)
        ? current.filter((id) => id !== instrument.id)
        : [...current, instrument.id]
    ));
  }

  function removeSelectedInstrument(instrumentId: string) {
    setSelectedIds((current) => current.filter((id) => id !== instrumentId));
  }

  function handleAddSelected() {
    if (!selectedInstruments.length || isSubmitting) return;
    onAdd(selectedInstruments);
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-instrument-title" onClick={onClose}>
      <div className="add-instrument-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
          </div>
          <div>
            <h2 id="add-instrument-title">Adicionar instrumento</h2>
            <p className="muted">Selecione os testes que serão planejados nesta avaliação.</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-search">
          <svg className="modal-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="modal-search-input"
            placeholder="Buscar instrumento por nome ou sigla..."
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-age-info">
          {patientAgeMonths !== null ? (
            <>Idade do paciente: <strong>{formatPatientAge()}</strong>. A lista mostra apenas testes compatíveis com a faixa etária.</>
          ) : (
            <>Sem data de nascimento válida. Informe a data do paciente para filtrar os testes por idade.</>
          )}
        </div>

        <div className="modal-instrument-workspace">
          <div className="modal-instrument-list">
            {filteredInstruments.map((instrument) => {
              const unavailableReason = getUnavailableReason(instrument);
              const isSelected = selectedIds.includes(instrument.id);
              return (
                <label
                  className={`modal-instrument-row ${unavailableReason ? "modal-instrument-excluded" : ""}`}
                  key={instrument.id}
                >
                  <input
                    checked={isSelected}
                    className="modal-instrument-checkbox"
                    disabled={Boolean(unavailableReason) || isSubmitting}
                    onChange={() => toggleInstrument(instrument)}
                    type="checkbox"
                  />
                  <div className="modal-instrument-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                    </svg>
                  </div>
                  <div className="modal-instrument-info">
                    <div className="modal-instrument-name">{instrument.name}</div>
                    <div className="modal-instrument-desc">
                      {instrument.description || instrument.code}
                    </div>
                  </div>
                  <div className="modal-instrument-meta">
                    <span className="modal-instrument-age">{formatAgeRange(instrument.min_age_months, instrument.max_age_months)}</span>
                    {instrument.category ? (
                      <span className={`modal-instrument-category ${categoryColor(instrument.category)}`}>
                        {instrument.category}
                      </span>
                    ) : null}
                  </div>
                  {unavailableReason ? <span className="modal-instrument-excluded-badge">{unavailableReason}</span> : null}
                </label>
              );
            })}

            {filteredInstruments.length === 0 && (
              <div className="modal-empty">
                <p>Nenhum instrumento compatível encontrado para a idade do paciente e busca informada.</p>
              </div>
            )}
          </div>

          <aside className="modal-selected-panel" aria-label="Testes selecionados">
            <div>
              <p className="eyebrow">Selecionados</p>
              <h3>{selectedInstruments.length} teste{selectedInstruments.length === 1 ? "" : "s"}</h3>
            </div>
            {selectedInstruments.length ? (
              <div className="modal-selected-list">
                {selectedInstruments.map((instrument) => (
                  <button
                    className="modal-selected-item"
                    key={instrument.id}
                    onClick={() => removeSelectedInstrument(instrument.id)}
                    type="button"
                  >
                    <span>{instrument.name}</span>
                    <strong>Remover</strong>
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted">Escolha um ou mais testes elegíveis na lista.</p>
            )}
          </aside>
        </div>

        <div className="modal-footer">
          <button className="button-secondary button-compact" disabled={isSubmitting} onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="button-primary button-compact"
            disabled={!selectedInstruments.length || isSubmitting}
            onClick={handleAddSelected}
            type="button"
          >
            {isSubmitting ? "Adicionando..." : `Adicionar ${selectedInstruments.length} teste${selectedInstruments.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
