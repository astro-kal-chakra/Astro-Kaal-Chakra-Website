import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { CheckoutAddress } from "@/features/store/components/CheckoutAddress";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.storeCheckout, title: "Checkout – Delivery address", noIndex: true });
}

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <CheckoutAddress />
    </div>
  );
}
