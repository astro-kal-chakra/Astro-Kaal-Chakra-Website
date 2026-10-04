import { notFound } from "next/navigation";
import { BadgeCheck, MessageCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getSign } from "@/constants/zodiac";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { contentService } from "@/lib/api/services/content.service";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AstrologerLiveRow } from "@/features/astrologers/components/AstrologerLiveRow";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { ContentCta } from "@/features/content/components/ContentCta";
import { ArticleBody } from "@/features/content/blog/ArticleBody";
import { BlogCover } from "@/features/content/blog/BlogCover";
import { PostCard } from "@/features/content/blog/PostCard";
import { PostMeta } from "@/features/content/blog/PostMeta";
import { ShareButtons } from "@/features/content/blog/ShareButtons";
import { TableOfContents } from "@/features/content/blog/TableOfContents";
import { label as t } from "@/lib/labels";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await contentService.listPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const post = await contentService.getPost(slug, lang);
  if (!post) return {};
  return buildMetadata({
    locale: lang,
    path: routes.blogPost(slug),
    title: post.title,
    description: post.excerpt,
    type: "article",
  });
}

export default async function BlogPostPage({ params }) {
  const { lang, slug } = await params;
  const post = await contentService.getPost(slug, lang);
  if (!post) notFound();

  const [related, helpers] = await Promise.all([
    contentService.getRelatedPosts(post, { limit: 3, locale: lang }),
    astrologerService.list({ specialty: post.specialty }, { pageSize: 4 }),
  ]);
  const path = routes.blogPost(slug);
  const absoluteUrl = new URL(`${path}`, siteConfig.url).toString();
  const categoryLabel = t(`content.blog.categories.${post.category}`);
  const signs = post.signs.map(getSign).filter(Boolean);
  const author = post.author;

  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs
        label="Breadcrumb"
        className="mb-6"
        items={[
          { name: "Home", href: routes.home },
          { name: "Astrology Blog", href: routes.blog },
          { name: categoryLabel, href: `${routes.blog}?category=${post.category}` },
          { name: post.title },
        ]}
      />

      <article>
        <header className="mx-auto max-w-3xl text-center">
          <LocaleLink href={`${routes.blog}?category=${post.category}`}>
            <Badge tone="gold">{categoryLabel}</Badge>
          </LocaleLink>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
          {author && (
            <div className="mt-6 flex items-center justify-center gap-3 text-left">
              <LocaleLink href={routes.astrologer(author.slug)}>
                <Avatar src={author.avatarUrl} name={author.name} size={44} />
              </LocaleLink>
              <div>
                <LocaleLink
                  href={routes.astrologer(author.slug)}
                  className="flex items-center gap-1 text-sm font-semibold hover:text-brand-600 dark:hover:text-gold-400"
                >
                  {`By ${author.name}`}
                  <BadgeCheck className="size-4 text-brand-500" aria-label="Verified" />
                </LocaleLink>
                <PostMeta post={post} showAuthor={false} className="mt-0.5" />
              </div>
            </div>
          )}
        </header>

        <BlogCover cover={post.cover} size="lg" className="mx-auto mt-8 max-w-5xl rounded-3xl sm:aspect-[21/9]" />

        <div className="mx-auto mt-10 grid grid-cols-1 max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <TableOfContents id="toc-mobile" title="In this article" sections={post.sections} className="mb-8 lg:hidden" />
            <ArticleBody sections={post.sections} tipLabel="Astrologer's tip" />

            <p className="mt-10 text-xs text-muted">
              {`Updated ${formatDate(post.updatedAt, lang)}`}
            </p>

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="mb-3 text-sm font-semibold">Found this helpful? Share it</h2>
              <ShareButtons url={absoluteUrl} title={post.title} />
            </div>

            {author && (
              <Card className="mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <Avatar src={author.avatarUrl} name={author.name} size={72} />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">About the author</p>
                  <h2 className="mt-1 text-lg font-semibold">{author.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {`${author.name} has ${author.experienceYears}+ years of experience in ${author.specialties.join(", ")} and consults on our platform.`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <ButtonLink href={routes.astrologer(author.slug)} variant="outline" size="sm">
                    View profile
                  </ButtonLink>
                  <ButtonLink href={routes.astrologer(author.slug)} size="sm">
                    <MessageCircle className="size-4" aria-hidden /> Chat
                  </ButtonLink>
                </div>
              </Card>
            )}
          </div>

          <aside className="space-y-6">
            <div className="hidden lg:sticky lg:top-20 lg:block lg:space-y-6">
              <TableOfContents id="toc-desktop" title="In this article" sections={post.sections} />
              {signs.length > 0 && <SignLinks t={t} signs={signs} lang={lang} id="signs-desktop" />}
            </div>
            {signs.length > 0 && <SignLinks t={t} signs={signs} lang={lang} id="signs-mobile" className="lg:hidden" />}
          </aside>
        </div>
      </article>

      <ContentCta className="mx-auto mt-14 max-w-6xl" title="Want to know how this applies to your chart?" text="Chat privately with a verified astrologer. Your first 3-minute chat is free." cta="Talk to an astrologer" />

      {helpers.items.length > 0 && (
        <section className="mt-14">
          <SectionHeading title="Astrologers who can help" action={{ href: routes.astrologers, label: "View all" }} />
          <AstrologerLiveRow astrologers={helpers.items} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading title="Related articles" action={{ href: routes.blog, label: "View all" }} />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd
        data={[
          {
            ...articleJsonLd({
              title: post.title,
              description: post.excerpt,
              path: `${path}`,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
            }),
            inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
            articleSection: categoryLabel,
            ...(author
              ? { author: { "@type": "Person", name: author.name, url: new URL(`${routes.astrologer(author.slug)}`, siteConfig.url).toString() } }
              : {}),
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Astrology Blog", path: `${routes.blog}` },
            { name: post.title, path: `${path}` },
          ]),
        ]}
      />
    </div>
  );
}

function SignLinks({ t, signs, lang, id, className }) {
  return (
    <nav aria-labelledby={id} className={cn("rounded-2xl border border-line bg-surface p-5", className)}>
      <h2 id={id} className="text-sm font-semibold uppercase tracking-wide text-muted">
        Read your horoscope
      </h2>
      <ul className="mt-3 space-y-2">
        {signs.map((s) => (
          <li key={s.slug}>
            <LocaleLink
              href={routes.horoscopeSign("daily", s.slug)}
              className="flex items-center gap-3 rounded-xl p-2 text-sm font-medium transition-colors hover:bg-surface-muted"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-lg text-gold-300" aria-hidden>
                {s.symbol}
              </span>
              {`${s[lang]} daily horoscope`}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
