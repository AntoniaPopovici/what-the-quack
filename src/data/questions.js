// Prompt pool for What the Quack.
//
// The app itself follows the canonical rubber-duck method: you explain
// your code to a silent duck, and the act of explaining surfaces the
// bug. The duck never asks anything.
//
// This file is only used by the "I'm still stuck" escape hatch:
// if explaining out loud didn't get you there, the app classifies what
// you wrote (see src/nlp/classify.js) into one of four rough buckets
// and offers a few relevant prompts to get you talking again. These
// are prompts to consider, not a questionnaire to fill in.
//
// Structure: CATEGORIES[key] = { label, hint, questions: Question[] }
// Question = { text: string, tags: string[] }
//
// `tags` drive relevance scoring against the user's own words (same
// tokenizer/stemmer as the notes), so a note mentioning "cached" will
// match a prompt tagged "cache". Tags are never shown in the UI.
//
// To add a prompt: pick the closest bucket, add { text, tags }. Keep it
// a genuine open prompt that makes the reader articulate something,
// never one that hints at an answer.

export const CATEGORIES = {
  regression: {
    label: "it worked before",
    hint: "something that used to work has broken",
    questions: [
      { text: "What's the last change you're sure was in place when this still worked?", tags: ["change", "commit", "last working", "history"] },
      { text: "Was the change more likely in your code, a dependency, or the environment it runs in?", tags: ["dependency", "environment", "code", "config"] },
      { text: "Did the input change, the code change, or both?", tags: ["input", "data", "code change"] },
      { text: "Is 'used to work' based on something you tested, or something you assumed?", tags: ["assumption", "tested", "verify"] },
      { text: "What's different about how you're running this now versus then?", tags: ["environment", "runtime", "machine", "config"] },
      { text: "Did anyone else touch this code, or change something it depends on, around the same time?", tags: ["teammate", "dependency", "timing", "change"] },
      { text: "Is this breaking for everyone, or just in your environment?", tags: ["environment", "scope", "reproduce"] },
      { text: "What was the exact moment you first noticed it was broken? Right after a specific action, or just at some point?", tags: ["timeline", "trigger", "noticed"] },
      { text: "Could 'it broke' actually mean the environment moved out from under otherwise-unchanged code?", tags: ["environment", "drift", "unchanged code"] },
      { text: "Can you check out the last known-good commit and confirm it still works there?", tags: ["commit", "git", "checkout", "bisect"] },
      { text: "If you bisect between then and now, roughly where would you guess the break is?", tags: ["bisect", "git", "commit history"] },
      { text: "Which files actually changed in that window, and which of those touch this code path?", tags: ["diff", "files", "changed", "code path"] },
      { text: "Did any dependency, config, or environment variable change alongside your code?", tags: ["dependency", "package", "config", "env variable"] },
      { text: "Is the break in the code that runs, or in the data it's now running against?", tags: ["data", "input", "code"] },
      { text: "If you diff the config/environment between then and now, what actually changed there?", tags: ["config", "environment", "diff", "env variable"] },
      { text: "Does the break correlate with a specific commit, or with a deploy/release boundary regardless of commit?", tags: ["commit", "deploy", "release"] },
      { text: "Have you ruled out the data itself changing shape, even though the code didn't?", tags: ["data", "schema", "shape", "unchanged code"] },
      { text: "If you stub out the suspect change temporarily, does the rest of the system behave like it used to?", tags: ["stub", "isolate", "temporary"] },
      { text: "What's the smallest diff you could revert to test whether that's the cause?", tags: ["revert", "diff", "minimal"] },
      { text: "If you pin the dependency back to its old version, does the problem go away?", tags: ["dependency", "version", "package", "downgrade"] },
      { text: "Have you run the old and new code side by side on the same input?", tags: ["compare", "old", "new", "side by side"] },
      { text: "What would you expect to see in the logs if your current suspicion is right?", tags: ["logs", "logging", "expect"] },
      { text: "Does the problem follow the code, or does it follow the machine/environment?", tags: ["environment", "machine", "code"] },
      { text: "If you re-run the exact same input against both versions, where do the outputs first diverge?", tags: ["diverge", "compare", "input", "output"] },
      { text: "Does a fresh install or clean environment reproduce it, or only your current one?", tags: ["fresh install", "clean environment", "reproduce"] },
      { text: "If you cherry-pick just the suspected commit onto the old known-good base, does it break there too?", tags: ["cherry-pick", "commit", "isolate"] },
      { text: "What's the earliest point in the code path where old and new behavior actually differ?", tags: ["code path", "diverge", "trace"] },
      { text: "If you revert the suspected change, does everything else still work as expected?", tags: ["revert", "regression", "side effects"] },
      { text: "Is there a test that would have caught this, and can you add it now?", tags: ["test", "unit test", "coverage"] },
      { text: "Are you fixing the cause, or just the symptom you happened to see first?", tags: ["root cause", "symptom", "fix"] },
      { text: "Could this same change have broken anything else you haven't checked yet?", tags: ["side effects", "regression", "other"] },
      { text: "What would you tell a teammate to watch for so this doesn't regress again?", tags: ["prevent", "future", "regression", "monitor"] },
      { text: "Does the fix work with the exact steps that originally triggered the break, not just a similar case?", tags: ["fix", "original trigger", "exact steps"] },
      { text: "If someone else pulls your fix cold, does it reproduce and resolve the same way for them?", tags: ["teammate", "reproduce", "fix"] },
      { text: "Is the fix specific to the regression, or does it also paper over some other latent issue?", tags: ["fix", "root cause", "latent issue"] },
      { text: "Would this regression have been caught earlier with a smoke test or CI check you don't have yet?", tags: ["smoke test", "ci", "monitor"] },
    ],
  },

  neverWorked: {
    label: "it never worked",
    hint: "new code, not doing what you expected",
    questions: [
      { text: "What did you expect this to do, in plain language, before you wrote any code?", tags: ["expectation", "design", "intent"] },
      { text: "Where did that expectation come from: docs, an example, or an assumption?", tags: ["docs", "documentation", "example", "assumption"] },
      { text: "What's actually happening instead? Be as literal as possible.", tags: ["actual behavior", "output", "result"] },
      { text: "Is the failure in the logic, the syntax, or a wrong assumption about the inputs?", tags: ["logic", "syntax", "input", "assumption"] },
      { text: "If you read this code with no memory of writing it, what would you expect it to do?", tags: ["read", "review", "expect"] },
      { text: "Did you write this from a mental model of how it should work, or copy it from somewhere without fully tracing it?", tags: ["mental model", "copied", "trace"] },
      { text: "Is there a version of this same feature elsewhere, in another language, library, or past project, that behaves the way you expected?", tags: ["reference", "prior experience", "comparison"] },
      { text: "What's the very first line of this code that you're not 100% sure you understand?", tags: ["understanding", "uncertain", "first line"] },
      { text: "If you had to explain this code to a rubber duck line by line, where would you get stuck?", tags: ["explain", "walkthrough", "stuck"] },
      { text: "What's the smallest example that should demonstrate this working correctly?", tags: ["minimal example", "reproduce", "smallest case"] },
      { text: "Have you tried this exact call/function in isolation, outside the rest of the app?", tags: ["isolation", "function", "standalone"] },
      { text: "Are you sure the inputs are what you think they are at this point?", tags: ["input", "data", "assumption"] },
      { text: "Is this failing at the step you think it is, or earlier than that?", tags: ["step", "location", "trace"] },
      { text: "What does the type/shape of the data actually look like right before this runs?", tags: ["type", "shape", "data", "structure"] },
      { text: "Which specific line or call is the first one that doesn't behave like you expect?", tags: ["line", "call", "first divergence"] },
      { text: "If you strip this down to the bare minimum needed to see the problem, what's left?", tags: ["minimal", "strip down", "reduce"] },
      { text: "Are you testing this the way it's actually meant to be invoked, or a simplified stand-in for it?", tags: ["invocation", "stand-in", "realistic test"] },
      { text: "Does the problem exist at the boundary, in the inputs and outputs, or inside the logic itself?", tags: ["boundary", "input", "logic"] },
      { text: "What does the official documentation say should happen here?", tags: ["docs", "documentation", "reference"] },
      { text: "Can you find a minimal working example elsewhere and compare it line by line to yours?", tags: ["example", "compare", "reference implementation"] },
      { text: "What's one assumption you're making that you haven't actually printed/logged to confirm?", tags: ["assumption", "log", "print", "confirm"] },
      { text: "If you hardcode the expected input directly, does the rest of the logic work?", tags: ["hardcode", "input", "test"] },
      { text: "Is there a simpler way to write this that would make the bug more obvious?", tags: ["simplify", "rewrite", "clarity"] },
      { text: "If you swap in a value you're certain is correct, does everything downstream behave as expected?", tags: ["known good value", "downstream", "test"] },
      { text: "Have you tried the absolute simplest version of this task, with no extra logic layered on?", tags: ["simplest version", "minimal", "baseline"] },
      { text: "Does a different but equivalent approach to the same problem produce the result you expected?", tags: ["alternative approach", "equivalent", "compare"] },
      { text: "If you comment out everything except the core call, does that core call alone behave correctly?", tags: ["comment out", "isolate", "core call"] },
      { text: "Now that it works, do you understand why the original version didn't?", tags: ["understand", "root cause", "explanation"] },
      { text: "Does this hold for edge cases, or only the happy path you tested?", tags: ["edge case", "happy path", "testing"] },
      { text: "Would this same mistake be easy to make again elsewhere in the codebase?", tags: ["mistake", "pattern", "codebase"] },
      { text: "Is there a comment or test worth leaving behind so this isn't re-learned the hard way?", tags: ["comment", "test", "documentation"] },
      { text: "What's the one-sentence explanation you'd give a teammate for what was actually wrong?", tags: ["explanation", "teammate", "summary"] },
      { text: "If you hadn't found this by accident or trial-and-error, would you have found it by reasoning it through?", tags: ["reasoning", "understanding", "luck"] },
      { text: "Does the fix generalize, or does it only happen to work for the exact case you tested?", tags: ["generalize", "edge case", "specific case"] },
      { text: "Is there a name for this kind of mistake that would help you recognize it faster next time?", tags: ["pattern", "recognize", "learning"] },
      { text: "Would writing this again from scratch today produce the same bug, or have you actually closed the gap in understanding?", tags: ["understanding", "rewrite", "gap"] },
    ],
  },

  intermittent: {
    label: "it happens sometimes",
    hint: "flaky, inconsistent, hard to reproduce on demand",
    questions: [
      { text: "What do the failing runs have in common that the passing runs don't?", tags: ["pattern", "common factor", "runs"] },
      { text: "Does it correlate with load, timing, order of operations, or something external?", tags: ["load", "timing", "order", "external"] },
      { text: "Is 'sometimes' actually random, or is there a pattern you haven't spotted yet?", tags: ["random", "pattern"] },
      { text: "Does it fail more on a fresh environment, a warm one, or under concurrent load?", tags: ["environment", "concurrency", "load"] },
      { text: "Could two things be racing to happen in an order you're assuming is fixed?", tags: ["race condition", "order", "assumption", "concurrency"] },
      { text: "If you had to bet, is this about shared state, timing, or something entirely external like network or disk?", tags: ["shared state", "timing", "external"] },
      { text: "Does it ever fail twice in a row, or always recover on retry?", tags: ["retry", "recover", "pattern"] },
      { text: "Is the failure rate roughly constant, or does it get worse under specific conditions?", tags: ["failure rate", "conditions"] },
      { text: "Have you checked whether 'intermittent' might actually be 'deterministic but dependent on something you're not tracking'?", tags: ["deterministic", "untracked variable", "hidden dependency"] },
      { text: "Can you make it fail more often by adding load, delay, or repetition?", tags: ["load", "delay", "repetition", "reproduce"] },
      { text: "Is any shared/mutable state involved that more than one thing touches?", tags: ["shared state", "mutable", "concurrency"] },
      { text: "If you run this single-threaded or sequentially, does the problem disappear?", tags: ["thread", "sequential", "concurrency"] },
      { text: "Is there a timeout, retry, or cache anywhere nearby that could be involved?", tags: ["timeout", "retry", "cache"] },
      { text: "What's different about the machine/environment on the runs where it fails?", tags: ["environment", "machine", "runs"] },
      { text: "If you isolate this component or function entirely from the rest of the system, does the flakiness follow it?", tags: ["isolate", "component", "follow"] },
      { text: "Does the order you run things in, whether tests, requests, or initialization, ever change between passes and fails?", tags: ["order", "initialization", "sequence"] },
      { text: "Is there any resource, like memory, a connection pool, or a file handle, that could be exhausted only some of the time?", tags: ["resource", "exhaustion", "pool"] },
      { text: "Could the flakiness be in your test/harness itself rather than the code it's testing?", tags: ["test harness", "false flake", "tooling"] },
      { text: "What's the shortest way you could reliably reproduce this, even if it's ugly?", tags: ["reproduce", "reliable", "minimal"] },
      { text: "If you add logging with timestamps, does the order of events match what you assumed?", tags: ["logging", "timestamp", "order", "sequence"] },
      { text: "Does forcing a delay in one place make the failure more or less frequent?", tags: ["delay", "timing", "frequency"] },
      { text: "Have you checked whether the failure is in your code or in something it depends on?", tags: ["dependency", "code", "library"] },
      { text: "Is the 'fix' you're considering actually addressing the race, or just making it rarer?", tags: ["race condition", "fix", "workaround"] },
      { text: "If you pin down timing artificially with a mocked clock or a forced delay, can you make it fail on command?", tags: ["mocked clock", "forced delay", "reproduce"] },
      { text: "Does running it in complete isolation, with nothing else competing for resources, change the failure rate?", tags: ["isolation", "resources", "competing"] },
      { text: "If you remove the retry/timeout logic temporarily, does the underlying failure become visible every time?", tags: ["retry", "timeout", "underlying failure"] },
      { text: "Have you correlated failures against a timestamp or log from an external system like a queue, database, or network?", tags: ["correlate", "external system", "logs"] },
      { text: "Have you run this enough times to trust the fix, not just gotten lucky once?", tags: ["trust", "repeated runs", "luck"] },
      { text: "Does the fix hold under load, or only in your quiet local environment?", tags: ["load", "stress test", "environment"] },
      { text: "Did you fix the race itself, or just widen the window so it's less likely?", tags: ["race condition", "root cause", "workaround"] },
      { text: "Would a stress test or repeated CI run give you real confidence here?", tags: ["stress test", "ci", "confidence"] },
      { text: "If this comes back in three months, what would you want logged to catch it faster?", tags: ["logging", "monitor", "future"] },
      { text: "Have you reproduced the original failure conditions closely enough to trust that you fixed the real one?", tags: ["original conditions", "trust", "fix"] },
      { text: "Does the fix eliminate the race, or just change the timing enough to make it rare again?", tags: ["race condition", "timing", "rare"] },
      { text: "If you deliberately reintroduce load or delay, does the fix still hold?", tags: ["load", "delay", "stress test"] },
      { text: "Is there a way to make this fail loudly next time instead of silently succeeding by luck?", tags: ["fail loudly", "monitor", "luck"] },
    ],
  },

  silentWrong: {
    label: "no error, just wrong",
    hint: "it runs fine, but the output is incorrect",
    questions: [
      { text: "What's the exact output you're getting, versus the exact output you expected?", tags: ["output", "expected", "actual"] },
      { text: "Is the result completely wrong, or subtly wrong, off by a little or off by a lot?", tags: ["magnitude", "subtle", "result"] },
      { text: "At what point does correct data become wrong, and where is the first sign of it?", tags: ["data", "correct", "trace", "location"] },
      { text: "Is this a math/logic issue, a data issue, or a display/formatting issue?", tags: ["math", "logic", "data", "formatting", "display"] },
      { text: "Would you have noticed this if you weren't specifically looking for it?", tags: ["noticeable", "subtle"] },
      { text: "Is the output wrong in a way that looks plausible, or wrong in a way that's obviously off?", tags: ["plausible", "obviously wrong", "output"] },
      { text: "Does the wrongness show up immediately, or only after some accumulation from rounding, aggregation, or repeated operations?", tags: ["accumulation", "rounding", "aggregation"] },
      { text: "Who or what would actually notice this is wrong, and how would they know?", tags: ["noticeable", "detection", "downstream consumer"] },
      { text: "Is 'expected' here based on a spec or requirement, or your own best guess at what it should be?", tags: ["spec", "requirement", "guess"] },
      { text: "If you log the intermediate values step by step, where does it first look wrong?", tags: ["log", "intermediate", "step", "trace"] },
      { text: "Is the wrong value coming from this function, or from something feeding into it?", tags: ["function", "value", "source", "upstream"] },
      { text: "Does this happen with all inputs, or only specific ones, and what do those share?", tags: ["input", "pattern", "specific"] },
      { text: "Is there a unit, type, or off-by-one mismatch hiding in here?", tags: ["unit", "type", "off by one", "mismatch"] },
      { text: "Would printing the raw value before any formatting change what you're seeing?", tags: ["raw value", "formatting", "print"] },
      { text: "If you compare this output against a trusted reference implementation or tool, where do they diverge?", tags: ["reference implementation", "diverge", "compare"] },
      { text: "Is the wrong value present at the very first calculation, or does it drift wrong somewhere in the middle?", tags: ["first calculation", "drift", "trace"] },
      { text: "Does the same wrong pattern show up in every output, or only in aggregates and edge values?", tags: ["pattern", "aggregate", "edge value"] },
      { text: "Could two correct-looking pieces of logic be combining in a way that's individually fine but wrong together?", tags: ["combination", "interaction", "individually correct"] },
      { text: "What would the correct output actually look like, worked out by hand?", tags: ["correct output", "manual", "expected"] },
      { text: "If you feed in a known, simple input, does the output match what you'd expect?", tags: ["known input", "simple case", "test"] },
      { text: "Are you comparing the right things, with the same units, rounding, and timezone?", tags: ["units", "rounding", "timezone", "comparison"] },
      { text: "Could the logic be correct but operating on the wrong data entirely?", tags: ["logic", "wrong data", "source"] },
      { text: "What's the simplest case where you can say for certain 'this is wrong, here's why'?", tags: ["simplest case", "certain", "proof"] },
      { text: "If you construct the smallest possible test case by hand, can you predict the exact correct answer before running it?", tags: ["predict", "hand-constructed", "exact answer"] },
      { text: "Does the bug reproduce with a completely different but equally valid input?", tags: ["different input", "reproduce", "valid input"] },
      { text: "If you remove any caching or memoization, does the wrong value still appear?", tags: ["cache", "memoization", "stale"] },
      { text: "Would a property like 'output should always be positive' catch this if you asserted it directly?", tags: ["property", "assertion", "invariant"] },
      { text: "Now that it's fixed, have you checked it against more than one example?", tags: ["fixed", "multiple examples", "verify"] },
      { text: "Could the same wrong assumption be baked into other code nearby?", tags: ["assumption", "other code", "pattern"] },
      { text: "Is there a test that pins down the correct value so this can't drift back silently?", tags: ["test", "regression", "correct value"] },
      { text: "Would someone reviewing this catch the difference between right and wrong at a glance?", tags: ["review", "readability", "obvious"] },
      { text: "What made this wrong output so easy to miss, and how would you catch it sooner?", tags: ["missed", "detection", "sooner"] },
      { text: "Have you checked a case that's structurally different from the one that first revealed the bug?", tags: ["structurally different", "edge case", "coverage"] },
      { text: "Does the corrected value match an independent source of truth, not just your own recalculation?", tags: ["independent source", "ground truth", "verify"] },
      { text: "If this value feeds into something else downstream, have you confirmed that's now correct too?", tags: ["downstream", "propagate", "verify"] },
      { text: "What assumption led you to trust the wrong value for as long as you did?", tags: ["trust", "assumption", "reflection"] },
    ],
  },
};

// Shown by the escape hatch when the classifier can't confidently place
// what you've written. Method-faithful nudges that just push you to
// keep articulating.
export const GENERIC_NUDGES = [
  "Read back the last thing you wrote. Is that what the code actually says, or what you meant it to say?",
  "Which line did you skip past because it looked obviously fine? Explain that line out loud.",
  "Describe the input to this code as if the duck has never seen your data.",
  "Find where you said 'and then it just' something. Go back to that part and read it again.",
];
