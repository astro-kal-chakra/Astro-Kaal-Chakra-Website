import { env } from "@/config/site";
import { ApiError, http, mockDelay, mockPage } from "../http";
import { MOCK_ASTROLOGERS } from "../mock/astrologers";
import {
  MOCK_BIRTH_PROFILES,
  MOCK_FOLLOWING_IDS,
  MOCK_PRIVACY,
  MOCK_SAVED_KUNDLIS,
  MOCK_SESSIONS,
  clearMockAccount,
  mockId,
  mockStore,
} from "../mock/account";
import { authService } from "./auth.service";

const profilesStore = mockStore("birthProfiles", MOCK_BIRTH_PROFILES);
const followingStore = mockStore("following", MOCK_FOLLOWING_IDS);
const kundlisStore = mockStore("savedKundlis", MOCK_SAVED_KUNDLIS);
const privacyStore = mockStore("privacy", MOCK_PRIVACY);
const sessionsStore = mockStore("sessions_v2", MOCK_SESSIONS);

/** Everything about the logged-in user: profile, family profiles, saved items, privacy. */
export const userService = {
  /* ------------------------------ Profile ------------------------------ */

  async updateProfile(profile) {
    if (env.useMocks) return authService.updateProfile(profile);
    return http("/me", { method: "PATCH", body: profile });
  },

  /** Dashboard quick stats. */
  async getStats() {
    if (env.useMocks) {
      const sessions = sessionsStore.get();
      return mockDelay({
        totalSessions: sessions.length,
        totalMinutes: Math.round(sessions.reduce((sum, s) => sum + s.durationSec, 0) / 60),
        following: followingStore.get().length,
        birthProfiles: profilesStore.get().length,
      });
    }
    return http("/me/stats");
  },

  /* --------------------------- Birth profiles -------------------------- */

  async listBirthProfiles() {
    if (env.useMocks) return mockDelay(profilesStore.get());
    return http("/me/birth-profiles");
  },

  async saveBirthProfile(profile) {
    if (env.useMocks) {
      const saved = profile.id ? profile : { ...profile, id: mockId("bp"), createdAt: new Date().toISOString() };
      profilesStore.update((list) =>
        profile.id ? list.map((p) => (p.id === profile.id ? { ...p, ...saved } : p)) : [saved, ...list]
      );
      return mockDelay(saved);
    }
    return profile.id
      ? http(`/me/birth-profiles/${profile.id}`, { method: "PATCH", body: profile })
      : http("/me/birth-profiles", { method: "POST", body: profile });
  },

  async deleteBirthProfile(id) {
    if (env.useMocks) {
      profilesStore.update((list) => list.filter((p) => p.id !== id));
      return mockDelay(null);
    }
    return http(`/me/birth-profiles/${id}`, { method: "DELETE" });
  },

  /* ------------------------ Followed astrologers ----------------------- */

  /** One page of followed astrologers (cards): { items, total, page, pageSize, hasMore }. */
  async listFollowing({ page = 1, pageSize = 12 } = {}) {
    if (env.useMocks) {
      const ids = followingStore.get();
      return mockDelay(mockPage(MOCK_ASTROLOGERS.filter((a) => ids.includes(a.id)).map((a) => ({ ...a, isFollowing: true })), page, pageSize));
    }
    return http("/me/following", { query: { page, pageSize } });
  },

  /** Ids of every followed astrologer (for Follow buttons), without loading the cards. */
  async listFollowingIds() {
    if (env.useMocks) return mockDelay(followingStore.get());
    return http("/me/following/ids", { cache: "no-store" });
  },

  async unfollow(astrologerId) {
    if (env.useMocks) {
      followingStore.update((ids) => ids.filter((id) => id !== astrologerId));
      return mockDelay({ following: false });
    }
    return http(`/astrologers/${astrologerId}/follow`, { method: "DELETE" });
  },

  /* ---------------------------- Saved kundlis -------------------------- */

  /** One page of saved kundlis / matchings: { items, total, page, pageSize, hasMore }. */
  async listSavedKundlis({ page = 1, pageSize = 12 } = {}) {
    if (env.useMocks) return mockDelay(mockPage(kundlisStore.get(), page, pageSize));
    return http("/me/kundlis", { query: { page, pageSize } });
  },

  async deleteSavedKundli(id) {
    if (env.useMocks) {
      kundlisStore.update((list) => list.filter((k) => k.id !== id));
      return mockDelay(null);
    }
    return http(`/me/kundlis/${id}`, { method: "DELETE" });
  },

  /* ------------------------------ Privacy ------------------------------ */

  async getPrivacy() {
    if (env.useMocks) return mockDelay(privacyStore.get());
    return http("/me/privacy");
  },

  async updatePrivacy(patch) {
    if (env.useMocks) return mockDelay(privacyStore.update((p) => ({ ...p, ...patch })));
    return http("/me/privacy", { method: "PATCH", body: patch });
  },

  /** DPDP Act: right to access. Backend emails a download link. */
  async requestDataExport() {
    if (env.useMocks) return mockDelay(privacyStore.update((p) => ({ ...p, dataExportRequestedAt: new Date().toISOString() })), 600);
    return http("/me/data-export", { method: "POST" });
  },

  /** DPDP Act: right to erasure. Backend revokes all sessions on success. */
  async deleteAccount({ reason, feedback, confirmation }) {
    if (confirmation !== "DELETE") throw new ApiError("Confirmation required", { status: 400, code: "CONFIRMATION_REQUIRED" });
    if (env.useMocks) {
      await mockDelay(null, 700);
      clearMockAccount();
      return null;
    }
    return http("/me", { method: "DELETE", body: { reason, feedback } });
  },
};
