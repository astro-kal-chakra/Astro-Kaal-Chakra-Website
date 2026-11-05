import { RemedyDetailView } from "@/features/remedies/components/RemedyDetailView";
import { accountMetadata } from "@/features/account/lib/metadata";

export const generateMetadata = accountMetadata("remedy");

export default async function Page({ params }) {
  const { id } = await params;
  return <RemedyDetailView id={id} />;
}
