"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

/** Official WhatsApp glyph. */
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.5 2 2 6.48 2 12c0 1.77.47 3.5 1.36 5.02L2 22l5.12-1.34A10.03 10.03 0 0 0 12.04 22C17.57 22 22 17.52 22 12S17.57 2 12.04 2Zm0 18.3c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.04.8.81-2.96-.2-.31A8.26 8.26 0 0 1 3.73 12c0-4.58 3.73-8.3 8.31-8.3 4.58 0 8.3 3.72 8.3 8.3 0 4.58-3.72 8.3-8.3 8.3Z" />
    </svg>
  );
}

/**
 * Floating "Chat with us" WhatsApp button on every browseable page.
 * Round icon on phones (clear of the iPhone home bar), labelled pill from tablet up.
 * Hidden inside live rooms, where it would cover the chat box (the full-screen chat/call
 * screens use a different layout and never show it).
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (!siteConfig.whatsappChatUrl || /\/live\/[^/]+/.test(pathname || "")) return null;

  return (
    <a
      href={siteConfig.whatsappChatUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lg shadow-green-900/25 transition hover:bg-[#1ebe5b] hover:shadow-xl sm:bottom-6 sm:right-6 sm:py-3 sm:pl-3.5 sm:pr-5",
        "motion-safe:hover:-translate-y-0.5"
      )}
    >
      {/* soft attention pulse */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-40 motion-safe:animate-ping motion-safe:[animation-duration:2.4s]" aria-hidden />
      <WhatsAppIcon className="relative size-7 shrink-0 sm:size-6" />
      <span className="relative hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}
