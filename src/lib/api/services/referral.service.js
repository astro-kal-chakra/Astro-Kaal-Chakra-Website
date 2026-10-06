import { env } from "@/config/site";
import { http, mockDelay } from "../http";
import { MOCK_REFERRAL } from "../mock/account";

export const referralService = {
  /** @returns {Promise<{ code: string, rewardPerReferral: number, friendReward: number, trigger: string, minRecharge: number, rewards: object[] }>} */
  async get() {
    if (env.useMocks) return mockDelay(MOCK_REFERRAL());
    return http("/me/referral");
  },

  /**
   * Public check of a friend's code before login. Never says whose code it is.
   * @returns {Promise<{ valid: boolean, code?: string, reason?: "invalid"|"disabled", refereeReward?: number, trigger?: string, minRecharge?: number }>}
   */
  async check(code) {
    if (env.useMocks) {
      const valid = code === MOCK_REFERRAL().code;
      return mockDelay(valid ? { valid, code, refereeReward: 30, referrerReward: 50, trigger: "first_recharge", minRecharge: 100 } : { valid, reason: "invalid" }, 300);
    }
    return http(`/referral/${encodeURIComponent(code)}`);
  },
};
