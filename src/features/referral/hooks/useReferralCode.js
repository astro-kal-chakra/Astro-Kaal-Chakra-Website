"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { referralService } from "@/lib/api/services/referral.service";
import { getPendingReferral, isReferralCodeShape, normalizeReferralCode, subscribePendingReferral } from "../lib/pending";

/**
 * Referral code typed on (or carried into) the login form, checked against the backend as the user types.
 * status: idle (empty) | checking | valid | invalid | disabled | error
 */
export function useReferralCode() {
  // A code from a friend's share link (localStorage; empty during SSR): prefills the field and shows it
  const pending = useSyncExternalStore(subscribePendingReferral, getPendingReferral, () => "");
  const [edited, setEdited] = useState(null);
  const [opened, setOpen] = useState(false);
  const [result, setResult] = useState({ code: "", status: "idle" });
  const code = edited ?? pending;
  const open = opened || Boolean(pending);

  const normalized = normalizeReferralCode(code);
  const shapeOk = isReferralCodeShape(normalized);

  useEffect(() => {
    if (!shapeOk) return;
    let cancelled = false;
    const t = setTimeout(() => {
      referralService
        .check(normalized)
        .then((r) => !cancelled && setResult({ code: normalized, status: r.valid ? "valid" : r.reason === "disabled" ? "disabled" : "invalid", terms: r }))
        .catch(() => !cancelled && setResult({ code: normalized, status: "error" }));
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [normalized, shapeOk]);

  let status;
  if (!normalized) status = "idle";
  else if (!shapeOk) status = normalized.length >= 4 ? "invalid" : "typing";
  else status = result.code === normalized ? result.status : "checking";

  return {
    code,
    setCode: (v) => setEdited(v.toUpperCase().replace(/[^A-Z0-9-\s]/g, "").slice(0, 24)),
    open,
    setOpen,
    status,
    terms: result.code === normalized ? result.terms : null,
    /** What to send with the OTP: only a code the backend accepted (a network error still sends it; the server decides). */
    codeToSend: status === "valid" || status === "error" ? normalized : undefined,
    /** Blocks "Send OTP" while a typed code is unchecked or wrong. */
    blocking: status === "checking" || status === "typing" || status === "invalid",
  };
}
