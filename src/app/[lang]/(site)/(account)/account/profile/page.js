import { ProfileView } from "@/features/account/components/ProfileView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("profile");

export default function Page() {
  return <ProfileView />;
}
