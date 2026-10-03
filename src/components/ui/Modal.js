"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { cn } from "@/lib/utils/cn";

/**
 * Native <dialog> modal.
 * - Phones: bottom sheet that slides up, respects the iPhone home bar and lifts
 *   above the on-screen keyboard so form fields stay visible while typing.
 * - Tablet / desktop (sm+): centred dialog.
 * Esc and backdrop click close it.
 */
export function Modal({ open, onClose, title, children, className, dismissible = true }) {
  const ref = useRef(null);
  const keyboard = useKeyboardInset();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose?.();
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose?.();
      }}
      style={keyboard ? { bottom: keyboard, maxHeight: `calc(100dvh - ${keyboard}px - 1rem)` } : undefined}
      className={cn(
        // Phone: bottom sheet
        "fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-none max-h-[90dvh] overflow-y-auto overscroll-contain",
        "rounded-t-3xl border-x-0 border-b-0 border-t border-line bg-surface p-0 text-fg shadow-2xl",
        "pb-[env(safe-area-inset-bottom)] open:animate-sheet-up",
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        // Tablet / desktop: centred dialog
        "sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[85dvh] sm:max-w-md sm:rounded-3xl sm:border sm:pb-0 sm:open:animate-dialog-in",
        className
      )}
    >
      {open && (
        <div className="p-5 sm:p-6">
          {/* Drag-handle affordance on phones */}
          <div className="mx-auto -mt-2 mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
          <div className="mb-4 flex items-start justify-between gap-4">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {dismissible && (
              <button onClick={onClose} className="-m-1 ml-auto rounded-full p-1 text-muted hover:bg-surface-muted" aria-label="Close">
                <X className="size-5" />
              </button>
            )}
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
