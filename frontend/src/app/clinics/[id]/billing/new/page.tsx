import { InvoiceCreatePage } from "@/features/billing/InvoiceCreatePage";

export default function NewInvoice({ params }: PageProps<"/clinics/[id]/billing/new">) {
  return <InvoiceCreatePage params={params} />;
}
