import { BillingPage } from "@/features/billing/BillingPage";

export default function Billing({ params }: PageProps<"/clinics/[id]/billing">) {
  return <BillingPage params={params} />;
}
