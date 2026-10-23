import { Archive, Mail, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/Card";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { DeletionRequestForm } from "@/features/content/delete-account/DeletionRequestForm";

const APP = "Kaal-Chakra-Astro";
const COMPANY = "Ritvex Technologies";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: routes.astrologerDeleteAccount,
    title: `Delete Astrologer Account — ${APP}`,
    description: `How astrologers can delete their ${APP} account (by ${COMPANY}) in the app or by request, and what data is deleted or kept.`,
  });
}

const APP_STEPS = [
  `Open the ${APP} app.`,
  "Sign in using your registered phone number.",
  "Open Profile and tap Delete account.",
  "Read what will be deleted and tap Delete account.",
  "Type DELETE to confirm permanent deletion.",
];

const DELETED = [
  "Your account is closed and you are signed out on all devices.",
  "Your public profile is removed from the app and the website.",
  "Your profile photo, email, bio, date of birth, ID / PAN numbers, bank account number and UPI ID are removed.",
  "Push notification tokens for your devices are removed.",
  "Your phone number is released, so it is no longer linked to an active account.",
];

const KEPT = [
  ["Name, past consultation records, earnings, payouts and invoice / tax records (TDS, GST)", "Required by Indian tax and accounting law. Kept for up to 8 years."],
  ["Records needed for fraud prevention, disputes and refunds, including chat / call records of consultations and reviews", "Kept only as long as needed for these purposes, typically up to 3 years."],
  ["A disabled reference to your phone number", "Used only to prevent fraud and misuse of the platform."],
  ["Unpaid earnings", "Put on hold when the account is deleted. Contact support to settle them."],
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

/** Public page for Google Play's "Delete account URL": no login needed. */
export default async function AstrologerDeleteAccountPage() {
  const { support } = await contentService.getSiteConfig();

  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs label="Breadcrumb" items={[{ name: "Home", href: routes.home }, { name: "Delete astrologer account" }]} className="mb-4" />
      <header className="mb-8">
        <p className="text-sm font-medium text-brand-600 dark:text-gold-400">{`${APP} by ${COMPANY}`}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{`${APP} — Delete Astrologer Account`}</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {`Astrologers can permanently delete their accounts through the ${APP} mobile application. If you can't access the app, send us a request using the form below.`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Section icon={Smartphone} title="Delete your account through the app">
            <ol className="list-decimal space-y-2 pl-5">
              {APP_STEPS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="mt-4 text-muted">Once deletion is completed, your astrologer account and associated data are permanently removed from our active database, except the records listed under &ldquo;What we keep, and why&rdquo;.</p>
          </Section>

          <Card className="p-5 sm:p-8">
            <h2 className="text-xl font-semibold">Unable to access your account?</h2>
            <p className="mt-1 mb-5 text-sm text-muted">You can request account deletion without the mobile application. Requests are usually processed within 7 working days.</p>
            <DeletionRequestForm />
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
            </ul>
            <p className="mt-4 text-muted">After these periods, this data is deleted or anonymised.</p>
          </Section>
        </div>

        <aside className="space-y-4">
          <Section icon={ShieldCheck} title="How we verify your request">
            <ul className="list-disc space-y-2 pl-5">
              <li>Our support team contacts you on the registered mobile number or the email you give, to confirm you own the account before anything is deleted.</li>
              <li>An account is never deleted only because a phone number was submitted.</li>
              <li>The registered account also gets an in-app notification about the request, so a request you didn&apos;t make can be stopped.</li>
            </ul>
          </Section>

          {support?.email && (
            <Section icon={Mail} title="Need help?">
              <p>
                Write to{" "}
                <a href={`mailto:${support.email}`} className="text-brand-600 hover:underline dark:text-gold-400">
                  {support.email}
                </a>
                {` about your ${APP} account or unpaid earnings.`}
              </p>
            </Section>
          )}
        </aside>
      </div>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Delete astrologer account", path: routes.astrologerDeleteAccount },
        ])}
      />
    </div>
  );
}
