import { AppointmentDetailPage } from "@/features/appointments/AppointmentDetailPage";

type PageProps = {
  params: Promise<{ id: string; appointmentId: string }>;
};

export default function AppointmentDetail({ params }: PageProps) {
  return <AppointmentDetailPage params={params} />;
}
