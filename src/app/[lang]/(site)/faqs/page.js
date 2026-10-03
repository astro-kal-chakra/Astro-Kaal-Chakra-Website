import { LifeBuoy } from "lucide-react";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { FaqBrowser } from "@/features/content/faq/FaqBrowser";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.faqs, title: "FAQs – Consultations, Wallet, Refunds & Privacy", description: "Answers to common questions about astrology consultations, payments and wallet, refunds, privacy and your account." });
}

export default async function FaqsPage({ params }) {
  const { lang } = await params;
  const faqs = await contentService.getFaqs(lang);
  const categories = contentService.faqCategories;
  const all = categories.flatMap((c) => faqs[c] || []);

  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs
        label="Breadcrumb"
        items={[{ name: "Home", href: routes.home }, { name: "FAQs" }]}
        className="mb-4"
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <header className="mb-6">
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Frequently asked questions</h1>
            <p className="mt-2 max-w-2xl text-muted">Quick answers about consultations, payments, refunds, privacy and your account.</p>
          </header>
          <FaqBrowser faqs={faqs} categories={categories} />
        </div>

        <aside>
          <Card className="p-6 lg:sticky lg:top-20">
            <LifeBuoy className="size-8 text-gold-500" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Still need help?</h2>
            <p className="mt-1 text-sm text-muted">Our support team usually replies within a few hours.</p>
            <div className="mt-5 flex flex-col gap-2">
              <ButtonLink href={routes.contact}>Contact us</ButtonLink>
              <ButtonLink href={routes.support} variant="outline">
                My support tickets
              </ButtonLink>
              <ButtonLink href={routes.howItWorks} variant="ghost">
                How it works
              </ButtonLink>
            </div>
          </Card>
        </aside>
      </div>

      <JsonLd
        data={[
          faqJsonLd(all),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQs", path: `${routes.faqs}` },
          ]),
        ]}
      />
    </div>
  );
}
