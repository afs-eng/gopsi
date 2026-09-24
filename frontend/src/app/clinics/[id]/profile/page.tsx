import { ProfessionalProfilePage } from "@/features/professionals/ProfessionalProfilePage";

export default function Profile({
  params,
}: PageProps<"/clinics/[id]/profile">) {
  return <ProfessionalProfilePage params={params} />;
}
