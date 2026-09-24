import { MedicalRecordsPage } from "@/features/medical-records/MedicalRecordsPage";

export default function MedicalRecords({ params }: PageProps<"/clinics/[id]/medical-records">) {
  return <MedicalRecordsPage params={params} />;
}
