import { Suspense } from "react";
import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBreadcrumbs } from "@/features/content/components/ContentBreadcrumbs";
import { courseBySlug } from "@/features/academy/data";
import { CoursePlayer } from "@/features/academy/components/CoursePlayer";

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const c = courseBySlug(slug);
  if (!c) return {};
  return buildMetadata({ locale: lang, path: routes.academyCourse(slug), title: `${c.title} – Astrologer Training`, description: `${c.summary} ${c.hours} hours of video lessons, notes, study material and weekly live classes with ${c.trainer.name}.` });
}

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();
  return (
    <div className="container-page py-8">
      <ContentBreadcrumbs label="Breadcrumb" items={[{ name: "Home", href: routes.home }, { name: "Academy", href: routes.academy }, { name: course.title }]} className="mb-5" />
      <Suspense>
        <CoursePlayer course={course} />
      </Suspense>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: routes.home },
            { name: "Academy", path: routes.academy },
            { name: course.title, path: routes.academyCourse(slug) },
          ]),
          { "@context": "https://schema.org", "@type": "Course", name: course.title, description: course.summary, provider: { "@type": "Organization", name: "Astro Kaal Chakra" } },
        ]}
      />
    </div>
  );
}
