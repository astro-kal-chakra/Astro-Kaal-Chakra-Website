import { AccountView } from "@/features/auth/components/AccountView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("account");

export default function Page() {
  return <AccountView />;
}
