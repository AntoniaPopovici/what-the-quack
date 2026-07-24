// Ad-hoc stress-test runner for the classifier. Not part of the build
// or test suite — run manually with `node scripts/stress-test-classify.mjs`
// after touching src/nlp/signals.js to eyeball before/after behavior.
// The actual regression protection lives in src/nlp/classify.test.js.
//
// Loaded via Vite's SSR module API (rather than plain Node ESM)
// because src/nlp/*.js uses extensionless relative imports, which
// Vite/bundlers resolve but Node's own resolver doesn't.

import { createServer } from "vite";

const server = await createServer({ configFile: false, root: process.cwd(), logLevel: "silent" });
const { classify } = await server.ssrLoadModule("/src/nlp/classify.js");
const { ALL_LABELED_CASES, AMBIGUOUS_CASES, REAL_BUG_WITH_PLANNING_WORDS_CASES } =
  await server.ssrLoadModule("/src/nlp/classify.fixtures.js");
await server.close();

function resultLabel(result) {
  if (result.isOffTopic) return "offTopic";
  return result.best;
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

let pass = 0;
let fail = 0;

console.log("=== Labeled cases ===\n");
for (const { text, expected } of ALL_LABELED_CASES) {
  const result = classify(text);
  const actual = resultLabel(result);
  const ok = actual === expected;
  ok ? pass++ : fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  expected=${String(expected).padEnd(12)} actual=${String(actual).padEnd(12)} conf=${result.confidence.toFixed(2)}  "${truncate(text, 70)}"`
  );
  if (!ok) {
    console.log(`      scores: ${JSON.stringify(result.scores)}`);
    console.log(`      matched: ${JSON.stringify(result.matched)}`);
  }
}

console.log(`\n${pass}/${pass + fail} labeled cases passed.\n`);

console.log("=== Real bugs containing offTopic-flavored words (must NOT be offTopic) ===\n");
let planPass = 0;
let planFail = 0;
for (const { text } of REAL_BUG_WITH_PLANNING_WORDS_CASES) {
  const result = classify(text);
  const ok = !result.isOffTopic;
  ok ? planPass++ : planFail++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  isOffTopic=${result.isOffTopic}  best=${String(result.best).padEnd(12)}  "${truncate(text, 70)}"`
  );
}
console.log(`\n${planPass}/${planPass + planFail} passed.\n`);

console.log("=== Ambiguous cases (not scored, just reported) ===\n");
for (const { text, expected } of AMBIGUOUS_CASES) {
  const result = classify(text);
  const actual = resultLabel(result);
  console.log(
    `guess=${String(expected).padEnd(12)} actual=${String(actual).padEnd(12)} conf=${result.confidence.toFixed(2)}  "${truncate(text, 70)}"`
  );
  console.log(`   scores: ${JSON.stringify(result.scores)}`);
}
