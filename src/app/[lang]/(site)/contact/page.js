import { Clock, HelpCircle, Mail, ShieldAlert, Ticket } from "lucide-react";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { ContactForm } from "@/features/content/contact/ContactForm";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.contact, title: "Contact Us & Support", description: "Get help with consultations, payments, refunds or your account. Send us a message or raise a support ticket." });
}

export default async function ContactPage({ params, searchParams }) {
  const { lang } = await params;
  const { topic } = await searchParams;
  const { support } = await contentService.getSiteConfig(); // contacts set in the dashboard

  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs
        label="Breadcrumb"
        items={[{ name: "Home", href: routes.home }, { name: "Contact us" }]}
        className="mb-4"
      />
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Contact us &amp; support</h1>
        <p className="mt-2 max-w-2xl text-muted">{"We're here to help. Send us a message and we'll get back to you soon."}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5 sm:p-8">
          <h2 className="mb-5 text-xl font-semibold">Send us a message</h2>
          <ContactForm defaultTopic={typeof topic === "string" ? topic : ""} />
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold">Other ways to get help</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${support.email}`} className="text-brand-600 hover:underline dark:text-gold-400">
                    {support.email}
                  </a>
                  {support.phone && <p className="text-muted">{`Phone / WhatsApp: ${support.whatsapp || support.phone}`}</p>}
                  <p className="text-muted">Write to us anytime</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
                  <Clock className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">Support hours</p>
                  <p className="text-muted">Every day, 8 AM – 11 PM IST</p>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <Ticket className="size-7 text-gold-500" aria-hidden />
            <h2 className="mt-3 font-semibold">Have an issue with a session or payment?</h2>
            <p className="mt-1 text-sm text-muted">Raise a support ticket from your account so we can see the session details and resolve it faster.</p>
            <ButtonLink href={routes.support} size="sm" className="mt-4">
              My support tickets
            </ButtonLink>
          </Card>

          <Card className="p-5">
            <HelpCircle className="size-7 text-gold-500" aria-hidden />
            <h2 className="mt-3 font-semibold">Looking for a quick answer?</h2>
            <p className="mt-1 text-sm text-muted">Most questions about payments, refunds and consultations are answered in our FAQs.</p>
            <ButtonLink href={routes.faqs} variant="outline" size="sm" className="mt-4">
              Read FAQs
            </ButtonLink>
          </Card>

          <p className="flex gap-2 rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <ShieldAlert className="size-5 shrink-0" aria-hidden /> We will never ask for your OTP, UPI PIN or card details.
          </p>
        </aside>
      </div>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact us", path: `${routes.contact}` },
        ])}
      />
    </div>
  );
}
