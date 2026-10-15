/**
 * Plain-language readings for the free tools (Kundli Matching, Numerology, Kundli, Zodiac finder).
 * Rule-based and deterministic: the same chart always gives the same reading. Written in English;
 * visitors who pick Hindi get it through the site's translation layer.
 *
 * Tone: guidance, never fear. Astrology describes tendencies — the readings say so and point to an
 * astrologer for decisions.
 *
 * Every reading has the shape { title, intro, sections: [{ heading, text }], strengths: [], cautions: [], advice }.
 */

// ---------------------------------------------------------------- signs (0 = Aries … 11 = Pisces)
export const SIGN_PROFILES = [
  {
    name: "Aries", nature: "bold, energetic and quick to act. You like to lead, start new things and face challenges head-on",
    strengths: ["Courage and initiative", "Honest and direct", "High energy and drive"], challenges: ["Impatience", "Acting before thinking", "A quick temper that cools just as fast"],
    love: "You love with passion and loyalty and need a partner who enjoys some adventure and gives you space to lead.",
    career: "Leadership roles, entrepreneurship, sports, defence, engineering and anything competitive.",
    emotion: "Your feelings rise fast and pass fast. You need action and movement to feel settled.",
    lucky: { color: "Red", day: "Tuesday", numbers: "1 and 9" },
  },
  {
    name: "Taurus", nature: "steady, patient and practical. You value comfort, security and beautiful things, and you finish what you start",
    strengths: ["Reliability", "Patience and persistence", "Good taste and money sense"], challenges: ["Stubbornness", "Resistance to change", "Holding on to possessions or grudges"],
    love: "You are loyal and affectionate and show love through care and comfort. Trust is everything for you.",
    career: "Finance, banking, real estate, food, design, music and arts, and any work that builds something lasting.",
    emotion: "You need stability and routine to feel calm; sudden change unsettles you.",
    lucky: { color: "White and light green", day: "Friday", numbers: "2 and 6" },
  },
  {
    name: "Gemini", nature: "curious, witty and adaptable. You love ideas, conversation and learning new things",
    strengths: ["Communication", "Quick learning", "Versatility and humour"], challenges: ["Restlessness", "Scattered focus", "Overthinking"],
    love: "You need a partner who is also a friend — someone to talk with, laugh with and explore with.",
    career: "Media, writing, teaching, sales, marketing, IT and any role that uses words or networks.",
    emotion: "Talking things through helps you feel better; boredom affects your mood quickly.",
    lucky: { color: "Green", day: "Wednesday", numbers: "3 and 5" },
  },
  {
    name: "Cancer", nature: "caring, intuitive and protective. Family, home and emotional security mean a lot to you",
    strengths: ["Empathy and kindness", "Strong intuition", "Loyalty to family"], challenges: ["Moodiness", "Being easily hurt", "Holding on to the past"],
    love: "You are a devoted, nurturing partner who needs emotional closeness and reassurance.",
    career: "Healthcare, teaching, hospitality, food, counselling, real estate and caring professions.",
    emotion: "Your emotions run deep and change with your surroundings; a peaceful home restores you.",
    lucky: { color: "White and silver", day: "Monday", numbers: "2 and 7" },
  },
  {
    name: "Leo", nature: "confident, warm and generous. You shine in a crowd and naturally inspire others",
    strengths: ["Leadership and confidence", "Generosity", "Creativity and warmth"], challenges: ["Pride", "Needing recognition", "Dominating others"],
    love: "You are romantic and loyal and love grand gestures; you need appreciation and respect.",
    career: "Management, government, politics, entertainment, creative fields and anything with authority.",
    emotion: "You feel best when appreciated; being ignored hurts more than you show.",
    lucky: { color: "Gold and orange", day: "Sunday", numbers: "1 and 4" },
  },
  {
    name: "Virgo", nature: "thoughtful, organised and helpful. You notice details and like to improve whatever you touch",
    strengths: ["Analytical mind", "Hard work and discipline", "Practical helpfulness"], challenges: ["Over-criticism", "Worry", "Perfectionism"],
    love: "You show love through small acts of care and need a partner who values sincerity.",
    career: "Accounts, analysis, medicine, research, editing, IT and quality-focused work.",
    emotion: "You calm down when things are in order; uncertainty makes you anxious.",
    lucky: { color: "Green and cream", day: "Wednesday", numbers: "5 and 6" },
  },
  {
    name: "Libra", nature: "charming, fair and diplomatic. You seek balance, harmony and good relationships",
    strengths: ["Diplomacy", "Sense of fairness", "Charm and good taste"], challenges: ["Indecision", "Avoiding conflict", "Depending on others' approval"],
    love: "Partnership is central to your life; you are romantic and want an equal, harmonious bond.",
    career: "Law, design, fashion, public relations, counselling, arts and partnership businesses.",
    emotion: "Disharmony around you disturbs your peace; you need beauty and calm.",
    lucky: { color: "Light blue and white", day: "Friday", numbers: "6 and 9" },
  },
  {
    name: "Scorpio", nature: "intense, determined and perceptive. You see beneath the surface and never give up easily",
    strengths: ["Determination", "Deep insight", "Loyalty"], challenges: ["Jealousy", "Secretiveness", "Difficulty forgiving"],
    love: "You love deeply and loyally and need complete trust and emotional honesty.",
    career: "Research, investigation, medicine, surgery, finance, psychology and occult sciences.",
    emotion: "Your feelings are strong but private; trust takes time, and betrayal is hard to forget.",
    lucky: { color: "Maroon and red", day: "Tuesday", numbers: "4 and 9" },
  },
  {
    name: "Sagittarius", nature: "optimistic, adventurous and honest. You love freedom, travel, learning and big ideas",
    strengths: ["Optimism", "Wisdom and fairness", "Love of learning"], challenges: ["Restlessness", "Bluntness", "Over-promising"],
    love: "You need a partner who shares your sense of adventure and respects your freedom.",
    career: "Teaching, law, travel, publishing, spirituality, sports and consulting.",
    emotion: "Feeling free and hopeful keeps you happy; restriction makes you restless.",
    lucky: { color: "Yellow", day: "Thursday", numbers: "3 and 9" },
  },
  {
    name: "Capricorn", nature: "disciplined, ambitious and responsible. You plan for the long term and build success step by step",
    strengths: ["Discipline", "Patience and planning", "Responsibility"], challenges: ["Being too serious", "Workaholism", "Hiding feelings"],
    love: "You are a committed, dependable partner who shows love through responsibility and support.",
    career: "Administration, government, management, engineering, finance and long-term businesses.",
    emotion: "You keep feelings in check and feel secure when your goals are on track.",
    lucky: { color: "Black and dark blue", day: "Saturday", numbers: "8 and 4" },
  },
  {
    name: "Aquarius", nature: "independent, original and humane. You think ahead and care about people and causes",
    strengths: ["Original thinking", "Friendliness", "Humanitarian spirit"], challenges: ["Detachment", "Stubborn opinions", "Unpredictability"],
    love: "You need friendship and freedom in love — a partner who respects your individuality.",
    career: "Technology, science, social work, research, aviation and innovative fields.",
    emotion: "You process feelings through thought; you need space before you open up.",
    lucky: { color: "Blue", day: "Saturday", numbers: "4 and 8" },
  },
  {
    name: "Pisces", nature: "gentle, imaginative and compassionate. You are intuitive, artistic and spiritual by nature",
    strengths: ["Compassion", "Imagination and creativity", "Spiritual sensitivity"], challenges: ["Escapism", "Being easily influenced", "Self-doubt"],
    love: "You are a romantic, giving partner who needs gentleness and emotional understanding.",
    career: "Arts, music, healing, medicine, spirituality, charity and creative work.",
    emotion: "You absorb others' moods easily; quiet time and prayer recharge you.",
    lucky: { color: "Yellow and sea green", day: "Thursday", numbers: "3 and 7" },
  },
];

