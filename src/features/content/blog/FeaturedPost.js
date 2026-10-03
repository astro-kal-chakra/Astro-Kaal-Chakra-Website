"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { BlogCover } from "./BlogCover";
import { PostMeta } from "./PostMeta";
import { label as t } from "@/lib/labels";

export function FeaturedPost({ post }) {
  return (
    <Card as="article" className="grid grid-cols-1 overflow-hidden md:grid-cols-2">
      <LocaleLink href={routes.blogPost(post.slug)} tabIndex={-1} aria-hidden className="block">
        <BlogCover cover={post.cover} size="lg" className="h-full md:aspect-auto md:min-h-72" />
      </LocaleLink>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">
            <Sparkles className="size-3" aria-hidden /> Featured
          </Badge>
          <LocaleLink href={`${routes.blog}?category=${post.category}`}>
            <Badge tone="gold">{t(`content.blog.categories.${post.category}`)}</Badge>
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
