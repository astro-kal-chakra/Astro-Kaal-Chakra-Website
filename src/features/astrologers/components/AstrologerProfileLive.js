"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useAstrologerPresence } from "../hooks/useAstrologerPresence";
import { AstrologerActions } from "./AstrologerActions";
import { StatusBadge } from "./StatusBadge";
import { label as t } from "@/lib/labels";

/**
 * Live status + action buttons on the profile page. Warns the user when the
 * astrologer goes offline or busy while they're looking at the profile.
 */
export function AstrologerProfileLive({ astrologer }) {
  const merge = useAstrologerPresence([astrologer]);
  const live = merge(astrologer);
  const [prevStatus, setPrevStatus] = useState(astrologer.status);
  const [noticeKey, setNoticeKey] = useState(null);

  // Adjust state during render when the live status changes (no effect needed).
  if (prevStatus !== live.status) {
    if (prevStatus === "online" && live.status === "offline") setNoticeKey("astrologers.wentOffline");
    else if (prevStatus === "online" && live.status === "busy") setNoticeKey("astrologers.becameBusy");
    else if (live.status === "online") setNoticeKey(null);
    setPrevStatus(live.status);
  }
  const notice = noticeKey && t(noticeKey);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <StatusBadge status={live.status} className="text-sm" />
        {live.queueCount > 0 && <span className="text-sm text-muted">· {`${live.queueCount} in queue`}</span>}
      </div>
      {notice && (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> {notice}
        </p>
      )}
      <AstrologerActions astrologer={live} layout="profile" showFollow />
    </div>
  );
}
