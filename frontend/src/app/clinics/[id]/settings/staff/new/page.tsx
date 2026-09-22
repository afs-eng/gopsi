import { ClinicStaffFormPage } from "@/features/settings/ClinicStaffFormPage";

export default function StaffCreate({ params }: PageProps<"/clinics/[id]/settings/staff/new">) {
  return <ClinicStaffFormPage mode="create" params={params} />;
}
