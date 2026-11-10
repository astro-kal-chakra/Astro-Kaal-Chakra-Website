import { BookOpen, GraduationCap, NotebookPen, Radio, Star, Users, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ParticleField } from "@/components/ui/ParticleField";
import { COURSES, allLessons } from "@/features/academy/data";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: routes.academy,
    title: "Astrologer Training Academy – Learn Vedic Astrology, KP, Tarot & Numerology",
    description: "Learn astrology from verified astrologers: video lessons, live video classes, notes and study material. Courses in Vedic astrology, KP, tarot and numerology.",
  });
}

const STEPS = [
  { icon: GraduationCap, title: "Enroll & subscribe", text: "Register for a course and pick the plan that suits you." },
  { icon: Video, title: "Watch lessons", text: "Short video lessons, module by module." },
  { icon: NotebookPen, title: "Take notes", text: "Notes per lesson and downloadable study material." },
  { icon: Radio, title: "Join live classes", text: "Weekly live video class with your trainer." },
];

export default function AcademyPage() {
  return (
    <div>
      <section className="bg-aura relative overflow-hidden border-b border-line">
        <ParticleField contained density={0.45} />
        <div className="container-page relative py-12 text-center sm:py-16">
          <p className="eyebrow justify-center motion-safe:animate-[banner-in_0.6s_ease-out]">
            <GraduationCap className="size-3.5" aria-hidden /> Astro Kaal Chakra Academy
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl leading-tight motion-safe:animate-[banner-in_0.7s_ease-out] sm:text-5xl">Learn astrology from verified astrologers</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted motion-safe:animate-[banner-in_0.8s_ease-out]">
            Video lessons, live video classes, notes and study material — from your first chart to consulting clients.
          </p>
        </div>
      </section>

      <div className="container-page space-y-14 py-10">
        <section aria-labelledby="courses">
          <h2 id="courses" className="font-display text-2xl sm:text-3xl">
            Choose your course
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COURSES.map((c, i) => (
              <li key={c.slug} className="motion-safe:animate-[rise_0.55s_cubic-bezier(0.22,1,0.36,1)_backwards]" style={{ animationDelay: `${i * 70}ms` }}>
                <LocaleLink
                  href={routes.academyCourse(c.slug)}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:border-brand-200 hover:shadow-[0_20px_44px_-24px_rgb(194_65_12/0.5)] motion-safe:hover:-translate-y-1"
                >
                  <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${c.tone}`}>
                    <span className="font-display text-6xl text-white/90 transition duration-500 group-hover:scale-110" aria-hidden>
                      {c.glyph}
                    </span>
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-fg">{c.level}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold leading-snug">{c.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{c.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="size-3.5" aria-hidden /> {`${allLessons(c).length} lessons · ${c.hours}h`}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden /> {c.students.toLocaleString("en-IN")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden /> {c.rating}
                      </span>
                    </div>
                    <p className="mt-3 text-xs">{c.trainer.name}</p>
                    <span className="mt-auto pt-4 text-sm font-semibold text-accent">
                      Start training <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </LocaleLink>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how" className="rounded-3xl bg-surface-muted p-6 sm:p-10">
          <h2 id="how" className="text-center font-display text-2xl sm:text-3xl">
            How training works
          </h2>
          <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/30">
                  <Icon className="size-6" aria-hidden />
                </span>
                <p className="mt-3 font-semibold">{`${i + 1}. ${title}`}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-center text-xs text-muted">Demo courses — content, trainers and schedules are for preview.</p>
      </div>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: routes.home }, { name: "Academy", path: routes.academy }])} />
    </div>
  );
}
