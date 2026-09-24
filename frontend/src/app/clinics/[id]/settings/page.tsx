import { SettingsPage } from "@/features/settings/SettingsPage";

export default function Settings({ params }: PageProps<"/clinics/[id]/settings">) {
  return <SettingsPage params={params} />;
}
