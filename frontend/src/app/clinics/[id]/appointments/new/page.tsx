import { AppointmentCreatePage } from "@/features/appointments/AppointmentCreatePage";

export default function NewAppointment({
  params,
}: PageProps<"/clinics/[id]/appointments/new">) {
  return <AppointmentCreatePage params={params} />;
}
