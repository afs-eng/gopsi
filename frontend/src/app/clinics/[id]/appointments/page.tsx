import { AppointmentsPage } from "@/features/appointments/AppointmentsPage";

export default function Appointments({
  params,
}: PageProps<"/clinics/[id]/appointments">) {
  return <AppointmentsPage params={params} />;
}
