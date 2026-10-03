"use client";

import { routes } from "@/config/routes";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { BlogCover } from "./BlogCover";
import { PostMeta } from "./PostMeta";
import { label as t } from "@/lib/labels";

export function PostCard({ post, headingLevel = "h3" }) {
  const Heading = headingLevel;
  return (
    <Card as="article" className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <LocaleLink href={routes.blogPost(post.slug)} tabIndex={-1} aria-hidden className="block overflow-hidden">
        <BlogCover cover={post.cover} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      </LocaleLink>
      <div className="flex flex-1 flex-col p-5">
        <LocaleLink href={`${routes.blog}?category=${post.category}`} className="self-start">
          <Badge tone="gold">{t(`content.blog.categories.${post.category}`)}</Badge>
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
