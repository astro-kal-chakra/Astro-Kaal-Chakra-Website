import { MyReportRequestsView } from "@/features/report-requests/components/MyReportRequestsView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("reportRequests");

export default function Page() {
  return <MyReportRequestsView />;
}
