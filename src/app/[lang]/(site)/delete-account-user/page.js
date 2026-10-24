import { Archive, Clock, Mail, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { DeletionRequestForm } from "@/features/content/delete-account/DeletionRequestForm";

const APP = "Astro-Kaal-Chakra";
const COMPANY = "Ritvex Technologies";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: routes.customerDeleteAccount,
    title: `Delete Your Account — ${APP}`,
    description: `How customers can delete their ${APP} account (by ${COMPANY}) in the app or by request, and what data is deleted or kept.`,
  });
}

const APP_STEPS = [
  `Open the ${APP} Customer App.`,
  "Log in using your registered phone number.",
  "Open Profile or Settings (in the app: Account tab → Settings).",
  "Select Delete Account.",
  "Follow the confirmation steps.",
];

const DELETED = [
  "You are signed out on all devices and can't log in to this account again.",
  "Your name, phone number, email, gender, date / time / place of birth, city / state, profile photo and device details are removed.",
  "Your saved family / birth profiles (and the kundlis saved under them) and the list of astrologers you follow are deleted.",
  "On the records we have to keep, your name is replaced with “Deleted user”.",
  "Your phone number is released, so it is no longer linked to an account.",
];

const KEPT = [
  ["Payment, wallet transaction and tax invoice records (with your name removed)", "Required by Indian tax and accounting law. Kept for up to 8 years."],
  ["Consultation records (chat / call records, reviews) and support tickets", "Needed for refunds, disputes and fraud prevention. Kept only as long as needed, typically up to 3 years."],
];

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
          <Icon className="size-5" aria-hidden />
        </span>
        {title}
      </h2>
      <div className="mt-4 text-sm leading-relaxed">{children}</div>
    </Card>
  );
}

const linkClass = "text-brand-600 hover:underline dark:text-gold-400";

/** Public page for the customer app's Google Play "Delete account URL": no login needed. */
export default async function CustomerDeleteAccountPage() {
  const { support } = await contentService.getSiteConfig();

  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs label="Breadcrumb" items={[{ name: "Home", href: routes.home }, { name: "Delete customer account" }]} className="mb-4" />
      <header className="mb-8">
        <p className="text-sm font-medium text-brand-600 dark:text-gold-400">{`${APP} Customer App by ${COMPANY}`}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{`Delete Your ${APP} Account`}</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {`Customers can delete their ${APP} account directly in the mobile app after logging in. If you can't access the app, send us a request using the form below.`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Section icon={Smartphone} title="Delete your account in the app">
            <ol className="list-decimal space-y-2 pl-5">
              {APP_STEPS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="mt-4 text-muted">
              You can also delete your account on this website: sign in and go to{" "}
              <LocaleLink href={routes.settings} className={linkClass}>
                Account → Settings
              </LocaleLink>{" "}
              → Delete account.
            </p>
          </Section>

          <Card className="p-5 sm:p-8">
            <h2 className="text-xl font-semibold">Can&apos;t access the app?</h2>
            <p className="mt-1 mb-5 text-sm text-muted">Request account deletion without the app. Requests are processed within 7 working days after we verify that you own the account.</p>
            <DeletionRequestForm audience="customer" />
          </Card>

          <Section icon={Trash2} title="What gets deleted">
            <ul className="list-disc space-y-2 pl-5">
              {DELETED.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Section>

          <Section icon={Archive} title="What we keep, and why">
            <ul className="space-y-3">
              {KEPT.map(([what, why]) => (
                <li key={what}>
                  <p className="font-medium">{what}</p>
                  <p className="text-muted">{why}</p>
                </li>
              ))}
              <li>
                <p className="font-medium">Wallet balance</p>
                <p className="text-muted">
                  Any remaining wallet balance or bonus credit is forfeited when the account is deleted. If you believe you are due a refund under our{" "}
                  <LocaleLink href={routes.legal("refund-policy")} className={linkClass}>
                    Refund &amp; Cancellation policy
                  </LocaleLink>
                  , contact support before deleting your account.
                </p>
              </li>
            </ul>
            <p className="mt-4 text-muted">After these periods, this data is deleted or anonymised.</p>
          </Section>
        </div>

        <aside className="space-y-4">
          <Section icon={ShieldCheck} title="How we verify your request">
            <ul className="list-disc space-y-2 pl-5">
              <li>Our support team contacts you on the registered mobile number (or the email you give) to confirm you own the account before anything is deleted.</li>
              <li>An account is never deleted only because a phone number was submitted.</li>
              <li>The registered account also gets an in-app notification about the request, so a request you didn&apos;t make can be stopped.</li>
            </ul>
          </Section>

          <Section icon={Clock} title="How long it takes">
            <ul className="list-disc space-y-2 pl-5">
              <li>Deleting in the app or on the website takes effect at once: you are signed out right away and your personal details are removed within minutes.</li>
              <li>Requests sent with this form are processed within 7 working days after ownership is verified.</li>
              <li>Records we must keep (listed above) are kept for the periods shown, then deleted or anonymised.</li>
            </ul>
          </Section>

          {support?.email && (
            <Section icon={Mail} title="Need help?">
              <p>
                Write to{" "}
                <a href={`mailto:${support.email}`} className={linkClass}>
                  {support.email}
                </a>
                {` about your ${APP} account, wallet or refunds.`}
              </p>
            </Section>
          )}
        </aside>
      </div>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Delete customer account", path: routes.customerDeleteAccount },
        ])}
      />
    </div>
  );
}
