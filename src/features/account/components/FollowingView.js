"use client";

import { useState } from "react";
import { Heart, HeartOff } from "lucide-react";
import { routes } from "@/config/routes";
import { AstrologerCard, AstrologerCardSkeleton } from "@/features/astrologers/components/AstrologerCard";
import { userService } from "@/lib/api/services/user.service";
import { useToast } from "@/providers/ToastProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAccountResource } from "../hooks/useAccountResource";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState } from "./AccountStates";

export function FollowingView() {
  const { toast } = useToast();
  const { data, status, reload, mutate } = useAccountResource(() => userService.listFollowing());
  const [busyId, setBusyId] = useState(null);

  const unfollow = async (a) => {
    setBusyId(a.id);
    try {
      await userService.unfollow(a.id);
      mutate((list = []) => list.filter((x) => x.id !== a.id));
      toast({ type: "success", title: `You unfollowed ${a.name}` });
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AccountShell title="Followed astrologers" subtitle="We'll notify you when they come online.">
      {status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <AstrologerCardSkeleton key={i} />
          ))}
        </div>
      )}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && data.length === 0 && (
        <AccountEmptyCard
          icon={Heart}
          title="You're not following anyone"
          description="Follow astrologers you like to get notified when they're available."
          action={<ButtonLink href={routes.astrologers}>Browse astrologers</ButtonLink>}
        />
      )}
      {status === "success" && data.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((a) => (
            <li key={a.id} className="flex flex-col gap-2">
              <AstrologerCard astrologer={a} />
              <Button
                size="sm"
                variant="ghost"
                className="self-center text-muted hover:text-red-600"
                loading={busyId === a.id}
                onClick={() => unfollow(a)}
                aria-label={`${"Unfollow"} ${a.name}`}
              >
                <HeartOff className="size-4" aria-hidden /> Unfollow
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
