import { ScheduleBlockCreatePage } from "@/features/appointments/ScheduleBlockCreatePage";

export default function NewScheduleBlock({
  params,
}: PageProps<"/clinics/[id]/appointments/blocks/new">) {
  return <ScheduleBlockCreatePage params={params} />;
}
