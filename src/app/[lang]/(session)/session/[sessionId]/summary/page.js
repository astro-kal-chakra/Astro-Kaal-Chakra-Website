import { SummaryView } from "@/features/session/components/summary/SummaryView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "Session summary" };
}

export default async function SessionSummaryPage({ params }) {
  const { sessionId } = await params;
  return <SummaryView key={sessionId} sessionId={sessionId} />;
}
