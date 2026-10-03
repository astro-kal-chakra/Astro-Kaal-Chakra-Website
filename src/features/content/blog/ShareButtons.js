"use client";

import { useSyncExternalStore } from "react";
import { Link2, Share2 } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils/cn";

const noopSubscribe = () => () => {};
const useCanNativeShare = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false
  );

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.43 9.43 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43m8.03-17.47A11.3 11.3 0 0 0 12.05.7C5.79.7.7 5.79.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.6l6.02-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02" />
  </svg>
);

const BTN =
  "inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition-colors hover:bg-surface-muted";

/**
 * WhatsApp share link, copy link and (where supported) the native share sheet.
 * @param {{ url: string, title: string, className?: string }} props  `url` must be absolute.
 */
export function ShareButtons({ url, title, className }) {
  const { toast } = useToast();
  const canShare = useCanNativeShare();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ type: "success", message: "Link copied to clipboard" });
    } catch {
      toast({ type: "error", message: "Couldn't copy the link. Please copy it from the address bar." });
    }
  };

  const share = () => navigator.share({ title, url }).catch(() => {});

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(BTN, "text-green-700 dark:text-green-400")}
      >
        <WhatsAppIcon className="size-4" /> Share on WhatsApp
      </a>
      <button type="button" onClick={copy} className={BTN}>
        <Link2 className="size-4" aria-hidden /> Copy link
      </button>
      {canShare && (
        <button type="button" onClick={share} className={BTN}>
          <Share2 className="size-4" aria-hidden /> Share…
        </button>
      )}
    </div>
  );
}
