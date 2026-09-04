# what the quack 🦆

A Socratic rubber-duck debugging tool. It never gives you the answer —
only the next question.

You describe what you're stuck on, pick what kind of problem it is, and
it walks you through four stages — **understand → isolate → test →
verify** — asking one open question at a time instead of a generic
checklist. No AI, no account, no data leaves your browser.

**[Live demo →](https://antoniapopovici.github.io/what-the-quack/)**

## Why

Explaining a bug out loud, to a literal rubber duck, often surfaces the
answer before you finish the sentence. This is that trick, structured a
little more deliberately: the questions are grouped by the *kind* of bug
(a regression, something that never worked, a flaky/intermittent
failure, or silently wrong output), because the useful question for
"this broke and used to work" is different from the useful question for
"this is flaky."

It's not a substitute for AI tools when you just need an answer fast —
it's for the moments where you'd benefit more from thinking it through
yourself.

## Running locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
git clone https://github.com/AntoniaPopovici/what-the-quack.git
cd what-the-quack
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Building

```bash
npm run build
```

Outputs static files to `dist/` — plain HTML/CSS/JS, deployable anywhere
that serves static files.

## Deploying to GitHub Pages

1. In `vite.config.js`, set `base` to `/<your-repo-name>/` (already set
   to `/what-the-quack/` — update it if you rename the repo).
2. Install the deploy helper (already a dev dependency):
   ```bash
   npm install
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```
   This builds the app and pushes `dist/` to a `gh-pages` branch.
4. In your repo's **Settings → Pages**, set the source to the `gh-pages`
   branch.

Prefer Vercel or Netlify instead? Both auto-detect Vite — just set the
build command to `npm run build` and the output directory to `dist`,
and set `base: "/"` in `vite.config.js` since you won't be under a repo
subpath.

## Project structure

```
src/
  App.jsx                 – main app state & flow
  App.css                 – all component styling
  index.css               – global reset
  components/
    Duck.jsx               – the duck (blink/quack animation)
    RippleTracker.jsx       – 4-stage progress indicator
    CategoryPicker.jsx      – description input + category suggestion
  data/
    questions.js            – the question pool, organized by
                               category → stage → question[] (each
                               question also carries `tags` for
                               relevance scoring)
  nlp/
    tokenize.js              – normalize / tokenize / stem
    signals.js                – weighted keyword & phrase dictionaries
    classify.js                – scores free text against each bug
                                  category, flags "this looks like
                                  planning, not a bug"
    selectQuestion.js           – picks the most relevant question in
                                   a stage's pool based on the user's
                                   notes, instead of pure random
```

## How the classification works

There's no AI/LLM involved anywhere in this app — on purpose, so it
stays free to run for everyone and works offline. The category
suggestion and question selection are classic rule-based NLP:

1. **Normalize & tokenize** the user's text (lowercase, strip
   punctuation, drop stopwords, light suffix-stripping stemmer so
   "crashed"/"crashing"/"crashes" all match the same signal).
2. **Score against weighted dictionaries** — each bug category
   (`regression`, `neverWorked`, `intermittent`, `silentWrong`) has a
   list of phrases and stems that suggest it (e.g. "used to work" is a
   strong regression signal), plus a separate `offTopic` dictionary
   for planning/ideation language ("no code yet", "how do I start").
3. **Cross-check against a general dev-vocabulary score** — if the
   text also contains real debugging vocabulary (error, function,
   output, crash, …), that pulls down the offTopic score, since
   planning-flavored words can legitimately show up in real bug
   reports too ("not sure how to approach this null check").
4. **Question selection** works the same way at a smaller scale: every
   question carries a few `tags`, and when picking the next question
   the app scores each candidate in the stage's pool against the
   user's most recent notes and picks randomly among the top-scoring
   ones — relevant, but not robotically deterministic.

All of this is inspectable/tunable by editing plain JS objects in
`src/nlp/signals.js` — no model weights, no training step.

## License

MIT — see [LICENSE](./LICENSE).

Made by Antonia Adelina Popovici.
