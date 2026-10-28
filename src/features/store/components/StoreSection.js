import { routes } from "@/config/routes";
import { PRODUCTS } from "../data";
import { ProductRail } from "./ProductRail";

/** Home "Spiritual Store": the most popular products + View all → /store. */
export function StoreSection() {
  return (
    <div className="container-page py-4 sm:py-6">
      <ProductRail
        eyebrow="Spiritual store"
        title="Rudraksha, Malas & Gemstones"
        subtitle="Authentic, energised items recommended by our astrologers."
        action={{ href: routes.store, label: "View all products" }}
        label="Spiritual store"
        products={[...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 10)}
      />
    </div>
  );
}
