"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

/** Error state with a retry button, used by every account list. */
export function AccountErrorState({ onRetry, className }) {
  return (
    <Card className={className} role="alert">
      <EmptyState
        icon={CircleAlert}
        title="Couldn't load this"
        description="Please check your connection and try again."
        action={
          onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="size-4" aria-hidden /> Try again
            </Button>
          )
        }
      />
    </Card>
  );
}

/** Generic row skeleton: avatar + two lines. */
export function AccountListSkeleton({ rows = 4, avatar = true, className }) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="flex items-center gap-4 p-4">
          {avatar && <Skeleton className="size-12 shrink-0 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="hidden h-8 w-20 rounded-full sm:block" />
        </Card>
      ))}
    </div>
  );
}

/** EmptyState inside a card so empty lists look consistent. */
export function AccountEmptyCard({ className, ...props }) {
  return (
    <Card className={className}>
      <EmptyState {...props} />
    </Card>
  );
}

/**
 * "Show more" under a paged list (usePagedResource): loads the next page, shows progress, and offers a retry
 * when a page fails. Renders nothing once everything is loaded.
 */
export function AccountLoadMore({ list, label = "Show more", className }) {
  if (!list.hasMore && list.more !== "error") return null;
  return (
    <div className={cn("mt-4 flex flex-col items-center gap-1.5", className)}>
      <Button variant="outline" size="sm" loading={list.more === "loading"} onClick={list.loadMore}>
        {list.more === "error" ? (
          <>
            <RefreshCw className="size-3.5" aria-hidden /> Try again
          </>
        ) : (
          label
        )}
      </Button>
      {list.more === "error" && <p className="text-xs text-muted">Couldn&apos;t load more. Check your connection.</p>}
    </div>
  );
}
