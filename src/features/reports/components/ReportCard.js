import { Check, FileText, Star } from "lucide-react";
import { routes } from "@/config/routes";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ReportIcon } from "./ReportIcon";
import { reportCopy } from "../lib/copy";

const PREVIEW = 4;

/** Server component: report summary card for the public listing. */
export function ReportCard({ report: r, t, locale }) {
  const off = r.originalPrice > r.price ? Math.round((1 - r.price / r.originalPrice) * 100) : 0;
  const copy = reportCopy(r);
  const title = copy.title;
  return (
    <Card as="article" className="group flex flex-col p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <ReportIcon icon={r.icon} />
        {off > 0 && <Badge tone="gold">{`${off}% off`}</Badge>}
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">
        <LocaleLink href={routes.report(r.slug)} className="hover:text-brand-600 dark:hover:text-gold-400">
          {title}
        </LocaleLink>
      </h2>
      {copy.short && <p className="mt-1 text-sm text-muted">{copy.short}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {r.rating > 0 && (
          <span className="flex items-center gap-1 font-semibold text-fg">
            <Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden /> {r.rating.toFixed(1)}
          </span>
        )}
        {r.sold > 0 && <span>{`${formatCompact(r.sold, locale)} sold`}</span>}
        {r.pages > 0 && (
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" aria-hidden /> {`${r.pages}+ pages`}
          </span>
        )}
      </div>

      {copy.items.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{"What's included"}</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {copy.items.slice(0, PREVIEW).map((item) => (
              <li key={item.key} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden />
                {item.title}
              </li>
            ))}
            {copy.items.length > PREVIEW && <li className="pl-6 text-xs text-muted">{`+${copy.items.length - PREVIEW} more`}</li>}
          </ul>
        </>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          {off > 0 && <p className="text-xs text-muted line-through">{formatCurrency(r.originalPrice, locale)}</p>}
          <p className="font-display text-2xl font-bold">{formatCurrency(r.price, locale)}</p>
        </div>
        <ButtonLink href={routes.report(r.slug)} variant="gold" aria-label={`View details: ${title}`}>
          View details
        </ButtonLink>
      </div>
    </Card>
  );
}
