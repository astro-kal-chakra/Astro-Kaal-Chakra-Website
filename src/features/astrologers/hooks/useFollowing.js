"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { userService } from "@/lib/api/services/user.service";

/**
 * Which astrologers the signed-in user follows, shared by every Follow button on the page.
 * Pages are server-rendered for everyone (no user), so "Following" is decided here in the browser.
 */
let state = { userId: null, ids: null }; // ids: Set once loaded
let loading = null;
const listeners = new Set();
const emit = () => listeners.forEach((cb) => cb());
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const snapshot = () => state;
// Must return the same object every call, or React loops re-rendering during hydration.
const EMPTY = { userId: null, ids: null };
const serverSnapshot = () => EMPTY;

function load(userId) {
  if (loading && state.userId === userId) return;
  state = { userId, ids: null };
  // Just the ids (one light request), not the followed astrologers' cards
  loading = userService
    .listFollowingIds()
    .then((ids) => {
      if (state.userId === userId) state = { userId, ids: new Set(ids.map(String)) };
    })
    .catch(() => {})
    .finally(() => {
      loading = null;
      emit();
    });
}

/** After a follow / unfollow anywhere: every button for that astrologer updates. */
export function setFollowing(astrologerId, on) {
  if (!state.ids) return;
  const ids = new Set(state.ids);
  if (on) ids.add(astrologerId);
  else ids.delete(astrologerId);
  state = { ...state, ids };
  emit();
}

/**
 * @param {{ id: string, isFollowing?: boolean }} astrologer
 * @returns {boolean} whether the signed-in user follows this astrologer
 */
export function useIsFollowing(astrologer) {
  const { user, isAuthenticated } = useAuth();
  const s = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => {
    if (isAuthenticated && user?.id && state.userId !== user.id) load(user.id);
    if (!isAuthenticated && state.userId) {
      state = { userId: null, ids: null };
      emit();
    }
  }, [isAuthenticated, user?.id]);
  if (!isAuthenticated) return false;
  return s.ids && s.userId === user?.id ? s.ids.has(astrologer.id) : Boolean(astrologer.isFollowing);
}
