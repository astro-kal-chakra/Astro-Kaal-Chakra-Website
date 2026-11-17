"use client";

import { useCurrency, Money } from "@/features/international/components/CurrencyProvider";
import { USD } from "@/features/international/lib/currency";

/**
 * A report's price with the struck-through original price (when there's a discount), in the viewer's currency:
 * rupees, or the dashboard's dollar prices (`priceUsd`, `originalPriceUsd`) for international users.
 */
export function ReportPriceTag({ report, size = "card" }) {
  const { currency } = useCurrency();
  const usd = currency === USD;
  const price = usd ? report.priceUsd ?? 0 : report.price;
  const original = usd ? report.originalPriceUsd ?? 0 : report.originalPrice;
  const strike = original > price;
  if (size === "panel") {
    return (
      <>
        <Money value={price} className="font-display text-3xl font-bold" />
        {strike && <Money value={original} className="pb-1 text-sm text-muted line-through" />}
      </>
    );
  }
  return (
    <div>
      {strike && <Money value={original} className="block text-xs text-muted line-through" />}
      <Money value={price} className="block font-display text-2xl font-bold" />
    </div>
  );
}

/** This viewer's price for a report (wallet maths in the purchase sheet). */
export const reportPrice = (report, currency) => (currency === USD ? report.priceUsd ?? 0 : report.price);
