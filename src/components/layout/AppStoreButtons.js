import { Apple, Play } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

const TONES = {
  /** On saffron bands */
  onBrand: { btn: "border-white/50 bg-white/15 text-white hover:bg-white/25", label: "text-white/85" },
  /** On white / cream */
  light: { btn: "border-line bg-surface text-fg hover:border-brand-300 hover:bg-surface-muted", label: "text-muted" },
};

/** `links` = { playStore, appStore } from the backend settings (falls back to the env defaults). */
export function AppStoreButtons({ label, className, tone = "onBrand", links }) {
  const t = TONES[tone];
  const playStore = links?.playStore || siteConfig.appLinks.playStore;
  const appStore = links?.appStore || siteConfig.appLinks.appStore;
  const btn = cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition", t.btn);
  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className={cn("text-xs uppercase tracking-wider", t.label)}>{label}</p>}
      <div className="flex flex-wrap gap-2">
        <a href={playStore} className={btn} rel="noopener" target="_blank">
          <Play className="size-5 fill-current" aria-hidden />
          <span className="text-xs leading-tight">
            GET IT ON
            <br />
            <strong className="text-sm">Google Play</strong>
          </span>
        </a>
        <a href={appStore} className={btn} rel="noopener" target="_blank">
          <Apple className="size-5" aria-hidden />
          <span className="text-xs leading-tight">
            Download on the
            <br />
            <strong className="text-sm">App Store</strong>
          </span>
        </a>
      </div>
    </div>
  );
}
