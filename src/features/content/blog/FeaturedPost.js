"use client";

import { blogCategoryLabel } from "@/features/content/blog/categoryLabel";
import { ArrowRight, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { PostMedia, postMedia } from "./PostMedia";
import { PostMeta } from "./PostMeta";

export function FeaturedPost({ post }) {
  return (
    <Card as="article" className="grid grid-cols-1 overflow-hidden md:grid-cols-2">
      {/* Video plays right in the card; image / illustrated cover links to the article */}
      {postMedia(post)?.type === "video" ? (
        <PostMedia post={post} size="lg" interactive priority className="h-full md:aspect-auto md:min-h-72" />
      ) : (
        <LocaleLink href={routes.blogPost(post.slug)} tabIndex={-1} aria-hidden className="block">
          <PostMedia post={post} size="lg" priority className="h-full md:aspect-auto md:min-h-72" />
        </LocaleLink>
      )}
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">
            <Sparkles className="size-3" aria-hidden /> Featured
          </Badge>
          <LocaleLink href={`${routes.blog}?category=${post.category}`}>
            <Badge tone="gold">{blogCategoryLabel(post.category)}</Badge>
          </LocaleLink>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold leading-tight sm:text-3xl">
          <LocaleLink href={routes.blogPost(post.slug)} className="hover:text-brand-600 dark:hover:text-gold-400">
            {post.title}
          </LocaleLink>
        </h2>
        <p className="mt-3 text-muted">{post.excerpt}</p>
        <PostMeta post={post} className="mt-4" />
        <ButtonLink href={routes.blogPost(post.slug)} className="mt-6 self-start">
          Read article <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </div>
    </Card>
  );
}
