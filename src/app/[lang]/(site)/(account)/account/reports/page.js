import { MyReportsView } from "@/features/reports/components/MyReportsView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "My reports" };
}

export default function MyReportsPage() {
  return <MyReportsView />;
}
