import { MyRemediesView } from "@/features/remedies/components/MyRemediesView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("remedies");

export default function Page() {
  return <MyRemediesView />;
}
