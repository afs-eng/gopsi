import { DocumentsPage } from "@/features/documents/DocumentsPage";

export default function Documents({ params }: PageProps<"/clinics/[id]/documents">) {
  return <DocumentsPage params={params} />;
}
