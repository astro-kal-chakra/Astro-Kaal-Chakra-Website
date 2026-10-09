import { AUTH_HINT_COOKIE, env } from "@/config/site";
import { ApiError, http, mockDelay } from "../http";
import { contentService } from "./content.service";

/** Firebase (phone OTP) only when the backend uses it and this site has the Firebase web config. */
async function firebaseMode() {
  const { firebaseConfigured } = await import("@/lib/firebase/phoneAuth");
  if (!firebaseConfigured()) return null;
  const auth = (await contentService.getSiteConfig().catch(() => null))?.auth;
  return auth?.otpProvider === "firebase" ? auth : null;
}

/** Firebase error → ApiError the login form can show (message), keeping our codes where they matter. */
async function firebaseError(err) {
  const { firebaseErrorMessage } = await import("@/lib/firebase/phoneAuth");
  const message = firebaseErrorMessage(err?.code);
  if (!message) return err;
  return new ApiError(message, { code: err.code === "auth/invalid-verification-code" ? "INVALID_OTP" : err.code });
}

/** Dev-only OTP when running on mocks. */
export const MOCK_OTP = "123456";
const MOCK_USER_KEY = "mock_user";

const readMockUser = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USER_KEY));
  } catch {
    return null;
  }
};

export const authService = {
  /** Backend enforces rate limits + bot protection; we surface its errors. */
  async sendOtp(phone) {
    if (env.useMocks) return mockDelay({ requestId: "mock", resendAfter: 30, maxAttempts: 3 });
    const fb = await firebaseMode();
    if (fb) {
      const { sendPhoneCode } = await import("@/lib/firebase/phoneAuth");
      try {
        await sendPhoneCode(phone, { testing: !fb.firebaseProd });
      } catch (err) {
        throw await firebaseError(err);
      }
      return { requestId: "firebase", resendAfter: 30, maxAttempts: 5 };
    }
    return http("/auth/otp/send", { method: "POST", body: { phone, countryCode: "+91" } });
  },

  /** @returns {Promise<{ user, isNewUser, referral?: "applied"|"invalid"|"not_eligible"|"disabled" }>} */
  async verifyOtp({ phone, otp, requestId, referralCode }) {
    if (env.useMocks) {
      await mockDelay(null, 400);
      if (otp !== MOCK_OTP) throw new ApiError("Invalid OTP", { status: 400, code: "INVALID_OTP" });
      const existing = readMockUser();
      const user = existing?.phone === phone ? existing : { id: "u_mock", phone, name: "", profileComplete: false, walletBalance: 300, freeChatAvailable: true };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
      return { user, isNewUser: !user.profileComplete, ...(referralCode ? { referral: user.profileComplete ? "not_eligible" : "applied" } : {}) };
    }
    if (requestId === "firebase") {
      // Firebase checks the code; the backend verifies Firebase's ID token and sets our cookies
      const { confirmPhoneCode, finishPhoneSignIn } = await import("@/lib/firebase/phoneAuth");
      let idToken;
      try {
        idToken = await confirmPhoneCode(phone, otp);
      } catch (err) {
        throw await firebaseError(err);
      }
      const res = await http("/auth/firebase", { method: "POST", body: { idToken, ...(referralCode ? { referralCode } : {}) } });
      await finishPhoneSignIn();
      return res;
    }
    // Backend sets httpOnly access/refresh cookies on success.
    return http("/auth/otp/verify", { method: "POST", body: { phone, otp, requestId, ...(referralCode ? { referralCode } : {}) } });
  },

  async me() {
    if (env.useMocks) return readMockUser();
    // No login hint cookie → a guest: skip the round trip (and the refresh attempt that a 401 triggers)
    if (typeof document !== "undefined" && !document.cookie.split("; ").some((c) => c.startsWith(`${AUTH_HINT_COOKIE}=`))) return null;
    return http("/me").catch((e) => {
      if (e.status === 401) return null;
      throw e;
    });
  },

  async updateProfile(profile) {
    if (env.useMocks) {
      const user = { ...readMockUser(), ...profile, profileComplete: true };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
      return mockDelay(user);
    }
    return http("/me", { method: "PATCH", body: profile });
  },

  /**
   * Forget the session in this browser only — used when the account signed in on
   * another device (the server has already revoked this device's tokens).
   */
  clearLocal() {
    if (env.useMocks) localStorage.removeItem(MOCK_USER_KEY);
  },

  async logout({ allDevices = false } = {}) {
    if (env.useMocks) {
      localStorage.removeItem(MOCK_USER_KEY);
      return null;
    }
    return http(allDevices ? "/auth/logout-all" : "/auth/logout", { method: "POST" });
  },
};