// ---------------------------------------------------------------- nakshatras (0 = Ashwini … 26 = Revati)
const NAKSHATRA_NOTES = [
  "quick, healing and pioneering — you love speed and new beginnings",
  "strong-willed and responsible — you carry burdens bravely and value truth",
  "sharp, determined and protective — you cut through confusion with clarity",
  "charming, creative and steady — you attract comfort, beauty and growth",
  "curious and gentle — a seeker who loves exploring, learning and travel",
  "intense and transformative — storms in your life usually lead to growth",
  "kind and hopeful — you bounce back and bring renewal to others",
  "nurturing and dutiful — one of the most auspicious stars, focused on care and dharma",
  "perceptive and wise — sharp intuition and a strong mind; use it kindly",
  "dignified and traditional — respect for family, ancestors and position",
  "warm, creative and pleasure-loving — you bring joy and relaxation",
  "generous and dependable — a helpful friend and a fair partner",
  "skilful and resourceful — good with your hands, humour and practical work",
  "artistic and attractive — you have an eye for design and beauty",
  "independent and adaptable — like the wind, you move freely and diplomatically",
  "goal-driven and determined — you keep striving until you reach your aim",
  "devoted and friendly — loyal in friendship and successful through teamwork",
  "protective and capable — a natural senior figure who takes charge",
  "deep and searching — you look for the root of things and spiritual truth",
  "confident and persuasive — invincible in spirit, with strong convictions",
  "principled and patient — success comes steadily through righteous effort",
  "attentive and learned — a good listener who gains through knowledge",
  "rhythmic and prosperous — musical, generous and good with resources",
  "independent and healing — private, scientific and a natural problem-solver",
  "idealistic and intense — passionate about causes and spiritual growth",
  "calm and wise — deep, controlled and supportive of others",
  "gentle and nourishing — compassionate, protective and blessed with safe journeys",
];

