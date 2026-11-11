import { CardCarousel } from "@/components/ui/CardCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "./ProductCard";

/** A titled, swipeable row of product cards (home store section, related / latest on a product page). */
export function ProductRail({ eyebrow, title, subtitle, action, products, label = title }) {
  if (!products?.length) return null;
  return (
    <section aria-label={label}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} action={action} />
      <CardCarousel label={label} slideClassName="basis-[58%] min-[480px]:basis-[40%] md:basis-1/4 lg:basis-1/5" delay={3500}>
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </CardCarousel>
    </section>
  );
}
