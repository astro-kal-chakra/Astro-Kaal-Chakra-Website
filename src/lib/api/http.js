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

/**
 * Tokens live in httpOnly cookies set by the backend (never in localStorage),
 * so every request is sent with `credentials: "include"`. On a 401 we try one
 * silent refresh, de-duplicated across concurrent requests.
 */
async function refreshSession() {
  refreshPromise ??= fetch(`${env.apiUrl}/auth/refresh`, { method: "POST", credentials: "include" })
    .then((res) => res.ok)
    .catch(() => false)
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

  if (res.status === 401 && retry && typeof window !== "undefined" && path !== "/auth/refresh") {
    if (await refreshSession()) return http(path, { method, body, query, headers, retry: false, ...rest });
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message || res.statusText, { status: res.status, code: data?.code, data });
  }
  return data;
}

/** Small helper so mocks feel like a real network call in dev. */
export const mockDelay = (value, ms = 300) => new Promise((r) => setTimeout(() => r(value), ms));