// ---------------------------------------------------------------- Vimshottari periods
const DASHA_NOTES = {
  sun: "a period that highlights confidence, career, authority and your relationship with father or seniors. Recognition is possible through responsible effort; watch ego and health of the heart and eyes.",
  moon: "a period that brings emotions, family, home and public life into focus. Peace of mind, travel and support from mother are themes; avoid mood-based decisions.",
  mars: "an energetic, action-oriented period. Good for property, courage, sports and taking initiative; keep anger, haste and accidents in check.",
  rahu: "a period of ambition, change and unconventional opportunities, often involving foreign links or technology. Results can be sudden — stay grounded and avoid shortcuts.",
  jupiter: "one of the most favourable periods — growth in wisdom, education, children, marriage and wealth, with guidance from teachers. Keep plans realistic and avoid overindulgence.",
  saturn: "a period of hard work, discipline and long-term building. Progress may feel slow but is lasting; patience, service and honesty bring the best results.",
  mercury: "a period that favours learning, business, communication, writing and trade. Your intellect and network grow; avoid overthinking and nervous stress.",
  ketu: "an inward, spiritual period. Detachment, research and intuition grow while material matters may feel uncertain; meditation and simplicity help.",
  venus: "a period of comfort, relationships, art and prosperity. Marriage, vehicles, luxury and creative success are themes; avoid excess and keep finances balanced.",
};
const PLANET_NAMES = { sun: "Sun", moon: "Moon", mars: "Mars", rahu: "Rahu", jupiter: "Jupiter", saturn: "Saturn", mercury: "Mercury", ketu: "Ketu", venus: "Venus" };

