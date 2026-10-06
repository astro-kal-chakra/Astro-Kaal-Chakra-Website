import { Briefcase, Gem, Heart, HeartPulse, IndianRupee } from "lucide-react";
import { routes } from "@/config/routes";
import { CATEGORIES } from "@/constants/astrologer";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { label as t } from "@/lib/labels";

const ICONS = { Heart, Briefcase, Gem, IndianRupee, HeartPulse };
const HINTS = { love: "Relationships, compatibility", career: "Job change, growth, business", marriage: "Timing, matching, delays", finance: "Money, investments, debt", health: "Wellbeing, remedies" };

/** `categories` = slugs from the backend (/meta); only ones with an icon here are shown. */
export function Categories({ categories }) {
  const list = categories?.length ? CATEGORIES.filter((c) => categories.includes(c.slug)) : CATEGORIES;
  return (
    <section className="container-page py-4 sm:py-6">
      <SectionHeading eyebrow="Find the right expert" title="What's on your mind?" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((c) => {
          const Icon = ICONS[c.icon];
          return (
            <li key={c.slug}>
              <LocaleLink
                href={`${routes.astrologers}?category=${c.slug}`}
                className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_10px_30px_-14px_rgb(194_65_12/0.3)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/50 dark:text-brand-300">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-fg">{t(`categories.${c.slug}`)}</span>
                  <span className="block truncate text-xs text-muted">{HINTS[c.slug]}</span>
                </span>
              </LocaleLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
