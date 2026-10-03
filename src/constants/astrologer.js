export const ASTROLOGER_STATUS = {
  ONLINE: "online",
  BUSY: "busy",
  OFFLINE: "offline",
};

export const CONSULT_MODE = {
  CHAT: "chat",
  VIDEO: "video",
};

export const CATEGORIES = [
  { slug: "love", icon: "Heart" },
  { slug: "career", icon: "Briefcase" },
  { slug: "marriage", icon: "Gem" },
  { slug: "finance", icon: "IndianRupee" },
  { slug: "health", icon: "HeartPulse" },
];

export const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Punjabi"];

export const SPECIALTIES = ["Vedic", "Tarot", "Numerology", "Vastu", "KP", "Palmistry", "Prashna", "Face Reading"];

export const SORT_OPTIONS = {
  POPULARITY: "popularity",
  RATING: "rating",
  PRICE_LOW: "price_asc",
  PRICE_HIGH: "price_desc",
};

export const PRICE_RANGES = [
  { id: "0-20", min: 0, max: 20, label: "₹0 – ₹20" },
  { id: "20-50", min: 20, max: 50, label: "₹20 – ₹50" },
  { id: "50-100", min: 50, max: 100, label: "₹50 – ₹100" },
  { id: "100+", min: 100, max: Infinity, label: "₹100+" },
];
