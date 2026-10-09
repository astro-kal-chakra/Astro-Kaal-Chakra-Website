"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A paged list for account screens: the first page on load, `loadMore()` appends the next one.
 * `fetchPage(page)` resolves { items, total, hasMore }. Same states as useAccountResource:
 * - `key` changes (e.g. a tab) start over from page 1 with the loading state.
 * - `reload()` starts over (error retry); `refresh()` re-reads page 1 silently, keeping the screen.
 * - `mutate(updater)` edits the loaded items after optimistic writes.
 * - `meta` is the rest of the latest first-page answer (e.g. unreadCount); `mutateMeta` edits it.
 */
export function usePagedResource(fetchPage, key = "") {
  const fetcherRef = useRef(fetchPage);
  useEffect(() => {
    fetcherRef.current = fetchPage;
  });

  const [nonce, setNonce] = useState(0);
  const reqKey = `${key}#${nonce}`;
  const empty = { reqKey, status: "loading", items: [], total: 0, page: 0, hasMore: false, more: "idle", error: null, meta: {} };
  const metaOf = ({ items, ...rest }) => rest;
  const [state, setState] = useState(empty);

  // Adjust state during render when the request key changes (no setState in effects).
  if (state.reqKey !== reqKey) setState(empty);

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current(1)
      .then((r) => !cancelled && setState({ ...empty, status: "success", items: r.items, total: r.total ?? r.items.length, page: 1, hasMore: Boolean(r.hasMore), meta: metaOf(r) }))
      .catch((error) => !cancelled && setState({ ...empty, status: "error", error }));
    return () => {
      cancelled = true;
    };
    // `empty` is rebuilt every render from reqKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqKey]);

  // Latest state for event handlers (loadMore reads it, never inside a setState updater)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const busy = useRef(false);

  const loadMore = useCallback(() => {
    const s = stateRef.current;
    if (busy.current || s.status !== "success" || !s.hasMore) return;
    busy.current = true;
    const { reqKey: k } = s;
    const page = s.page + 1;
    setState((cur) => (cur.reqKey === k ? { ...cur, more: "loading" } : cur));
    fetcherRef
      .current(page)
      .then((r) =>
        setState((cur) => {
          if (cur.reqKey !== k) return cur;
          // Rows can shift onto the next page when new ones arrive at the top: keep each id once
          const seen = new Set(cur.items.map((x) => x.id));
          return { ...cur, items: [...cur.items, ...r.items.filter((x) => !seen.has(x.id))], total: r.total ?? cur.total, page, hasMore: Boolean(r.hasMore), more: "idle" };
        })
      )
      .catch(() => setState((cur) => (cur.reqKey === k ? { ...cur, more: "error" } : cur)))
      .finally(() => {
        busy.current = false;
      });
  }, []);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const refresh = useCallback(
    () =>
      fetcherRef
        .current(1)
        .then((r) =>
          setState((s) => {
            // Fresh first page; rows already loaded from later pages stay below it
            const ids = new Set(r.items.map((x) => x.id));
            const tail = s.page > 1 ? s.items.filter((x) => !ids.has(x.id)) : [];
            return { ...s, status: "success", items: [...r.items, ...tail], total: r.total ?? r.items.length, page: Math.max(1, s.page), hasMore: s.page > 1 ? s.hasMore : Boolean(r.hasMore), error: null, meta: metaOf(r) };
          })
        )
        .catch(() => {}),
    []
  );

  const mutate = useCallback((updater) => setState((s) => ({ ...s, items: typeof updater === "function" ? updater(s.items) : updater })), []);
  const mutateMeta = useCallback((updater) => setState((s) => ({ ...s, meta: typeof updater === "function" ? updater(s.meta) : updater })), []);

  return {
    items: state.items,
    total: state.total,
    hasMore: state.hasMore,
    status: state.status,
    error: state.error,
    loading: state.status === "loading",
    /** "idle" | "loading" | "error" for the next page */
    more: state.more,
    loadMore,
    reload,
    refresh,
    mutate,
    meta: state.meta,
    mutateMeta,
  };
}
