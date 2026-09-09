import { useEffect, useRef, useState } from "react";
import Duck from "./components/Duck";
import StuckPrompts from "./components/StuckPrompts";
import SolvedScreen from "./components/SolvedScreen";
import { classify } from "./nlp/classify";
import { pickTopRelevant } from "./nlp/selectQuestion";
import { CATEGORIES, GENERIC_NUDGES } from "./data/questions";
import "./App.css";

// The escape hatch: classify whatever the user has written so far into
// one of the four rough buckets, then pull a few tag-relevant prompts.
// Falls back to method-faithful generic nudges when there's nothing
// confident to classify.
function nudgesFor(text) {
  const { best } = classify(text);
  if (!best) return GENERIC_NUDGES;
  return pickTopRelevant(CATEGORIES[best].questions, text, 4).map((q) => q.text);
}

// intent  – "what is this supposed to do?"
// walk    – "now go line by line: what does it actually do?"
// stuck   – walk + a few nudge prompts revealed
// solved  – you found it
export default function App() {
  const [phase, setPhase] = useState("intent");
  const [intent, setIntent] = useState("");
  const [walkthrough, setWalkthrough] = useState("");
  const [nudges, setNudges] = useState([]);
  const walkRef = useRef(null);

  useEffect(() => {
    if (phase === "walk") walkRef.current?.focus();
  }, [phase]);

  const startWalk = () => {
    if (intent.trim()) setPhase("walk");
  };
  const getStuck = () => {
    setNudges(nudgesFor(`${intent} ${walkthrough}`));
    setPhase("stuck");
  };
  const restart = () => {
    setIntent("");
    setWalkthrough("");
    setNudges([]);
    setPhase("intent");
  };

  return (
    <div className="page">
      <svg
        className="pond-waves"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="pond-wave pond-wave-back"
          d="M0,110 C240,170 480,40 720,100 C960,160 1200,30 1440,90 L1440,200 L0,200 Z"
        />
        <path
          className="pond-wave pond-wave-front"
          d="M0,140 C260,80 500,190 760,130 C1000,75 1220,180 1440,130 L1440,200 L0,200 Z"
        />
      </svg>

      <div className="card">
        <div className="header">
          <span className="eyebrow">What the QUACK?</span>
          <span className="tagline">
            explain your code to a duck that won't say anything back
          </span>
        </div>

        <div className="duck-row">
          <Duck />
        </div>

        {phase === "solved" ? (
          <SolvedScreen intent={intent} walkthrough={walkthrough} onRestart={restart} />
        ) : phase === "intent" ? (
          <div className="step">
            <p className="cue">
              Tell the duck what this code is <em>supposed</em> to do. Say it the
              way you would to another person.
            </p>
            <textarea
              className="notes"
              autoFocus
              rows={5}
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="“this function takes a list of orders and returns the total, skipping the cancelled ones…”"
            />
            <p className="notes-hint">
              whatever you type stays in your browser and is never saved
            </p>
            <div className="actions">
              <button className="ask-btn" onClick={startWalk} disabled={!intent.trim()}>
                Quack!
              </button>
            </div>
          </div>
        ) : (
          <div className="step">
            <div className="recap">
              <span className="recap-label">it should</span>
              <span className="recap-text">{intent.trim()}</span>
            </div>

            <p className="cue">
              Now go through what it <em>actually</em> does, one line at a time.
              Say each step out loud, as if the duck has never seen the code.
            </p>
            <textarea
              ref={walkRef}
              className="notes notes-tall"
              rows={9}
              value={walkthrough}
              onChange={(e) => setWalkthrough(e.target.value)}
              placeholder="“line 1, I grab the orders array. line 2, I loop through and add each price. wait, I add it before I check whether the order is cancelled…”"
            />
            <p className="notes-hint">
              the duck won't answer. the bug usually turns up somewhere in what you just said.
            </p>

            {phase === "stuck" && (
              <StuckPrompts prompts={nudges} onBack={() => setPhase("walk")} />
            )}

            <div className="actions">
              <button className="ask-btn" onClick={() => setPhase("solved")}>
                I see it now
              </button>
              {phase === "walk" && (
                <button className="reset-btn" onClick={getStuck}>
                  I'm still stuck
                </button>
              )}
            </div>
            <button className="startover-link" onClick={restart}>
              start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
