import { AssessmentDetailPage } from "@/features/assessments/AssessmentDetailPage";

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>;
};

export default function AssessmentDetail({ params }: PageProps) {
  return <AssessmentDetailPage params={params} />;
}