// ---------------------------------------------------------------- Kundli Matching
const KOOTA_GOOD = {
  varna: "Your spiritual and working temperaments fit well — you are likely to respect each other's values and ambitions.",
  vashya: "There is a natural mutual attraction and the ability to influence each other gently.",
  tara: "The birth stars support each other, which traditionally favours health, luck and well-being together.",
  yoni: "Physical and emotional compatibility is strong — a good sign for intimacy and comfort with each other.",
  grahaMaitri: "Your Moon-sign lords are friendly, which supports mental compatibility, friendship and understanding.",
  gana: "Your temperaments match well, so day-to-day behaviour and attitudes are likely to be in tune.",
  bhakoot: "Your Moon signs sit well with each other — traditionally a strong sign for love, family growth and finances.",
  nadi: "Your Nadis are different, which is considered very good for health and future family.",
};
const KOOTA_LOW = {
  varna: "Your approaches to work and values may differ; respect for each other's way of doing things will matter.",
  vashya: "Attraction and influence may not flow easily at first; patience and shared interests help build closeness.",
  tara: "The birth stars are less supportive of each other; traditionally this asks for extra care of health and timing of important events.",
  yoni: "Physical and emotional rhythms may differ; open communication about needs and affection is important.",
  grahaMaitri: "Your thinking styles may clash at times; consciously building friendship and listening will help a lot.",
  gana: "Your temperaments are quite different — one may be calmer and the other more intense. Understanding and adjustment are key.",
  bhakoot: "Bhakoot dosha is present (the Moon signs are 2/12, 5/9 or 6/8 from each other). Traditionally it can bring differences in emotions or finances. Astrologers often check for cancellation through the sign lords' friendship before concluding.",
  nadi: "Nadi dosha is present (both have the same Nadi). Traditionally it is the most important dosha, linked to health and progeny. It is often cancelled when the birth stars or Moon signs differ in specific ways — have an astrologer confirm before deciding.",
};

const verdictText = (total) =>
  total >= 32
    ? { level: "Excellent match", text: "This is an excellent level of compatibility — very few couples score this high. The traditional factors strongly support a happy, harmonious married life." }
    : total >= 25
      ? { level: "Very good match", text: "This is a very good match. Most of the important factors are in your favour, and the relationship has a strong traditional foundation." }
      : total >= 18
        ? { level: "Acceptable match", text: "This is an acceptable match — 18 or more gunas is traditionally the minimum for marriage. Some areas are strong and some need understanding, which is true for most good relationships." }
        : { level: "Challenging match", text: "The score is below the traditional minimum of 18 gunas. This does not mean the relationship cannot work, but it does mean differences in nature need more effort, and a detailed kundli analysis is strongly recommended." };

/**
 * @param {{ total, max, kootas: [{ key, obtained, max }], boy: { name, manglik, moonSign }, girl: { name, manglik, moonSign } }} r
 */
