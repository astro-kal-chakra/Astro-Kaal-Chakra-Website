import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { courseBySlug } from "@/features/academy/data";
import { SubscribeSuccess } from "@/features/academy/components/SubscribeSuccess";

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const c = courseBySlug(slug);
  if (!c) return {};
  return buildMetadata({ locale: lang, path: routes.academySuccess(slug), title: `Subscription active – ${c.title}`, noIndex: true });
}

export default async function SuccessPage({ params }) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();
  return (
    <div className="container-page py-10 sm:py-16">
      <SubscribeSuccess course={course} />
    </div>
  );
}
