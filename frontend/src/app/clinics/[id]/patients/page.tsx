import { PatientsPage } from "@/features/patients/PatientsPage";

export default function Patients({ params }: PageProps<"/clinics/[id]/patients">) {
  return <PatientsPage params={params} />;
}
