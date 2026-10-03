import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { LEGAL_PAGES } from "@/features/legal/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) return {};
  return buildMetadata({ locale: lang, path: routes.legal(slug), title: page.title });
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) notFound();

  return (
    <article className="container-page max-w-3xl py-10">
      <h1 className="font-display text-3xl font-semibold">{page.title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 2026</p>
      <div className="mt-8 space-y-6">
        {page.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 className="text-lg font-semibold">{heading}</h2>
            <p className="mt-1 leading-relaxed text-muted">{body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
