import { MedicalRecordCreatePage } from "@/features/medical-records/MedicalRecordCreatePage";

export default function NewMedicalRecord({ params }: PageProps<"/clinics/[id]/medical-records/new">) {
  return <MedicalRecordCreatePage params={params} />;
}
