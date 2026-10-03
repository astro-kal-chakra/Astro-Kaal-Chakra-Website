import { Briefcase, Gem, Heart, HeartPulse, IndianRupee } from "lucide-react";
import { routes } from "@/config/routes";
import { CATEGORIES } from "@/constants/astrologer";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { label as t } from "@/lib/labels";

const ICONS = { Heart, Briefcase, Gem, IndianRupee, HeartPulse };

export function Categories() {
  return (
    <section className="container-page py-12">
      <SectionHeading title="What's on your mind?" />
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon];
          return (
            <li key={c.slug}>
              <LocaleLink
                href={`${routes.astrologers}?category=${c.slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center font-medium transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-400">
                  <Icon className="size-6" aria-hidden />
                </span>
                {t(`categories.${c.slug}`)}
              </LocaleLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
