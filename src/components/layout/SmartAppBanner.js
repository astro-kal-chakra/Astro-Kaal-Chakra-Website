"use client";

import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useBrowserStorage } from "@/hooks/useBrowserStorage";

const KEY = "smart_banner_dismissed";

const noopSubscribe = () => () => {};
function detectPlatform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return null;
}

/** Mobile-only "get the app" strip. Picks the right store by user agent. */
/** `appLinks` = { playStore, appStore } from the backend settings. */
export function SmartAppBanner({ appLinks }) {
  const platform = useSyncExternalStore(noopSubscribe, detectPlatform, () => null);
  const store =
    platform === "android" ? appLinks?.playStore || siteConfig.appLinks.playStore : platform === "ios" ? appLinks?.appStore || siteConfig.appLinks.appStore : null;
  const [dismissed, setDismissed] = useBrowserStorage(KEY, { storage: "sessionStorage", serverValue: "1" });

  if (!store || dismissed) return null;

  const dismiss = () => setDismissed("1");

  return (
    <div className="flex items-center gap-3 bg-brand-600 px-4 py-2 text-sm text-white md:hidden">
      <button onClick={dismiss} aria-label="Dismiss" className="text-white/85">
        <X className="size-4" />
      </button>
      <p className="flex-1">Get the app for faster consultations</p>
      <a href={store} className="rounded-full bg-white px-3 py-1 font-semibold text-brand-700">
        Open
      </a>
    </div>
  );
}
