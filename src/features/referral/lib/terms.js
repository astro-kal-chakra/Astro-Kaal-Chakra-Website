import { formatCurrency } from "@/lib/utils/format";

/**
 * When the reward is paid, from the dashboard's referral rule (Marketing → Referral rules).
 * @param {{ trigger?: string, minRecharge?: number }} terms
 * @param {{ who?: string, whose?: string }} [subject] { who: "you", whose: "your" } (default) or { who: "your friend", whose: "your friend's" }
 */
export function rewardWhen(terms, locale, { who = "you", whose = "your" } = {}) {
  if (terms?.trigger === "signup") return `as soon as ${who} ${who === "you" ? "sign" : "signs"} up`;
  if (terms?.trigger === "first_session") return `after ${whose} first paid consultation`;
  return terms?.minRecharge > 0 ? `after ${whose} first recharge of ${formatCurrency(terms.minRecharge, locale)} or more` : `after ${whose} first recharge`;
}
