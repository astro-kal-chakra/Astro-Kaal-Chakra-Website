import { ChevronRight } from "lucide-react";
import { routes } from "@/config/routes";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ToolsCta } from "./ToolsCta";
import { ToolsNav } from "./ToolsNav";
import { label as t } from "@/lib/labels";
import { TOOL_FAQS } from "../lib/faqs";

/**
 * Server shell shared by every free-tool page: breadcrumb, H1 + SEO intro, the tool,
 * FAQs (+ FAQPage JSON-LD), links to the other tools and the astrologer CTA.
 * @param {{ lang: string, ns: string, navKey: string, path: string, cta?: { titleKey: string, textKey: string } }} props
 */
export async function ToolPageLayout({ lang, ns, navKey, path, cta, children }) {
  const title = t(`tools.${ns}.title`);
  const faqs = TOOL_FAQS[ns] || [];

  return (
    <div className="container-page space-y-12 py-8 sm:py-10">
      <header className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <LocaleLink href={routes.home} className="hover:text-fg hover:underline">
                Home
              </LocaleLink>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="text-fg">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{t(`tools.${ns}.intro`)}</p>
      </header>

      {children}

      {faqs.length > 0 && (
        <section aria-labelledby="tool-faq-title" className="max-w-3xl">
          <h2 id="tool-faq-title" className="mb-4 font-display text-xl font-semibold sm:text-2xl">
            Frequently asked questions
          </h2>
          <Accordion items={faqs} />
        </section>
      )}

      <ToolsNav active={navKey} />

      <ToolsCta {...cta} />

      <JsonLd
        data={[
          ...(faqs.length ? [faqJsonLd(faqs)] : []),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: title, path: `${path}` },
          ]),
        ]}
      />
    </div>
  );
}
