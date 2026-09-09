import { tokenize } from "./tokenize";

/**
 * Relevance scoring for the "I'm still stuck" escape hatch.
 *
 * The main app never asks questions. You explain to a silent duck.
 * This only runs if explaining didn't get you there: given a bucket's
 * prompt pool and whatever you've written, it ranks prompts by how much
 * their tags overlap your own words, so the nudges you see connect to
 * the thing you're actually stuck on.
 */

/**
 * Build a stemmed token set for a prompt's tags. Cheap to recompute
 * per call at these pool sizes, so no build-time caching is needed.
 */
function questionTokenSet(question) {
  return new Set(tokenize(question.tags.join(" ")));
}

/**
 * Weighted term overlap between a prompt's tags and the user's notes.
 * Longer stemmed tokens tend to be more specific ("dependency" vs.
 * "test"), so they count a little extra.
 */
function scoreQuestion(question, notesTokenFreq) {
  const qTokens = questionTokenSet(question);
  let score = 0;
  for (const t of qTokens) {
    const freq = notesTokenFreq[t];
    if (freq) {
      const specificity = t.length >= 6 ? 1.5 : 1;
      score += freq * specificity;
    }
  }
  return score;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` prompts from `pool`, most relevant to `notesText` first.
 *
 * - No usable notes → a random spread, so repeat visits vary.
 * - Some tag overlap → the overlapping prompts, ranked, topped up with
 *   a random spread of the rest if there aren't enough that score.
 *
 * Always returns exactly `count` distinct prompts (or the whole pool if
 * it's smaller than `count`).
 */
export function pickTopRelevant(pool, notesText, count = 4) {
  const n = Math.min(count, pool.length);
  const notesTokens = tokenize(notesText || "");
  if (notesTokens.length === 0) return shuffle(pool).slice(0, n);

  const freq = {};
  for (const t of notesTokens) freq[t] = (freq[t] || 0) + 1;

  const scored = pool.map((q) => ({ q, score: scoreQuestion(q, freq) }));
  scored.sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0).map((s) => s.q);
  if (relevant.length >= n) return relevant.slice(0, n);

  const chosen = new Set(relevant);
  const filler = shuffle(pool.filter((q) => !chosen.has(q)));
  return [...relevant, ...filler].slice(0, n);
}
