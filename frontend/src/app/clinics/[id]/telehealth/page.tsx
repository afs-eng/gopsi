import { TelehealthPage } from "@/features/telehealth/TelehealthPage";

export default function Telehealth({
  params,
}: PageProps<"/clinics/[id]/telehealth">) {
  return <TelehealthPage params={params} />;
}
