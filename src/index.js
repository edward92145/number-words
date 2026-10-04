/**
 * number-words — convert non-negative integers to English words.
 *
 * This module is the package entry point. It re-exports the public converter
 * and a couple of internals that tests and power users may want to reach for.
 * Keeping the table constants exported lets callers build related formatters
 * without duplicating the word lists.
 */

export { toWords, tripleToWords, ONES_TEENS, TENS, SCALES } from "./core.js";
