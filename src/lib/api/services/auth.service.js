import { env } from "@/config/site";
import { ApiError, http, mockDelay } from "../http";

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
    return http("/auth/otp/send", { method: "POST", body: { phone, countryCode: "+91" } });
  },

  async verifyOtp({ phone, otp, requestId }) {
    if (env.useMocks) {
      await mockDelay(null, 400);
      if (otp !== MOCK_OTP) throw new ApiError("Invalid OTP", { status: 400, code: "INVALID_OTP" });
      const existing = readMockUser();
      const user = existing?.phone === phone ? existing : { id: "u_mock", phone, name: "", profileComplete: false, walletBalance: 300, freeChatAvailable: true };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
      return { user, isNewUser: !user.profileComplete };
    }
    // Backend sets httpOnly access/refresh cookies on success.
    return http("/auth/otp/verify", { method: "POST", body: { phone, otp, requestId } });
  },

  async me() {
    if (env.useMocks) return readMockUser();
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
