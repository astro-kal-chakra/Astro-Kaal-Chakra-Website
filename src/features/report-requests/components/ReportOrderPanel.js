"use client";

import { useState } from "react";
import { Clock, RotateCcw, ShieldCheck, UserRoundCheck } from "lucide-react";
import { SITE_LOCALE } from "@/config/locale";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { ReportPurchasePanel } from "@/features/reports/components/ReportPurchasePanel";
import { reportCopy } from "@/features/reports/lib/copy";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useReportRequestConfig } from "../hooks/useReportRequestConfig";
import { deliveryText } from "../lib/reportRequests";
import { ReportOrderForm } from "./ReportOrderForm";

/** The dashboard's report product for this catalogue report (same slug, or same id). */
export const productFor = (config, report) => (config?.enabled ? config.products?.find((p) => (report.id && p.id === report.id) || (p.slug && p.slug === report.slug)) : null) || null;

/**
 * Price card on a report page. While "Get a report from an astrologer" is on (dashboard) and this report is
 * one of its products, "Buy" opens the order flow (astrologer, person(s), question, pay). Otherwise the older
 * instant purchase panel is shown unchanged.
 */
export function ReportOrderPanel({ report }) {
  const config = useReportRequestConfig();
  const product = productFor(config, report);
  const [off, setOff] = useState(false); // REPORTS_OFF while the form was open

  if (!product || off) return <ReportPurchasePanel report={report} />;
  return <OrderCard report={report} product={product} config={config} onUnavailable={() => setOff(true)} />;
}

function OrderCard({ report, product, config, onUnavailable }) {
  const locale = SITE_LOCALE;
  const { requireAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const price = product.price;
  const original = product.originalPrice || report.originalPrice;
  const pct = original > price ? Math.round((1 - price / original) * 100) : 0;

  const start = () =>
    requireAuth(() => {
      setSheetKey((k) => k + 1); // fresh form (and a new idempotency key) per order
      setOpen(true);
    }, "report");

  return (
    <>
      <Card className="space-y-4 p-5 lg:sticky lg:top-24">
        <div className="flex items-end gap-3">
          <p className="font-display text-3xl font-bold">{formatCurrency(price, locale)}</p>
          {pct > 0 && <p className="pb-1 text-sm text-muted line-through">{formatCurrency(original, locale)}</p>}
          {pct > 0 && (
            <Badge tone="gold" className="mb-1.5">
              {`${pct}% off`}
            </Badge>
          )}
        </div>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-center gap-2">
            <UserRoundCheck className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
            Written for you by an expert astrologer
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
            {`Delivered within ${deliveryText(product.deliveryHours)}`}
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
            Full refund if not delivered in time
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
            Private and secure, only you can see it
          </li>
        </ul>
        <Button variant="gold" size="lg" className="w-full" onClick={start}>
          Get this report
        </Button>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={reportCopy({ ...report, ...product, slug: report.slug }).title} className="sm:max-w-lg">
        <ReportOrderForm key={sheetKey} config={config} product={product} onClose={() => setOpen(false)} onUnavailable={onUnavailable} />
      </Modal>
    </>
  );
}
