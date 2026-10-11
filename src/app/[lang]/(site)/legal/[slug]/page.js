import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { formatDate } from "@/lib/utils/format";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

/** Legal pages are edited in the admin dashboard (Content → Pages) and served by the backend. */
const LEGAL_SLUGS = ["privacy-policy", "terms", "refund-policy", "disclaimer"];

/** Search-result descriptions, used when the dashboard page has no SEO description of its own. */
const DEFAULT_DESCRIPTIONS = {
  "privacy-policy": "How Astro-Kaal-Chakra collects, uses and protects your personal and birth details, and your rights under India's DPDP Act.",
  terms: "Terms of use for Astro-Kaal-Chakra: eligibility, account and devices, wallet and billing, free first chat, recharges and conduct.",
  "refund-policy": "Refund and cancellation policy for Astro-Kaal-Chakra wallet recharges and astrology consultations.",
  disclaimer: "Astrology on Astro-Kaal-Chakra offers guidance, not guarantees. Read our disclaimer before your consultation.",
};
export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const page = await contentService.getPage(slug).catch(() => null);
  if (!page) return {};
  return buildMetadata({
    locale: lang,
    path: routes.legal(slug),
    title: page.seo?.title || page.title,
    description: page.seo?.description || DEFAULT_DESCRIPTIONS[slug],
  });
}

export default async function LegalPage({ params }) {
  const { lang, slug } = await params;
  const page = await contentService.getPage(slug);
  if (!page) notFound();

  return (
    <article className="container-page max-w-3xl py-10">
      <h1 className="font-display text-3xl font-semibold">{page.title}</h1>
      {page.updatedAt && <p className="mt-2 text-sm text-muted">{`Last updated: ${formatDate(page.updatedAt, lang)}`}</p>}
      <div className="mt-8 space-y-6">
        {page.sections.map(([heading, body], i) => (
          <section key={`${i}-${heading}`}>
            {heading && <h2 className="font-display text-xl">{heading}</h2>}
            {body.split(/\n/).map((line, j) => (
              <p key={j} className="mt-1 leading-relaxed text-muted">
                {line}
              </p>
            ))}
          </section>
        ))}
      </div>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: routes.home }, { name: page.title, path: routes.legal(slug) }])} />
    </article>
  );
}
