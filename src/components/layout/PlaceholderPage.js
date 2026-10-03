import { Hammer } from "lucide-react";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/** Temporary page body for routes scheduled in later build phases. */
export async function PlaceholderPage({ lang, title, description }) {
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      <EmptyState
        icon={Hammer}
        title="Coming soon"
        action={<ButtonLink href={routes.astrologers}>Talk to an Astrologer</ButtonLink>}
      />
    </div>
  );
}

/** Factory for a placeholder route: export default + generateMetadata in two lines. */
export function placeholderRoute({ path, title, description }) {
  return {
    async generateMetadata({ params }) {
      const { lang } = await params;
      return buildMetadata({ locale: lang, path, title, description });
    },
    Page: async function Page({ params }) {
      const { lang } = await params;
      return <PlaceholderPage lang={lang} title={title} description={description} />;
    },
  };
}
