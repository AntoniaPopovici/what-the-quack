import { describe, it, expect } from "vitest";
import { selectQuestion } from "./selectQuestion";
import { CATEGORIES, STAGE_ORDER } from "../data/questions";

const REGRESSION_ISOLATE_POOL = CATEGORIES.regression.stages.isolate;

describe("selectQuestion — relevance scoring", () => {
  it("prefers a question whose tags overlap with the notes over one that doesn't", () => {
    // "Did any dependency, config, or environment variable change
    // alongside your code?" is tagged dependency/package/config/env
    // variable — a strong match for notes about a dependency bump.
    const notes = "I think a dependency got bumped and now this breaks, not sure which package.";
    const results = new Set();
    for (let i = 0; i < 25; i++) {
      results.add(selectQuestion(REGRESSION_ISOLATE_POOL, notes, null).text);
    }
    expect(
      [...results].every((text) => /dependency|package|config/i.test(text))
    ).toBe(true);
  });

  it("falls back to uniform random when notes are empty", () => {
    const seen = new Set();
    for (let i = 0; i < 50; i++) {
      seen.add(selectQuestion(REGRESSION_ISOLATE_POOL, "", null).text);
    }
    // With 9 candidates and 50 draws, uniform random should surface
    // more than just one or two of them.
    expect(seen.size).toBeGreaterThan(3);
  });

  it("falls back to uniform random when notes don't overlap with any tags", () => {
    const notes = "purple elephants dancing on the moon";
    const seen = new Set();
    for (let i = 0; i < 50; i++) {
      seen.add(selectQuestion(REGRESSION_ISOLATE_POOL, notes, null).text);
    }
    expect(seen.size).toBeGreaterThan(3);
  });

  it("never returns the avoided question when the pool has other options", () => {
    const avoid = REGRESSION_ISOLATE_POOL[0].text;
    for (let i = 0; i < 30; i++) {
      const result = selectQuestion(REGRESSION_ISOLATE_POOL, "", avoid);
      expect(result.text).not.toBe(avoid);
    }
  });

  it("can return the only question in a single-item pool even if it's the one to avoid", () => {
    const singlePool = [REGRESSION_ISOLATE_POOL[0]];
    const result = selectQuestion(singlePool, "", singlePool[0].text);
    expect(result.text).toBe(singlePool[0].text);
  });
});

describe("selectQuestion — question pool integrity", () => {
  it("has at least the original 5 questions per category/stage after expansion", () => {
    for (const category of Object.values(CATEGORIES)) {
      for (const stage of STAGE_ORDER) {
        expect(category.stages[stage].length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it("gives every question at least one tag", () => {
    for (const category of Object.values(CATEGORIES)) {
      for (const stage of STAGE_ORDER) {
        for (const question of category.stages[stage]) {
          expect(question.tags.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("has no duplicate question text within the same category/stage", () => {
    for (const category of Object.values(CATEGORIES)) {
      for (const stage of STAGE_ORDER) {
        const texts = category.stages[stage].map((q) => q.text);
        expect(new Set(texts).size).toBe(texts.length);
      }
    }
  });
});
