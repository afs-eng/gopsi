import { DocumentCreatePage } from "@/features/documents/DocumentCreatePage";

export default function NewDocument({ params }: PageProps<"/clinics/[id]/documents/new">) {
  return <DocumentCreatePage params={params} />;
}
