"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowDown, Check, CheckCheck, Clock } from "lucide-react";
import { localeTags } from "@/config/locale";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const timeFormat = (locale) =>
  new Intl.DateTimeFormat(localeTags[locale] || "en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

function Ticks({ status }) {
  const label = t(`session.chat.status.${status}`);
  if (status === "sending") return <Clock className="size-3.5" aria-label={label} />;
  if (status === "sent") return <Check className="size-3.5" aria-label={label} />;
  if (status === "delivered") return <CheckCheck className="size-3.5" aria-label={label} />;
  if (status === "read") return <CheckCheck className="size-3.5 text-sky-300" aria-label={label} />;
  return null;
}

function SystemMessage({ message }) {
  const locale = SITE_LOCALE;
  const params = { ...message.params };
  if (params.rate != null) params.rate = formatCurrency(params.rate, locale);
  return (
    <li className="flex justify-center px-4">
      <p className="max-w-xs rounded-full bg-surface-muted px-3 py-1 text-center text-xs text-muted">
        {t(`session.chat.system.${message.code}`, params)}
      </p>
    </li>
  );
}

function Bubble({ message, astrologer, showAvatar, onRetry, fmt }) {
  const mine = message.from === "user";
  const failed = message.status === "failed";
  return (
    <li className={cn("flex items-end gap-2 px-3", mine ? "justify-end" : "justify-start")}>
      {!mine && (
        <span className="w-7 shrink-0">{showAvatar && <Avatar src={astrologer.avatarUrl} name={astrologer.name} size={28} />}</span>
      )}
      <div className={cn("flex max-w-[80%] flex-col sm:max-w-[65%]", mine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-snug shadow-sm",
            mine
              ? "rounded-br-md bg-brand-600 text-white dark:bg-brand-700"
              : "rounded-bl-md border border-line bg-surface text-fg",
            failed && "opacity-70"
          )}
        >
          <span className="sr-only">{mine ? "You" : astrologer.name}: </span>
          {message.text}
          <span
            className={cn(
              "ml-2 inline-flex translate-y-0.5 items-center gap-0.5 align-bottom text-[11px]",
              mine ? "text-white/70" : "text-muted"
            )}
          >
            <time dateTime={new Date(message.createdAt).toISOString()}>{fmt.format(message.createdAt)}</time>
            {mine && <Ticks status={message.status} />}
          </span>
        </div>
        {failed && (
          <button
            type="button"
            onClick={() => onRetry(message)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
          >
            <AlertCircle className="size-3.5" aria-hidden />
            Not sent. Tap to retry
          </button>
        )}
      </div>
    </li>
  );
}

export function TypingIndicator({ astrologer }) {
  return (
    <li className="flex items-end gap-2 px-3" aria-label={`${astrologer.name} is typing`}>
      <span className="w-7 shrink-0">
        <Avatar src={astrologer.avatarUrl} name={astrologer.name} size={28} />
      </span>
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3" aria-hidden>
        {[0, 150, 300].map((d) => (
          <span key={d} className="size-2 animate-bounce rounded-full bg-muted motion-reduce:animate-none" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </li>
  );
}

/**
 * Scrollable message log. Sticks to the bottom while the user is at the
 * bottom; otherwise shows a "new messages" pill instead of yanking the view.
 */
export function MessageList({ messages, astrologer, typing, onRetry, header }) {
  const locale = SITE_LOCALE;
  const ref = useRef(null);
  const atBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const fmt = timeFormat(locale);
  const last = messages[messages.length - 1];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Always follow your own messages; follow others only when already at the bottom.
    if (atBottom.current || last?.from === "user") {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      requestAnimationFrame(() => setShowJump(true));
    }
  }, [messages.length, last?.from, typing]);

  const onScroll = () => {
    const el = ref.current;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottom.current = near;
    if (near && showJump) setShowJump(false);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={ref} onScroll={onScroll} className="h-full overflow-y-auto overscroll-contain py-4">
        {header}
        <ol role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation" className="space-y-1.5">
          {messages.map((m, i) =>
            m.from === "system" ? (
              <SystemMessage key={m.id} message={m} />
            ) : (
              <Bubble
                key={m.clientId || m.id}
                message={m}
                astrologer={astrologer}
                showAvatar={messages[i + 1]?.from !== m.from}
                onRetry={onRetry}
                fmt={fmt}
              />
            )
          )}
          {typing && <TypingIndicator astrologer={astrologer} />}
        </ol>
      </div>
      {showJump && (
        <button
          type="button"
          onClick={() => {
            ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
            setShowJump(false);
          }}
          className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
        >
          <ArrowDown className="size-3.5" aria-hidden />
          New messages
        </button>
      )}
    </div>
  );
}
