import { BadgeCheck, Gift, Headphones, Languages, Lock, Timer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { label as t } from "@/lib/labels";

const ITEMS = [
  { n: 1, icon: BadgeCheck },
  { n: 2, icon: Lock },
  { n: 3, icon: Timer },
  { n: 4, icon: Gift },
  { n: 5, icon: Languages },
  { n: 6, icon: Headphones },
];

/** Six-point "Why choose us" grid used on About and How it works. */
export function WhyChooseUs() {
  return (
    <section className="container-page py-12">
      <SectionHeading title="Why choose us" subtitle="Built for trust from the ground up." />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ n, icon: Icon }) => (
          <Card as="li" key={n} className="flex gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold">{t(`content.why.i${n}Title`)}</h3>
              <p className="mt-0.5 text-sm text-muted">{t(`content.why.i${n}Text`)}</p>
            </div>
          </Card>
        ))}
      </ul>
    </section>
  );
}
