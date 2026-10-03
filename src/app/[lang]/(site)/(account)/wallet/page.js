import { Suspense } from "react";
import { WalletView } from "@/features/wallet/components/WalletView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "Wallet" };
}

export default function WalletPage() {
  return (
    <Suspense>
      <WalletView />
    </Suspense>
  );
}
