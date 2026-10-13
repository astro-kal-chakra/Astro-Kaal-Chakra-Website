import { notFound } from "next/navigation";
import { BadgeCheck, Briefcase, Gift, Languages, Lock, Star, Timer, Users } from "lucide-react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { routes } from "@/config/routes";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { contentService } from "@/lib/api/services/content.service";
import { astrologerJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatCompact } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AstrologerLiveRow } from "@/features/astrologers/components/AstrologerLiveRow";
import { AstrologerProfileLive } from "@/features/astrologers/components/AstrologerProfileLive";
import { ReviewCard } from "@/features/home/components/InfoSections";
import { MoreReviews } from "@/features/astrologers/components/MoreReviews";
import { label as t } from "@/lib/labels";

export async function generateStaticParams() {
  const slugs = await astrologerService.listSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const a = await astrologerService.getBySlug(slug);
  if (!a) return {};
  return buildMetadata({
    locale: lang,
    path: routes.astrologer(slug),
    title: `${a.name} – ${a.specialties.join(", ")} Astrologer`,
    description: `Consult ${a.name}, ${a.experienceYears}+ years experience in ${a.specialties.join(", ")}. Rated ${a.rating}/5 by ${a.reviewCount} users. Speaks ${a.languages.join(", ")}.`,
    type: "profile",
  });
}

export default async function AstrologerProfilePage({ params }) {
  const { lang, slug } = await params;
  const astrologer = await astrologerService.getBySlug(slug);
  if (!astrologer) notFound();

  const [reviews, similar, config] = await Promise.all([
    astrologerService.getReviews(astrologer.id),
    astrologerService.getSimilar(astrologer, 3),
    contentService.getSiteConfig(),
  ]);
  const a = astrologer;

  const stats = [
    { icon: Star, label: "Reviews", value: `${a.rating.toFixed(1)} (${formatCompact(a.reviewCount, lang)})` },
    { icon: Briefcase, label: "Experience", value: `${a.experienceYears} yrs` },
    { icon: Users, label: "Total sessions", value: formatCompact(a.totalSessions, lang) },
  ];

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <ol className="flex flex-wrap gap-1">
          <li>
            <LocaleLink href="/" className="hover:text-accent">Home</LocaleLink> /
          </li>
          <li>
            <LocaleLink href={routes.astrologers} className="hover:text-accent">Talk to Astrologer</LocaleLink> /
          </li>
          <li aria-current="page" className="text-fg">
            {a.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row">
              <Avatar src={a.avatarUrl} name={a.name} size={112} priority />
              <div className="min-w-0 flex-1">
                <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl text-fg sm:text-4xl">
                  {a.name}
                  {a.isVerified && (
                    <Badge tone="brand">
                      <BadgeCheck className="size-3.5" aria-hidden /> Verified
                    </Badge>
                  )}
                </h1>
                <p className="mt-1 text-muted">{a.specialties.join(" · ")}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <Languages className="size-4" aria-hidden /> {a.languages.join(", ")}
                </p>
                <div className="mt-2">
                  <RatingStars value={a.rating} size={16} showValue />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl bg-surface-muted p-3">
                      <dt className="flex items-center gap-1 text-xs text-muted">
                        <s.icon className="size-3.5" aria-hidden /> {s.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-2 font-display text-2xl text-fg">About</h2>
            <p className="leading-relaxed text-muted">{a.about}</p>
            <h3 className="mb-2 mt-5 text-sm font-semibold">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {a.specialties.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
              {a.categories.map((c) => (
                <Badge key={c} tone="gold">
                  {t(`categories.${c}`)}
                </Badge>
              ))}
            </div>
          </Card>

          <section>
            <h2 className="mb-3 font-display text-2xl text-fg">
              Reviews ({formatCompact(a.reviewCount, lang)})
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {reviews.items.map((r) => (
                <ReviewCard key={r.id} review={r} locale={lang} />
              ))}
              <MoreReviews astrologerId={astrologer.id} hasMore={reviews.hasMore ?? reviews.items.length < reviews.total} locale={lang} />
            </ul>
          </section>
        </div>

        {/* Sticky action panel — on mobile it sits right after the header card. */}
        <aside className="order-first lg:order-none">
          <Card className="space-y-4 p-5 lg:sticky lg:top-20">
            <AstrologerProfileLive astrologer={a} />
            <ul className="space-y-1.5 border-t border-line pt-4 text-xs text-muted">
              <li className="flex gap-2">
                <Timer className="size-3.5 shrink-0 text-brand-500" aria-hidden /> Charged per minute at the rate shown · end anytime
              </li>
              {a.freeChatEligible && config.freeChat?.enabled && (
                <li className="flex gap-2">
                  <Gift className="size-3.5 shrink-0 text-brand-500" aria-hidden /> {`New users: your first ${config.freeChat.minutes}-minute chat is free`}
                </li>
              )}
              <li className="flex gap-2">
                <Lock className="size-3.5 shrink-0 text-brand-500" aria-hidden /> Your phone number is never shared
              </li>
            </ul>
          </Card>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <SectionHeading eyebrow="You may also like" title="Similar astrologers" />
          <AstrologerLiveRow astrologers={similar} />
        </section>
      )}

      <JsonLd
        data={[
          astrologerJsonLd(a, lang),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Talk to Astrologer", path: `${routes.astrologers}` },
            { name: a.name, path: `${routes.astrologer(a.slug)}` },
          ]),
        ]}
      />
    </div>
  );
}
