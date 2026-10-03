"use client";

import { useState } from "react";
import { BellRing, Share, X } from "lucide-react";
import { useBrowserStorage } from "@/hooks/useBrowserStorage";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { usePushPermission } from "../hooks/usePushPermission";
import { label as t } from "@/lib/labels";

const SNOOZE_KEY = "push_prompt_snoozed_until";
const SNOOZE_DAYS = 7;
const isSnoozed = (until) => Boolean(until) && Number(until) > Date.now();

const TEXT_KEYS = {
  default: "account.push.text",
  afterSession: "account.push.textAfterSession",
  follow: "account.push.textFollow",
};

/**
 * Soft-ask for web push, shown at a good moment (after the first session,
 * after following an astrologer, when joining a queue). Only calls the
 * browser's permission prompt when the user taps "Turn on", so a "Not now"
 * never burns the one-time native prompt. Snoozes for 7 days on dismiss.
 *
 * Usage: <PushPermissionPrompt context="afterSession" />  (variant: "card" | "banner")
 * Renders nothing if permission was already granted/denied or push is unsupported.
 * On iPhone Safari it shows an "Add to Home Screen" hint instead.
 */
export function PushPermissionPrompt({ context = "default", variant = "card", onDone, className }) {
  const { toast } = useToast();
  const { permission, request, needsHomeScreen } = usePushPermission();
  const [snoozedUntil, setSnoozedUntil] = useBrowserStorage(SNOOZE_KEY);
  const [busy, setBusy] = useState(false);

  if (isSnoozed(snoozedUntil)) return null;
  const showIOSHint = needsHomeScreen;
  if (!showIOSHint && permission !== "default") return null;

  const dismiss = () => {
    setSnoozedUntil(String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
    onDone?.("dismissed");
  };

  const enable = async () => {
    setBusy(true);
    const result = await request();
    setBusy(false);
    if (result === "granted") toast({ id: "push-enabled", type: "success", title: "Notifications turned on" });
    else if (result === "denied") toast({ id: "push-denied", type: "warning", title: "Notifications blocked. You can enable them later in browser settings." });
    onDone?.(result);
  };

  const Icon = showIOSHint ? Share : BellRing;
  const title = showIOSHint ? "Add to Home Screen for alerts" : "Never miss your turn";
  const text = showIOSHint ? "On iPhone, tap Share and then \"Add to Home Screen\" to receive notifications." : t(TEXT_KEYS[context] || TEXT_KEYS.default);

  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        "relative flex gap-3 border border-gold-400/50 bg-gradient-to-br from-gold-100 to-brand-50 text-fg dark:from-brand-800 dark:to-brand-900",
        variant === "banner" ? "items-center rounded-xl p-3" : "flex-col rounded-2xl p-4 sm:flex-row sm:items-center",
        className
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-brand-950">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pr-6">
        <p className="font-semibold">{title}</p>
        <p className={cn("text-sm text-muted", variant === "banner" && "line-clamp-2")}>{text}</p>
      </div>
      {!showIOSHint && (
        <div className="flex shrink-0 gap-2">
          {variant === "card" && (
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          )}
          <Button size="sm" variant="gold" onClick={enable} loading={busy}>
            Turn on
          </Button>
        </div>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-muted hover:bg-surface-muted hover:text-fg"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
