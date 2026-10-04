import { test } from "node:test";
import assert from "node:assert/strict";

import { toWords, tripleToWords, ONES_TEENS, TENS, SCALES } from "../src/index.js";

test("constants are frozen arrays", () => {
  assert.ok(Object.isFrozen(ONES_TEENS));
  assert.ok(Object.isFrozen(TENS));
  assert.ok(Object.isFrozen(SCALES));
});

test("zero returns the literal word zero", () => {
  assert.equal(toWords(0), "zero");
});

test("single digits map directly to ONES_TEENS", () => {
  assert.equal(toWords(7), "seven");
});

test("teens use the irregular teen forms", () => {
  assert.equal(toWords(13), "thirteen");
  assert.equal(toWords(15), "fifteen");
  assert.equal(toWords(18), "eighteen");
});

test("exact tens have no trailing hyphen or ones word", () => {
  assert.equal(toWords(20), "twenty");
  assert.equal(toWords(40), "forty");
  assert.equal(toWords(90), "ninety");
});

test("compound tens are hyphenated", () => {
  assert.equal(toWords(21), "twenty-one");
  assert.equal(toWords(42), "forty-two");
  assert.equal(toWords(99), "ninety-nine");
});

test("hundreds combine hundreds place with remainder", () => {
  assert.equal(toWords(100), "one hundred");
  assert.equal(toWords(101), "one hundred one");
  assert.equal(toWords(115), "one hundred fifteen");
  assert.equal(toWords(345), "three hundred forty-five");
});

test("thousands skip empty inner groups", () => {
  assert.equal(toWords(1000), "one thousand");
  assert.equal(toWords(1001), "one thousand one");
  assert.equal(toWords(10000), "ten thousand");
  assert.equal(toWords(11000), "eleven thousand");
  assert.equal(toWords(123456), "one hundred twenty-three thousand four hundred fifty-six");
});

test("millions and billions compose in order", () => {
  assert.equal(toWords(1000000), "one million");
  assert.equal(toWords(1000001), "one million one");
  assert.equal(toWords(987654321),
    "nine hundred eighty-seven million six hundred fifty-four thousand three hundred twenty-one");
});

test("MAX_SAFE_INTEGER converts fully", () => {
  const max = Number.MAX_SAFE_INTEGER;
  assert.equal(
    toWords(max),
    "nine quadrillion seven trillion one hundred ninety-nine billion " +
    "two hundred fifty-four million seven hundred forty thousand nine hundred ninety-one"
  );
});

test("tripleToWords rejects out-of-range inputs", () => {
  assert.throws(() => tripleToWords(-1), RangeError);
  assert.throws(() => tripleToWords(1000), RangeError);
});

test("toWords rejects non-integer and unsafe inputs", () => {
  for (const bad of [3.5, "7", null, undefined, NaN, Infinity, -Infinity, -1]) {
    assert.throws(() => toWords(bad), TypeError);
  }
});
