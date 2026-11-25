import { routes } from "@/config/routes";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { LocaleLink } from "@/components/ui/LocaleLink";

const link = "font-semibold text-accent underline-offset-4 hover:underline";

/** Anchor of the finder form on this page (ZodiacFinderTool), so "find my sign" links jump straight to it. */
export const FINDER_ANCHOR = "find-your-sign";

/**
 * Zodiac Sign Finder guide. The headings answer the searches that bring people here (Search Console):
 * "what is my zodiac sign by date of birth", "what is my rashi", "how to find my sun sign",
 * "how to check my horoscope by date of birth", "star sign / birth sign / astrology sign"…
 * Every answer links to the tool that gives the answer (finder form, free Kundli, the sign's horoscope).
 */
export function ZodiacGuide() {
  return (
    <section aria-labelledby="zodiac-guide-title" className="space-y-10">
      <div className="max-w-3xl space-y-4 leading-relaxed text-fg">
        <h2 id="zodiac-guide-title" className="font-display text-2xl font-semibold sm:text-3xl">
          What is my zodiac sign by date of birth?
        </h2>
        <p>
          Your zodiac sign (also called your <strong>sun sign</strong>, <strong>star sign</strong>, <strong>birth sign</strong> or{" "}
          <strong>astrology sign</strong>) is the sign the Sun was passing through on the day you were born. You only need your date of birth to find it:
          look up your birthday in the table below, or{" "}
          <a href={`#${FINDER_ANCHOR}`} className={link}>
            enter your date of birth in the zodiac sign finder
          </a>{" "}
          above and get your sign instantly.
        </p>
      </div>

      {/* Dates table: the direct answer to "what is my sign" for every birthday, each row linking to that sign's horoscope */}
      <div>
        <h3 className="mb-3 font-display text-xl font-semibold">Zodiac sign dates: find your sign by birthday</h3>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">The 12 zodiac signs with their Hindi rashi names and birth dates</caption>
            <thead className="bg-surface-muted text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Zodiac sign
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Rashi (Hindi)
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Birth dates
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Horoscope
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {ZODIAC_SIGNS.map((s) => (
                <tr key={s.slug}>
                  <th scope="row" className="px-4 py-3 font-semibold text-fg">
                    <span aria-hidden className="mr-1.5">
                      {s.symbol}
                    </span>
                    {s.en}
                  </th>
                  <td className="px-4 py-3" lang="hi">
                    {s.hi}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{s.dates}</td>
                  <td className="px-4 py-3">
                    <LocaleLink href={routes.horoscopeSign("daily", s.slug)} className={link}>
                      {`${s.en} horoscope today`}
                    </LocaleLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 leading-relaxed text-fg lg:grid-cols-2">
        <article className="space-y-3">
          <h3 className="font-display text-xl font-semibold">How to find my zodiac sign (sun sign)</h3>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              Go to the{" "}
              <a href={`#${FINDER_ANCHOR}`} className={link}>
                zodiac sign finder
              </a>{" "}
              at the top of this page.
            </li>
            <li>Enter your date of birth (day, month and year).</li>
            <li>Press &ldquo;Find my sign&rdquo; to see your sun sign, its element, ruling planet and traits.</li>
          </ol>
          <p>
            That is all you need to know your zodiac sign. If your birthday falls on the first or last day of a sign, the exact answer depends on your
            birth year and time, so check it with a{" "}
            <LocaleLink href={routes.kundli} className={link}>
              free kundli
            </LocaleLink>
            .
          </p>
        </article>

        <article className="space-y-3">
          <h3 className="font-display text-xl font-semibold">What is my rashi by date of birth and time?</h3>
          <p>
            In Vedic astrology your <strong>rashi</strong> is your <strong>moon sign</strong>: the sign the Moon was in when you were born. The Moon
            changes sign every two to two-and-a-half days, so your rashi needs your <strong>date, exact time and place of birth</strong>, not just the
            date. That is why your rashi is often different from your sun sign.
          </p>
          <p>
            To find your rashi, enter your birth details in our{" "}
            <LocaleLink href={routes.kundli} className={link}>
              free kundli by date of birth and time
            </LocaleLink>
            . Your moon sign, nakshatra and ascendant (lagna) are shown in the &ldquo;Basic details&rdquo; tab.
          </p>
        </article>

        <article className="space-y-3">
          <h3 className="font-display text-xl font-semibold">How to check my horoscope by date of birth</h3>
          <p>
            First find your zodiac sign from your date of birth with the finder above, then read your sign&apos;s{" "}
            <LocaleLink href={routes.horoscope} className={link}>
              daily, weekly, monthly and yearly horoscope
            </LocaleLink>
            . A sign horoscope is the same for everyone born under that sign.
          </p>
          <p>
            For a personal horoscope made from your own birth chart, generate your{" "}
            <LocaleLink href={routes.kundli} className={link}>
              janam kundli online
            </LocaleLink>{" "}
            or{" "}
            <LocaleLink href={routes.astrologers} className={link}>
              talk to a verified astrologer
            </LocaleLink>{" "}
            who reads your chart for your exact question.
          </p>
        </article>

        <article className="space-y-3">
          <h3 className="font-display text-xl font-semibold">Sun sign, star sign, birth sign: what is the difference?</h3>
          <p>
            <strong>Sun sign</strong>, <strong>star sign</strong>, <strong>birth sign</strong> and <strong>astrology sign</strong> all mean the same
            thing: the zodiac sign found from your date of birth. Your <strong>moon sign (rashi)</strong> and <strong>ascendant (lagna)</strong> are
            different and need your birth time. Vedic astrology gives the most importance to the moon sign, while Western horoscopes use the sun sign.
          </p>
          <p>
            Want to go further? Calculate your{" "}
            <LocaleLink href={routes.numerology} className={link}>
              life path number by date of birth
            </LocaleLink>{" "}
            or check{" "}
            <LocaleLink href={routes.kundliMatching} className={link}>
              kundli matching for marriage
            </LocaleLink>
            .
          </p>
        </article>
      </div>
    </section>
  );
}
