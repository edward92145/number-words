# number-words

Convert a non-negative integer to its English words: `42` → `"forty-two"`. ESM only, zero runtime dependencies.

```js
import { toWords } from "number-words";

toWords(0);        // "zero"
toWords(15);       // "fifteen"
toWords(345);      // "three hundred forty-five"
toWords(1000001);  // "one million one"
toWords(Number.MAX_SAFE_INTEGER);
// "nine quadrillion fifteen trillion three hundred seventy-two billion ..."
```

## Why

Check-writing, human-readable IDs, educational tooling, and audit logs all want a stable text form of an integer. This library does exactly that and nothing else: no currencies, no ordinals, no locale negotiation. Keeping the surface small means the output is predictable and the code stays short enough to audit.

## Decisions

- **Short scale.** A billion is a thousand million, a trillion a thousand billion. This matches modern American and most international English usage.
- **No "and".** `345` reads `"three hundred forty-five"`, not `"three hundred and forty-five"`. The placement of "and" varies by dialect (British usage inserts it; American style guides often don't). Picking one keeps output deterministic; we picked the form without "and".
- **Hyphenated compounds.** `"twenty-one"`, `"ninety-nine"`. Standard American style.
- **Non-negative safe integers only.** Inputs outside `0..Number.MAX_SAFE_INTEGER` throw a `TypeError`. Negative numbers, decimals, and fractions are out of scope; their word forms need extra conventions ("negative", "point", fractional digits) that belong in a richer formatter, not here.

## Edge you will hit

`Number.MAX_SAFE_INTEGER` (2^53 − 1) is the hard ceiling. Anything larger is not representable as an exact integer in JavaScript and will be rejected, not silently rounded. If you need larger values, pass strings into a BigInt-aware library instead.

The exported names are: `toWords`, `tripleToWords`, `ONES_TEENS`, `TENS`, `SCALES`. `toWords` is the function most callers want; the rest are exposed for callers building related formatters.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

