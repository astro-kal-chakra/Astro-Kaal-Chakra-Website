/**
 * Pythagorean numerology — real calculations, client-side only.
 * Letters A–Z map to 1–9 in sequence (A=1 … I=9, J=1 …). Master numbers 11, 22, 33 are kept.
 */
const MASTER = [11, 22, 33];
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export const letterValue = (ch) => ((ch.charCodeAt(0) - 65) % 9) + 1;

const digitSum = (n) => String(n).split("").reduce((s, d) => s + Number(d), 0);

/** Reduce to 1–9 keeping master numbers. Returns the chain, e.g. 38 → [38, 11]. */
export function reduceChain(n) {
  const chain = [n];
  while (n > 9 && !MASTER.includes(n)) {
    n = digitSum(n);
    chain.push(n);
  }
  return chain;
}

export const reduce = (n) => reduceChain(n).at(-1);

/** Only Latin letters count; returns null when the name has none (e.g. typed in Devanagari). */
export const normalizeName = (name = "") => {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  return letters.length ? letters : null;
};

const describe = (total) => reduceChain(total).join(" → ");

function fromLetters(letters, filter) {
  const picked = letters.split("").filter(filter);
  const total = picked.reduce((s, ch) => s + letterValue(ch), 0);
  return { value: reduce(total), steps: picked.length ? `${picked.map(letterValue).join("+")} = ${describe(total)}` : "0" };
}

/** Life path: reduce month, day and year separately, then add and reduce. */
export function lifePath(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const parts = [reduce(m), reduce(d), reduce(digitSum(y))];
  const total = parts.reduce((a, b) => a + b, 0);
  return { value: reduce(total), steps: `${parts.join("+")} = ${describe(total)}` };
}

/**
 * @returns {{ lifePath, destiny, soulUrge, personality } | null} each { value, steps }
 */
export function calculateNumerology(name, dateStr) {
  const letters = normalizeName(name);
  if (!letters || !dateStr) return null;
  return {
    lifePath: lifePath(dateStr),
    destiny: fromLetters(letters, () => true),
    soulUrge: fromLetters(letters, (ch) => VOWELS.has(ch)),
    personality: fromLetters(letters, (ch) => !VOWELS.has(ch)),
  };
}

export const isMaster = (n) => MASTER.includes(n);