export function matchingReading(r) {
  const boy = r.boy?.name?.trim() || "the boy";
  const girl = r.girl?.name?.trim() || "the girl";
  const v = verdictText(r.total);
  const byKey = Object.fromEntries(r.kootas.map((k) => [k.key, k]));
  const strengths = r.kootas.filter((k) => k.obtained / k.max >= 0.75).map((k) => KOOTA_GOOD[k.key]).filter(Boolean);
  const cautions = r.kootas.filter((k) => k.obtained / k.max < 0.4).map((k) => KOOTA_LOW[k.key]).filter(Boolean);

  const manglik =
    r.boy.manglik && r.girl.manglik
      ? "Both charts are Manglik, so the Mangal dosha balances out — traditionally this is considered a good pairing on this point."
      : !r.boy.manglik && !r.girl.manglik
        ? "Neither chart is Manglik, so there is no Mangal dosha concern for this marriage."
        : `${r.boy.manglik ? boy : girl} is Manglik and ${r.boy.manglik ? girl : boy} is not. Mangal dosha is common (about 40% of people) and is often softened by other placements or simple remedies; an astrologer can check whether it is cancelled in these charts.`;

  const sections = [
    { heading: v.level, text: `${boy} and ${girl} share ${r.total} out of ${r.max} gunas. ${v.text}` },
    {
      heading: "Nature and understanding",
      text:
        (byKey.gana?.obtained ?? 0) >= 5 && (byKey.grahaMaitri?.obtained ?? 0) >= 4
          ? "Your temperaments and ways of thinking are well matched, so communication and everyday life together should feel natural."
          : (byKey.gana?.obtained ?? 0) >= 5 || (byKey.grahaMaitri?.obtained ?? 0) >= 4
            ? "You agree well in some ways of thinking and behaving and differ in others — appreciating those differences will keep the relationship balanced."
            : "Your natures are quite different. Couples like this often complement each other well when they make time to understand and respect each other's way of thinking.",
    },
    {
      heading: "Love, family and well-being",
      text:
        (byKey.bhakoot?.obtained ?? 0) === 7 && (byKey.nadi?.obtained ?? 0) === 8
          ? "Bhakoot and Nadi — the two most important factors for love, family growth and health — are both fully in your favour."
          : (byKey.nadi?.obtained ?? 0) === 0 && (byKey.bhakoot?.obtained ?? 0) === 0
            ? "Both Nadi and Bhakoot doshas are present. These carry the most weight in Guna Milan, so a careful check for cancellation by an astrologer is important before deciding."
            : (byKey.nadi?.obtained ?? 0) === 0
              ? "Nadi dosha is present. It is the most important point to verify — many charts have a cancellation, so please get it checked."
              : (byKey.bhakoot?.obtained ?? 0) === 0
                ? "Bhakoot dosha is present. It is frequently cancelled when the Moon-sign lords are friends; an astrologer can confirm it for you."
                : "The key family and well-being factors look supportive.",
    },
    { heading: "Manglik", text: manglik },
  ];

  return {
    title: "What this match means",
    intro: "A simple explanation of your Guna Milan result, based on the eight traditional kootas.",
    sections,
    strengths,
    cautions,
    advice:
      "Guna Milan is one important part of marriage matching, but not the whole picture. A complete analysis also looks at the 7th house, current dashas, and dosha cancellations in both kundlis. Above all, mutual respect, communication and family support make a marriage work.",
  };
}

