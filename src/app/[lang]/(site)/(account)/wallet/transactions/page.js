import { TransactionsView } from "@/features/wallet/components/TransactionsView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "Transaction history" };
}

export default function WalletTransactionsPage() {
  return <TransactionsView />;
}
