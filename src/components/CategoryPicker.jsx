import { useMemo, useState } from "react";
import { CATEGORIES } from "../data/questions";
import { classify } from "../nlp/classify";

const MIN_CHARS_FOR_SUGGESTION = 12;

/**
 * First screen: describe the problem, get a suggested category (via
 * rule-based classification, not AI — see src/nlp/classify.js), then
 * confirm or override by picking any category directly.
 */
export default function CategoryPicker({ onPick }) {
  const [description, setDescription] = useState("");

  const result = useMemo(() => classify(description), [description]);

  const showSuggestion =
    description.trim().length >= MIN_CHARS_FOR_SUGGESTION && !result.isOffTopic && result.best;

  const showOffTopicNote =
    description.trim().length >= MIN_CHARS_FOR_SUGGESTION && result.isOffTopic;

  return (
    <div className="category-picker">
      <p className="category-prompt">What's going on?</p>

      <textarea
        className="notes description-input"
        rows={3}
        placeholder="describe the problem — what's happening, what you expected…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {showOffTopicNote && (
        <p className="offtopic-note">
          This sounds more like a planning question than a bug — this tool
          works best once you have code that's actually misbehaving. You can
          still pick a category below if you want to give it a try.
        </p>
      )}

      <div className="category-grid">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            className={
              "category-btn" +
              (showSuggestion && key === result.best ? " category-btn-suggested" : "")
            }
            onClick={() => onPick(key, description)}
          >
            <span className="category-label">
              {cat.label}
              {showSuggestion && key === result.best && (
                <span className="category-suggested-tag">suggested</span>
              )}
            </span>
            <span className="category-hint">{cat.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
