"use client";

import { useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MESSAGE_MAX_LENGTH } from "../../lib/sessionEvents";

const MAX_HEIGHT = 140;

/**
 * Sticky chat composer. Desktop: Enter sends, Shift+Enter = new line.
 * Touch devices: Enter inserts a new line, the send button sends (keyboard
 * shows a "send" key hint). The textarea grows up to ~5 lines.
 */
export function Composer({ onSend, onTyping, disabled }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  const stopTyping = () => {
    clearTimeout(typingTimer.current);
    if (isTyping.current) {
      isTyping.current = false;
      onTyping?.(false);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value.slice(0, MESSAGE_MAX_LENGTH));
    resize();
    if (!isTyping.current) {
      isTyping.current = true;
      onTyping?.(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2000);
  };

  const submit = (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
    stopTyping();
    requestAnimationFrame(() => {
      resize();
      ref.current?.focus(); // keep the keyboard open on mobile
    });
  };

  const onKeyDown = (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    submit(e);
  };

  const remaining = MESSAGE_MAX_LENGTH - text.length;

  return (
    <form
      onSubmit={submit}
      className="shrink-0 border-t border-line bg-surface px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <label htmlFor="chat-composer" className="sr-only">
          Type your message
        </label>
        <textarea
          id="chat-composer"
          ref={ref}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onBlur={stopTyping}
          disabled={disabled}
          maxLength={MESSAGE_MAX_LENGTH}
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="on"
          spellCheck
          placeholder={disabled ? "This session has ended" : "Type a message…"}
          aria-describedby={remaining < 100 ? "chat-composer-count" : undefined}
          className={cn(
            "max-h-[140px] min-h-11 flex-1 resize-none rounded-3xl border border-line bg-surface-muted px-4 py-2.5 text-base leading-6 text-fg",
            "placeholder:text-muted/80 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
          )}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          // Keep focus in the textarea so the mobile keyboard doesn't close on tap.
          onMouseDown={(e) => e.preventDefault()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40 dark:bg-gold-500 dark:text-brand-950 dark:hover:bg-gold-400"
        >
          <SendHorizontal className="size-5" aria-hidden />
        </button>
      </div>
      {remaining < 100 && (
        <p id="chat-composer-count" className="mx-auto mt-1 max-w-3xl px-4 text-right text-xs text-muted" aria-live="polite">
          {`${remaining} characters left`}
        </p>
      )}
    </form>
  );
}
