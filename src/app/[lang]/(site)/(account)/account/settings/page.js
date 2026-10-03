import { SettingsView } from "@/features/account/components/SettingsView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("settings");

export default function Page() {
  return <SettingsView />;
}
