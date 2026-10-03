"use client";

import { useId, useRef } from "react";
import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS } from "@/lib/api/services/support.service";

const MB = MAX_ATTACHMENT_BYTES / (1024 * 1024);
const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Read-only chip for an attachment ({ name, size }). */
export function AttachmentChip({ file, onRemove }) {
  const isImage = /\.(png|jpe?g|gif|webp|heic)$/i.test(file.name) || file.type?.startsWith("image/");
  const Icon = isImage ? ImageIcon : FileText;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-surface-muted py-1 pl-2.5 pr-1.5 text-xs">
      <Icon className="size-3.5 shrink-0 text-muted" aria-hidden />
      <span className="truncate font-medium">{file.name}</span>
      {file.size != null && <span className="shrink-0 text-muted">{formatSize(file.size)}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 text-muted hover:bg-line hover:text-fg"
          aria-label={`Remove ${file.name}`}
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

/**
 * Attachment picker UI (images / PDF). Validates count and size client-side;
 * the upload itself happens in supportService (TODO(api): signed URL upload).
 */
export function AttachmentPicker({ files, onChange, onError, compact = false }) {
  const inputRef = useRef(null);
  const hintId = useId();

  const add = (list) => {
    const next = [...files];
    for (const f of list) {
      if (next.length >= MAX_ATTACHMENTS) {
        onError?.(`You can attach up to ${MAX_ATTACHMENTS} files`);
        break;
      }
      if (f.size > MAX_ATTACHMENT_BYTES) {
        onError?.(`${f.name} is larger than ${MB} MB`);
        continue;
      }
      next.push(f);
    }
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            add(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={files.length >= MAX_ATTACHMENTS}
          aria-describedby={hintId}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-line px-3 text-sm font-medium text-muted hover:border-brand-400 hover:text-fg disabled:opacity-50"
        >
          <Paperclip className="size-4" aria-hidden /> Add file
        </button>
        {files.map((f, i) => (
          <AttachmentChip key={`${f.name}-${i}`} file={f} onRemove={() => onChange(files.filter((_, j) => j !== i))} />
        ))}
      </div>
      <p id={hintId} className={compact ? "sr-only" : "text-xs text-muted"}>
        {`Up to ${MAX_ATTACHMENTS} images or PDFs, max ${MB} MB each`}
      </p>
    </div>
  );
}
