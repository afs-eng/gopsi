import { ProfessionalsExchangePage } from "@/features/professionals/ProfessionalsExchangePage";

export default function Trueque({
  params,
}: PageProps<"/clinics/[id]/trueque">) {
  return <ProfessionalsExchangePage params={params} />;
}
