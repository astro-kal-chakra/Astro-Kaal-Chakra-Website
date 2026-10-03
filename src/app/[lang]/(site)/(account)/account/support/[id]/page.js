import { SupportTicketView } from "@/features/account/components/SupportTicketView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("supportTicket");

export default async function Page({ params }) {
  const { id } = await params;
  return <SupportTicketView id={id} />;
}
