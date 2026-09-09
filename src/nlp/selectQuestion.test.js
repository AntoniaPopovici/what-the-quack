import { describe, it, expect } from "vitest";
import { pickTopRelevant } from "./selectQuestion";
import { CATEGORIES } from "../data/questions";

const REGRESSION = CATEGORIES.regression.questions;

describe("pickTopRelevant — relevance", () => {
  it("leads with a tag-relevant prompt when the notes overlap", () => {
    const notes = "a dependency got bumped and now this breaks, not sure which package";
    const top = pickTopRelevant(REGRESSION, notes, 4);
    expect(/depend|package|config|version/i.test(top[0].tags.join(" "))).toBe(true);
  });

  it("returns exactly `count` prompts", () => {
    expect(pickTopRelevant(REGRESSION, "anything at all", 3)).toHaveLength(3);
    expect(pickTopRelevant(REGRESSION, "", 5)).toHaveLength(5);
  });

  it("returns distinct prompts", () => {
    const texts = pickTopRelevant(REGRESSION, "dependency config commit deploy", 5).map((q) => q.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("falls back to a random spread when nothing matches", () => {
    const seen = new Set();
    for (let i = 0; i < 40; i++) {
      for (const q of pickTopRelevant(REGRESSION, "purple elephants on the moon", 4)) {
        seen.add(q.text);
      }
    }
    expect(seen.size).toBeGreaterThan(6);
  });

  it("handles empty notes without throwing", () => {
    expect(() => pickTopRelevant(REGRESSION, "", 4)).not.toThrow();
    expect(pickTopRelevant(REGRESSION, "", 4)).toHaveLength(4);
  });

  it("never returns more than the pool holds", () => {
    const tiny = REGRESSION.slice(0, 2);
    expect(pickTopRelevant(tiny, "anything", 5)).toHaveLength(2);
  });
});

describe("prompt pool integrity", () => {
  it("gives every category a flat questions array of a decent size", () => {
    for (const category of Object.values(CATEGORIES)) {
      expect(Array.isArray(category.questions)).toBe(true);
      expect(category.questions.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("gives every prompt at least one tag", () => {
    for (const category of Object.values(CATEGORIES)) {
      for (const q of category.questions) expect(q.tags.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate prompt text within a category", () => {
    for (const category of Object.values(CATEGORIES)) {
      const texts = category.questions.map((q) => q.text);
      expect(new Set(texts).size).toBe(texts.length);
    }
  });
});
