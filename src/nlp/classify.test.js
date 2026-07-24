import { describe, it, expect } from "vitest";
import { classify } from "./classify";
import {
  REGRESSION_CASES,
  NEVER_WORKED_CASES,
  INTERMITTENT_CASES,
  SILENT_WRONG_CASES,
  OFF_TOPIC_CASES,
  REAL_BUG_WITH_PLANNING_WORDS_CASES,
} from "./classify.fixtures";

function resultLabel(result) {
  return result.isOffTopic ? "offTopic" : result.best;
}

describe("classify — regression", () => {
  for (const text of REGRESSION_CASES) {
    it(`classifies: "${text}"`, () => {
      expect(resultLabel(classify(text))).toBe("regression");
    });
  }
});

describe("classify — neverWorked", () => {
  for (const text of NEVER_WORKED_CASES) {
    it(`classifies: "${text}"`, () => {
      expect(resultLabel(classify(text))).toBe("neverWorked");
    });
  }
});

describe("classify — intermittent", () => {
  for (const text of INTERMITTENT_CASES) {
    it(`classifies: "${text}"`, () => {
      expect(resultLabel(classify(text))).toBe("intermittent");
    });
  }
});

describe("classify — silentWrong", () => {
  for (const text of SILENT_WRONG_CASES) {
    it(`classifies: "${text}"`, () => {
      expect(resultLabel(classify(text))).toBe("silentWrong");
    });
  }
});

describe("classify — offTopic (planning/ideation)", () => {
  for (const text of OFF_TOPIC_CASES) {
    it(`flags as offTopic: "${text}"`, () => {
      expect(classify(text).isOffTopic).toBe(true);
    });
  }
});

describe("classify — real bugs that use offTopic-flavored words", () => {
  // These describe an actual, already-written piece of misbehaving
  // code, but happen to contain words ("approach", "start", "build",
  // "no idea how to") that also appear in the offTopic dictionary.
  // The bug category isn't asserted — a couple of these are lexically
  // thin enough that `best` legitimately comes back null, and that's
  // a safe outcome (the UI just falls back to manual category
  // choice). What must never happen is isOffTopic being true, since
  // that actively misleads the user with a wrong "this looks like
  // planning" note on a real bug.
  for (const { text } of REAL_BUG_WITH_PLANNING_WORDS_CASES) {
    it(`is NOT offTopic: "${text}"`, () => {
      expect(classify(text).isOffTopic).toBe(false);
    });
  }
});

describe("classify — edge cases", () => {
  it("returns no category and is not offTopic for empty text", () => {
    const result = classify("");
    expect(result.best).toBeNull();
    expect(result.isOffTopic).toBe(false);
  });

  it("returns no category for whitespace-only text", () => {
    const result = classify("   ");
    expect(result.best).toBeNull();
    expect(result.isOffTopic).toBe(false);
  });

  it("resolves a close (non-tied) race to the actually-higher scorer", () => {
    // "used to work" (regression, weight 5) vs "sometimes it" phrase +
    // "sometim" stem (intermittent, weight 5 + 1 = 6).
    const result = classify("It used to work but now sometimes it crashes, not sure why.");
    expect(result.best).toBe("intermittent");
  });

  it("returns no category on a genuine tie, rather than favoring whichever category is listed first", () => {
    // "broke" (regression stem, weight 1) vs "flaky" (intermittent
    // stem, weight 1) — an exact 1-1 tie. Without the tie-break fix,
    // this silently resolved to "regression" just because it's first
    // in CATEGORY_KEYS, not because of any real signal.
    const result = classify("The build broke, but it might just be flaky.");
    expect(result.best).toBeNull();
    expect(result.confidence).toBe(0);
  });
});
