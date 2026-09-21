import { ProfessionalProfilePage } from "@/features/professionals/ProfessionalProfilePage";

export default function ProfessionalProfile({
  params,
}: PageProps<"/clinics/[id]/professionals/[professionalId]">) {
  return <ProfessionalProfilePage params={params} />;
}
