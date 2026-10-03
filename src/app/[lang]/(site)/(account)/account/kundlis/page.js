import { SavedKundlisView } from "@/features/account/components/SavedKundlisView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("savedKundlis");

export default function Page() {
  return <SavedKundlisView />;
}
