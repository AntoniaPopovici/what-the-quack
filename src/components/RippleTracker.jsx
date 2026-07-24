import { STAGE_ORDER, STAGE_LABELS } from "../data/questions";

/**
 * Shows progress through the four debugging stages as pond ripples
 * rather than numbered steps — order matters here (you can't verify
 * before you isolate) so it's a real sequence, not decoration.
 */
export default function RippleTracker({ stageIndex }) {
  return (
    <div className="ripples" aria-hidden="true">
      {STAGE_ORDER.map((key, i) => (
        <div
          className={i === stageIndex ? "ripple-unit is-active" : "ripple-unit"}
          key={key}
        >
          <div
            className="ripple-dot"
            style={{
              background: i <= stageIndex ? "var(--duck)" : "transparent",
              borderColor: i <= stageIndex ? "var(--duck)" : "var(--pond-600)",
            }}
          />
          <span
            className="ripple-label"
            style={{ color: i === stageIndex ? "var(--cream)" : "var(--cream-dimmer)" }}
          >
            {STAGE_LABELS[key]}
          </span>
        </div>
      ))}
    </div>
  );
}
