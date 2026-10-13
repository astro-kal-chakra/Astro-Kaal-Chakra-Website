"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "@/components/ui/LocaleLink";

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, warning: TriangleAlert, info: Info };
const TONES = {
  success: "border-green-500/30 text-green-700 dark:text-green-400",
  error: "border-red-500/30 text-red-700 dark:text-red-400",
  warning: "border-amber-500/30 text-amber-700 dark:text-amber-400",
  info: "border-brand-500/30 text-brand-600 dark:text-brand-300",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Track ids so the same event from socket + push only shows once.
  const seen = useRef(new Set());

  // Optional per-toast close callbacks, called once when the toast goes away (× / action / timeout / dismiss()).
  const onCloseById = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const onClose = onCloseById.current.get(id);
    onCloseById.current.delete(id);
    onClose?.();
  }, []);

  const toast = useCallback(
    /**
     * `action` (optional): { label, href } — a link button inside the toast; clicking it closes the toast.
     * `duration: 0` keeps the toast until the user closes it. `onClose` (optional) runs when it goes away.
     */
    ({ id = crypto.randomUUID(), type = "info", title, message, action, duration = 4000, onClose }) => {
      if (seen.current.has(id)) return;
      seen.current.add(id);
      if (onClose) onCloseById.current.set(id, onClose);
      setToasts((t) => [...t.slice(-3), { id, type, title, message, action }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  // Stable value: components that only call toast() don't re-render every time a toast shows or hides.
  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-auto sm:top-20 sm:items-end"
      >
        {toasts.map(({ id, type, title, message, action }) => {
          const Icon = ICONS[type];
          return (
            <div
              key={id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-3 shadow-lg",
                TONES[type]
              )}
            >
              <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1 text-fg">
                {title && <p className="text-sm font-semibold">{title}</p>}
                {message && <p className="text-sm text-muted">{message}</p>}
                {action && (
                  <LocaleLink
                    href={action.href}
                    onClick={() => dismiss(id)}
                    className="mt-1.5 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400"
                  >
                    {action.label} →
                  </LocaleLink>
                )}
              </div>
              <button onClick={() => dismiss(id)} className="text-muted hover:text-fg" aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
