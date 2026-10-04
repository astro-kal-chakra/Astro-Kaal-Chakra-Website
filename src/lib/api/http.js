import { env } from "@/config/site";

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

let refreshPromise = null;

/** 401 code when this account signed in on another device (one signed-in device per account). */
export const SIGNED_IN_ELSEWHERE_CODE = "SIGNED_IN_ELSEWHERE";

/** Error code from a response body ({ error: { code } } on the backend, or a flat { code }). */
const errorCode = (body) => body?.error?.code ?? body?.code;

/**
 * Sign this tab out because the account is now used on another device.
 * AuthProvider listens for this (the socket sends the same as `auth:signed_out`).
 */
export function signalSignedInElsewhere() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:signed_out", { detail: { reason: "signed_in_elsewhere" } }));
  }
}

/**
 * Tokens live in httpOnly cookies set by the backend (never in localStorage),
 * so every request is sent with `credentials: "include"`. On a 401 we try one
 * silent refresh, de-duplicated across concurrent requests.
 * Resolves "ok" | "expired" | "elsewhere".
 */
async function refreshSession() {
  refreshPromise ??= fetch(`${env.apiUrl}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (res) => {
      if (res.ok) return "ok";
      const body = await res.json().catch(() => null);
      return errorCode(body) === SIGNED_IN_ELSEWHERE_CODE ? "elsewhere" : "expired";
    })
    .catch(() => "expired")
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

/**
 * @param {string} path  e.g. "/astrologers"
 * @param {object} opts  { method, body, query, headers, next, cache, retry }
 */
export async function http(path, { method = "GET", body, query, headers, retry = true, ...rest } = {}) {
  const url = new URL(`${env.apiUrl}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (res.status === 401 && typeof window !== "undefined") {
    // Signed in on another device: no refresh will help — sign this tab out.
    if (errorCode(data) === SIGNED_IN_ELSEWHERE_CODE) signalSignedInElsewhere();
    else if (retry && path !== "/auth/refresh") {
      const refreshed = await refreshSession();
      if (refreshed === "ok") return http(path, { method, body, query, headers, retry: false, ...rest });
      if (refreshed === "elsewhere") signalSignedInElsewhere();
      else window.dispatchEvent(new CustomEvent("auth:expired"));
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.error?.message || data?.message || res.statusText, { status: res.status, code: errorCode(data), data });
  }
  return data;
}

/** Small helper so mocks feel like a real network call in dev. */
export const mockDelay = (value, ms = 300) => new Promise((r) => setTimeout(() => r(value), ms));
