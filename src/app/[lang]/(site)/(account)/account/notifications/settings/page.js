import { NotificationSettingsView } from "@/features/notifications/components/NotificationSettingsView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("notificationSettings");

export default function Page() {
  return <NotificationSettingsView />;
}
