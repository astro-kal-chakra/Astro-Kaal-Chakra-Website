/**
 * Mock data for Live sessions (phase 2). Shape mirrors the planned /live endpoints.
 * Gift labels live in content.json → content.live.gifts.<id>.
 */

export const MOCK_LIVE_SESSIONS = [
  {
    id: "live_101",
    astrologerSlug: "acharya-vikram-shastri",
    status: "live",
    viewers: 1284,
    startedMinutesAgo: 18,
    questionPrice: 51,
    tags: ["career", "finance"],
    gradient: "from-brand-600 via-brand-800 to-brand-950",
    en: { title: "Career & money forecast for October", topic: "Open Q&A on job changes, business and investments" },
    hi: { title: "अक्टूबर का करियर और धन पूर्वानुमान", topic: "नौकरी बदलाव, व्यवसाय और निवेश पर खुला प्रश्नोत्तर" },
  },
  {
    id: "live_102",
    astrologerSlug: "tarot-meera",
    status: "live",
    viewers: 642,
    startedMinutesAgo: 6,
    questionPrice: 31,
    tags: ["love"],
    gradient: "from-fuchsia-600 via-brand-800 to-brand-950",
    en: { title: "Love tarot: what's next for you?", topic: "Quick one-card readings for relationship questions" },
    hi: { title: "लव टैरो: आपके लिए आगे क्या है?", topic: "रिश्तों से जुड़े प्रश्नों के लिए एक-कार्ड रीडिंग" },
  },
  {
    id: "live_103",
    astrologerSlug: "pandit-suresh-tiwari",
    status: "live",
    viewers: 2310,
    startedMinutesAgo: 42,
    questionPrice: 51,
    tags: ["marriage"],
    gradient: "from-gold-500 via-orange-700 to-brand-950",
    en: { title: "Diwali muhurat & festive remedies", topic: "Auspicious timings and simple remedies for the festive season" },
    hi: { title: "दिवाली मुहूर्त और त्योहार के उपाय", topic: "त्योहारों के मौसम के लिए शुभ मुहूर्त और सरल उपाय" },
  },
  {
    id: "live_201",
    astrologerSlug: "numerologist-kavya",
    status: "upcoming",
    startsInMinutes: 45,
    questionPrice: 31,
    tags: ["career"],
    gradient: "from-teal-500 via-brand-800 to-brand-950",
    en: { title: "Lucky numbers for your name", topic: "Name numerology corrections, live" },
    hi: { title: "आपके नाम के शुभ अंक", topic: "नाम अंक ज्योतिष सुधार, लाइव" },
  },
  {
    id: "live_202",
    astrologerSlug: "dr-ananya-rao",
    status: "upcoming",
    startsInMinutes: 180,
    questionPrice: 51,
    tags: ["health", "career"],
    gradient: "from-sky-600 via-brand-800 to-brand-950",
    en: { title: "Saturn transit: what changes for you", topic: "Sign-by-sign transit effects and remedies" },
    hi: { title: "शनि गोचर: आपके लिए क्या बदलेगा", topic: "राशि अनुसार गोचर प्रभाव और उपाय" },
  },
  {
    id: "live_203",
    astrologerSlug: "acharya-deepak-sharma",
    status: "upcoming",
    startsInMinutes: 1440,
    questionPrice: 51,
    tags: ["marriage", "love"],
    gradient: "from-rose-500 via-brand-800 to-brand-950",
    en: { title: "Marriage timing Q&A", topic: "When will I get married? Live chart readings" },
    hi: { title: "विवाह योग प्रश्नोत्तर", topic: "मेरी शादी कब होगी? लाइव कुंडली विश्लेषण" },
  },
];

export const MOCK_LIVE_GIFTS = [
  { id: "diya", emoji: "🪔", price: 11 },
  { id: "flower", emoji: "🌸", price: 21 },
  { id: "star", emoji: "⭐", price: 51 },
  { id: "moon", emoji: "🌙", price: 101 },
  { id: "crown", emoji: "👑", price: 251 },
  { id: "rocket", emoji: "🚀", price: 501 },
];

/** Simulated chat pool for the mock live room. */
export const MOCK_LIVE_CHAT = {
  users: ["Priya", "Rahul", "Anjali", "Vikas", "Sneha", "Arjun", "Kavita", "Rohit", "Meena", "Aman"],
  en: [
    "Namaste guruji 🙏",
    "Very helpful, thank you!",
    "Please check for Leo ascendant",
    "When is a good time for a job change?",
    "Joined just now, what did I miss?",
    "So accurate for my Scorpio moon",
    "Can you talk about Saturn transit?",
    "Thank you for the remedies 🙏",
    "Will Jupiter help my business?",
    "Love this session ❤️",
  ],
  hi: [
    "नमस्ते गुरुजी 🙏",
    "बहुत उपयोगी, धन्यवाद!",
    "कृपया सिंह लग्न के लिए बताएँ",
    "नौकरी बदलने का सही समय कब है?",
    "अभी जुड़ा हूँ, क्या छूट गया?",
    "मेरी वृश्चिक राशि के लिए बिल्कुल सही",
    "क्या आप शनि गोचर पर बात करेंगे?",
    "उपायों के लिए धन्यवाद 🙏",
    "क्या गुरु मेरे व्यवसाय में मदद करेंगे?",
    "यह सत्र बहुत अच्छा है ❤️",
  ],
};
