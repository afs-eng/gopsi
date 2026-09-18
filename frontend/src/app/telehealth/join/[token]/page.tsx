import { PublicTelehealthJoinPage } from "@/features/telehealth/PublicTelehealthJoinPage";

export default function PublicTelehealthJoin({
  params,
}: PageProps<"/telehealth/join/[token]">) {
  return <PublicTelehealthJoinPage params={params} />;
}
