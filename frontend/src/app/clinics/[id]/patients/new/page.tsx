import { PatientCreatePage } from "@/features/patients/PatientCreatePage";

export default function NewPatient({
  params,
}: PageProps<"/clinics/[id]/patients/new">) {
  return <PatientCreatePage params={params} />;
}
