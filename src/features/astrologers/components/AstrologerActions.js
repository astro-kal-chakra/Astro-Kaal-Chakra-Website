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
import { astrologerModes } from "../lib/modes";

/**
 * Chat / Call / Video / Waitlist / Follow. Browsing is open; login is requested
 * only when the user actually starts something.
 */
export function AstrologerActions({ astrologer, layout = "card", showFollow = false }) {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [following, setFollowing] = useState(Boolean(astrologer.isFollowing));
  const [followBusy, setFollowBusy] = useState(false);

  const start = (mode) =>
    requireAuth(() => {
      router.push(`${routes.consult}?astrologer=${astrologer.slug}&mode=${mode}`);
    }, mode);

  const joinWaitlist = () =>
    requireAuth(() => {
      router.push(`${routes.consult}?astrologer=${astrologer.slug}&mode=chat&waitlist=1`);
    }, "waitlist");

  const toggleFollow = () =>
    requireAuth(async () => {
      setFollowBusy(true);
      try {
        const next = !following;
        await astrologerService.follow(astrologer.id, next);
        setFollowing(next);
        if (next) toast({ type: "success", title: `You'll be notified when ${astrologer.name} comes online` });
      } catch {
        toast({ type: "error", title: "Something went wrong" });
      } finally {
        setFollowBusy(false);
      }
    }, "follow");

  const card = layout === "card";
  const size = card ? "sm" : "lg";
  const { status } = astrologer;
  const modes = astrologerModes(astrologer);

  // Card: one row of compact buttons. Profile: full-width buttons with the price.
  return (
    <div className={cn("gap-2", card ? "flex flex-wrap" : "grid grid-cols-1")}>
      {status === "online" &&
        modes.map((m, i) => (
          <Button
            key={m.key}
            size={size}
            variant={i === 0 ? "primary" : "soft"}
            onClick={() => start(m.key)}
            className={cn(card ? (i === 0 ? "flex-[1.4] px-2" : "flex-1 px-2") : "w-full justify-between")}
            aria-label={`${m.label} with ${astrologer.name}`}
          >
            <span className="flex items-center gap-2">
              <m.icon className="size-4" aria-hidden /> {card ? m.label : `Start ${m.label.toLowerCase()}`}
            </span>
            {!card && <span className="text-sm font-medium opacity-90">{formatCurrency(m.price)}/min</span>}
          </Button>
        ))}
      {status === "busy" && (
        <Button size={size} variant="gold" onClick={joinWaitlist} className="flex-1">
          <ListPlus className="size-4" aria-hidden /> Join waitlist
        </Button>
      )}
      {status === "offline" && (
        <Button size={size} variant="outline" onClick={showFollow ? toggleFollow : undefined} disabled={!showFollow} className="flex-1">
          {showFollow ? (
            <>
              <BellRing className="size-4" aria-hidden /> Notify me when online
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
    </div>
  );
}
