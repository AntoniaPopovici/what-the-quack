import { normalize, tokenize, termFreq } from "./tokenize";
import { CATEGORY_SIGNALS, CODE_VOCABULARY, CATEGORY_KEYS } from "./signals";

/**
 * Score one category's signals against a piece of text.
 *
 * - Phrase signals are matched as substrings on the normalized text
 *   (order-sensitive, catches things single-token matching can't,
 *   e.g. "used to work").
 * - Stem signals are matched against the stemmed token *set* of the
 *   text (order-insensitive, catches inflected forms).
 *
 * Returns a raw numeric score — not yet normalized against other
 * categories.
 */
function scoreCategory(normText, tokenSet, signals) {
  let score = 0;
  const matched = [];

  for (const { text, weight } of signals.phrases || []) {
    if (normText.includes(text)) {
      score += weight;
      matched.push(text);
    }
  }

  for (const s of signals.stems || []) {
    if (tokenSet.has(s)) {
      score += signals.stemWeight || 1;
      matched.push(s);
    }
  }

  return { score, matched };
}

/**
 * Classify a free-text problem description.
 *
 * Returns:
 *   {
 *     scores: { regression, neverWorked, intermittent, silentWrong, offTopic },
 *     matched: { ...same keys, arrays of the signals that fired },
 *     best: categoryKey | null,     // best bug category, ignoring offTopic
 *     isOffTopic: boolean,          // true if this reads like planning/ideation
 *     confidence: number,           // 0..1, how much the top score clears the rest
 *     hasCodeVocabulary: boolean,   // true if generic dev/debugging terms are present
 *   }
 *
 * "isOffTopic" is a soft signal, not a hard gate — the UI uses it to
 * show a gentle note, never to block category selection.
 */
export function classify(text) {
  const normText = normalize(text);
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);
  const freq = termFreq(tokens);

  const scores = {};
  const matched = {};

  for (const key of [...CATEGORY_KEYS, "offTopic"]) {
    const { score, matched: m } = scoreCategory(normText, tokenSet, CATEGORY_SIGNALS[key]);
    scores[key] = score;
    matched[key] = m;
  }

  let codeScore = 0;
  for (const s of CODE_VOCABULARY.stems) {
    if (freq[s]) codeScore += freq[s] * CODE_VOCABULARY.weight;
  }
  const hasCodeVocabulary = codeScore >= 2;

  // Code vocabulary is real evidence this is an actual bug, not just
  // an idea — pull the offTopic score down proportionally instead of
  // trusting planning-flavored words ("start", "approach") in
  // isolation, since those also show up in ordinary bug reports
  // ("not sure how to approach this null check").
  scores.offTopic = Math.max(0, scores.offTopic - codeScore * 1.5);

  const bugEntries = CATEGORY_KEYS.map((k) => [k, scores[k]]);
  bugEntries.sort((a, b) => b[1] - a[1]);
  const [bestKey, bestScore] = bugEntries[0];
  const secondScore = bugEntries[1] ? bugEntries[1][1] : 0;

  // A tie between the top two categories is genuinely ambiguous —
  // without this check, ties silently resolved in favor of whichever
  // category happens to come first in CATEGORY_KEYS (always
  // "regression"), which is an arbitrary implementation detail, not a
  // real signal that regression is more likely.
  const best = bestScore > 0 && bestScore > secondScore ? bestKey : null;
  const spread = bestScore + secondScore;
  const confidence = spread > 0 ? (bestScore - secondScore) / spread : 0;

  // Require a minimum surviving score rather than a hard "any code
  // vocabulary at all disqualifies offTopic" gate. The old boolean
  // gate over-corrected: a genuine planning message that happens to
  // mention two ordinary dev words (e.g. "plan out the database
  // schema before writing any code" — "database" + "code") was
  // getting pulled out of offTopic entirely just for crossing the
  // hasCodeVocabulary threshold, even though its offTopic evidence
  // was still strong after the proportional discount. A floor lets
  // strong offTopic evidence win even alongside some code vocabulary,
  // while weak offTopic evidence (e.g. a bug report that merely says
  // "not sure how to approach this null check") still gets discounted
  // away, same as before.
  const MIN_OFFTOPIC_SCORE = 2;
  const isOffTopic =
    scores.offTopic >= MIN_OFFTOPIC_SCORE &&
    scores.offTopic >= bestScore &&
    text.trim().length > 0;

  return {
    scores,
    matched,
    best,
    isOffTopic,
    confidence,
    hasCodeVocabulary,
  };
}
