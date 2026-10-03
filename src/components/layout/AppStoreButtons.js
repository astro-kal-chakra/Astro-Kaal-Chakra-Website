import { Apple, Play } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function AppStoreButtons({ label, className }) {
  const btn =
    "inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/15 px-3 py-2 text-left text-white hover:bg-white/25";
  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-xs uppercase tracking-wider text-white/85">{label}</p>}
      <div className="flex flex-wrap gap-2">
        <a href={siteConfig.appLinks.playStore} className={btn} rel="noopener" target="_blank">
          <Play className="size-5 fill-current" aria-hidden />
          <span className="text-xs leading-tight">
            GET IT ON
            <br />
            <strong className="text-sm">Google Play</strong>
          </span>
        </a>
        <a href={siteConfig.appLinks.appStore} className={btn} rel="noopener" target="_blank">
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
