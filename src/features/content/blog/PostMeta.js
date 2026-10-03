"use client";

import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { SITE_LOCALE } from "@/config/locale";

/** Author · date · reading time line. */
export function PostMeta({ post, className, showAuthor = true }) {
  const locale = SITE_LOCALE;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted", className)}>
      {showAuthor && post.author && (
        <>
          <span className="font-medium text-fg">{post.author.name}</span>
          <span aria-hidden>·</span>
        </>
      )}
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale, { day: "numeric", month: "short", year: "numeric" })}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden /> {`${post.readingMinutes} min read`}
      </span>
    </p>
  );
}
