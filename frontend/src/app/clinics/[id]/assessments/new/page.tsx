import { AssessmentCreatePage } from "@/features/assessments/AssessmentCreatePage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AssessmentCreate({ params }: PageProps) {
  return <AssessmentCreatePage params={params} />;
}
