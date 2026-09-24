import { AssessmentsPage } from "@/features/assessments/AssessmentsPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Assessments({ params }: PageProps) {
  return <AssessmentsPage params={params} />;
}
