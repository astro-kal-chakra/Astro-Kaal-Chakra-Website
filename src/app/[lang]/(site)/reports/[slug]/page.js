import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { reportService } from "@/lib/api/services/report.service";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ReportDetail } from "@/features/reports/components/ReportDetail";
import { label as t } from "@/lib/labels";
import { reportCopy } from "@/features/reports/lib/copy";

export async function generateStaticParams() {
  const slugs = await reportService.listSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const report = await reportService.getBySlug(slug);
  if (!report) return {};
  return buildMetadata({
    locale: lang,
    path: routes.report(slug),
    title: reportCopy(report).title,
    description: reportCopy(report).short,
  });
}

export default async function ReportPage({ params }) {
  const { lang, slug } = await params;
  const report = await reportService.getBySlug(slug);
  if (!report) notFound();
  const all = await reportService.list();
  const { title, short } = reportCopy(report);
  const url = new URL(`${routes.report(slug)}`, siteConfig.url).toString();

  return (
    <>
      <ReportDetail report={report} others={all.filter((r) => r.slug !== slug)} t={t} locale={lang} />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: title,
            description: short,
            url,
            brand: { "@type": "Brand", name: siteConfig.name },
            // Only real review counts: using the number sold as reviewCount is misleading markup under Google's
            // review-snippet policy. Rating must be 1–5 and the count positive, or Search Console marks it invalid.
            ...(report.rating >= 1 && report.reviewCount > 0
              ? { aggregateRating: { "@type": "AggregateRating", ratingValue: report.rating, reviewCount: report.reviewCount, bestRating: 5, worstRating: 1 } }
              : {}),
            offers: { "@type": "Offer", price: report.price, priceCurrency: "INR", availability: "https://schema.org/InStock", url },
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Reports", path: `${routes.reports}` },
            { name: title, path: `${routes.report(slug)}` },
          ]),
        ]}
      />
    </>
  );
}
