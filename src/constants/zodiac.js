export const ZODIAC_SIGNS = [
  { slug: "aries", symbol: "♈", en: "Aries", hi: "मेष", dates: "Mar 21 – Apr 19" },
  { slug: "taurus", symbol: "♉", en: "Taurus", hi: "वृषभ", dates: "Apr 20 – May 20" },
  { slug: "gemini", symbol: "♊", en: "Gemini", hi: "मिथुन", dates: "May 21 – Jun 20" },
  { slug: "cancer", symbol: "♋", en: "Cancer", hi: "कर्क", dates: "Jun 21 – Jul 22" },
  { slug: "leo", symbol: "♌", en: "Leo", hi: "सिंह", dates: "Jul 23 – Aug 22" },
  { slug: "virgo", symbol: "♍", en: "Virgo", hi: "कन्या", dates: "Aug 23 – Sep 22" },
  { slug: "libra", symbol: "♎", en: "Libra", hi: "तुला", dates: "Sep 23 – Oct 22" },
  { slug: "scorpio", symbol: "♏", en: "Scorpio", hi: "वृश्चिक", dates: "Oct 23 – Nov 21" },
  { slug: "sagittarius", symbol: "♐", en: "Sagittarius", hi: "धनु", dates: "Nov 22 – Dec 21" },
  { slug: "capricorn", symbol: "♑", en: "Capricorn", hi: "मकर", dates: "Dec 22 – Jan 19" },
  { slug: "aquarius", symbol: "♒", en: "Aquarius", hi: "कुंभ", dates: "Jan 20 – Feb 18" },
  { slug: "pisces", symbol: "♓", en: "Pisces", hi: "मीन", dates: "Feb 19 – Mar 20" },
];

export const HOROSCOPE_PERIODS = ["daily", "weekly", "monthly", "yearly"];

export const getSign = (slug) => ZODIAC_SIGNS.find((s) => s.slug === slug);
export const isValidPeriod = (p) => HOROSCOPE_PERIODS.includes(p);
