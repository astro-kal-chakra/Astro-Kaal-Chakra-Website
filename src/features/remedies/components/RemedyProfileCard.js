"use client";

import { useState } from "react";
import { Clock, HandHeart, RotateCcw } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SITE_LOCALE } from "@/config/locale";
import { useRemedyConfig } from "../hooks/useRemedyConfig";
import { RemedyRequestForm } from "./RemedyRequestForm";

/**
 * "Get a remedy" on an astrologer's profile. Shows only when the dashboard has remedies on and this
 * astrologer is taking requests; signed-out visitors get the normal login prompt first.
 */
export function RemedyProfileCard({ astrologer }) {
  const locale = SITE_LOCALE;
  const { requireAuth } = useAuth();
  const config = useRemedyConfig(astrologer.id);
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [hidden, setHidden] = useState(false);

  // Turned off / not accepting while the form was open: hide once the form is closed
  if (!config?.enabled || !config.available || (hidden && !open)) return null;

  const start = () =>
    requireAuth(() => {
      setSheetKey((k) => k + 1); // fresh form (and a new idempotency key) per request
      setOpen(true);
    }, "remedy");

  return (
    <>
      <section aria-label="Get a remedy" className="space-y-3 border-t border-line pt-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">
            <HandHeart className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold">Get a written remedy</h2>
            <p className="text-sm text-muted">{`Ask ${astrologer.name} about one problem and get written remedies: mantra, puja, gemstone, daan and more.`}</p>
          </div>
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          <li className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
            {`Reply within ${config.deliveryHours} hours`}
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
            Full refund if not answered in time
          </li>
        </ul>
        <Button variant="soft" size="lg" className="w-full justify-between" onClick={start}>
          <span>Get a remedy</span>
          <span translate="no" className="notranslate font-medium opacity-90">
            {formatCurrency(config.price, locale)}
          </span>
        </Button>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title={`Get a remedy from ${astrologer.name}`} className="sm:max-w-lg">
        <RemedyRequestForm
          key={sheetKey}
          astrologer={astrologer}
          config={config}
          onClose={() => setOpen(false)}
          onUnavailable={() => setHidden(true)}
        />
      </Modal>
    </>
  );
}
