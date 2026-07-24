// Rule-based signal dictionaries for classifying a free-text problem
// description into one of the bug categories — or flagging it as not a
// debugging problem at all (planning/ideation).
//
// Two kinds of signals, matched differently:
//   - phrases: matched as literal substrings against the normalized
//     (lowercased, punctuation-stripped) text. High precision, so they
//     carry more weight.
//   - stems: matched against stemmed tokens, so "crashed"/"crashing"/
//     "crashes" all hit the same signal. Lower weight individually
//     since they're less precise, but they add robustness.
//
// Weights are hand-tuned, not learned. Keep them roughly in the range
// 1–5; phrases should generally outweigh single stems since they're
// more specific.

// A handful of entries below are listed in more than one inflected
// form (e.g. "functi" and "function", "response" and "respons").
// That's not redundancy — the stemmer only does single-pass suffix
// stripping, so singular and plural forms of the same word can come
// out as different strings (stem("function") -> "functi" but
// stem("functions") -> "function"). Each variant here was verified
// against the actual stem() output for the word's common inflected
// forms; don't "clean up" one without checking what stem() produces
// first (see the comment atop tokenize.js).
export const CODE_VOCABULARY = {
  stems: [
    "error","bug","except","excepti","exception","crash","stack",
    "trace","null","undefin","nan","output","code","test","debug",
    "api","database","databas","queri","endpoint","compon","class",
    "loop","array","object","request","response","respons","respond",
    "function","functi","method","variabl","paramet","import","log",
    "console","runtim","syntax","compil","deploy","server","client",
    "render","state","prop","hook","async","await","promise","promis",
    "thread","process",
  ],
  weight: 1,
};

export const CATEGORY_SIGNALS = {
  regression: {
    phrases: [
      { text: "used to work", weight: 5 },
      { text: "worked before", weight: 5 },
      { text: "worked fine before", weight: 5 },
      { text: "stopped working", weight: 5 },
      { text: "it broke", weight: 4 },
      { text: "was working", weight: 4 },
      { text: "after i updated", weight: 4 },
      { text: "after updating", weight: 4 },
      { text: "after the update", weight: 4 },
      { text: "after upgrading", weight: 4 },
      { text: "since yesterday", weight: 3 },
      { text: "since the last", weight: 3 },
      { text: "after merging", weight: 4 },
      { text: "after i changed", weight: 3 },
      { text: "worked yesterday", weight: 4 },
    ],
    stems: [
      "broke","broken","regress","regression","rollback","revert",
      "upgrad","updat","deploy","merg","commit",
    ],
    stemWeight: 1,
  },

  neverWorked: {
    phrases: [
      { text: "never worked", weight: 5 },
      { text: "doesnt work at all", weight: 5 },
      { text: "not working at all", weight: 5 },
      { text: "first time", weight: 3 },
      { text: "just started", weight: 3 },
      { text: "just wrote", weight: 3 },
      { text: "trying to implement", weight: 3 },
      { text: "trying to write", weight: 3 },
      { text: "following the docs", weight: 3 },
      { text: "following a tutorial", weight: 3 },
      { text: "cant get it to work", weight: 4 },
      { text: "cant get this to work", weight: 4 },
    ],
    stems: [
      "never","new","beginn","learn","tutori","exampl","scratch",
      "imple","implement","attempt",
    ],
    stemWeight: 1,
  },

  intermittent: {
    phrases: [
      { text: "sometimes it", weight: 5 },
      { text: "sometimes fails", weight: 5 },
      { text: "happens sometimes", weight: 5 },
      { text: "not always", weight: 4 },
      { text: "once in a while", weight: 4 },
      { text: "cant reproduce", weight: 4 },
      { text: "hard to reproduce", weight: 4 },
      { text: "works most of the time", weight: 4 },
      { text: "race condition", weight: 5 },
      { text: "fails randomly", weight: 5 },
      { text: "randomly fails", weight: 5 },
      { text: "no clear pattern", weight: 4 },
    ],
    stems: [
      "sometim","random","occasion","flaki","flaky","intermitt",
      "inconsist","tim","concurr","race","thread","reproduc","pattern",
    ],
    stemWeight: 1,
  },

  silentWrong: {
    phrases: [
      { text: "wrong output", weight: 5 },
      { text: "wrong value", weight: 5 },
      { text: "wrong result", weight: 5 },
      { text: "no error", weight: 5 },
      { text: "without error", weight: 4 },
      { text: "doesnt throw", weight: 4 },
      { text: "silently fails", weight: 5 },
      { text: "off by one", weight: 4 },
      { text: "expected x but got", weight: 3 },
      { text: "returns the wrong", weight: 4 },
      { text: "unexpected result", weight: 4 },
      { text: "slightly off", weight: 3 },
      { text: "not accurate", weight: 3 },
      { text: "off from", weight: 3 },
      { text: "doesnt match", weight: 4 },
      { text: "does not match", weight: 4 },
    ],
    stems: [
      "wrong","incorrect","inaccur","mismatch","miscalcul","silent",
      "unexpect",
    ],
    stemWeight: 1,
  },

  offTopic: {
    phrases: [
      { text: "no idea how to", weight: 3 },
      { text: "dont know how to start", weight: 5 },
      { text: "dont know where to start", weight: 5 },
      { text: "how do i start", weight: 4 },
      { text: "how should i approach", weight: 4 },
      { text: "havent started", weight: 4 },
      { text: "havent written any code", weight: 5 },
      { text: "no code yet", weight: 5 },
      { text: "before writing any code", weight: 4 },
      { text: "want to build", weight: 3 },
      { text: "want to create", weight: 3 },
      { text: "thinking about building", weight: 4 },
      { text: "project idea", weight: 4 },
      { text: "random app", weight: 3 },
      { text: "app idea", weight: 4 },
      { text: "idk how to approach", weight: 4 },
      { text: "not sure how to approach", weight: 4 },
    ],
    // Deliberately narrow: bare "start", "begin", "approach", and
    // "idea" used to be in this list, but they're common in ordinary
    // bug reports ("crashes at the start of the function", "not sure
    // how to approach this null check", "no idea why this fails") —
    // exactly the kind of generic word that fires on both offTopic
    // and real bug descriptions. The multi-word phrases above already
    // capture the genuine "haven't started coding" / "how do I
    // approach this" signal with much better precision; rely on those
    // instead of the bare stems. Think twice before re-adding any of
    // them.
    stems: ["plan","brainstorm","concept","project"],
    stemWeight: 1,
  },
};

export const CATEGORY_KEYS = ["regression", "neverWorked", "intermittent", "silentWrong"];
