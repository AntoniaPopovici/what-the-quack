import { useEffect, useRef, useState } from "react";
import Duck from "./components/Duck";
import RippleTracker from "./components/RippleTracker";
import CategoryPicker from "./components/CategoryPicker";
import { CATEGORIES, STAGE_ORDER } from "./data/questions";
import { selectQuestion } from "./nlp/selectQuestion";
import "./App.css";

export default function App() {
  const [categoryKey, setCategoryKey] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [question, setQuestion] = useState(null); // { text, tags }
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState([]);
  const [quacking, setQuacking] = useState(false);
  const [started, setStarted] = useState(false);
  const textareaRef = useRef(null);

  const category = categoryKey ? CATEGORIES[categoryKey] : null;

  const chooseCategory = (key, initialDescription) => {
    const pool = CATEGORIES[key].stages[STAGE_ORDER[0]];
    setCategoryKey(key);
    setStageIndex(0);
    setQuestion(selectQuestion(pool, initialDescription, null));
    setHistory([]);
    setNotes(initialDescription || "");
    setStarted(false);
  };

  const nextQuestion = () => {
    if (!category) return;

    setHistory((h) => [
      ...h,
      { stage: STAGE_ORDER[stageIndex], question: question.text, note: notes.trim() },
    ]);

    const nextIndex = Math.min(stageIndex + 1, STAGE_ORDER.length - 1);
    const pool = category.stages[STAGE_ORDER[nextIndex]];
    // Use whatever the user just typed to steer relevance for the next
    // question; if the stage didn't advance (already at the last one),
    // still avoid repeating the exact same question.
    const avoid = nextIndex === stageIndex ? question.text : null;

    setQuestion(selectQuestion(pool, notes, avoid));
    setStageIndex(nextIndex);
    setNotes("");
    setStarted(true);
    setQuacking(true);
    setTimeout(() => setQuacking(false), 260);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const restart = () => {
    setCategoryKey(null);
    setStageIndex(0);
    setQuestion(null);
    setNotes("");
    setHistory([]);
    setStarted(false);
  };

  useEffect(() => {
    if (categoryKey) textareaRef.current?.focus();
  }, [categoryKey]);

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
          <span className="eyebrow">what the quack</span>
        </div>

        <div className="duck-row">
          <Duck quacking={quacking} />
        </div>

        {!category ? (
          <CategoryPicker onPick={chooseCategory} />
        ) : (
          <>
            <RippleTracker stageIndex={stageIndex} />

            <p className="question">
              {started ? question.text : "One more thing before you start — anything to add?"}
            </p>

            <textarea
              ref={textareaRef}
              className="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                started
                  ? "type your answer, or just think it through…"
                  : "optional — more detail here sharpens the next question…"
              }
              rows={4}
            />

            <div className="actions">
              <button className="ask-btn" onClick={nextQuestion}>
                {started ? "next question" : "Quack!"}
              </button>
              {started && (
                <button className="reset-btn" onClick={restart}>
                  start over
                </button>
              )}
            </div>

            {history.length > 0 && (
              <details className="log">
                <summary>your trail ({history.length})</summary>
                <div className="log-list">
                  {history.map((h, i) => (
                    <div className="log-item" key={i}>
                      <span className="log-stage">{h.stage}</span>
                      <span className="log-question">{h.question}</span>
                      {h.note && <span className="log-note">{h.note}</span>}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
}
