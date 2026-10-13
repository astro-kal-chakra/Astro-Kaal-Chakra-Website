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

/**
 * Can `mode` be started right now? `availableModes` comes from the astrologer's live presence (they choose
 * which modes to take when going online, e.g. chat only). Without it (mock data) every offered mode is open.
 */
export const isModeAvailable = (a, mode) => (a.availableModes ? Boolean(a.availableModes[mode]) : true);

/** Offered modes with their price; `available`: can be started right now (online and switched on). */
export function astrologerModes(a) {
  return MODES.filter((m) => m.on(a)).map((m) => ({
    key: m.key,
    label: m.label,
    icon: m.icon,
    price: m.price(a),
    available: a.status === "online" && isModeAvailable(a, m.key),
  }));
}

export const MODE_FILTERS = MODES.map(({ key, label, icon }) => ({ key, label, icon }));
