import { routes } from "@/config/routes";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { StoreView } from "@/features/store/components/StoreView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: routes.store,
    title: "Spiritual Store – Rudraksha, Malas, Gemstones & Yantras",
    description: "Shop authentic, energised Rudraksha, jaap malas, certified gemstones, healing bracelets, yantras and puja essentials recommended by verified astrologers.",
  });
}

export default function StorePage() {
  return (
    <>
      <StoreView />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: routes.home }, { name: "Store", path: routes.store }])} />
    </>
  );
}
