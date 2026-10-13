"use client";

import { routes } from "@/config/routes";
import { useBrowserStorage } from "@/hooks/useBrowserStorage";
import { Button } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";

const KEY = "cookie_consent"; // "all" | "essential"

/** DPDP-friendly consent banner. Analytics should only load when consent === "all". */
export function CookieConsent() {
  // serverValue hides the banner during SSR; it appears after hydration if no choice is stored.
  const [consent, setConsent] = useBrowserStorage(KEY, { serverValue: "ssr" });

  const choose = (value) => {
    setConsent(value);
    window.dispatchEvent(new CustomEvent("consent:change", { detail: value }));
  };

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4" role="region" aria-label="Cookie consent">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-2xl sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted">
          We use cookies to keep you logged in, remember your language and understand how the site is used.{" "}
          <LocaleLink href={routes.legal("privacy-policy")} className="font-medium text-brand-600 underline dark:text-gold-400">
            Privacy Policy
          </LocaleLink>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => choose("essential")}>
            Essential only
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none" onClick={() => choose("all")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
