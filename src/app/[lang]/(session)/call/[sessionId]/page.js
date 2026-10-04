import { CallScreen } from "@/features/session/components/call/CallScreen";

export async function generateMetadata({ params, searchParams }) {
  const [{ lang }, sp] = await Promise.all([params, searchParams]);
  // ?mode=call is a voice-only call (backend mode "call"); video calls have no mode param.
  return { title: sp.mode === "call" ? "Voice call" : "Video call" };
}

export default async function CallPage({ params, searchParams }) {
  const [{ sessionId }, sp] = await Promise.all([params, searchParams]);
  return <CallScreen key={sessionId} sessionId={sessionId} voiceOnly={sp.mode === "call"} />;
}
