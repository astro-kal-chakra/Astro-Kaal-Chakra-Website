import { FollowingView } from "@/features/account/components/FollowingView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("following");

export default function Page() {
  return <FollowingView />;
}
