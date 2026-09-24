import { ProfessionalsPage } from "@/features/professionals/ProfessionalsPage";

export default function Professionals({
  params,
}: PageProps<"/clinics/[id]/professionals">) {
  return <ProfessionalsPage params={params} />;
}
