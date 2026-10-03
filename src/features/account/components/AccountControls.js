"use client";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

/** Accessible on/off switch (role="switch"). */
export function AccountSwitch({ checked, onChange, disabled, label, id, className }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-brand-600 dark:bg-gold-500" : "bg-line",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

/** Horizontal, scrollable filter chips. `options`: [{ value, label, count? }]. */
export function AccountFilterChips({ options, value, onChange, label, className }) {
  return (
    <div role="group" aria-label={label} className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
              active
                ? "border-brand-600 bg-brand-600 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-brand-950"
                : "border-line bg-surface text-muted hover:text-fg"
            )}
          >
            {o.label}
            {o.count > 0 && (
              <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white/20" : "bg-surface-muted text-fg")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Confirmation dialog (bottom sheet on mobile). */
export function AccountConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = "danger",
  loading = false,
  confirmDisabled = false,
  children,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} dismissible={!loading}>
      {description && <p className="text-sm text-muted">{description}</p>}
      {children}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading} disabled={confirmDisabled}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/** Textarea styled like Input. */
export function AccountTextarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-base text-fg placeholder:text-muted/70",
        "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
