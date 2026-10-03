import { routes } from "@/config/routes";
import { reportService } from "@/lib/api/services/report.service";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ReportsLanding, reportFaqs } from "@/features/reports/components/ReportsLanding";
import { label as t } from "@/lib/labels";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: routes.reports,
    title: "Astrology Reports – Detailed Kundli, Marriage Matching & Yearly Predictions",
    description: "Get detailed, personalised astrology reports prepared by expert Vedic astrologers: Kundli report, marriage matching, yearly prediction and career report. Delivered as PDF within hours.",
  });
}

export default async function ReportsPage({ params }) {
  const { lang } = await params;
  const reports = await reportService.list();

  return (
    <>
      <ReportsLanding reports={reports} t={t} locale={lang} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Reports", path: `${routes.reports}` },
          ]),
          faqJsonLd(reportFaqs(t)),
        ]}
      />
    </>
  );
}
