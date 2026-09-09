/**
 * The "I'm still stuck" escape hatch.
 *
 * This is not the duck talking. The duck never talks. It's a short list
 * of prompts, picked for relevance to what you've already written, to
 * get you articulating again. Read them, then go back to explaining.
 */
export default function StuckPrompts({ prompts, onBack }) {
  return (
    <div className="stuck">
      <p className="stuck-title">
        This isn't the duck. Just a few things to try saying out loud:
      </p>
      <ul className="stuck-list">
        {prompts.map((p, i) => (
          <li className="stuck-item" key={i}>
            {p}
          </li>
        ))}
      </ul>
      <button className="stuck-back" onClick={onBack}>
        back to explaining
      </button>
    </div>
  );
}
