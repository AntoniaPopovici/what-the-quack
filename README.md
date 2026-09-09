# What the QUACK? 🦆

Rubber duck debugging in the browser. You explain your code to a duck
that says nothing back, and the bug tends to fall out of your own
explanation. No AI, no account, nothing leaves your browser.

There is no hosted demo right now. Run it locally (see below). It builds
to a static site, so any host works once you deploy.

## The method

Straight from [rubberduckdebugging.com](https://rubberduckdebugging.com).
Tell the duck what the code is supposed to do, then walk it through what
it actually does, one line at a time. Somewhere mid sentence you say
"and then it does X" and realise it doesn't do X. The duck sits there
serenely, having helped.

The app just holds that shape:

1. **"Tell the duck what this is supposed to do."** Plain words, before
   you look at the code.
2. **"Now go through what it actually does, one line at a time."** One
   big space that stays on screen. The duck never interrupts.
3. You spot the gap, hit **"I see it now,"** and your explanation is
   handed back to you to keep.

### Still stuck?

If explaining it out loud genuinely didn't get you there, an **"I'm
still stuck"** button shows a few prompts picked for relevance to what
you have written. These are clearly not the duck talking. They are just
prompts to get you articulating again. That is the only place the prompt
bank and the classifier below come into play.

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

Outputs static files to `dist/`. Plain HTML, CSS and JS, deployable
anywhere that serves static files.

## Deploying to GitHub Pages

1. In `vite.config.js`, `base` is set to `/what-the-quack/`. Update it
   if you rename the repo.
2. Deploy (the helper is already a dev dependency):
   ```bash
   npm run deploy
   ```
   This builds and pushes `dist/` to a `gh-pages` branch.
3. In **Settings, then Pages**, set the source to the `gh-pages` branch.

Prefer Vercel or Netlify? Both auto detect Vite. Build command
`npm run build`, output directory `dist`, and set `base: "/"` in
`vite.config.js` since you won't be under a repo subpath.

## Project structure

```
src/
  App.jsx                  flow: intent, walkthrough, (stuck), solved
  App.css                  all styling
  index.css                global reset
  components/
    Duck.jsx               the duck. it just sits there.
    StuckPrompts.jsx       the "I'm still stuck" prompt panel
    SolvedScreen.jsx       end state; hands your explanation back
  data/
    questions.js           prompt pool for the stuck panel, in four
                           rough buckets; each prompt carries `tags`
                           for relevance scoring
  nlp/
    tokenize.js            normalize, tokenize, stem
    signals.js             weighted keyword and phrase dictionaries
    classify.js            buckets free text into regression,
                           neverWorked, intermittent or silentWrong
    selectQuestion.js      ranks stuck-panel prompts by tag overlap
                           with what you wrote
```

## How the classifier works

Nothing in this app calls an AI or LLM. It works offline and costs
nothing to run. When you ask for a nudge, placing your text into a
bucket and ranking prompts is classic rule based NLP:

1. **Normalize and tokenize** the text. Lowercase, strip punctuation,
   drop stopwords, light suffix stripping stemmer so "crashed",
   "crashing" and "crashes" collapse to one signal.
2. **Score against weighted dictionaries.** Each bucket (`regression`,
   `neverWorked`, `intermittent`, `silentWrong`) has phrases and stems
   that suggest it. "used to work" points at regression. There is also
   an `offTopic` dictionary for planning language like "no code yet".
3. **Cross check against general dev vocabulary.** Real debugging words
   like error, function or output pull the `offTopic` score down, so a
   genuine bug report phrased tentatively isn't mistaken for ideation.
4. **Rank the prompts.** Every prompt carries a few `tags`. The app
   scores each against your words and shows the top handful, with a
   random spread when nothing clearly matches.

All of it is tunable by editing plain JS objects in `src/nlp/signals.js`.
No model weights, no training step.

## License

MIT, see [LICENSE](./LICENSE).

Made by Antonia Adelina Popovici.
