import { env } from "@/config/site";
import { http, mockDelay } from "../http";
import { MOCK_REFERRAL } from "../mock/account";

export const referralService = {
  /** @returns {Promise<{ code: string, rewardPerReferral: number, friendReward: number, rewards: object[] }>} */
  async get() {
    if (env.useMocks) return mockDelay(MOCK_REFERRAL());
    return http("/me/referral");
  },
};
