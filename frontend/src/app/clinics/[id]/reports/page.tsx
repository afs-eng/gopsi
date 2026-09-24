import { ReportsPage } from "@/features/reports/ReportsPage";

export default function Reports({ params }: PageProps<"/clinics/[id]/reports">) {
  return <ReportsPage params={params} />;
}
