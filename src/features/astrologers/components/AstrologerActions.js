"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ListPlus, MessageCircle, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";

/**
 * Chat / Video / Waitlist / Follow. Browsing is open; login is requested
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
      } catch {
        toast({ type: "error", title: "Something went wrong" });
      } finally {
        setFollowBusy(false);
      }
    }, "follow");

  const size = layout === "card" ? "sm" : "lg";
  const { status } = astrologer;

  return (
    <div className={cn("flex flex-wrap gap-2", layout === "card" ? "" : "sm:flex-nowrap")}>
      {status === "online" && (
        <>
          <Button size={size} variant="success" onClick={() => start("chat")} className="flex-1">
            <MessageCircle className="size-4" aria-hidden /> Chat
          </Button>
          {astrologer.supportsVideo && (
            <Button size={size} variant="outline" onClick={() => start("video")} className="flex-1">
              <Video className="size-4" aria-hidden /> Video Call
            </Button>
          )}
        </>
      )}
      {status === "busy" && (
        <Button size={size} variant="gold" onClick={joinWaitlist} className="flex-1">
          <ListPlus className="size-4" aria-hidden /> Join Waitlist
        </Button>
      )}
      {status === "offline" && (
        <Button size={size} variant="outline" disabled className="flex-1">
          Offline
        </Button>
      )}
      {showFollow && (
        <Button size={size} variant="outline" onClick={toggleFollow} loading={followBusy} aria-pressed={following}>
          <Heart className={cn("size-4", following && "fill-red-500 text-red-500")} aria-hidden />
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
