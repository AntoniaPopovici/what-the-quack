import { tokenize } from "./tokenize";

/**
 * Build a stemmed token set for a question's tags once, on demand.
 * Cheap enough to recompute each call given the pool sizes here (≤6
 * questions per stage) — no need to precompute/cache at build time.
 */
function questionTokenSet(question) {
  return new Set(tokenize(question.tags.join(" ")));
}

/**
 * Score a question against the user's notes using weighted term
 * overlap: each tag-token that also appears in the notes contributes,
 * weighted a little extra if it's a rarer/more specific token (longer
 * stemmed tokens tend to be more specific than short ones like "test").
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

/**
 * Pick the next question from a stage's pool.
 *
 * - If there's no usable notes text yet, falls back to uniform random
 *   (minus whatever was just asked, to avoid immediate repeats).
 * - Otherwise scores every candidate by tag/notes overlap and picks
 *   randomly among the top-scoring tier, so relevance is respected but
 *   the flow doesn't feel robotic or fully deterministic.
 * - If nothing scores above zero (notes don't overlap with any tags),
 *   falls back to uniform random rather than forcing an irrelevant
 *   "best" match.
 */
export function selectQuestion(pool, notesText, avoidText) {
  const candidates = avoidText && pool.length > 1
    ? pool.filter((q) => q.text !== avoidText)
    : pool;

  const notesTokens = tokenize(notesText || "");
  if (notesTokens.length === 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const freq = {};
  for (const t of notesTokens) freq[t] = (freq[t] || 0) + 1;

  const scored = candidates.map((q) => ({
    q,
    score: scoreQuestion(q, freq),
  }));

  const maxScore = Math.max(...scored.map((s) => s.score));
  if (maxScore <= 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const top = scored.filter((s) => s.score >= maxScore * 0.75);
  return top[Math.floor(Math.random() * top.length)].q;
}
