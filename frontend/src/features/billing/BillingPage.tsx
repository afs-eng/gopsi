"use client";

import Link from "next/link";
import { FormEvent, use, useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { useAuthenticatedData } from "@/features/clinics/useAuthenticatedData";
import {
  cancelInvoice,
  createPayment,
  getClinic,
  listInvoices,
  listPayments,
  listTransactions,
} from "@/lib/api";
import type { Clinic, Invoice, Payment, Transaction } from "@/lib/types";

type BillingPageProps = {
  params: Promise<{ id: string }>;
};

type InvoiceFilter = "ALL" | "OPEN" | "OVERDUE" | "PAID" | "DRAFT" | "CANCELLED";

const currency = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

const invoiceStatusLabels: Record<Invoice["status"], string> = {
  CANCELLED: "Cancelada",
  DRAFT: "Rascunho",
  OPEN: "Aberta",
  OVERDUE: "Vencida",
  PAID: "Paga",
  REFUNDED: "Reembolsada",
};

const paymentStatusLabels: Record<Payment["status"], string> = {
  AUTHORIZED: "Autorizado",
  CANCELLED: "Cancelado",
  FAILED: "Falhou",
  PAID: "Pago",
  PENDING: "Pendente",
  REFUNDED: "Reembolsado",
};

const paymentMethodLabels: Record<Payment["method"], string> = {
  BANK_TRANSFER: "Transferência",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  EXTERNAL_GATEWAY: "Gateway externo",
  OTHER: "Outro",
  PIX: "Pix",
};

const invoiceFilters: Array<{ label: string; value: InvoiceFilter }> = [
  { label: "Todas", value: "ALL" },
  { label: "Em aberto", value: "OPEN" },
  { label: "Vencidas", value: "OVERDUE" },
  { label: "Pagas", value: "PAID" },
  { label: "Rascunhos", value: "DRAFT" },
  { label: "Canceladas", value: "CANCELLED" },
];

function money(value: string | number) {
  return currency.format(Number(value || 0));
}

function amountInCents(value: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) {
    return null;
  }

  const [whole, fraction = ""] = value.trim().split(".");
  const cents = Number(`${fraction}00`.slice(0, 2));
  const wholeAmount = Number(whole);
  return Number.isSafeInteger(wholeAmount) ? wholeAmount * 100 + cents : null;
}

function isFullPaymentAmount(value: string, invoiceAmount: string) {
  const paymentCents = amountInCents(value);
  const outstandingCents = amountInCents(invoiceAmount);
  return outstandingCents !== null && outstandingCents > 0 && paymentCents === outstandingCents;
}

function paymentAmountError(value: string, invoiceAmount: string) {
  if (!value.trim()) {
    return "Informe o valor integral da cobrança.";
  }

  if (!isFullPaymentAmount(value, invoiceAmount)) {
    return `Informe exatamente ${money(invoiceAmount)}. Pagamentos parciais não são suportados.`;
  }

  return "";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sem vencimento";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sem baixa";
  }

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function isInvoiceOverdue(invoice: Invoice) {
  if (!invoice.due_date || invoice.status !== "OPEN") {
    return false;
  }

  return new Date(`${invoice.due_date}T23:59:59`) < new Date();
}

function invoiceDisplayStatus(invoice: Invoice) {
  return isInvoiceOverdue(invoice) ? "OVERDUE" : invoice.status;
}

async function getBillingData(clinicId: string) {
  const [clinicData, invoiceData, paymentData, transactionData] = await Promise.all([
    getClinic(clinicId),
    listInvoices(clinicId),
    listPayments(clinicId),
    listTransactions(clinicId),
  ]);
  return { clinicData, invoiceData, paymentData, transactionData };
}

