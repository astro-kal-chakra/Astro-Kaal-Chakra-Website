import { COURSES } from "@/features/academy/data";

export const dynamicParams = false; // demo catalogue: every course page and enrolment step is built ahead of time

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export default function CourseLayout({ children }) {
  return children;
}
