import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { OrderSuccess } from "@/features/store/components/OrderSuccess";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.storeOrderSuccess, title: "Order placed", noIndex: true });
}

export default function OrderSuccessPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <OrderSuccess />
    </div>
  );
}
