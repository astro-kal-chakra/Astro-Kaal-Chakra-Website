import { MessageCircle, Phone, Video } from "lucide-react";

/**
 * Consultation modes an astrologer offers, with their per-minute price (rupees).
 * Mode keys match the backend: chat | call (voice) | video.
 */
const MODES = [
  { key: "chat", label: "Chat", icon: MessageCircle, price: (a) => a.chatPrice, on: () => true },
  { key: "call", label: "Call", icon: Phone, price: (a) => a.callPrice ?? a.voicePrice ?? a.chatPrice, on: (a) => a.supportsCall ?? true },
  { key: "video", label: "Video", icon: Video, price: (a) => a.videoPrice, on: (a) => Boolean(a.supportsVideo) },
];

export function astrologerModes(a) {
  return MODES.filter((m) => m.on(a)).map((m) => ({ key: m.key, label: m.label, icon: m.icon, price: m.price(a) }));
}

export const MODE_FILTERS = MODES.map(({ key, label, icon }) => ({ key, label, icon }));
