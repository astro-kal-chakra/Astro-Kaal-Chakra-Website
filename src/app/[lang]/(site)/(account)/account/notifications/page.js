import { NotificationsView } from "@/features/notifications/components/NotificationsView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("notifications");

export default function Page() {
  return <NotificationsView />;
}
