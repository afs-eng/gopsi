import { ClinicDetailPage } from "@/features/clinics/ClinicDetailPage";

export default function ClinicDetail({ params }: PageProps<"/clinics/[id]">) {
  return <ClinicDetailPage params={params} />;
}
