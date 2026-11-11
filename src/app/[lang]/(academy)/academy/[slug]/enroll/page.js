import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { courseBySlug } from "@/features/academy/data";
import { EnrollStep } from "@/features/academy/components/EnrollForm";

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const c = courseBySlug(slug);
  if (!c) return {};
  return buildMetadata({ locale: lang, path: routes.academyEnroll(slug), title: `Enroll – ${c.title}`, noIndex: true });
}

export default async function EnrollPage({ params }) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();
  return (
    <div className="container-page py-8 sm:py-12">
      <EnrollStep course={course} />
    </div>
  );
}
