import { ChatScreen } from "@/features/session/components/chat/ChatScreen";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "Live chat" };
}

export default async function ChatPage({ params }) {
  const { sessionId } = await params;
  return <ChatScreen key={sessionId} sessionId={sessionId} />;
}
