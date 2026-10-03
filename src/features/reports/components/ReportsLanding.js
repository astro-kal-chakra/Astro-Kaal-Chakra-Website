import { CreditCard, FileDown, UserRound } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReportCard } from "./ReportCard";

export const REPORT_FAQ_KEYS = [1, 2, 3, 4];

export const reportFaqs = (t) => REPORT_FAQ_KEYS.map((n) => ({ q: t(`wallet.reports.faq.q${n}`), a: t(`wallet.reports.faq.a${n}`) }));

/** Server component: public /reports landing (SEO). */
export function ReportsLanding({ reports, t, locale }) {
  const steps = [
    { icon: UserRound, title: "Choose a birth profile", text: "Pick a saved birth profile (or two, for matching) with date, time and place of birth." },
    { icon: CreditCard, title: "Pay from your wallet", text: "The price is deducted from your wallet balance. Recharge in seconds if you're short." },
    { icon: FileDown, title: "Download your PDF", text: "Your report is generated within hours and saved in My Reports forever." },
  ];

  return (
    <>
      <section className="bg-cosmic text-white">
        <div className="container-page py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/90">Personalised reports</p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-5xl">
            <span className="text-gradient-gold">Detailed astrology reports, written for you</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/95">In-depth PDF reports prepared from your exact birth chart by expert Vedic astrologers. Pay from your wallet and download anytime.</p>
        </div>
      </section>

      <div className="container-page space-y-16 py-10 sm:py-14">
        <section aria-label="Available reports">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {reports.map((r) => (
              <ReportCard key={r.slug} report={r} t={t} locale={locale} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="How it works" />
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-display text-sm text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-3xl">
          <SectionHeading title="Frequently asked questions" />
          <Accordion items={reportFaqs(t)} />
        </section>
      </div>
    </>
  );
}
