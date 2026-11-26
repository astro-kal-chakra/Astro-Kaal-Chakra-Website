import { ReportRequestDetailView } from "@/features/report-requests/components/ReportRequestDetailView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("reportRequest");

/** Notification links from the backend point here: /account/report-requests/{id}. */
export default async function Page({ params }) {
  const { id } = await params;
  return <ReportRequestDetailView id={id} />;
}