// ---------------------------------------------------------------- Numerology
const NUMBERS = {
  1: { word: "the Leader", core: "independent, ambitious and original. You prefer to lead rather than follow", strengths: ["Leadership", "Self-motivation", "Courage to start new things"], challenges: ["Stubbornness", "Impatience with others", "Doing everything alone"], career: "business, management, government and any role where you take charge", love: "You need a partner who respects your independence and supports your goals.", lucky: { day: "Sunday", color: "Gold and orange", numbers: "1, 10, 19, 28" }, planet: "Sun" },
  2: { word: "the Peacemaker", core: "sensitive, cooperative and diplomatic. You bring people together and value harmony", strengths: ["Diplomacy", "Intuition", "Patience and tact"], challenges: ["Over-sensitivity", "Indecision", "Depending on others' approval"], career: "counselling, teaching, HR, healing, arts and partnership roles", love: "You are a caring, devoted partner who needs emotional closeness and kindness.", lucky: { day: "Monday", color: "White and cream", numbers: "2, 11, 20, 29" }, planet: "Moon" },
  3: { word: "the Communicator", core: "creative, expressive and optimistic. You bring joy and ideas wherever you go", strengths: ["Creativity", "Communication", "Optimism"], challenges: ["Scattered energy", "Unfinished projects", "Mood swings"], career: "teaching, writing, media, design, performing arts and advisory work", love: "You need a fun, intellectually stimulating partner who appreciates your expressiveness.", lucky: { day: "Thursday", color: "Yellow", numbers: "3, 12, 21, 30" }, planet: "Jupiter" },
  4: { word: "the Builder", core: "practical, hard-working and dependable. You create order and lasting results", strengths: ["Discipline", "Reliability", "Practical planning"], challenges: ["Rigidity", "Overworking", "Resisting change"], career: "engineering, technology, administration, finance and construction", love: "You are a loyal, steady partner who shows love through dependability.", lucky: { day: "Saturday", color: "Blue and grey", numbers: "4, 13, 22, 31" }, planet: "Rahu" },
  5: { word: "the Explorer", core: "free-spirited, versatile and adventurous. You love change, travel and new experiences", strengths: ["Adaptability", "Quick thinking", "Communication and sales skill"], challenges: ["Restlessness", "Impulsiveness", "Difficulty with routine"], career: "sales, travel, media, marketing, business and anything with variety", love: "You need freedom and excitement in love and a partner who shares your curiosity.", lucky: { day: "Wednesday", color: "Green", numbers: "5, 14, 23" }, planet: "Mercury" },
  6: { word: "the Nurturer", core: "caring, responsible and family-minded. You love beauty and harmony at home", strengths: ["Compassion", "Responsibility", "Artistic taste"], challenges: ["Over-protectiveness", "Self-sacrifice", "Worrying about others"], career: "healthcare, teaching, design, hospitality, beauty and family business", love: "You are a devoted, romantic partner; home and family are at the centre of your life.", lucky: { day: "Friday", color: "White and pink", numbers: "6, 15, 24" }, planet: "Venus" },
  7: { word: "the Seeker", core: "thoughtful, intuitive and spiritual. You look for deeper meaning and truth", strengths: ["Analytical mind", "Intuition", "Wisdom"], challenges: ["Isolation", "Overthinking", "Difficulty trusting"], career: "research, science, spirituality, IT, investigation and specialist work", love: "You need a partner who respects your need for space and enjoys deep conversations.", lucky: { day: "Monday", color: "Light green and white", numbers: "7, 16, 25" }, planet: "Ketu" },
  8: { word: "the Achiever", core: "ambitious, disciplined and powerful. You are built for responsibility and material success", strengths: ["Management ability", "Determination", "Financial sense"], challenges: ["Workaholism", "Delays that test patience", "Controlling tendencies"], career: "finance, law, administration, real estate, industry and large organisations", love: "You are a protective, committed partner who shows love through providing security.", lucky: { day: "Saturday", color: "Dark blue and black", numbers: "8, 17, 26" }, planet: "Saturn" },
  9: { word: "the Humanitarian", core: "compassionate, courageous and idealistic. You care about the greater good", strengths: ["Generosity", "Courage", "Wide vision"], challenges: ["Anger when hurt", "Impatience", "Taking on too much"], career: "medicine, defence, social work, teaching, law and service-oriented roles", love: "You are a warm, giving partner who needs shared values and loyalty.", lucky: { day: "Tuesday", color: "Red", numbers: "9, 18, 27" }, planet: "Mars" },
  11: { word: "the Inspirer (master number)", core: "highly intuitive, inspiring and spiritually aware — a stronger, more sensitive form of 2", strengths: ["Intuition", "Inspiration", "Spiritual insight"], challenges: ["Nervous tension", "Self-doubt", "High expectations"], career: "teaching, healing, counselling, arts and spiritual guidance", love: "You need a deep soul connection and a calm, supportive partner.", lucky: { day: "Monday", color: "Silver and white", numbers: "2, 11, 29" }, planet: "Moon" },
  22: { word: "the Master Builder (master number)", core: "visionary and highly capable — able to turn big dreams into reality, a stronger form of 4", strengths: ["Vision with practicality", "Leadership", "Organisation"], challenges: ["Pressure on yourself", "Burnout", "Fear of failure"], career: "large projects, architecture, administration, entrepreneurship and public service", love: "You need a partner who shares your long-term goals and supports your mission.", lucky: { day: "Saturday", color: "Blue", numbers: "4, 22" }, planet: "Rahu" },
  33: { word: "the Master Teacher (master number)", core: "deeply compassionate and service-minded — a higher form of 6 devoted to helping others", strengths: ["Compassion", "Guidance", "Selfless service"], challenges: ["Self-sacrifice", "Carrying others' burdens", "Perfectionism"], career: "teaching, healing, social service, counselling and spiritual work", love: "You give love generously and need a partner who cares for you in return.", lucky: { day: "Friday", color: "Pink and white", numbers: "6, 33" }, planet: "Venus" },
};
const num = (v) => NUMBERS[v] || NUMBERS[((v - 1) % 9) + 1];

