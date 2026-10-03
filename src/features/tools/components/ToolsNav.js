import { ChevronRight } from "lucide-react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { TOOLS } from "../lib/constants";
import { label as t } from "@/lib/labels";

/** Internal links between the free tools (SEO + discovery). `active` is a TOOLS key. */
export function ToolsNav({ active }) {
  return (
    <nav aria-labelledby="tools-nav-title">
      <h2 id="tools-nav-title" className="mb-4 font-display text-xl font-semibold sm:text-2xl">
        More free astrology tools
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.filter((tool) => tool.key !== active).map(({ key, href, icon: Icon }) => (
          <li key={key}>
            <LocaleLink
              href={href}
              className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-colors hover:border-brand-300 hover:bg-surface-muted dark:hover:border-brand-600"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{t(`tools.nav.${key}.title`)}</span>
                <span className="block text-sm text-muted">{t(`tools.nav.${key}.desc`)}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
            </LocaleLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
