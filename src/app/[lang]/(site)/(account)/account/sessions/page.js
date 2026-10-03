import { SessionHistoryView } from "@/features/account/components/SessionHistoryView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("sessions");

export default function Page() {
  return <SessionHistoryView />;
}
