/**
 * Core integer-to-English-words conversion.
 *
 * Scope is deliberately narrow: non-negative integers up to Number.MAX_SAFE_INTEGER.
 * Negative numbers, fractions, and decimals are out of scope and rejected with a
 * TypeError. Supporting them would require syntactic conventions ("negative",
 * "point", "and") whose formatting varies by dialect, and the README states one
 * interpretation so tests stay honest.
 */

/**
 * Words for the values 0..19.
 *
 * Kept as a dense array indexed by value because the indices are a contiguous
 * integer range — an object would only add lookup noise.
 */
export const ONES_TEENS = Object.freeze([
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
]);

/**
 * Tens-place words. Index 0 and 1 are unused (0..9 handled by ONES_TEENS),
 * so the array lines up directly with the tens digit: index 2 -> "twenty".
 */
export const TENS = Object.freeze([
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
]);

/**
 * Scale names for each group of three digits. Index 0 is the ones group and is
 * represented by the empty string so no suffix is appended. Each subsequent
 * entry applies to a group one thousand times larger than the last, matching
 * the short-scale naming used in most English-speaking countries today.
 */
export const SCALES = Object.freeze([
  "", "thousand", "million", "billion", "trillion", "quadrillion",
]);

/**
 * Largest value this library will accept. Number.MAX_SAFE_INTEGER (2^53 - 1)
 * is the biggest integer every JS number can represent exactly; beyond it,
 * integer arithmetic silently loses precision and the input is already
 * ambiguous, so refusing it is safer than producing words for a different
 * nearby value.
 */
const MAX_INPUT = Number.MAX_SAFE_INTEGER;

/**
 * Validate the input and normalize it to a safe integer.
 *
 * @param {*} value - The value to convert.
 * @returns {number} A non-negative safe integer.
 * @throws {TypeError} If the value is not a safe, non-negative integer.
 */
function validate(value) {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new TypeError("number-words: input must be a safe integer");
  }
  if (value < 0) {
    throw new TypeError("number-words: input must be non-negative");
  }
  // Guard against values that are safe integers but exceed our supported ceiling.
  if (value > MAX_INPUT) {
    throw new TypeError("number-words: input exceeds Number.MAX_SAFE_INTEGER");
  }
  return value;
}

/**
 * Convert a value in the range 0..999 to words.
 *
 * Pre-condition (enforced by the caller): n is an integer in [0, 999].
 * Returns "zero" only for the literal value 0 — the top-level converter
 * special-cases 0 so this function never sees it in a multi-group number.
 *
 * @param {number} n - Integer 0..999.
 * @returns {string} The English words for n.
 */
export function tripleToWords(n) {
  // Caller guarantees the range; this is defensive against accidental misuse
  // rather than a documented public contract.
  if (n < 0 || n > 999 || !Number.isInteger(n)) {
    throw new RangeError("tripleToWords: expected integer in 0..999");
  }

  const parts = [];
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  if (hundreds > 0) {
    parts.push(`${ONES_TEENS[hundreds]} hundred`);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(ONES_TEENS[remainder]);
    } else {
      const tensDigit = Math.floor(remainder / 10);
      const onesDigit = remainder % 10;
      if (onesDigit > 0) {
        parts.push(`${TENS[tensDigit]}-${ONES_TEENS[onesDigit]}`);
      } else {
        parts.push(TENS[tensDigit]);
      }
    }
  }

  return parts.join(" ");
}

/**
 * Convert a non-negative integer to its English word representation.
 *
 * Uses short-scale naming (million, billion, trillion, ...) and hyphenates
 * the compound tens-place ("twenty-one"). Does not insert "and" anywhere —
 * a deliberate choice documented in the README, since "and" placement is
 * dialect-dependent and would make the output non-deterministic across
 * reasonable readings of the brief.
 *
 * @param {number} n - A non-negative safe integer.
 * @returns {string} The English words for n.
 * @throws {TypeError} If n is not a non-negative safe integer.
 */
export function toWords(n) {
  const value = validate(n);

  if (value === 0) {
    return ONES_TEENS[0]; // "zero"
  }

  // Split into base-1000 groups, least significant first.
  const groups = [];
  let remaining = value;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  if (groups.length > SCALES.length) {
    // Number.MAX_SAFE_INTEGER has 16 digits, so at most 6 groups (ones
    // through quadrillion). This branch is unreachable for safe integers
    // but is kept as a structural guard in case SCALES is shortened later.
    throw new RangeError("number-words: value too large for known scale names");
  }

  const pieces = [];
  // Walk most-significant group first so the output reads left to right.
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) {
      // Skip empty groups like the thousands place in 1,000,001.
      continue;
    }
    const words = tripleToWords(g);
    const scale = SCALES[i];
    if (scale === "") {
      pieces.push(words);
    } else {
      pieces.push(`${words} ${scale}`);
    }
  }

  return pieces.join(" ");
}
