import { PatientEditPage } from "@/features/patients/PatientEditPage";

export default function EditPatient({
  params,
}: PageProps<"/clinics/[id]/patients/[patientId]/edit">) {
  return <PatientEditPage params={params} />;
}