/** @param {{ lifePath, destiny, soulUrge, personality }} r each { value } ; `name` optional */
export function numerologyReading(r, name = "") {
  const lp = num(r.lifePath.value);
  const ds = num(r.destiny.value);
  const su = num(r.soulUrge.value);
  const pe = num(r.personality.value);
  const first = name.trim().split(/\s+/)[0] || "You";
  const same = r.lifePath.value === r.destiny.value;
  return {
    title: "Your numerology reading",
    intro: `${first === "You" ? "Your" : `${first}'s`} numbers read together — what drives you, how you come across and where you shine.`,
    sections: [
      { heading: `Life Path ${r.lifePath.value} — ${lp.word}`, text: `Your life path shows that you are ${lp.core}. This is the main theme of your life journey and is ruled by ${lp.planet}.` },
      {
        heading: `Destiny ${r.destiny.value} — ${ds.word}`,
        text: same
          ? `Your destiny number is the same as your life path, which doubles its strength — your talents and your life purpose point in the same direction.`
          : `Your name gives you the talents of ${ds.word.replace(/ \(.*\)/, "")}: you are ${ds.core}. Combining this with your life path makes you both ${lp.strengths[0].toLowerCase()} and ${ds.strengths[0].toLowerCase()}.`,
      },
      { heading: `Heart's desire ${r.soulUrge.value}`, text: `Deep inside, what you truly want is linked to ${su.word.replace(/ \(.*\)/, "")} — you feel fulfilled through ${su.strengths.map((s) => s.toLowerCase()).slice(0, 2).join(" and ")}.` },
      { heading: `Personality ${r.personality.value}`, text: `Others first see you as ${pe.core.split(".")[0]}.` },
      { heading: "Career", text: lp.career === ds.career ? `You do best in ${lp.career}.` : `You do best in ${lp.career}. Your destiny number also supports ${ds.career}.` },
      { heading: "Love and relationships", text: `${lp.love} ${su.love !== lp.love ? su.love : ""}`.trim() },
      { heading: "Lucky for you", text: `Day: ${lp.lucky.day} · Colour: ${lp.lucky.color} · Numbers: ${lp.lucky.numbers}` },
    ],
    strengths: [...new Set([...lp.strengths, ...ds.strengths])].slice(0, 5),
    cautions: [...new Set([...lp.challenges, ...ds.challenges])].slice(0, 4),
    advice: "Numbers describe your natural tendencies, not fixed fate. Use your strengths consciously and work gently on the challenges — that is where real change happens.",
  };
}

// ---------------------------------------------------------------- Kundli
/**
 * @param {{ input: { name }, basic: { ascendant, moonSign, sunSign, nakshatra, nakshatraLord, manglik, marsHouse, gana }, dasha: [{ lord, start, end }] }} k
 * @param {{ nakshatra: (i) => string }} names
 */
