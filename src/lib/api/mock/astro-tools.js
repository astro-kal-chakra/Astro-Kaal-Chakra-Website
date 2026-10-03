/**
 * MOCK astrology calculations for the free tools (Kundli, Matching, Panchang).
 *
 * ⚠️ NOT ACCURATE — for UI development only. Everything is deterministic from the input
 * (same birth details → same chart) and uses low-precision astronomical approximations
 * (mean sun / moon / node motion) so the output *looks* plausible. Mars, Mercury and Venus
 * are pseudo-random. The real calculations (Swiss Ephemeris, Lahiri ayanamsa, proper
 * timezone/DST handling) come from the backend — delete this file once it is live.
 *
 * Output uses language-neutral keys / indexes (sign 0-11, nakshatra 0-26, planet keys)
 * that the UI translates via the `tools.names.*` dictionary.
 */

const DAY = 86400000;
const YEAR = 365.25 * DAY;
const AYANAMSA = 24.1; // ≈ Lahiri for the 2000s
const J2000 = Date.UTC(2000, 0, 1, 12);
const NAK = 360 / 27;
const IST_OFFSET_MIN = 330;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const norm = (x) => ((x % 360) + 360) % 360;

export const PLANET_KEYS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];
const NAK_LORDS = ["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury"];
const DASHA_YEARS = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };
const GANA_CODES = "DMRMDMDDRRMMDRDRDRRMMDRRMMD";
const GANA = { D: "deva", M: "manushya", R: "rakshasa" };
const NADI = ["adi", "madhya", "antya", "antya", "madhya", "adi"];
const VARNA = ["kshatriya", "vaishya", "shudra", "brahmin"]; // by element of the moon sign
const VARNA_RANK = { brahmin: 4, kshatriya: 3, vaishya: 2, shudra: 1 };
const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

// ---------------------------------------------------------------- helpers

/** FNV-1a 32-bit string hash. */
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32) → () => [0, 1). */
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];
const iso = (ms) => new Date(ms).toISOString();
const isoDate = (ms) => iso(ms).slice(0, 10);

/** "YYYY-MM-DD" + "HH:MM" in IST → UTC ms. TODO(backend): real timezone/DST from the place. */
function birthInstant(date, time = "12:00") {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh || 0, mm || 0) - IST_OFFSET_MIN * 60000;
}

// Low-precision tropical longitudes (degrees). Good to ~1° for sun/moon.
const daysSinceJ2000 = (ms) => (ms - J2000) / DAY;
function sunTropical(ms) {
  const d = daysSinceJ2000(ms);
  const g = rad(357.529 + 0.98560028 * d);
  return norm(280.459 + 0.98564736 * d + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
}
function moonTropical(ms) {
  const d = daysSinceJ2000(ms);
  return norm(218.316 + 13.176396 * d + 6.289 * Math.sin(rad(134.963 + 13.064993 * d)));
}
const rahuTropical = (ms) => norm(125.04452 - 0.0529538083 * daysSinceJ2000(ms));
const jupiterTropical = (ms) => norm(34.35 + 0.08308529 * daysSinceJ2000(ms));
const saturnTropical = (ms) => norm(50.08 + 0.03345965 * daysSinceJ2000(ms));
const sidereal = (lon) => norm(lon - AYANAMSA);

function ascendantTropical(ms, lat, lng) {
  const d = daysSinceJ2000(ms);
  const ramc = rad(norm(280.46061837 + 360.98564736629 * d + lng));
  const eps = rad(23.4393);
  const phi = rad(lat);
  return norm(deg(Math.atan2(Math.cos(ramc), -Math.sin(ramc) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps))));
}

const nakshatraOf = (lon) => Math.floor(lon / NAK) % 27;
const padaOf = (lon) => Math.floor((lon % NAK) / (NAK / 4)) + 1;

// ---------------------------------------------------------------- kundli

/**
 * @param {{ name?: string, gender?: string, date: string, time: string, place: { lat: number, lng: number } }} input
 */
