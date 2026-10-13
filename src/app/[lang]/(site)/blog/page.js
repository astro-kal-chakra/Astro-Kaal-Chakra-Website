import { Suspense } from "react";
import { blogCategoryLabel } from "@/features/content/blog/categoryLabel";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkCardGrid } from "@/components/ui/PageSkeletons";
import { Skeleton } from "@/components/ui/Skeleton";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { ContentCta } from "@/features/content/components/ContentCta";
import { BlogFilters, blogHref } from "@/features/content/blog/BlogFilters";
import { BlogPagination } from "@/features/content/blog/BlogPagination";
import { FeaturedPost } from "@/features/content/blog/FeaturedPost";
import { PostCard } from "@/features/content/blog/PostCard";

const PAGE_SIZE = 6;

function parseFilters(sp) {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  // Any category slug (also ones added in the dashboard, e.g. "Basics"), not just the built-in list
  const category = /^[\w-]{1,40}$/.test(str(sp.category)) ? str(sp.category) : "";
  const q = str(sp.q).slice(0, 80);
  const page = Math.max(1, Number.parseInt(str(sp.page), 10) || 1);
  return { category, q, page };
}

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const { category, q, page } = parseFilters(await searchParams);
  const catLabel = category ? blogCategoryLabel(category) : null;
  return buildMetadata({
    locale: lang,
    path: blogHref({ category, page }),
    title: catLabel ? `${catLabel} – ${"Astrology Blog"}` : "Astrology Blog – Vedic Astrology, Planets, Remedies & Festivals",
    description: "Read articles by verified astrologers on Vedic astrology, planetary transits, remedies, festivals, love, career, numerology and tarot.",
    noIndex: Boolean(q),
  });
}

/**
 * Streaming: the page shell (title, search, category chips) renders immediately; the featured post and
 * the article list are separate async sections, each in its own <Suspense> with a skeleton, so each
 * appears as soon as its own API data arrives instead of the whole page waiting for everything.
 */
export default async function BlogPage({ params, searchParams }) {
  const { lang } = await params;
  const { category, q, page } = parseFilters(await searchParams);

  // The unfiltered listing pins the featured post on page 1 and leaves it out of the grid on every page.
  // Both requests start right away (not awaited here); the list only needs the featured slug to exclude it.
  const unfiltered = !category && !q;
  const featuredPromise = unfiltered ? contentService.getFeaturedPost(lang).catch(() => null) : Promise.resolve(null);
  const listPromise = featuredPromise.then((featuredPost) =>
    contentService.listPosts({ category, q, page, pageSize: PAGE_SIZE, locale: lang, excludeSlug: featuredPost?.slug })
  );

  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs
        label="Breadcrumb"
        items={[{ name: "Home", href: routes.home }, { name: "Astrology Blog" }]}
        className="mb-4"
      />

      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Astrology Blog</h1>
        <p className="mt-2 max-w-2xl text-muted">Practical guidance from verified astrologers — no fear, just clarity.</p>
      </header>

      <BlogFilters lang={lang} categories={contentService.categories} category={category} q={q} />

      {unfiltered && page === 1 && (
        <Suspense fallback={<Skeleton className="mt-8 h-80 w-full rounded-2xl md:h-96" />}>
          <FeaturedSection promise={featuredPromise} />
        </Suspense>
      )}

      <section className="mt-10" aria-labelledby="blog-list-title">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="blog-list-title" className="font-display text-2xl font-semibold">
            {q ? `Results for “${q}”` : category ? blogCategoryLabel(category) : "Latest articles"}
          </h2>
          <Suspense fallback={<Skeleton className="h-4 w-20" />}>
            <PostCount promise={listPromise} />
          </Suspense>
        </div>
        <Suspense fallback={<SkCardGrid count={PAGE_SIZE} />}>
          <PostList promise={listPromise} page={page} category={category} q={q} />
        </Suspense>
      </section>

      <ContentCta
        className="mt-14"
        title="Still have questions about your chart?"
        text="Get a personal reading from a verified astrologer. Your first chat is free."
        cta="Talk to an astrologer"
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Astrology Blog", path: `${routes.blog}` },
        ])}
      />
    </div>
  );
}

async function FeaturedSection({ promise }) {
  const featured = await promise;
  if (!featured) return null;
  return (
    <section className="mt-8" aria-label="Featured">
      <FeaturedPost post={featured} />
    </section>
  );
}

async function PostCount({ promise }) {
  const { total } = await promise;
  return <p className="text-sm text-muted">{`${total} ${total === 1 ? "article" : "articles"}`}</p>;
}

async function PostList({ promise, page, category, q }) {
  const { items, totalPages } = await promise;
  return (
    <>
      {items.length ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={category || q ? "No articles found" : "More articles coming soon"}
          description={category || q ? "Try a different search term or browse all categories." : "New guidance from our astrologers is on its way."}
          action={
            category || q ? (
              <ButtonLink href={routes.blog} variant="outline">
                Clear filters
              </ButtonLink>
            ) : null
          }
        />
      )}
      <BlogPagination page={page} totalPages={totalPages} category={category} q={q} />
    </>
  );
}
