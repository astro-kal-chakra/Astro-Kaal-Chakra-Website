/** Deterministic placeholder horoscope text until the content API is wired up. */
const TEXT = {
  en: {
    general: [
      "The planets favour steady progress today. Focus on one goal and avoid spreading your energy too thin.",
      "A conversation you have been postponing will go better than expected. Speak honestly and listen fully.",
      "Unexpected news may shift your plans. Stay flexible — the change works in your favour.",
      "This is a good time to finish pending work and clear space for something new.",
    ],
    love: ["Warmth returns to close relationships.", "Single? Someone from your circle notices you.", "Small gestures matter more than big promises now."],
    career: ["Your effort gets noticed by seniors.", "Avoid office politics; let your work speak.", "A new opportunity needs a quick decision."],
    money: ["Hold off on large purchases.", "An old payment may finally come through.", "Good time to review your budget."],
    health: ["Prioritise sleep and hydration.", "A short walk will clear your mind.", "Watch stress levels in the evening."],
    colors: ["Purple", "Gold", "White", "Green", "Red", "Blue"],
  },
  hi: {
    general: [
      "आज ग्रह स्थिर प्रगति का संकेत दे रहे हैं। एक लक्ष्य पर ध्यान दें और ऊर्जा बिखरने न दें।",
      "जिस बातचीत को आप टाल रहे थे, वह उम्मीद से बेहतर रहेगी। ईमानदारी से बोलें और ध्यान से सुनें।",
      "अचानक कोई खबर आपकी योजना बदल सकती है। लचीले रहें — बदलाव आपके पक्ष में है।",
      "लंबित काम पूरे करने और कुछ नया शुरू करने के लिए यह अच्छा समय है।",
    ],
    love: ["करीबी रिश्तों में गर्माहट लौटेगी।", "सिंगल हैं? आपके दायरे का कोई आपको नोटिस करेगा।", "बड़े वादों से ज़्यादा छोटी बातें मायने रखेंगी।"],
    career: ["आपकी मेहनत वरिष्ठों की नज़र में आएगी।", "ऑफ़िस की राजनीति से दूर रहें।", "नए अवसर पर जल्दी निर्णय लेना होगा।"],
    money: ["बड़ी खरीदारी अभी टालें।", "पुराना भुगतान मिल सकता है।", "बजट की समीक्षा का अच्छा समय है।"],
    health: ["नींद और पानी पर ध्यान दें।", "थोड़ी देर टहलने से मन हल्का होगा।", "शाम को तनाव पर नज़र रखें।"],
    colors: ["बैंगनी", "सुनहरा", "सफ़ेद", "हरा", "लाल", "नीला"],
  },
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function buildMockHoroscope({ sign, period, locale, dateKey }) {
  const t = TEXT[locale] || TEXT.en;
  const h = hash(`${sign}-${period}-${dateKey}`);
  const pick = (arr, salt = 0) => arr[(h + salt) % arr.length];
  return {
    sign,
    period,
    dateKey,
    summary: `${pick(t.general)} ${pick(t.general, 1)}`,
    sections: {
      love: pick(t.love, 2),
      career: pick(t.career, 3),
      money: pick(t.money, 4),
      health: pick(t.health, 5),
    },
    luckyNumber: (h % 9) + 1,
    luckyColor: pick(t.colors, 6),
  };
}