export function mockKundli(input) {
  const { date, time, place } = input;
  const lat = place?.lat ?? 28.61;
  const lng = place?.lng ?? 77.21;
  const ms = birthInstant(date, time);
  const rand = prng(hash(`${date}|${time}|${lat.toFixed(2)}|${lng.toFixed(2)}`));

  const sun = sidereal(sunTropical(ms));
  const moon = sidereal(moonTropical(ms));
  const rahu = sidereal(rahuTropical(ms));
  const asc = sidereal(ascendantTropical(ms, lat, lng));
  const ascSign = Math.floor(asc / 30);

  const longitudes = {
    sun,
    moon,
    mars: rand() * 360,
    mercury: norm(sun + (rand() * 2 - 1) * 27),
    jupiter: sidereal(jupiterTropical(ms) + (rand() * 2 - 1) * 8),
    venus: norm(sun + (rand() * 2 - 1) * 46),
    saturn: sidereal(saturnTropical(ms) + (rand() * 2 - 1) * 5),
    rahu,
    ketu: norm(rahu + 180),
  };
  const retroChance = { mars: 0.12, mercury: 0.18, jupiter: 0.3, venus: 0.08, saturn: 0.35 };

  const planets = PLANET_KEYS.map((key) => {
    const lon = longitudes[key];
    const sign = Math.floor(lon / 30);
    return {
      key,
      longitude: Number(lon.toFixed(4)),
      sign,
      degree: Number((lon % 30).toFixed(4)),
      nakshatra: nakshatraOf(lon),
      pada: padaOf(lon),
      house: ((sign - ascSign + 12) % 12) + 1,
      retrograde: key === "rahu" || key === "ketu" ? true : rand() < (retroChance[key] || 0),
    };
  });

  const moonP = planets[1];
  const marsP = planets[2];
  const elong = norm(moon - sun);
  const tithi = Math.floor(elong / 12);

  return {
    isMock: true,
    input: { name: input.name || "", gender: input.gender || "", date, time, place },
    basic: {
      ascendant: ascSign,
      ascendantDegree: Number((asc % 30).toFixed(4)),
      ascendantNakshatra: nakshatraOf(asc),
      moonSign: moonP.sign,
      sunSign: planets[0].sign,
      nakshatra: moonP.nakshatra,
      pada: moonP.pada,
      nakshatraLord: NAK_LORDS[moonP.nakshatra % 9],
      gana: GANA[GANA_CODES[moonP.nakshatra]],
      nadi: NADI[moonP.nakshatra % 6],
      varna: VARNA[moonP.sign % 4],
      tithi,
      paksha: tithi < 15 ? "shukla" : "krishna",
      manglik: MANGLIK_HOUSES.includes(marsP.house),
      marsHouse: marsP.house,
    },
    planets,
    dasha: vimshottari(moon, ms),
  };
}

/** Vimshottari mahadashas + antardashas from the moon's longitude (this part is the real rule). */
function vimshottari(moonLon, birthMs) {
  const nak = nakshatraOf(moonLon);
  const startIdx = nak % 9;
  const traversed = (moonLon % NAK) / NAK;
  let cursor = birthMs - traversed * DASHA_YEARS[NAK_LORDS[startIdx]] * YEAR;

  return Array.from({ length: 9 }, (_, i) => {
    const lordIdx = (startIdx + i) % 9;
    const lord = NAK_LORDS[lordIdx];
    const years = DASHA_YEARS[lord];
    const start = cursor;
    let sub = start;
    const antardashas = Array.from({ length: 9 }, (__, j) => {
      const subLord = NAK_LORDS[(lordIdx + j) % 9];
      const s = sub;
      sub += ((years * DASHA_YEARS[subLord]) / 120) * YEAR;
      return { lord: subLord, start: isoDate(s), end: isoDate(sub) };
    });
    cursor += years * YEAR;
    return { lord, years, start: isoDate(start), end: isoDate(cursor), antardashas };
  });
}

// ---------------------------------------------------------------- matching

const summarize = (k) => ({
  name: k.input.name,
  moonSign: k.basic.moonSign,
  nakshatra: k.basic.nakshatra,
  pada: k.basic.pada,
  gana: k.basic.gana,
  nadi: k.basic.nadi,
  varna: k.basic.varna,
  manglik: k.basic.manglik,
  marsHouse: k.basic.marsHouse,
});

const GANA_SCORE = (a, b) => {
  if (a === b) return 6;
  const pair = [a, b].sort().join("-");
  return { "deva-manushya": 5, "deva-rakshasa": 1, "manushya-rakshasa": 0 }[pair] ?? 0;
};

const taraGood = (from, to) => ![3, 5, 7].includes((((to - from + 27) % 27) + 1) % 9);

/** Ashtakoot Guna Milan. Varna, Tara, Gana, Bhakoot and Nadi follow the classic rules; Vashya, Yoni and Graha Maitri are mocked. */
export function mockMatching({ boy, girl }) {
  const kb = mockKundli(boy);
  const kg = mockKundli(girl);
  const b = summarize(kb);
  const g = summarize(kg);
  const rand = prng(hash(`${boy.date}|${boy.time}|${girl.date}|${girl.time}`));
  const signDist = ((g.moonSign - b.moonSign + 12) % 12) + 1;

  const kootas = [
    { key: "varna", max: 1, obtained: VARNA_RANK[b.varna] >= VARNA_RANK[g.varna] ? 1 : 0, boy: { type: "varna", value: b.varna }, girl: { type: "varna", value: g.varna } },
    { key: "vashya", max: 2, obtained: pick(rand, [0, 0.5, 1, 2, 2]), boy: null, girl: null },
    { key: "tara", max: 3, obtained: (taraGood(g.nakshatra, b.nakshatra) ? 1.5 : 0) + (taraGood(b.nakshatra, g.nakshatra) ? 1.5 : 0), boy: { type: "nakshatra", value: b.nakshatra }, girl: { type: "nakshatra", value: g.nakshatra } },
    { key: "yoni", max: 4, obtained: pick(rand, [0, 1, 2, 3, 4]), boy: null, girl: null },
    { key: "grahaMaitri", max: 5, obtained: b.moonSign === g.moonSign ? 5 : pick(rand, [0, 0.5, 1, 3, 4, 5]), boy: null, girl: null },
    { key: "gana", max: 6, obtained: GANA_SCORE(b.gana, g.gana), boy: { type: "gana", value: b.gana }, girl: { type: "gana", value: g.gana } },
    { key: "bhakoot", max: 7, obtained: [2, 12, 5, 9, 6, 8].includes(signDist) ? 0 : 7, boy: { type: "sign", value: b.moonSign }, girl: { type: "sign", value: g.moonSign } },
    { key: "nadi", max: 8, obtained: b.nadi === g.nadi ? 0 : 8, boy: { type: "nadi", value: b.nadi }, girl: { type: "nadi", value: g.nadi } },
  ];

  return {
    isMock: true,
    boy: b,
    girl: g,
    kootas,
    total: kootas.reduce((s, k) => s + k.obtained, 0),
    max: 36,
  };
}

