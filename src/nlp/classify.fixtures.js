// Shared test fixtures for the classifier: realistic bug descriptions
// across all four categories, off-topic/planning examples, and a few
// deliberately ambiguous cases. Used both by the ad-hoc stress-test
// runner (scripts/stress-test-classify.mjs) and by the Vitest suite
// (src/nlp/classify.test.js), so dictionary changes are checked
// against the same cases both times.
//
// `expected` is the category key classify() should pick as `best`,
// or "offTopic" if `isOffTopic` should be true. `ambiguous: true`
// cases have a `expected` that's a reasonable guess, but they're
// reported separately rather than asserted on in tests, since a
// person could reasonably read them more than one way.

export const REGRESSION_CASES = [
  "This endpoint was working fine last week but now it throws a 500 error after I merged the auth refactor branch.",
  "After upgrading React to 18.3, my component stopped rendering the list — it used to work perfectly before.",
  "We just rolled back a dependency bump and now the build works again, so something in that update broke it.",
  "The API used to return sorted results, but since the last deploy the order is completely different.",
  "It worked before I refactored the sorting function, now it crashes on empty arrays.",
  "Login was fine until I updated the JWT library version this morning.",
  "This test suite passed on every commit until yesterday, and I haven't touched the test files themselves.",
];

export const NEVER_WORKED_CASES = [
  "I'm implementing my first recursive function for a tree traversal and it just returns undefined every time I call it.",
  "Following the React docs tutorial, I wrote a useEffect hook but the fetch inside it never seems to fire.",
  "This is my first attempt at writing a binary search algorithm and it never finds any element, even ones that exist.",
  "I just started learning about promises and I can't get my async function to actually wait for the API response.",
  "Trying to implement a custom hook for the first time, but the state never updates when I call the setter.",
  "New to Redux, wrote my first reducer, but the store state never changes no matter what action I dispatch.",
  "I wrote this parser from scratch and it's never worked, not even on the simplest example from the spec.",
];

export const INTERMITTENT_CASES = [
  "Our CI test suite fails maybe one in ten runs with no clear pattern, and passes every other time.",
  "The checkout flow works most of the time but occasionally the payment webhook silently doesn't fire.",
  "Sometimes the websocket connection drops for a few users and nobody else, and I can't reproduce it locally.",
  "This flaky test in our suite fails maybe twice a week and I have no idea why, it's driving me crazy.",
  "There's a race condition somewhere in our job queue — two workers occasionally grab the same task.",
  "Under heavy load the cache sometimes returns stale data, but works fine when traffic is low.",
  "The app crashes randomly, maybe once every few hundred requests, and I can't tell what triggers it.",
];

export const SILENT_WRONG_CASES = [
  "The invoice total calculates without any errors, but it's always $0.50 off from what it should be.",
  "No exceptions are thrown, but the sorted list is coming back in the wrong order for some entries.",
  "The currency conversion runs fine but the output is subtly wrong, like it's using yesterday's exchange rate.",
  "The function returns successfully every time, but the average calculation is wrong when there are negative numbers.",
  "Everything runs without error, but the date shown to users is consistently one day off.",
  "The report generates fine but the total revenue number doesn't match what's in the database.",
  "No error is thrown, but the search filter returns results that don't match the query at all.",
];

export const OFF_TOPIC_CASES = [
  "I want to build a habit tracker app for iOS but I don't know where to start.",
  "Thinking about building a small SaaS tool for freelancers — what tech stack should I use?",
  "I have an idea for a recipe-sharing app and I'm trying to plan out the database schema before writing any code.",
  "Not sure how to approach architecting a multiplayer game backend from scratch.",
  "Brainstorming project ideas for a hackathon this weekend, any suggestions?",
  "How should I approach learning backend development as a beginner?",
  "I want to create a browser extension but haven't written any code yet, where do I begin?",
];

// Realistic bug reports that happen to contain words that also show
// up in the offTopic dictionary ("approach", "start", "no idea how
// to", "build") — these must NOT be classified offTopic, since they
// describe an actual, already-written piece of misbehaving code. The
// bug *category* isn't asserted here (a couple of these are lexically
// thin enough that `best` legitimately comes back null, which is a
// safe outcome — the UI just falls back to manual category choice)
// — only that isOffTopic is false, since that's the part that would
// actively mislead the user with a wrong "this looks like planning"
// note.
export const REAL_BUG_WITH_PLANNING_WORDS_CASES = [
  { text: "Not sure how to approach fixing this null pointer exception I'm getting in production." },
  { text: "I want to build a tool to help me debug this recurring race condition in our queue." },
  { text: "No idea how to fix this null exception that's been thrown since this morning's deploy." },
  { text: "This crashes right at the start of the function, before it even reads the input." },
  { text: "Our build pipeline throws an exception every time, right after the dependency install step." },
];

// Cases where two categories' signals genuinely coexist — there's no
// single "correct" answer, so these are reported but not asserted on
// in the test suite. `expected` is a best-effort guess for the report
// table only.
export const AMBIGUOUS_CASES = [
  { text: "It used to work but now sometimes it crashes, not sure why.", expected: "regression" },
  { text: "I'm not sure if this is a bug or if I'm just misunderstanding how the API is supposed to work.", expected: "neverWorked" },
  { text: "The app worked fine in dev but production sometimes throws weird errors intermittently after the last deploy.", expected: "regression" },
  { text: "it's broken", expected: null },
  { text: "", expected: null },
];

export const ALL_LABELED_CASES = [
  ...REGRESSION_CASES.map((text) => ({ text, expected: "regression" })),
  ...NEVER_WORKED_CASES.map((text) => ({ text, expected: "neverWorked" })),
  ...INTERMITTENT_CASES.map((text) => ({ text, expected: "intermittent" })),
  ...SILENT_WRONG_CASES.map((text) => ({ text, expected: "silentWrong" })),
  ...OFF_TOPIC_CASES.map((text) => ({ text, expected: "offTopic" })),
];
