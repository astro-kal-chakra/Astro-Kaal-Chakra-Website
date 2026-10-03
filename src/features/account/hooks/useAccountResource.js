"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Load data for an account screen with loading / error / success states.
 * - `key` changes (e.g. a tab) refetch and show the loading state again.
 * - `reload()` refetches from scratch (used by the error state's retry).
 * - `refresh()` refetches silently, keeping the current data on screen.
 * - `mutate(updater)` updates local data after optimistic writes.
 */
export function useAccountResource(fetcher, key = "") {
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const [nonce, setNonce] = useState(0);
  const reqKey = `${key}#${nonce}`;
  const [state, setState] = useState({ reqKey, status: "loading", data: undefined, error: null });

  // Adjust state during render when the request key changes (no setState in effects).
  if (state.reqKey !== reqKey) setState({ reqKey, status: "loading", data: undefined, error: null });

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((data) => !cancelled && setState({ reqKey, status: "success", data, error: null }))
      .catch((error) => !cancelled && setState({ reqKey, status: "error", data: undefined, error }));
    return () => {
      cancelled = true;
    };
  }, [reqKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const refresh = useCallback(
    () =>
      fetcherRef
        .current()
        .then((data) => setState((s) => ({ ...s, status: "success", data, error: null })))
        .catch(() => {}),
    []
  );

  const mutate = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })),
    []
  );

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    loading: state.status === "loading",
    reload,
    refresh,
    mutate,
  };
}
