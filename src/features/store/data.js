/**
 * Spiritual store — DEMO catalogue (dummy products) until the backend provides /store/products.
 * Each product's `art` picks the illustration drawn by ProductArt (no external images).
 */

export const STORE_CATEGORIES = [
  { slug: "rudraksha", label: "Rudraksha", art: "rudraksha" },
  { slug: "mala", label: "Malas", art: "mala" },
  { slug: "gemstones", label: "Gemstones", art: "gem" },
  { slug: "bracelets", label: "Bracelets", art: "bracelet" },
  { slug: "yantra", label: "Yantras", art: "yantra" },
  { slug: "puja", label: "Puja Essentials", art: "diya" },
];

/** Gradient + accent per illustration colour. */
export const ART_TONES = {
  saffron: { from: "#fdba74", to: "#c2410c", accent: "#7c2d12" },
  amber: { from: "#fcd34d", to: "#b45309", accent: "#78350f" },
  wood: { from: "#d6a77a", to: "#7c4a21", accent: "#3b2410" },
  ruby: { from: "#fda4af", to: "#be123c", accent: "#881337" },
  emerald: { from: "#86efac", to: "#047857", accent: "#064e3b" },
  sapphire: { from: "#93c5fd", to: "#1d4ed8", accent: "#1e3a8a" },
  pearl: { from: "#f5f5f4", to: "#a8a29e", accent: "#57534e" },
  amethyst: { from: "#d8b4fe", to: "#7e22ce", accent: "#581c87" },
  onyx: { from: "#a8a29e", to: "#292524", accent: "#0c0a09" },
  gold: { from: "#fde68a", to: "#ca8a04", accent: "#713f12" },
};

const P = (slug, name, category, art, tone, price, mrp, rating, reviews, benefit, extra = {}) => ({
  slug,
  name,
  category,
  art,
  tone,
  price,
  mrp,
  rating,
  reviews,
  benefit,
  ...extra,
});

export const PRODUCTS = [
  // Rudraksha
  P("1-mukhi-rudraksha", "1 Mukhi Rudraksha (Nepal)", "rudraksha", "rudraksha", "wood", 4999, 7999, 4.9, 312, "Focus, clarity and Surya's blessings", { tag: "Bestseller", certified: true }),
  P("5-mukhi-rudraksha", "5 Mukhi Rudraksha", "rudraksha", "rudraksha", "wood", 299, 499, 4.8, 1840, "Calm mind and good health — for everyone", { tag: "Most loved", certified: true }),
  P("7-mukhi-rudraksha", "7 Mukhi Rudraksha", "rudraksha", "rudraksha", "saffron", 1499, 2199, 4.7, 406, "Blessings of Goddess Lakshmi for wealth", { certified: true }),
  P("gauri-shankar-rudraksha", "Gauri Shankar Rudraksha", "rudraksha", "rudraksha", "amber", 3499, 4999, 4.8, 221, "Harmony in marriage and relationships", { certified: true }),

  // Malas
  P("rudraksha-jaap-mala", "Rudraksha Jaap Mala (108+1)", "mala", "mala", "wood", 799, 1299, 4.8, 2310, "For daily mantra chanting and meditation", { tag: "Bestseller" }),
  P("tulsi-mala", "Tulsi Kanthi Mala", "mala", "mala", "emerald", 349, 599, 4.7, 980, "Devotion to Lord Vishnu and Krishna"),
  P("sphatik-mala", "Sphatik (Crystal) Mala", "mala", "mala", "pearl", 999, 1599, 4.6, 512, "Cooling, peace and Shukra's grace"),
  P("chandan-mala", "Red Sandalwood Mala", "mala", "mala", "ruby", 649, 999, 4.6, 377, "Soothing fragrance for focused japa"),
  P("kamal-gatta-mala", "Kamal Gatta (Lotus Seed) Mala", "mala", "mala", "onyx", 549, 899, 4.5, 244, "Prosperity mantras of Goddess Lakshmi", { tag: "New" }),

  // Gemstones
  P("yellow-sapphire-pukhraj", "Yellow Sapphire (Pukhraj)", "gemstones", "gem", "gold", 8999, 12999, 4.8, 168, "Jupiter (Guru) — wisdom, marriage, growth", { tag: "Lab certified", certified: true }),
  P("blue-sapphire-neelam", "Blue Sapphire (Neelam)", "gemstones", "gem", "sapphire", 11999, 16999, 4.7, 97, "Saturn (Shani) — discipline and career", { certified: true }),
  P("ruby-manik", "Ruby (Manik)", "gemstones", "gem", "ruby", 7499, 9999, 4.7, 134, "Sun (Surya) — confidence and leadership", { certified: true }),
  P("emerald-panna", "Emerald (Panna)", "gemstones", "gem", "emerald", 6999, 9499, 4.6, 152, "Mercury (Budh) — intellect and business", { certified: true }),
  P("pearl-moti", "Pearl (Moti)", "gemstones", "gem", "pearl", 2499, 3499, 4.6, 289, "Moon (Chandra) — calm emotions and peace", { certified: true }),

  // Bracelets
  P("7-chakra-bracelet", "7 Chakra Healing Bracelet", "bracelets", "bracelet", "amethyst", 499, 899, 4.6, 1460, "Balances all seven chakras", { tag: "Trending" }),
  P("rudraksha-bracelet", "Rudraksha Bracelet", "bracelets", "bracelet", "wood", 399, 699, 4.7, 1122, "Protection and positive energy, daily wear"),
  P("tiger-eye-bracelet", "Tiger Eye Bracelet", "bracelets", "bracelet", "amber", 599, 999, 4.5, 640, "Courage, focus and good luck"),
  P("black-tourmaline-bracelet", "Black Tourmaline Bracelet", "bracelets", "bracelet", "onyx", 649, 1099, 4.5, 318, "Shields against negative energy", { tag: "New" }),

  // Yantras
  P("shree-yantra", "Shree Yantra (Copper)", "yantra", "yantra", "gold", 1299, 1999, 4.8, 734, "Wealth, abundance and prosperity", { tag: "Bestseller" }),
  P("kuber-yantra", "Kuber Yantra", "yantra", "yantra", "amber", 899, 1399, 4.6, 286, "Attracts money and financial stability"),
  P("navgraha-yantra", "Navgraha Yantra", "yantra", "yantra", "saffron", 1099, 1699, 4.7, 341, "Calms all nine planets in your chart"),

  // Puja essentials
  P("brass-diya-set", "Brass Diya Set (Pair)", "puja", "diya", "gold", 449, 699, 4.7, 925, "For daily aarti and festive puja"),
  P("sandalwood-dhoop", "Sandalwood Dhoop Sticks", "puja", "diya", "wood", 199, 299, 4.5, 1560, "Pure fragrance for meditation and puja"),
  P("gangajal-kalash", "Copper Gangajal Kalash", "puja", "diya", "saffron", 599, 899, 4.6, 208, "Sacred water vessel for rituals", { tag: "New" }),
];

