import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { liveService } from "@/lib/api/services/live.service";
import { buildMetadata } from "@/lib/seo/metadata";
import { LiveRoom } from "@/features/live/components/LiveRoom";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const session = await liveService.get(id, lang);
  if (!session) return {};
  return buildMetadata({
    locale: lang,
    path: routes.liveRoom(id),
    title: `${session.title} – ${"Live sessions"}`,
    description: session.topic,
    // Live rooms are ephemeral — keep them out of the index.
    noIndex: true,
  });
}

export default async function LiveRoomPage({ params }) {
  const { lang, id } = await params;
  const [session, gifts] = await Promise.all([liveService.get(id, lang), liveService.getGifts()]);
  // Upcoming sessions don't have a room yet.
  if (!session || session.status !== "live") notFound();
  return <LiveRoom session={session} gifts={gifts} />;
}
