"use client";

import { useMemo, useState } from "react";

import type { AssessmentInstrument } from "@/lib/types";

type AddInstrumentModalProps = {
  instruments: AssessmentInstrument[];
  patientBirthDate: string | null;
  onSelect: (instrument: AssessmentInstrument) => void;
  onClose: () => void;
};

function formatAgeRange(minMonths: number | null, maxMonths: number | null): string {
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
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  return years * 12 + months;
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

export function AddInstrumentModal({ instruments, patientBirthDate, onSelect, onClose }: AddInstrumentModalProps) {
  const [search, setSearch] = useState("");

  const patientAgeMonths = useMemo(() => {
    if (!patientBirthDate) return null;
    return calculateAgeInMonths(patientBirthDate);
  }, [patientBirthDate]);

  const filteredInstruments = useMemo(() => {
    const term = search.toLowerCase();
    return instruments.filter((inst) => {
      const matchesSearch =
        !term ||
        inst.name.toLowerCase().includes(term) ||
        inst.code.toLowerCase().includes(term) ||
        inst.description.toLowerCase().includes(term) ||
        inst.category.toLowerCase().includes(term);

      if (!inst.is_active) return false;
      if (!matchesSearch) return false;

      if (patientAgeMonths !== null) {
        if (inst.min_age_months !== null && patientAgeMonths < inst.min_age_months) return false;
        if (inst.max_age_months !== null && patientAgeMonths > inst.max_age_months) return false;
      }

      return true;
    });
  }, [instruments, search, patientAgeMonths]);

  const excludedInstruments = useMemo(() => {
    if (patientAgeMonths === null) return [];
    const term = search.toLowerCase();
    return instruments.filter((inst) => {
      if (!inst.is_active) return false;
      const matchesSearch =
        !term ||
        inst.name.toLowerCase().includes(term) ||
        inst.code.toLowerCase().includes(term) ||
        inst.description.toLowerCase().includes(term) ||
        inst.category.toLowerCase().includes(term);
      if (!matchesSearch) return false;
      if (inst.min_age_months !== null && patientAgeMonths < inst.min_age_months) return true;
      if (inst.max_age_months !== null && patientAgeMonths > inst.max_age_months) return true;
      return false;
    });
  }, [instruments, search, patientAgeMonths]);

  function formatPatientAge(): string {
    if (patientAgeMonths === null) return "";
    if (patientAgeMonths < 12) return `${patientAgeMonths} mese${patientAgeMonths === 1 ? "s" : ""}`;
    const years = Math.floor(patientAgeMonths / 12);
    const months = patientAgeMonths % 12;
    if (months === 0) return `${years} ${years === 1 ? "ano" : "anos"}`;
    return `${years} ${years === 1 ? "ano" : "anos"} e ${months} mese${months === 1 ? "s" : ""}`;
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
            <p className="muted">Selecione um instrumento para adicionar nesta avaliação.</p>
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

        {patientAgeMonths !== null && (
          <div className="modal-age-info">
            Idade do paciente: <strong>{formatPatientAge()}</strong>
          </div>
        )}

        <div className="modal-instrument-list">
          {filteredInstruments.map((instrument) => (
            <div className="modal-instrument-row" key={instrument.id}>
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
              <button
                className="modal-instrument-add-btn"
                onClick={() => onSelect(instrument)}
                type="button"
                aria-label={`Adicionar ${instrument.name}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          ))}

          {excludedInstruments.length > 0 && (
            <div className="modal-excluded-section">
              <p className="modal-excluded-label">Fora da faixa etária</p>
              {excludedInstruments.map((instrument) => (
                <div className="modal-instrument-row modal-instrument-excluded" key={instrument.id}>
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
                  <span className="modal-instrument-excluded-badge">Fora da faixa</span>
                </div>
              ))}
            </div>
          )}

          {filteredInstruments.length === 0 && excludedInstruments.length === 0 && (
            <div className="modal-empty">
              <p>Nenhum instrumento encontrado para os critérios informados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
