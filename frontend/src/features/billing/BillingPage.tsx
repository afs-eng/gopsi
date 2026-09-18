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

const currency = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

function money(value: string) {
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
    return `Para registrar como pago, informe exatamente ${money(invoiceAmount)}. Pagamentos parciais não são suportados.`;
  }

  return "";
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
  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");
  const openAmount = openInvoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
  const paidAmount = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((total, payment) => total + Number(payment.amount), 0);

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
        <MetricCard label="Em aberto" value={currency.format(openAmount)} description={`${openInvoices.length} cobrança(s) aguardando pagamento.`} />
        <MetricCard label="Recebido" value={currency.format(paidAmount)} description={`${paidInvoices.length} cobrança(s) quitada(s).`} />
        <MetricCard label="Transações" value={transactions.length} description="Movimentos gerados por pagamentos." />
      </section>

      {error ? <div className="alert" role="alert" aria-live="assertive">{error}</div> : null}
      {success ? <div className="success-alert" role="status" aria-live="polite">{success}</div> : null}

      <section className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Recebíveis</p>
            <h2>Cobranças da clínica</h2>
          </div>
          <span className="panel-pill">{invoices.length} registro(s)</span>
        </div>

        {invoices.length ? (
          <div className="clinic-list">
            {invoices.map((invoice) => (
              <article className="clinic-row billing-row" key={invoice.id}>
                <div>
                  <strong>{invoice.description}</strong>
                  <p>{invoice.patient_name || "Sem paciente vinculado"}</p>
                  <p>{invoice.due_date ? `Vence em ${invoice.due_date}` : "Sem vencimento"}</p>
                </div>
                <div className="row-actions">
                  <span className="status-badge">{invoice.status}</span>
                  <strong>{money(invoice.amount)}</strong>
                </div>
                {invoice.status === "OPEN" ? (
                  <form className="inline-payment-form" onSubmit={(event) => handlePayment(event, invoice)}>
                    <label htmlFor={`payment-amount-${invoice.id}`}>
                      Valor recebido
                      <input
                        aria-describedby={`payment-amount-help-${invoice.id}${paymentAmountError(paymentAmounts[invoice.id] ?? invoice.amount, invoice.amount) ? ` payment-amount-error-${invoice.id}` : ""}`}
                        aria-invalid={Boolean(paymentAmountError(paymentAmounts[invoice.id] ?? invoice.amount, invoice.amount))}
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
                      <span id={`payment-amount-help-${invoice.id}`}>
                        Informe o valor integral de {money(invoice.amount)}; pagamentos parciais não são suportados.
                      </span>
                      {paymentAmountError(paymentAmounts[invoice.id] ?? invoice.amount, invoice.amount) ? (
                        <span className="alert" id={`payment-amount-error-${invoice.id}`} role="alert">
                          {paymentAmountError(paymentAmounts[invoice.id] ?? invoice.amount, invoice.amount)}
                        </span>
                      ) : null}
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
                    <button className="button-primary button-compact" disabled={isPending && activeInvoiceId === invoice.id || !isFullPaymentAmount(paymentAmounts[invoice.id] ?? invoice.amount, invoice.amount)} type="submit">
                      {isPending && activeInvoiceId === invoice.id ? "Registrando..." : "Registrar pagamento"}
                    </button>
                    {cancelInvoiceId === invoice.id ? (
                      <div className="alert" role="alert">
                        <strong>Confirmar cancelamento?</strong>
                        <p>Esta cobrança será marcada como cancelada.</p>
                        <button className="button-secondary button-compact" disabled={isPending} type="button" onClick={() => setCancelInvoiceId("")}>Manter aberta</button>
                        <button className="button-secondary button-compact" disabled={isPending} type="button" onClick={() => handleCancelInvoice(invoice)}>{isPending ? "Cancelando..." : "Confirmar cancelamento"}</button>
                      </div>
                    ) : (
                      <button className="button-secondary button-compact" disabled={isPending && activeInvoiceId === invoice.id} type="button" onClick={() => setCancelInvoiceId(invoice.id)}>
                        Cancelar cobrança
                      </button>
                    )}
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma cobrança registrada</h3>
            <p>Crie cobranças avulsas ou vinculadas a pacientes e consultas.</p>
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
                  <p>{payment.method} · {payment.paid_at ? new Date(payment.paid_at).toLocaleString("pt-BR") : "Sem baixa"}</p>
                </div>
                <div className="row-actions">
                  <span className="status-badge">{payment.status}</span>
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
