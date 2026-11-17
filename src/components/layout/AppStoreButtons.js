import { Apple, Play } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

const TONES = {
  /** On saffron bands */
  onBrand: { btn: "border-white/50 bg-white/15 text-white hover:bg-white/25", label: "text-white/85" },
  /** On white / cream */
  light: { btn: "border-line bg-surface text-fg hover:border-brand-300 hover:bg-surface-muted", label: "text-muted" },
};

/** A store link is real only when it is a full URL ("#" and empty values are placeholders). */
const realLink = (url) => (typeof url === "string" && /^https?:\/\//i.test(url) ? url : null);

/**
 * Store links that are actually live: { playStore, appStore }, each a URL or null.
 * `links` = { playStore, appStore } from the backend settings (falls back to the env defaults).
 */
export function storeLinks(links) {
  return {
    playStore: realLink(links?.playStore) || realLink(siteConfig.appLinks.playStore),
    appStore: realLink(links?.appStore) || realLink(siteConfig.appLinks.appStore),
  };
}

/** True when at least one store link is live. */
export const hasStoreLinks = (links) => {
  const { playStore, appStore } = storeLinks(links);
  return Boolean(playStore || appStore);
};

/** Google Play / App Store badges. Only stores with a real link are shown; nothing renders while neither is live. */
export function AppStoreButtons({ label, className, tone = "onBrand", links }) {
  const t = TONES[tone];
  const { playStore, appStore } = storeLinks(links);
  if (!playStore && !appStore) return null;
  const btn = cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition", t.btn);
  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className={cn("text-xs uppercase tracking-wider", t.label)}>{label}</p>}
      <div className="flex flex-wrap gap-2">
        {playStore && (
        <a href={playStore} className={btn} rel="noopener" target="_blank">
          <Play className="size-5 fill-current" aria-hidden />
          <span className="text-xs leading-tight">
            GET IT ON
            <br />
            <span className="text-sm font-bold">Google Play</span>
          </span>
        </a>
        )}
        {appStore && (
        <a href={appStore} className={btn} rel="noopener" target="_blank">
          <Apple className="size-5" aria-hidden />
          <span className="text-xs leading-tight">
            Download on the
            <br />
            <span className="text-sm font-bold">App Store</span>
          </span>
        </a>
        )}
      </div>
    </div>
  );
}