export function BillingPage({ params }: BillingPageProps) {
  const { id } = use(params);
  const { loading, user } = useAuthenticatedData();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [activeInvoiceId, setActiveInvoiceId] = useState("");
  const [cancelInvoiceId, setCancelInvoiceId] = useState("");
  const [paymentInvoiceId, setPaymentInvoiceId] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>("OPEN");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      return;
    }

    getBillingData(id)
      .then(({ clinicData, invoiceData, paymentData, transactionData }) => {
        setClinic(clinicData);
        setInvoices(invoiceData);
        setPayments(paymentData);
        setTransactions(transactionData);
      })
      .catch(() => setError("Não foi possível carregar o financeiro."));
  }, [id, user]);

  async function loadBillingData() {
    const { clinicData, invoiceData, paymentData, transactionData } = await getBillingData(id);
    setClinic(clinicData);
    setInvoices(invoiceData);
    setPayments(paymentData);
    setTransactions(transactionData);
  }

  function handlePayment(event: FormEvent<HTMLFormElement>, invoice: Invoice) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setActiveInvoiceId(invoice.id);
    const formData = new FormData(event.currentTarget);
    const amount = String(formData.get("amount") ?? "");

    if (!isFullPaymentAmount(amount, invoice.amount)) {
      setPaymentAmounts((current) => ({ ...current, [invoice.id]: amount }));
      setActiveInvoiceId("");
      return;
    }

    startTransition(async () => {
      try {
        await createPayment({
          invoice: invoice.id,
          amount,
          method: String(formData.get("method") ?? "PIX") as Payment["method"],
          status: "PAID",
          external_payment_id: String(formData.get("external_payment_id") ?? ""),
        });
        await loadBillingData();
        setSuccess("Pagamento registrado com segurança.");
        setPaymentInvoiceId("");
      } catch {
        setError("Não foi possível registrar o pagamento.");
      } finally {
        setActiveInvoiceId("");
      }
    });
  }

  function handleCancelInvoice(invoice: Invoice) {
    setError("");
    setSuccess("");
    setActiveInvoiceId(invoice.id);

    startTransition(async () => {
      try {
        await cancelInvoice(invoice.id);
        await loadBillingData();
        setSuccess("Cobrança cancelada.");
        setCancelInvoiceId("");
      } catch {
        setError("Não foi possível cancelar a cobrança.");
      } finally {
        setActiveInvoiceId("");
      }
    });
  }

  if (loading || !user) {
    return <main className="loading-page" role="status" aria-live="polite">Carregando ambiente seguro...</main>;
  }

  if (error && !clinic) {
    return (
      <AppShell activeNav="billing" eyebrow="Financeiro" title="Acesso bloqueado" user={user}>
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
    return <main className="loading-page" role="status" aria-live="polite">Carregando financeiro...</main>;
  }

  const openInvoices = invoices.filter((invoice) => invoice.status === "OPEN");
  const overdueInvoices = invoices.filter(isInvoiceOverdue);
  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");
  const openAmount = openInvoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
  const overdueAmount = overdueInvoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
  const paidAmount = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((total, payment) => total + Number(payment.amount), 0);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredInvoices = invoices.filter((invoice) => {
    const displayStatus = invoiceDisplayStatus(invoice);
    const matchesFilter = invoiceFilter === "ALL" || displayStatus === invoiceFilter;
    const matchesSearch = !normalizedSearch || [
      invoice.description,
      invoice.patient_name,
      invoice.external_invoice_id,
      invoice.amount,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch));
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell
      activeNav="billing"
      currentClinic={clinic}
      eyebrow="Financeiro"
      title="Cobranças e pagamentos"
      user={user}
      actions={
        <Link className="button-primary button-compact" href={`/clinics/${id}/billing/new`}>
          Nova cobrança
        </Link>
      }
    >
      <section className="metrics-grid" aria-label="Resumo financeiro">
        <MetricCard label="Em aberto" value={money(openAmount)} description={`${openInvoices.length} cobrança(s) aguardando pagamento.`} />
        <MetricCard label="Vencidas" value={money(overdueAmount)} description={`${overdueInvoices.length} cobrança(s) fora do prazo.`} />
        <MetricCard label="Recebido" value={money(paidAmount)} description={`${paidInvoices.length} cobrança(s) quitada(s).`} />
        <MetricCard label="Transações" value={transactions.length} description="Movimentos gerados por pagamentos." />
      </section>

      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}
      {success ? <div className="success-alert" role="status" aria-live="polite">{success}</div> : null}

      <section className="panel-card billing-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Recebíveis</p>
            <h2>Cobranças da clínica</h2>
          </div>
          <span className="panel-pill">{filteredInvoices.length} de {invoices.length}</span>
        </div>

        <div className="billing-toolbar" aria-label="Filtros de cobranças">
          <label className="billing-search">
            Buscar cobrança
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Paciente, descrição ou valor"
              type="search"
            />
          </label>
          <div className="billing-filter-tabs" role="group" aria-label="Filtrar por status">
            {invoiceFilters.map((filter) => (
              <button
                className={invoiceFilter === filter.value ? "active" : ""}
                key={filter.value}
                onClick={() => setInvoiceFilter(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredInvoices.length ? (
          <div className="clinic-list">
            {filteredInvoices.map((invoice) => {
              const displayStatus = invoiceDisplayStatus(invoice);
              const amountError = paymentAmountError(paymentAmounts[invoice.id] ?? invoice.amount, invoice.amount);
              return (
                <article className={`clinic-row billing-row ${displayStatus === "OVERDUE" ? "billing-row-overdue" : ""}`} key={invoice.id}>
                  <div className="billing-row-main">
                    <strong>{invoice.description}</strong>
                    <p>{invoice.patient_name || "Sem paciente vinculado"}</p>
                    <p>{invoice.due_date ? `Vence em ${formatDate(invoice.due_date)}` : "Sem vencimento"}</p>
                  </div>
                  <div className="row-actions">
                    <span className={`status-badge billing-status billing-status-${displayStatus.toLowerCase()}`}>
                      {invoiceStatusLabels[displayStatus]}
                    </span>
                    <strong>{money(invoice.amount)}</strong>
                  </div>
                  {invoice.status === "OPEN" ? (
                    <div className="billing-actions-row">
                      {paymentInvoiceId === invoice.id ? null : (
                        <button
                          className="button-primary button-compact"
                          disabled={isPending && activeInvoiceId === invoice.id}
                          onClick={() => {
                            setPaymentInvoiceId(invoice.id);
                            setCancelInvoiceId("");
                          }}
                          type="button"
                        >
                          Registrar pagamento
                        </button>
                      )}
                      {cancelInvoiceId === invoice.id ? (
                        <div className="alert billing-confirmation" role="alert">
                          <strong>Confirmar cancelamento?</strong>
                          <p>Esta cobrança será marcada como cancelada.</p>
                          <button className="button-secondary button-compact" disabled={isPending} type="button" onClick={() => setCancelInvoiceId("")}>Manter aberta</button>
                          <button className="button-secondary button-compact" disabled={isPending} type="button" onClick={() => handleCancelInvoice(invoice)}>{isPending ? "Cancelando..." : "Confirmar cancelamento"}</button>
                        </div>
                      ) : (
                        <button
                          className="button-secondary button-compact"
                          disabled={isPending && activeInvoiceId === invoice.id}
                          type="button"
                          onClick={() => {
                            setCancelInvoiceId(invoice.id);
                            setPaymentInvoiceId("");
                          }}
                        >
                          Cancelar cobrança
                        </button>
                      )}
                    </div>
                  ) : null}
                  {paymentInvoiceId === invoice.id ? (
                    <form className="inline-payment-form" onSubmit={(event) => handlePayment(event, invoice)}>
                      <label htmlFor={`payment-amount-${invoice.id}`}>
                        Valor recebido
                        <input
                          aria-describedby={`payment-amount-help-${invoice.id}${amountError ? ` payment-amount-error-${invoice.id}` : ""}`}
                          aria-invalid={Boolean(amountError)}
                          id={`payment-amount-${invoice.id}`}
                          max={invoice.amount}
                          min="0.01"
                          name="amount"
                          onChange={(event) => setPaymentAmounts((current) => ({ ...current, [invoice.id]: event.target.value }))}
                          step="0.01"
                          type="number"
                          value={paymentAmounts[invoice.id] ?? invoice.amount}
                          required
                        />
                        <span id={`payment-amount-help-${invoice.id}`}>Valor integral: {money(invoice.amount)}</span>
                        {amountError ? <span className="field-error" id={`payment-amount-error-${invoice.id}`} role="alert">{amountError}</span> : null}
                      </label>
                      <label>
                        Método
                        <select name="method" defaultValue="PIX">
                          <option value="PIX">Pix</option>
                          <option value="CASH">Dinheiro</option>
                          <option value="BANK_TRANSFER">Transferência</option>
                          <option value="CREDIT_CARD">Cartão de crédito</option>
                          <option value="DEBIT_CARD">Cartão de débito</option>
                          <option value="OTHER">Outro</option>
                        </select>
                      </label>
                      <label>
                        Comprovante externo
                        <input name="external_payment_id" placeholder="Opcional" />
                      </label>
                      <button className="button-primary button-compact" disabled={(isPending && activeInvoiceId === invoice.id) || !isFullPaymentAmount(paymentAmounts[invoice.id] ?? invoice.amount, invoice.amount)} type="submit">
                        {isPending && activeInvoiceId === invoice.id ? "Registrando..." : "Confirmar pagamento"}
                      </button>
                      <button className="button-secondary button-compact" type="button" onClick={() => setPaymentInvoiceId("")}>Fechar</button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma cobrança encontrada</h3>
            <p>Ajuste os filtros ou crie uma nova cobrança para acompanhar recebimentos.</p>
            <Link className="button-primary button-compact" href={`/clinics/${id}/billing/new`}>
              Criar cobrança
            </Link>
          </div>
        )}
      </section>

      <section className="panel-card section-gap">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Histórico</p>
            <h2>Pagamentos recentes</h2>
          </div>
          <span className="panel-pill">{payments.length} pagamento(s)</span>
        </div>
        {payments.length ? (
          <div className="clinic-list">
            {payments.map((payment) => (
              <article className="clinic-row" key={payment.id}>
                <div>
                  <strong>{payment.invoice_description}</strong>
                  <p>{paymentMethodLabels[payment.method]} · {formatDateTime(payment.paid_at)}</p>
                  {payment.external_payment_id ? <p>Comprovante: {payment.external_payment_id}</p> : null}
                </div>
                <div className="row-actions">
                  <span className="status-badge">{paymentStatusLabels[payment.status]}</span>
                  <strong>{money(payment.amount)}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum pagamento registrado</h3>
            <p>Quando uma cobrança for recebida, o pagamento aparece aqui.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
