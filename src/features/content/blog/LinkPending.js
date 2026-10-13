"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Put inside a <Link>: shows a small spinner while that link's navigation is in progress, so a click on
 * a filter chip registers instantly even before the new results arrive.
 */
export function LinkPending({ className }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "ml-0 inline-block size-0 rounded-full border-2 border-current border-t-transparent opacity-0 transition-all",
        pending && "ml-2 size-3.5 animate-spin opacity-100",
        className
      )}
    />
  );
}