export const discountPct = (p) => Math.round(((p.mrp - p.price) / p.mrp) * 100);
export const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const categoryLabel = (slug) => STORE_CATEGORIES.find((c) => c.slug === slug)?.label || slug;

/** Per-category copy for the product page (dummy content, same for every product in the category). */
export const CATEGORY_INFO = {
  rudraksha: {
    about: "Natural Rudraksha beads sourced from Nepal and Indonesia, checked for mukhi count and energised with Vedic mantras before dispatch.",
    use: ["Wear on a Monday after a bath, facing east", "Chant “Om Namah Shivaya” 108 times before first wearing", "Keep it on a red or black thread, or in a silver cap"],
    details: { Material: "Natural Rudraksha bead", Origin: "Nepal / Indonesia", Energised: "Yes, with Vedic mantras" },
  },
  mala: {
    about: "A traditional 108+1 bead japa mala, hand-knotted between beads so it lasts through daily chanting.",
    use: ["Hold in the right hand and move bead by bead with the thumb", "Do not cross the guru (head) bead — turn the mala around", "Store in a clean cloth pouch after japa"],
    details: { Beads: "108 + 1 guru bead", Knotting: "Hand-knotted", Energised: "Yes" },
  },
  gemstones: {
    about: "Natural, untreated gemstone with a lab certificate, recommended according to your birth chart by our astrologers.",
    use: ["Consult an astrologer before wearing a planetary gemstone", "Wear on the finger and day recommended for your chart", "Purify with Gangajal and raw milk before first wearing"],
    details: { Type: "Natural, untreated", Certificate: "Govt.-approved lab", Setting: "Loose stone (ring setting on request)" },
  },
  bracelets: {
    about: "A comfortable stretchable bracelet of natural beads for daily wear — simple to wear, and easy to keep with you all day.",
    use: ["Wear on the left wrist to receive, right wrist to release energy", "Remove while bathing or sleeping", "Recharge occasionally in morning sunlight"],
    details: { Size: "Free size (stretchable)", Beads: "8 mm natural beads", Energised: "Yes" },
  },
  yantra: {
    about: "A precisely engraved yantra on pure metal, prepared and energised for your home or workplace puja space.",
    use: ["Place in the north-east (Ishaan) corner, facing east or north", "Light a diya and offer flowers on the first day", "Wipe gently with a dry cloth; avoid chemicals"],
    details: { Material: "Copper / brass plate", Size: "3 × 3 inches", Energised: "Yes, with prana pratishtha" },
  },
  puja: {
    about: "Pure, traditional puja essentials for your daily rituals, festivals and meditation practice.",
    use: ["Use during morning and evening aarti", "Keep in a clean, dry place in your puja room", "Pair with your daily mantra or meditation"],
    details: { Material: "Brass / natural ingredients", Usage: "Daily puja & festivals" },
  },
};

/** FAQs shown on every product page. */
export const STORE_FAQS = [
  { q: "Are your products authentic?", a: "Yes. Rudraksha and gemstones are natural and come with a lab certificate where mentioned. Every item is checked before dispatch." },
  { q: "Are the products energised?", a: "Spiritual items are energised with Vedic mantras by our pandits before shipping, so they are ready to use." },
  { q: "How long does delivery take?", a: "Orders are dispatched within 24–48 hours and usually arrive in 3–7 working days across India. Delivery is free above ₹499." },
  { q: "Can I return or exchange a product?", a: "Yes — unused items in original packaging can be returned within 7 days of delivery. Gemstones cut or set on request are not returnable." },
  { q: "Which product is right for me?", a: "It depends on your birth chart. Talk to one of our verified astrologers — your first chat is free — and get a personal recommendation." },
  { q: "Is Cash on Delivery available?", a: "Online checkout is being set up. Your cart is saved on this device so you can complete the order once it is live." },
];

/** Same category first, then others — excluding the product itself. */
export const relatedProducts = (p, n = 8) =>
  [...PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug), ...PRODUCTS.filter((x) => x.category !== p.category)].slice(0, n);

/** Newest first (items tagged "New", then most recently added to the catalogue). */
export const latestProducts = (exclude, n = 8) =>
  [...PRODUCTS].reverse().sort((a, b) => (b.tag === "New") - (a.tag === "New")).filter((x) => x.slug !== exclude).slice(0, n);
