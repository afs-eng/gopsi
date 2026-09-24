import { ProfessionalCreatePage } from "@/features/professionals/ProfessionalCreatePage";

export default function NewProfessional({
  params,
}: PageProps<"/clinics/[id]/professionals/new">) {
  return <ProfessionalCreatePage params={params} />;
}
