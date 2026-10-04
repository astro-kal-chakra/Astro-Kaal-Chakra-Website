import { CalendarClock, Radio } from "lucide-react";
import { routes } from "@/config/routes";
import { liveService } from "@/lib/api/services/live.service";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { ContentCta } from "@/features/content/components/ContentCta";
import { LiveSessionCard } from "@/features/live/components/LiveSessionCard";

// Live status changes constantly — always render fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.live, title: "Live Astrology Sessions – Watch & Ask Questions", description: "Join live sessions with verified astrologers. Watch for free, chat with the community and ask your own question." });
}

export default async function LivePage({ params }) {
  const { lang } = await params;
  const { live, upcoming } = await liveService.list(lang);

  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs
        label="Breadcrumb"
        items={[{ name: "Home", href: routes.home }, { name: "Live sessions" }]}
        className="mb-4"
      />
      <header className="mb-8">
        <h1 className="flex items-center gap-3 font-display text-3xl font-semibold sm:text-4xl">
          <span className="relative flex size-3" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-red-600" />
          </span>
          Live sessions
        </h1>
        <p className="mt-2 max-w-2xl text-muted">Watch verified astrologers live for free. Ask a question or send a gift to show your appreciation.</p>
      </header>

      <section aria-labelledby="live-now-title">
        <h2 id="live-now-title" className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Radio className="size-5 text-red-600" aria-hidden /> Live now
          <span className="text-sm font-normal text-muted">({live.length})</span>
        </h2>
        {live.length ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((s) => (
              <li key={s.id}>
                <LiveSessionCard session={s} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Radio}
            title="No one is live right now"
            description="Check the upcoming sessions or talk to an astrologer one-on-one."
            action={<ButtonLink href={routes.astrologers}>Talk to an astrologer</ButtonLink>}
          />
        )}
      </section>

      <section aria-labelledby="upcoming-title" className="mt-12">
        <h2 id="upcoming-title" className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <CalendarClock className="size-5 text-gold-500" aria-hidden /> Upcoming
        </h2>
        {upcoming.length ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((s) => (
              <li key={s.id}>
                <LiveSessionCard session={s} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={CalendarClock} title="No upcoming sessions scheduled" />
        )}
      </section>

      <ContentCta className="mt-14" title="Still have questions about your chart?" text="Get a personal reading from a verified astrologer. Your first 3-minute chat is free." cta="Talk to an astrologer" />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Live sessions", path: `${routes.live}` },
        ])}
      />
    </div>
  );
}
