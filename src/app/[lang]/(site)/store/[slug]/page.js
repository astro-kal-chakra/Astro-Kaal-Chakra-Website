import { notFound } from "next/navigation";
import { BadgeCheck, RotateCcw, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatCurrency } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { CATEGORY_INFO, PRODUCTS, STORE_FAQS, categoryLabel, discountPct, latestProducts, productBySlug, relatedProducts } from "@/features/store/data";
import { ProductActions } from "@/features/store/components/ProductActions";
import { ProductArt } from "@/features/store/components/ProductArt";
import { ProductFaq } from "@/features/store/components/ProductFaq";
import { ProductRail } from "@/features/store/components/ProductRail";

export const dynamicParams = false; // demo catalogue: every product page is built ahead of time

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return buildMetadata({
    locale: lang,
    path: routes.storeProduct(slug),
    title: `${p.name} – ${categoryLabel(p.category)}`,
    description: `${p.name}: ${p.benefit}. ${formatCurrency(p.price, SITE_LOCALE)} (${discountPct(p)}% off), rated ${p.rating}/5 by ${p.reviews.toLocaleString("en-IN")} buyers. Energised and quality-checked.`,
  });
}

const PROMISES = [
  { icon: Truck, title: "Free delivery", text: "On orders above ₹499" },
  { icon: RotateCcw, title: "7-day returns", text: "Unused, in original pack" },
  { icon: ShieldCheck, title: "Secure checkout", text: "100% safe payments" },
];

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  const info = CATEGORY_INFO[p.category] || {};
  const money = (n) => formatCurrency(n, SITE_LOCALE);
  const off = discountPct(p);

  return (
    <div className="container-page space-y-14 py-8">
      <div>
        <ContentBreadcrumbs
          label="Breadcrumb"
          items={[{ name: "Home", href: routes.home }, { name: "Store", href: routes.store }, { name: p.name }]}
          className="mb-5"
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Image */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-line">
              <ProductArt product={p} className="aspect-square" />
              {off > 0 && <span className="absolute left-4 top-4 rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white shadow">{off}% off</span>}
            </div>
          </div>

          {/* Details */}
          <div className="motion-safe:animate-[banner-in_0.5s_ease-out]">
            <p className="eyebrow">
              <Sparkles className="size-3.5" aria-hidden /> {categoryLabel(p.category)}
              {p.tag && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] normal-case tracking-normal text-brand-700 dark:bg-brand-900 dark:text-brand-200">{p.tag}</span>
              )}
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-fg sm:text-4xl">{p.name}</h1>
            <p className="mt-2 text-muted">{p.benefit}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2 py-0.5 font-semibold text-white">
                {p.rating} <Star className="size-3.5 fill-current" aria-hidden />
              </span>
              <span className="text-muted">{p.reviews.toLocaleString("en-IN")} ratings</span>
              {p.certified && (
                <span className="inline-flex items-center gap-1 font-medium text-green-700 dark:text-green-400">
                  <BadgeCheck className="size-4" aria-hidden /> Lab certified
                </span>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-surface-muted p-4">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-3xl font-bold text-fg">{money(p.price)}</span>
                <span className="text-muted line-through">{money(p.mrp)}</span>
                {off > 0 && <span className="font-semibold text-green-600 dark:text-green-400">{`Save ${money(p.mrp - p.price)} (${off}%)`}</span>}
              </p>
              <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
            </div>

            <div className="mt-6">
              <ProductActions product={p} />
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-2 text-center">
              {PROMISES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-2xl border border-line p-3">
                  <Icon className="mx-auto size-5 text-brand-600 dark:text-gold-400" aria-hidden />
                  <p className="mt-1.5 text-xs font-semibold sm:text-sm">{title}</p>
                  <p className="text-[11px] text-muted sm:text-xs">{text}</p>
                </li>
              ))}
            </ul>

            <section className="mt-8 space-y-6">
              <div>
                <h2 className="font-display text-xl">About this product</h2>
                <p className="mt-2 leading-relaxed text-muted">{`${p.benefit}. ${info.about || ""}`}</p>
              </div>
              {info.use && (
                <div>
                  <h2 className="font-display text-xl">How to use</h2>
                  <ol className="mt-2 list-inside list-decimal space-y-1.5 text-muted marker:font-semibold marker:text-brand-600">
                    {info.use.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {info.details && (
                <div>
                  <h2 className="font-display text-xl">Product details</h2>
                  <dl className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line text-sm">
                    {[["Category", categoryLabel(p.category)], ...Object.entries(info.details)].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 px-4 py-2.5">
                        <dt className="text-muted">{k}</dt>
                        <dd className="font-medium text-fg">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* FAQs (same for every product) */}
      <section aria-labelledby="product-faq" className="mx-auto max-w-3xl">
        <h2 id="product-faq" className="text-center font-display text-2xl sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-6">
          <ProductFaq faqs={STORE_FAQS} />
        </div>
      </section>

      <ProductRail eyebrow="You may also like" title="Related products" products={relatedProducts(p)} action={{ href: routes.store, label: "View all products" }} />
      <ProductRail eyebrow="Just arrived" title="Latest products" products={latestProducts(p.slug)} />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: routes.home },
            { name: "Store", path: routes.store },
            { name: p.name, path: routes.storeProduct(p.slug) },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: `${p.benefit}. ${info.about || ""}`.trim(),
            category: categoryLabel(p.category),
            brand: { "@type": "Brand", name: siteConfig.name },
            aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews },
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: p.price,
              availability: "https://schema.org/InStock",
              url: new URL(routes.storeProduct(p.slug), siteConfig.url).toString(),
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: STORE_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
    </div>
  );
}
