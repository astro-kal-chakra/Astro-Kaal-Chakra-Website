import { Suspense } from "react";
import { PRICE_RANGES } from "@/constants/astrologer";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { contentService } from "@/lib/api/services/content.service";
import { buildMetadata } from "@/lib/seo/metadata";
import { AstrologerListing } from "@/features/astrologers/components/AstrologerListing";

const FILTER_KEYS = ["q", "language", "specialty", "price", "minRating", "online", "mode", "sort", "category"];

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: "/astrologers",
    title: "Talk to Astrologers Online – Chat, Call & Video",
    description: "Browse verified astrologers by language, specialty, price and rating. See who is online right now and start a private consultation.",
  });
}

export default async function AstrologersPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;

  const filters = Object.fromEntries(FILTER_KEYS.filter((k) => typeof sp[k] === "string").map((k) => [k, sp[k]]));
  const range = PRICE_RANGES.find((p) => p.id === filters.price);
  const { price, ...query } = filters;
  const [initial, meta, config] = await Promise.all([
    astrologerService.list({ ...query, ...(range ? { minPrice: range.min, maxPrice: Number.isFinite(range.max) ? range.max : undefined } : {}) }, { page: 1, pageSize: 12 }),
    contentService.getMeta().catch(() => null),
    contentService.getSiteConfig(),
  ]);

  return (
    <>
      <header className="bg-aura border-b border-line">
        <div className="container-page py-8 sm:py-10">
          <p className="eyebrow">Consult</p>
          <h1 className="mt-2 font-display text-3xl text-fg sm:text-4xl">Talk to an astrologer</h1>
          <p className="mt-2 max-w-2xl text-muted">
            {`Chat, call or video with verified astrologers. Each astrologer sets their own per-minute rate${config.freeChat?.enabled ? `; your first ${config.freeChat.minutes}-minute chat is free` : ""}.`}
          </p>
        </div>
      </header>
      <div className="container-page py-6">
        <Suspense>
          <AstrologerListing initial={initial} initialFilters={filters} options={meta} />
        </Suspense>
      </div>
    </>
  );
}
