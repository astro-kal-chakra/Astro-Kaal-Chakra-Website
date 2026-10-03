import { ReferralView } from "@/features/account/components/ReferralView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("referral");

export default function Page() {
  return <ReferralView />;
}
