/**
 * Mock notifications. The real API localises title/body server-side
 * (from the `lang` query), so the mock keeps both languages.
 */
import { daysAgo } from "./account";
import { MOCK_PACKS } from "../services/wallet.service";

// Promo copy comes from the mock recharge packs so it never disagrees with the wallet page.
const packFor = (amount) => MOCK_PACKS.find((p) => p.amount === amount) || { amount, credit: amount };
const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;
const PAID = packFor(500);
const OFFER = packFor(1000);
const offerPct = Math.round(((OFFER.credit - OFFER.amount) / OFFER.amount) * 100);

const SEED = [
  {
    id: "nt_1",
    type: "queue_turn",
    hoursAgo: 0.1,
    read: false,
    href: "/consult?astrologer=dr-ananya-rao&mode=chat",
    en: ["It's your turn!", "Dr. Ananya Rao is ready for your chat. Accept within 60 seconds to keep your spot."],
    hi: ["आपकी बारी आ गई!", "डॉ. अनन्या राव आपकी चैट के लिए तैयार हैं। अपनी जगह बनाए रखने के लिए 60 सेकंड में स्वीकार करें।"],
  },
  {
    id: "nt_2",
    type: "follow_online",
    hoursAgo: 1,
    read: false,
    href: "/astrologers/acharya-vikram-shastri",
    en: ["Acharya Vikram Shastri is online", "An astrologer you follow is available now."],
    hi: ["आचार्य विक्रम शास्त्री ऑनलाइन हैं", "आप जिन ज्योतिषी को फ़ॉलो करते हैं, वे अभी उपलब्ध हैं।"],
  },
  {
    id: "nt_3",
    type: "payment_success",
    hoursAgo: 5,
    read: false,
    href: "/wallet/transactions",
    en: ["Payment successful", `${rupees(PAID.amount)} added to your wallet. You received ${rupees(PAID.credit - PAID.amount)} extra as bonus.`],
    hi: ["भुगतान सफल", `आपके वॉलेट में ${rupees(PAID.amount)} जोड़े गए। आपको ${rupees(PAID.credit - PAID.amount)} का अतिरिक्त बोनस मिला।`],
  },
  {
    id: "nt_4",
    type: "daily_horoscope",
    hoursAgo: 9,
    read: true,
    href: "/horoscope",
    en: ["Your horoscope for today", "Good day for career moves. Lucky colour: yellow."],
    hi: ["आज का आपका राशिफल", "करियर के लिए अच्छा दिन। शुभ रंग: पीला।"],
  },
  {
    id: "nt_5",
    type: "offer",
    hoursAgo: 26,
    read: true,
    href: "/wallet",
    en: [`Recharge offer: ${offerPct}% extra`, `Recharge ${rupees(OFFER.amount)} and get ${rupees(OFFER.credit)} in your wallet (+${offerPct}% bonus credit).`],
    hi: [`रिचार्ज ऑफ़र: ${offerPct}% अतिरिक्त`, `${rupees(OFFER.amount)} का रिचार्ज करें और वॉलेट में ${rupees(OFFER.credit)} पाएं (+${offerPct}% बोनस)।`],
  },
  {
    id: "nt_6",
    type: "follow_online",
    hoursAgo: 50,
    read: true,
    href: "/astrologers/tarot-meera",
    en: ["Tarot Meera is online", "An astrologer you follow is available now."],
    hi: ["टैरो मीरा ऑनलाइन हैं", "आप जिन ज्योतिषी को फ़ॉलो करते हैं, वे अभी उपलब्ध हैं।"],
  },
  {
    id: "nt_7",
    type: "daily_horoscope",
    hoursAgo: 33,
    read: true,
    href: "/horoscope",
    en: ["Your horoscope for today", "Avoid big financial decisions today. Lucky number: 7."],
    hi: ["आज का आपका राशिफल", "आज बड़े वित्तीय निर्णयों से बचें। शुभ अंक: 7।"],
  },
];

export const MOCK_NOTIFICATIONS = () =>
  SEED.map(({ hoursAgo, ...n }) => ({ ...n, createdAt: daysAgo(0, hoursAgo) }));

export const MOCK_NOTIFICATION_PREFS = () => ({
  sessions: { push: true, sms: true, email: false },
  follows: { push: true, sms: false, email: false },
  payments: { push: true, sms: true, email: true },
  offers: { push: false, sms: false, email: false },
  horoscope: { push: true, sms: false, email: false },
});