// ---------------------------------------------------------------- panchang

/** Approximate sunrise/sunset (UTC ms) for a date + location. */
function sunTimes(baseUtcMs, lat, lng) {
  const start = Date.UTC(new Date(baseUtcMs).getUTCFullYear(), 0, 0);
  const n = Math.round((baseUtcMs - start) / DAY);
  const decl = rad(23.44 * Math.sin(rad((360 / 365) * (284 + n))));
  const phi = rad(lat);
  const cosW = (Math.sin(rad(-0.833)) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
  const w = deg(Math.acos(Math.min(1, Math.max(-1, cosW))));
  const B = rad((360 / 365) * (n - 81));
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutes
  const noon = 12 - lng / 15 - eot / 60; // UTC hours
  const h = 3600000;
  return { sunrise: baseUtcMs + (noon - w / 15) * h, sunset: baseUtcMs + (noon + w / 15) * h };
}

const RAHU_SEG = [7, 1, 6, 4, 5, 3, 2]; // Sun..Sat, 0-based eighth of the day
const YAMA_SEG = [4, 3, 2, 1, 0, 6, 5];
const GULIKA_SEG = [6, 5, 4, 3, 2, 1, 0];

/** Karana index (0-10: Bava…Vishti, Shakuni, Chatushpada, Naga, Kimstughna) from half-tithi 0-59. */
const karanaIndex = (k) => (k === 0 ? 10 : k >= 57 ? k - 50 : (k - 1) % 7);

/**
 * @param {{ date: string, place: { lat: number, lng: number, name?: string } }} p  date = "YYYY-MM-DD" (local)
 */
export function mockPanchang({ date, place }) {
  const lat = place?.lat ?? 28.61;
  const lng = place?.lng ?? 77.21;
  const [y, m, d] = date.split("-").map(Number);
  const base = Date.UTC(y, m - 1, d);
  const { sunrise, sunset } = sunTimes(base, lat, lng);

  const sun = sidereal(sunTropical(sunrise));
  const moon = sidereal(moonTropical(sunrise));
  const elong = norm(moon - sun);
  const yogaLon = norm(sun + moon);
  const at = (deltaDeg, speedPerDay) => iso(sunrise + (deltaDeg / speedPerDay) * DAY);

  const tithi = Math.floor(elong / 12);
  const nak = nakshatraOf(moon);
  const yoga = Math.floor(yogaLon / NAK);
  const half = Math.floor(elong / 6);

  const dayLen = sunset - sunrise;
  const part = dayLen / 8;
  const vaar = new Date(base).getUTCDay();
  const seg = (i) => ({ start: iso(sunrise + i * part), end: iso(sunrise + (i + 1) * part) });

  const dayStart = base - IST_OFFSET_MIN * 60000;
  const wrap = (t) => dayStart + ((((t - dayStart) % DAY) + DAY) % DAY);
  const moonrise = wrap(sunrise + (elong / 360) * 24.8 * 3600000);
  const moonset = wrap(moonrise + 12.4 * 3600000);

  return {
    isMock: true,
    date,
    place,
    vaar,
    tithi: { index: tithi, paksha: tithi < 15 ? "shukla" : "krishna", endsAt: at((tithi + 1) * 12 - elong, 12.19) },
    nakshatra: { index: nak, endsAt: at((nak + 1) * NAK - moon, 13.18) },
    yoga: { index: yoga, endsAt: at((yoga + 1) * NAK - yogaLon, 14.17) },
    karana: { index: karanaIndex(half), endsAt: at((half + 1) * 6 - elong, 12.19) },
    sunrise: iso(sunrise),
    sunset: iso(sunset),
    moonrise: iso(moonrise),
    moonset: iso(moonset),
    rahuKaal: seg(RAHU_SEG[vaar]),
    gulika: seg(GULIKA_SEG[vaar]),
    yamaganda: seg(YAMA_SEG[vaar]),
    abhijit: { start: iso(sunrise + (7 * dayLen) / 15), end: iso(sunrise + (8 * dayLen) / 15) },
  };
}
