import { PatientDetailPage } from "@/features/patients/PatientDetailPage";

type PageProps = {
  params: Promise<{ id: string; patientId: string }>;
};

export default function PatientDetail({ params }: PageProps) {
  return <PatientDetailPage params={params} />;
}
