import { BirthProfilesView } from "@/features/account/components/BirthProfilesView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("birthProfiles");

export default function Page() {
  return <BirthProfilesView />;
}
