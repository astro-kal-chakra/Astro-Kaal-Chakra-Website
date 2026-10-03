import { env } from "@/config/site";
import { ConsultView } from "@/features/session/components/consult/ConsultView";
import { normalizeMode } from "@/features/session/lib/modes";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "Start a consultation" };
}

export default async function ConsultPage({ searchParams }) {
  const sp = await searchParams;
  const slug = typeof sp.astrologer === "string" ? sp.astrologer : "";
  return (
    <ConsultView
      key={slug}
      slug={slug}
      initialMode={normalizeMode(sp.mode)}
      waitlist={sp.waitlist === "1"}
      // Mock-only QA hook: ?simulate=accept|reject|timeout
      simulate={env.useMocks && typeof sp.simulate === "string" ? sp.simulate : undefined}
    />
  );
}
