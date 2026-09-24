import { PlatformClinicDetailPage } from "@/features/platform/PlatformClinicDetailPage";
export default function PlatformClinic({ params }: PageProps<"/platform/clinics/[id]">) { return <PlatformClinicDetailPage params={params} />; }
