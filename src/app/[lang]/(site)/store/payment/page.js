import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { CheckoutPayment } from "@/features/store/components/CheckoutPayment";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.storePayment, title: "Checkout – Payment", noIndex: true });
}

export default function PaymentPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <CheckoutPayment />
    </div>
  );
}
