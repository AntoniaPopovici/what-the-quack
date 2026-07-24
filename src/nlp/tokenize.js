// Small, dependency-free text-processing primitives.
//
// This is deliberately NOT a machine-learning model — it's classic
// rule-based NLP: normalize, tokenize, strip stopwords, stem. That's
// enough to do reliable keyword/phrase matching without any network
// call, API key, or bundle-size cost.

const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","so","because","as","of",
  "at","by","for","with","about","against","between","into","through",
  "during","before","after","above","below","to","from","up","down",
  "in","out","on","off","over","under","again","further","is","are",
  "was","were","be","been","being","have","has","had","having","do",
  "does","did","doing","i","me","my","we","our","you","your","it","its",
  "this","that","these","those","not","no","nor","can","will","just",
  "should","now","also","really","very","get","getting","got","im",
  "ive","dont","doesnt","didnt","cant","wont","there","here","when",
  "where","why","how","what","which","who","whom",
]);

/**
 * Lowercase, strip punctuation (keep letters/digits/spaces), collapse
 * whitespace. Used both for phrase matching (on the full string) and
 * as the first step before tokenizing.
 */
export function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Minimal suffix-stripping stemmer. Not a full Porter stemmer, but
 * handles the common English inflections well enough that "crashes",
 * "crashed", "crashing" and "crash" all collapse to the same stem for
 * keyword matching purposes.
 */
export function stem(word) {
  let w = word;
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("edly")) w = w.slice(0, -4);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith("tion")) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 5 && w.endsWith("ness")) w = w.slice(0, -4);
  else if (w.length > 5 && w.endsWith("ment")) w = w.slice(0, -4);
  else if (w.length > 4 && w.endsWith("ly")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("es")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  return w;
}

/**
 * Full pipeline: normalize -> split -> drop stopwords/short tokens -> stem.
 * Returns an array of stemmed content tokens.
 */
export function tokenize(text) {
  const norm = normalize(text);
  if (!norm) return [];
  return norm
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

/**
 * Term-frequency map from a token array: { token: count }.
 */
export function termFreq(tokens) {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  return freq;
}
