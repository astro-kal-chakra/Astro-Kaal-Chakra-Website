"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Heart, ListPlus } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { PushPermissionPrompt } from "@/features/notifications/components/PushPermissionPrompt";
import { astrologerModes } from "../lib/modes";
import { setFollowing, useIsFollowing } from "../hooks/useFollowing";

/** Follow / unfollow (login first), shared by the Follow button and the card's heart. */
function useFollowToggle(astrologer) {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const following = useIsFollowing(astrologer);
  const [busy, setBusy] = useState(false);
  // Just followed: offer browser notifications (the prompt hides itself if already allowed / blocked)
  const [justFollowed, setJustFollowed] = useState(false);

  const toggle = () =>
    requireAuth(async () => {
      setBusy(true);
      try {
        const next = !following;
        await astrologerService.follow(astrologer.id, next);
        setFollowing(astrologer.id, next);
        setJustFollowed(next);
        if (next) toast({ type: "success", title: `You'll be notified when ${astrologer.name} comes online or goes live` });
      } catch {
        toast({ type: "error", title: "Something went wrong" });
      } finally {
        setBusy(false);
      }
    }, "follow");

  return { following, busy, toggle, justFollowed, setJustFollowed };
}

/** Heart icon button (mobile astrologer card). */
export function FollowHeart({ astrologer, className }) {
  const { following, busy, toggle } = useFollowToggle(astrologer);
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${astrologer.name}` : `Follow ${astrologer.name}`}
      className={cn("grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-red-500 disabled:opacity-60", className)}
    >
      <Heart className={cn("size-6", following && "fill-red-500 text-red-500")} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

/**
 * Chat / Call / Video / Waitlist / Follow. Browsing is open; login is requested
 * only when the user actually starts something.
 * layout: "card" (compact row), "compact" (mobile card: two-line buttons with the price), "profile" (full width).
 */
export function AstrologerActions({ astrologer, layout = "card", showFollow = false, className }) {
  const { requireAuth } = useAuth();
  const router = useRouter();
  const { following, busy: followBusy, toggle: toggleFollow, justFollowed, setJustFollowed } = useFollowToggle(astrologer);

  // A free mode starts right away (nothing to pay or check); paid modes open the pre-session screen
  const start = (mode, free) =>
    requireAuth(() => {
      router.push(`${routes.consult}?astrologer=${astrologer.slug}&mode=${mode}${free ? "&free=1" : ""}`);
    }, mode);

  const joinWaitlist = () =>
    requireAuth(() => {
      router.push(`${routes.consult}?astrologer=${astrologer.slug}&mode=chat&waitlist=1`);
    }, "waitlist");

  const { status } = astrologer;
  const modes = astrologerModes(astrologer);
  const onlyTaking = () => modes.filter((x) => x.available).map((x) => x.label.toLowerCase()).join(" and ") || "other";

  // Mobile card (app style): first mode filled, the rest soft; each shows its label and per-minute price
  if (layout === "compact") {
    // Like the app: only the modes that can be started right now (all of them, disabled, if none can)
    const open = modes.filter((m) => m.available);
    const shown = open.length ? open : modes;
    return (
      <div className={cn("flex gap-1.5 @min-[20rem]:gap-2", className)}>
        {status === "online" &&
          shown.map((m, i) => (
            <button
              key={m.key}
              type="button"
              onClick={() => start(m.key, m.free)}
              disabled={!m.available}
              title={m.available ? undefined : `${astrologer.name} is not taking requests right now`}
              aria-label={m.available ? `${m.label} with ${astrologer.name}, ${m.free ? "free" : `${formatCurrency(m.price)} per minute`}` : `${m.label} not available right now`}
              className={cn(
                "flex min-w-0 flex-1 select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-2xl px-1 py-2.5 transition-colors disabled:pointer-events-none disabled:opacity-50",
                i === 0
                  ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600 dark:bg-brand-400 dark:text-brand-950"
                  : "bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-200"
              )}
            >
              <span className="flex items-center gap-1 text-[13px] font-semibold @min-[20rem]:text-sm @min-[24rem]:gap-1.5 @min-[24rem]:text-[15px]">
                {/* icon hidden on the narrowest cards (home carousel / 320px phones) so the label fits */}
                <m.icon className="hidden size-[15px] shrink-0 @min-[20rem]:block" aria-hidden /> {m.label}
              </span>
              <span className={cn("text-xs font-medium @min-[20rem]:text-[13px]", i === 0 ? "text-white/90 dark:text-brand-950/80" : "text-fg")}>
                {m.free ? "Free" : `${formatCurrency(m.price)}/m`}
              </span>
            </button>
          ))}
        {status === "busy" && (
          <Button size="lg" variant="gold" onClick={joinWaitlist} className="flex-1 rounded-2xl">
            <ListPlus className="size-4" aria-hidden /> Join waitlist
          </Button>
        )}
        {status === "offline" && (
          <Button size="lg" variant="outline" disabled className="flex-1 rounded-2xl">
            Offline now
          </Button>
        )}
      </div>
    );
  }

  const card = layout === "card";
  const size = card ? "sm" : "lg";

  // Card: one row of compact buttons. Profile: full-width buttons with the price.
  return (
    <div className={cn("gap-2", card ? "flex flex-wrap" : "grid grid-cols-1", className)}>
      {status === "online" &&
        modes.map((m, i) => (
          <Button
            key={m.key}
            size={size}
            variant={m.free ? "success" : i === 0 ? "primary" : "soft"}
            onClick={() => start(m.key, m.free)}
            disabled={!m.available}
            title={m.available ? undefined : `${astrologer.name} is taking only ${onlyTaking()} requests right now`}
            className={cn(card ? (i === 0 ? "flex-[1.4] px-2" : "flex-1 px-2") : "w-full justify-between")}
            aria-label={m.available ? `${m.label} with ${astrologer.name}` : `${m.label} not available right now`}
          >
            <span className="flex items-center gap-2">
              <m.icon className="size-4" aria-hidden /> {m.free ? `Free ${m.label.toLowerCase()}` : card ? m.label : `Start ${m.label.toLowerCase()}`}
            </span>
            {!card && <span className="text-sm font-medium opacity-90">{m.free ? "₹0" : `${formatCurrency(m.price)}/min`}</span>}
          </Button>
        ))}
      {status === "busy" && (
        <Button size={size} variant="gold" onClick={joinWaitlist} className="flex-1">
          <ListPlus className="size-4" aria-hidden /> Join waitlist
        </Button>
      )}
      {status === "offline" && (
        <Button
          size={size}
          variant="outline"
          onClick={showFollow ? toggleFollow : undefined}
          disabled={!showFollow}
          loading={followBusy}
          aria-pressed={showFollow ? following : undefined}
          className="flex-1"
        >
          {showFollow ? (
            <>
              <BellRing className={cn("size-4", following && "fill-current text-accent")} aria-hidden />
              {following ? "Following · we'll notify you" : "Notify me when online"}
            </>
          ) : (
            "Offline now"
          )}
        </Button>
      )}
      {showFollow && status !== "offline" && (
        <Button size={size} variant="outline" onClick={toggleFollow} loading={followBusy} aria-pressed={following}>
          <Heart className={cn("size-4", following && "fill-red-500 text-red-500")} aria-hidden />
          {following ? "Following" : "Follow"}
        </Button>
      )}
      {showFollow && justFollowed && <PushPermissionPrompt context="follow" variant="banner" className="col-span-full w-full" onDone={() => setJustFollowed(false)} />}
    </div>
  );
}