export function kundliReading(k, names) {
  const b = k.basic;
  const asc = SIGN_PROFILES[b.ascendant];
  const moon = SIGN_PROFILES[b.moonSign];
  const first = k.input?.name?.trim().split(/\s+/)[0];
  const today = new Date().toISOString().slice(0, 10);
  const current = k.dasha?.find((d) => d.start <= today && today < d.end);
  const next = current ? k.dasha[k.dasha.indexOf(current) + 1] : null;
  const year = (d) => d?.slice(0, 4);

  const sections = [
    { heading: `${asc.name} ascendant — how you meet the world`, text: `Your ascendant (Lagna) is ${asc.name}, so you come across as ${asc.nature}. This shapes your personality, body and approach to life.` },
    { heading: `${moon.name} Moon — your mind and feelings`, text: `Your Moon sign (Rashi) is ${moon.name}. ${moon.emotion} In Vedic astrology this is the sign used for your daily horoscope.` },
    { heading: `${names.nakshatra(b.nakshatra)} nakshatra`, text: `You were born in ${names.nakshatra(b.nakshatra)} nakshatra: ${NAKSHATRA_NOTES[b.nakshatra]}. Its ruler ${PLANET_NAMES[b.nakshatraLord] ?? b.nakshatraLord} also started your dasha cycle.` },
  ];
  if (current) {
    sections.push({
      heading: `Now: ${PLANET_NAMES[current.lord]} Mahadasha (until ${year(current.end)})`,
      text: `You are in the ${PLANET_NAMES[current.lord]} period — ${DASHA_NOTES[current.lord]}${next ? ` From ${year(next.start)}, the ${PLANET_NAMES[next.lord]} period begins.` : ""}`,
    });
  }
  sections.push({ heading: "Career direction", text: `Your ascendant points towards ${asc.career.charAt(0).toLowerCase() + asc.career.slice(1)}` });
  sections.push({
    heading: "Love and marriage",
    text: b.ascendant === b.moonSign ? `${asc.love} With both your ascendant and Moon in ${asc.name}, this nature is especially strong in you.` : `${asc.love} Emotionally (${moon.name} Moon), ${moon.love.charAt(0).toLowerCase() + moon.love.slice(1)}`,
  });
  sections.push({
    heading: "Manglik",
    text: b.manglik
      ? `Mars is in your ${b.marsHouse}${["st", "nd", "rd"][b.marsHouse - 1] || "th"} house, so the chart is Manglik. This is very common and mainly matters for marriage matching — it is usually balanced by a Manglik partner, other placements, or simple remedies.`
      : "Your chart is not Manglik, so there is no Mangal dosha to consider for marriage matching.",
  });

  return {
    title: first ? `${first}'s kundli reading` : "Your kundli reading",
    intro: "A simple, plain-language reading of the key points in your birth chart.",
    sections,
    strengths: [...new Set([...asc.strengths, ...moon.strengths])].slice(0, 5),
    cautions: [...new Set([...asc.challenges, ...moon.challenges])].slice(0, 4),
    advice: "This is a general reading from the main points of your chart. For marriage, career or health decisions, an astrologer can read the full chart — houses, yogas, divisional charts and transits — for you.",
  };
}

// ---------------------------------------------------------------- Zodiac (Western sun sign)
const SLUGS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

export function zodiacReading(slug) {
  const s = SIGN_PROFILES[SLUGS.indexOf(slug)];
  if (!s) return null;
  return {
    title: `Being a ${s.name}`,
    intro: `What your sun sign says about your personality, love life and work.`,
    sections: [
      { heading: "Personality", text: `As a ${s.name}, you are ${s.nature}.` },
      { heading: "Love", text: s.love },
      { heading: "Career", text: `You shine in ${s.career.charAt(0).toLowerCase() + s.career.slice(1)}` },
      { heading: "Lucky for you", text: `Day: ${s.lucky.day} · Colour: ${s.lucky.color} · Numbers: ${s.lucky.numbers}` },
    ],
    strengths: s.strengths,
    cautions: s.challenges,
    advice: "Your sun sign shows your outer personality. In Vedic astrology your Moon sign (Rashi) matters even more — find it with a free Kundli.",
  };
}
