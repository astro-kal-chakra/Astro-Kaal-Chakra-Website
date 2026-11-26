"use client";

import { useState } from "react";
import { Clock, FilePen, RotateCcw } from "lucide-react";
import { SITE_LOCALE } from "@/config/locale";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useReportRequestConfig } from "../hooks/useReportRequestConfig";
import { deliveryText } from "../lib/reportRequests";
import { ReportOrderForm } from "./ReportOrderForm";

/**
 * "Get a report" on an astrologer's profile: shows only while the dashboard has report requests on. The
 * astrologer is preselected; the user picks the report. Signed-out visitors get the normal login prompt first.
 */
export function AstrologerReportCard({ astrologer }) {
  const locale = SITE_LOCALE;
  const { requireAuth } = useAuth();
  const config = useReportRequestConfig();
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [hidden, setHidden] = useState(false);

  const products = config?.enabled ? config.products || [] : [];
  if (!products.length || (hidden && !open)) return null;

  const from = Math.min(...products.map((p) => p.price));
  const fastest = Math.min(...products.map((p) => p.deliveryHours || 0).filter(Boolean));

  const start = () =>
    requireAuth(() => {
      setSheetKey((k) => k + 1); // fresh form (and a new idempotency key) per order
      setOpen(true);
    }, "report");

  return (
    <>
      <section aria-label="Get a report" className="space-y-3 border-t border-line pt-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">
            <FilePen className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold">Get a written report</h2>
            <p className="text-sm text-muted">{`${astrologer.name} studies your chart and writes a detailed report for you: kundli, career, marriage matching and more.`}</p>
          </div>
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          {Number.isFinite(fastest) && (
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
              {`Delivered within ${deliveryText(fastest)}`}
            </li>
          )}
          <li className="flex items-center gap-2">
            <RotateCcw className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
            Full refund if not delivered in time
          </li>
        </ul>
        <Button variant="soft" size="lg" className="w-full justify-between" onClick={start}>
          <span>Get a report</span>
          <span translate="no" className="notranslate font-medium opacity-90">
            {products.length > 1 ? `From ${formatCurrency(from, locale)}` : formatCurrency(from, locale)}
          </span>
        </Button>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title={`Get a report from ${astrologer.name}`} className="sm:max-w-lg">
        <ReportOrderForm key={sheetKey} config={config} astrologer={astrologer} onClose={() => setOpen(false)} onUnavailable={() => setHidden(true)} />
      </Modal>
    </>
  );
}
