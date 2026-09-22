import { ClinicStaffPage } from "@/features/settings/ClinicStaffPage";

export default function StaffSettings({ params }: PageProps<"/clinics/[id]/settings/staff">) {
  return <ClinicStaffPage params={params} />;
}
