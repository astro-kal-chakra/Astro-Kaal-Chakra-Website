import { Suspense } from "react";
import { PRICE_RANGES } from "@/constants/astrologer";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { buildMetadata } from "@/lib/seo/metadata";
import { AstrologerListing } from "@/features/astrologers/components/AstrologerListing";

const FILTER_KEYS = ["q", "language", "specialty", "price", "minRating", "online", "mode", "sort", "category"];

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: "/astrologers",
    title: "Talk to Astrologers Online – Live Chat & Video",
    description: "Browse verified astrologers by language, specialty, price and rating. See who is online right now and start a private consultation.",
  });
}

export default async function AstrologersPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;

  const filters = Object.fromEntries(FILTER_KEYS.filter((k) => typeof sp[k] === "string").map((k) => [k, sp[k]]));
  const range = PRICE_RANGES.find((p) => p.id === filters.price);
  const { price, ...query } = filters;
  const initial = await astrologerService.list(
    { ...query, ...(range ? { minPrice: range.min, maxPrice: Number.isFinite(range.max) ? range.max : undefined } : {}) },
    { page: 1, pageSize: 12 }
  );

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold">Talk to Astrologers</h1>
      <Suspense>
        <AstrologerListing initial={initial} initialFilters={filters} />
      </Suspense>
    </div>
  );
}
