"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SITE_LOCALE } from "@/config/locale";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { http } from "@/lib/api/http";
import { formatCurrency } from "@/lib/utils/format";
import { INR, USD, readCurrencyCookie, writeCurrencyCookie } from "../lib/currency";

/** Feature off (or no settings yet): rupees everywhere, from the first render, exactly as before. */
const RUPEES = { currency: INR, ready: true, international: false, settings: null };

const CurrencyContext = createContext(RUPEES);

/**
 * Which currency this viewer sees.
 *  - International off (the default): always rupees, nothing is checked.
 *  - On: a signed-in user's account currency; a visitor's country from their IP (GET /geo).
 *    The last answer (cookie) shows prices at once; the IP is still checked on every page load and a
 *    change (travel, VPN switched off) is applied straight away.
 * Until it is known, `ready` is false and prices show a placeholder instead of a wrong currency.
 * `settings`: the dashboard's international settings from the site config (dollars).
 */
export function CurrencyProvider({ international, children }) {
  const enabled = Boolean(international?.enabled);
  const { user, status } = useAuth();
  const [visitor, setVisitor] = useState(null); // INR | USD for a signed-out visitor

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const saved = readCurrencyCookie();
    // The remembered answer first (no placeholder flash), then always the fresh one from the IP
    if (saved) Promise.resolve().then(() => live && setVisitor(saved));
    http("/geo")
      .then((g) => {
        const c = g?.currency === USD ? USD : INR;
        writeCurrencyCookie(c);
        if (live) setVisitor(c);
      })
      .catch(() => live && !saved && setVisitor(INR));
    return () => {
      live = false;
    };
  }, [enabled]);

  const value = useMemo(() => {
    // A signed-in dollar account always sees dollars (its wallet and history are in dollars), even after the
    // feature is switched off or before this page's cached settings show it on
    if (status === "authenticated" && user?.currency === USD) return { currency: USD, ready: true, international: true, settings: international };
    if (!enabled) return RUPEES;
    // A signed-in rupee account: rupees (fixed when the account was made)
    if (status === "authenticated" && user) return { currency: INR, ready: true, international: false, settings: international };
    if (status === "loading" || !visitor) return { currency: INR, ready: false, international: false, settings: international };
    return { currency: visitor, ready: true, international: visitor === USD, settings: international };
  }, [enabled, status, user, visitor, international]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/** { currency: "INR" | "USD", ready, international, settings } */
export const useCurrency = () => useContext(CurrencyContext);

/** Formats an amount (rupees or dollars, in the viewer's currency): `money(36.2)` -> "₹36.20" / "$36.20". */
export function useMoney() {
  const { currency } = useCurrency();
  return useCallback((amount) => formatCurrency(amount, SITE_LOCALE, currency), [currency]);
}

/**
 * An amount in the viewer's currency. Shows a short placeholder until the currency is known
 * (international visitors only; with the feature off it renders at once, as before).
 */
export function Money({ value, className }) {
  const { currency, ready } = useCurrency();
  if (!ready) return <span className={`inline-block h-[1em] w-10 animate-pulse rounded bg-current/10 align-middle ${className || ""}`} aria-hidden />;
  return (
    <span className={`notranslate ${className || ""}`} translate="no">
      {formatCurrency(value, SITE_LOCALE, currency)}
    </span>
  );
}

/**
 * A public catalogue price (reports, gifts...) for this viewer: `inr` for rupee viewers, `usd` (the dashboard's
 * dollar price) for international ones. Usable from server components.
 */
export function ViewerPrice({ inr, usd, className }) {
  const { currency } = useCurrency();
  return <Money value={currency === USD ? usd ?? 0 : inr} className={className} />;
}

/**
 * Smallest recharge in the viewer's currency (for "Recharge X" shortcuts): the dashboard's dollar minimum for
 * international users, otherwise `rupeeMin` (the site's rupee minimum).
 */
export function useMinRecharge(rupeeMin) {
  const { currency, settings } = useCurrency();
  return currency === USD ? settings?.minRecharge ?? 5 : rupeeMin;
}
