import { ClinicStaffFormPage } from "@/features/settings/ClinicStaffFormPage";

export default function StaffEdit({ params }: PageProps<"/clinics/[id]/settings/staff/[staffId]/edit">) {
  return <ClinicStaffFormPage mode="edit" params={params} />;
}
