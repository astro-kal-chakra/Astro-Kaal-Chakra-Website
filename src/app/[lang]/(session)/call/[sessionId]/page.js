import { CallScreen } from "@/features/session/components/call/CallScreen";

export async function generateMetadata({ params, searchParams }) {
  const [{ lang }, sp] = await Promise.all([params, searchParams]);
  return { title: (sp.mode === "voice" ? "Voice call" : "Video call") };
}

export default async function CallPage({ params, searchParams }) {
  const [{ sessionId }, sp] = await Promise.all([params, searchParams]);
  return <CallScreen key={sessionId} sessionId={sessionId} voiceOnly={sp.mode === "voice"} />;
}
