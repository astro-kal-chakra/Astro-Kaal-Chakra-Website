import { SupportView } from "@/features/account/components/SupportView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("support");

export default function Page() {
  return <SupportView />;
}
