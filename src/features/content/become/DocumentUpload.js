"use client";

import { useId, useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const MAX_DOC_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "application/pdf"];

const formatSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/**
 * File picker with client-side preview. Nothing is uploaded — the parent keeps
 * the File in state and is responsible for revoking preview URLs on unmount
 * (previews must survive step changes). TODO(api): upload via pre-signed URL on submit.
 * @param {{ label: string, value: {file: File, url: string|null}|null, onChange: (v)=>void, onError: (msg:string)=>void, error?: string, required?: boolean }} props
 */
export function DocumentUpload({ label, value, onChange, onError, error, required = false }) {
  const inputId = useId();
  const inputRef = useRef(null);

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return onError("Only JPG, PNG or PDF files are allowed");
    if (file.size > MAX_DOC_BYTES) return onError("File is larger than 5 MB");
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange({ file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
  };

  const remove = () => {
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange(null);
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT.join(",")}
        onChange={pick}
        className="sr-only"
        aria-invalid={Boolean(error)}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
          {value.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimisable
            <img src={value.url} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <FileText className="size-7" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.file.name}</p>
            <p className="text-xs text-muted">{formatSize(value.file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-surface-muted dark:text-gold-400"
          >
            Replace
          </button>
          <button type="button" onClick={remove} className="rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-fg" aria-label="Remove">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors hover:bg-surface-muted",
            error ? "border-red-500/60" : "border-line"
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
            <Upload className="size-5" aria-hidden />
          </span>
          <span className="text-sm font-semibold">Choose file</span>
          <span className="text-xs text-muted">JPG, PNG or PDF, up to 5 MB</span>
        </button>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
