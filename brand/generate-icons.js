// Regenerate every brand asset from brand/logo-source.png.
// Usage (from the project root): node brand/generate-icons.js
const sharp = require("sharp");
const fs = require("fs");

const SRC = "brand/logo-source.png";
const DARK = "#1c0f07"; // brand dark brown (matches the logo's inner disc)
const PNG = { compressionLevel: 9, palette: true, quality: 90, effort: 10 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// The emblem's round badge (outer gold ring) without the decorative points — reads better at small sizes.
// Centre and radius in source pixels; adjust if the source artwork changes.
const MARK = { cx: 626, cy: 622, r: 568 };

async function roundMark() {
  const { cx, cy, r } = MARK;
  const d = 2 * r;
  const square = await sharp(SRC).extract({ left: cx - r, top: cy - r, width: d, height: d }).png().toBuffer();
  const mask = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`))
    .resize(d, d)
    .png()
    .toBuffer();
  return sharp(square).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}

const fit = (input, size) => sharp(input).resize(size, size, { fit: "contain", background: CLEAR }).png(PNG);

// Image centred on a solid square, `pad` = margin as a fraction of the tile.
async function onTile(input, size, pad, bg) {
  const inner = await fit(input, Math.round(size * (1 - 2 * pad))).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: inner, gravity: "center" }])
    .png(PNG);
}

// Minimal .ico writer: PNG-compressed entries (supported by every modern browser).
function ico(entries) {
  const header = Buffer.alloc(6 + 16 * entries.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = header.length;
  entries.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...entries.map((x) => x.data)]);
}

(async () => {
  const mark = await roundMark();

  // Full emblem: Google Organization logo
  await fit(SRC, 512).toFile("public/images/logo.png");
  // Round badge: header / footer (next/image resizes it)
  await fit(mark, 256).toFile("public/images/logo-mark.png");

  // PWA icons
  await fit(mark, 192).toFile("public/images/icon-192.png");
  await fit(mark, 512).toFile("public/images/icon-512.png");
  await (await onTile(mark, 512, 0.1, DARK)).toFile("public/images/icon-maskable-512.png");

  // Next.js file-convention icons
  await (await onTile(mark, 180, 0.04, DARK)).toFile("src/app/apple-icon.png");
  await fit(mark, 96).toFile("src/app/icon.png");
  const entries = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await fit(mark, size).toBuffer() })));
  fs.writeFileSync("src/app/favicon.ico", ico(entries));

  // Social share image 1200x630 (full emblem)
  const logo = await fit(SRC, 440).toBuffer();
  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fdba74"/><stop offset="1" stop-color="#fb8a3c"/></linearGradient>
    <radialGradient id="glow" cx="0.27" cy="0.5" r="0.45"><stop offset="0" stop-color="#fb8a3c" stop-opacity="0.28"/><stop offset="1" stop-color="#fb8a3c" stop-opacity="0"/></radialGradient></defs>
    <rect width="1200" height="630" fill="${DARK}"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <text x="580" y="270" font-family="Segoe UI, Arial, sans-serif" font-size="62" font-weight="700" fill="url(#w)">Astro-Kaal-Chakra</text>
    <text x="580" y="332" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#fde7d4">Talk to verified astrologers</text>
    <text x="580" y="372" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#fde7d4">Chat, call or video</text>
    <text x="580" y="440" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#fdba74">Free Kundli · Matching · Horoscope · Panchang</text>
  </svg>`;
  await sharp(Buffer.from(text)).composite([{ input: logo, left: 100, top: 95 }]).png(PNG).toFile("public/images/og-default.png");

  console.log("done");
})();
