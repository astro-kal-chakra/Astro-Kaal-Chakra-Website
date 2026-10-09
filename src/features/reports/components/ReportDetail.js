import { Check, ChevronRight, Clock, FileText, Star, Users } from "lucide-react";
import { routes } from "@/config/routes";
import { formatCompact } from "@/lib/utils/format";
import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReportCard } from "./ReportCard";
import { ReportIcon } from "./ReportIcon";
import { ReportPurchasePanel } from "./ReportPurchasePanel";
import { reportFaqs } from "./ReportsLanding";
import { reportCopy } from "../lib/copy";

/** Server component: public report detail page (SEO) with a client purchase panel. */
export function ReportDetail({ report: r, others, t, locale }) {
  const copy = reportCopy(r);
  const title = copy.title;
  const facts = [
    ...(r.pages > 0 ? [{ icon: FileText, label: `${r.pages}+ pages` }] : []),
    { icon: Clock, label: `Ready in about ${r.deliveryHours} hours` },
    { icon: Users, label: (r.profilesRequired === 2 ? "For a couple" : "For one person") },
  ];

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <LocaleLink href={routes.home} className="hover:text-fg">
              Home
            </LocaleLink>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <LocaleLink href={routes.reports} className="hover:text-fg">
              Reports
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-6">
          <Card className="bg-cosmic overflow-hidden border-0 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <ReportIcon icon={r.icon} size="lg" />
              <div>
                <h1 className="font-display text-2xl font-semibold sm:text-4xl">{title}</h1>
                {copy.short && <p className="mt-2 text-white/95">{copy.short}</p>}
                {/* Rating and "sold" are optional in the dashboard */}
                {(r.rating > 0 || r.sold > 0) && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-white/90">
                    {r.rating > 0 && (
                      <>
                        <Star className="size-4 fill-white text-white" aria-hidden />
                        <strong className="text-white">{r.rating.toFixed(1)}</strong>
                      </>
                    )}
                    {r.sold > 0 && <span>{`${r.rating > 0 ? "· " : ""}${formatCompact(r.sold, locale)} sold`}</span>}
                  </p>
                )}
              </div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {facts.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm">
                  <Icon className="size-4 text-gold-300" aria-hidden /> {label}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-xl font-semibold">About this report</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{copy.description || copy.short}</p>
            {copy.items.length > 0 && <h2 className="mt-6 font-display text-xl font-semibold">{"What's included"}</h2>}
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {copy.items.map((item) => (
                <li key={item.key} className="flex items-start gap-3 rounded-xl bg-surface-muted p-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.title}</span>
                    {item.detail && <span className="block text-xs text-muted">{item.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <section>
            <SectionHeading title="Frequently asked questions" />
            <Accordion items={reportFaqs(t)} />
          </section>
        </div>

        <ReportPurchasePanel report={r} />
      </div>

      {others.length > 0 && (
        <section className="mt-14">
          <SectionHeading title="Other reports" action={{ href: routes.reports, label: "View all" }} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <ReportCard key={o.slug} report={o} t={t} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
