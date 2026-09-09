/**
 * End state. You found the bug by explaining it, which is the method
 * working as intended. Hand the explanation back so it can be re-read
 * or pasted somewhere useful.
 */
export default function SolvedScreen({ intent, walkthrough, onRestart }) {
  return (
    <div className="solved">
      <p className="solved-head">…and the duck said nothing.</p>
      <p className="solved-lead">
        You talked your way to it. Here is what you told the duck, in case you
        want to keep it.
      </p>

      <div className="solved-block">
        <span className="recap-label">it should</span>
        <p className="solved-text">{intent.trim() || "nothing written"}</p>
      </div>
      <div className="solved-block">
        <span className="recap-label">what it actually does</span>
        <p className="solved-text">{walkthrough.trim() || "nothing written"}</p>
      </div>

      <div className="actions">
        <button className="ask-btn" onClick={onRestart}>
          go again
        </button>
      </div>
    </div>
  );
}
