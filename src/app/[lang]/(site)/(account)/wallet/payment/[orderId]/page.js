import { PaymentStatusView } from "@/features/wallet/components/PaymentStatusView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "Payment status" };
}

export default async function PaymentStatusPage({ params }) {
  const { orderId } = await params;
  return <PaymentStatusView orderId={decodeURIComponent(orderId)} />;
}
