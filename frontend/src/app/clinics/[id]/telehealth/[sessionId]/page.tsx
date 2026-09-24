import { TelehealthRoomPage } from "@/features/telehealth/TelehealthRoomPage";

export default function TelehealthRoom({
  params,
}: PageProps<"/clinics/[id]/telehealth/[sessionId]">) {
  return <TelehealthRoomPage params={params} />;
}
