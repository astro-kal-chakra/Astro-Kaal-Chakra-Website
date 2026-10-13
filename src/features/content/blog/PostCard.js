"use client";

import { blogCategoryLabel } from "@/features/content/blog/categoryLabel";
import { routes } from "@/config/routes";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { PostMedia } from "./PostMedia";
import { PostMeta } from "./PostMeta";

export function PostCard({ post, headingLevel = "h3" }) {
  const Heading = headingLevel;
  return (
    <Card as="article" className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <LocaleLink href={routes.blogPost(post.slug)} tabIndex={-1} aria-hidden className="block overflow-hidden">
        <PostMedia post={post} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      </LocaleLink>
      <div className="flex flex-1 flex-col p-5">
        <LocaleLink href={`${routes.blog}?category=${post.category}`} className="self-start">
          <Badge tone="gold">{blogCategoryLabel(post.category)}</Badge>
        </LocaleLink>
        <Heading className="mt-3 text-lg font-semibold leading-snug">
          <LocaleLink href={routes.blogPost(post.slug)} className="hover:text-brand-600 dark:hover:text-gold-400">
            {post.title}
          </LocaleLink>
        </Heading>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{post.excerpt}</p>
        <PostMeta post={post} className="mt-4" />
      </div>
    </Card>
  );
}
