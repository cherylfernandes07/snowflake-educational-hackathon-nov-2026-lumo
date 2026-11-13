# Lumo — The AI that learns from you.

A robot companion that learns from a child's fact-checking. One question, choice, or action per screen.

## Run

Requires Node.js 20.9+. This project includes `.nvmrc` for the installed Node 20.13.0 version.

```sh
nvm use
npm install
npm run dev
```

Open http://localhost:3000. If no `.env.local` exists, copy `.env.example` to `.env.local`. Do not overwrite an existing file containing credentials.

Keenable uses its real keyless API or `KEENABLE_API_KEY` when configured. `OPENAI_API_KEY` enables live follow-up conversations, screenshot reading, and strict Thinking Skills explanation evaluation; `OPENAI_MODEL` defaults to `gpt-4o-mini`. Without OpenAI credentials, curated guidance keeps the missions available and assessment explanations are saved as Needs review. Keys stay server-side.

```sh
npm run build
npm start
```

## The child’s adventure

1. **Choose:** Space, Wild weather, or suggest a theme.
2. **Guess:** Clumsy finds a claim. The child makes a hunch; it remains NOT VERIFIED.
3. **Plan:** Decide how to check. Counting likes and trusting confidence get brief hints, not punishment.
4. **Hunt:** Use Keenable, open a source, and collect a clue.
5. **Teach:** Choose a conclusion and explain what the evidence shows. Voice and text both work. Incomplete reasoning gets a follow-up.
6. **Discover:** Reveal the protected verified answer, official source, and what Clumsy learned.
7. **Transfer:** Try a new claim. Clumsy's dialogue now reads its changed belief state.

Brain rules live in an optional notebook. Your Thinking Skills compares independent before/after responses after the final mystery. The summary records explanations and distinguishes demonstration inputs from independent responses. Session progress persists in browser local storage under `clumsy-v2`. The old prototype's storage is not reused.

Space and weather are curated missions with official NASA and National Weather Service answer keys. A suggested theme matching these opens the relevant mission. Other themes open an actual web-search exploration workspace with no invented answer key. Students can inspect sources and discuss them with Clumsy; arbitrary claims stay NOT VERIFIED / insufficient evidence.

## Short presenter demo

Open the top-right settings button and switch **Presenter mode** on.

- Pick **Space**, make a hunch, and click **Let’s find out**.
- Choose **Find a source that knows**. Show a live search, or use **Load official demo clue** (clearly labeled preloaded evidence).
- Click **I’ve got a clue!**, then speak/type your explanation or use **Use a demonstration explanation**.
- Show the verified answer and click **Try my new brain**.
- Repeat for the lightning claim, then **See our adventure**.

Presenter controls appear only on relevant screens. Prepared explanations are explicitly labeled as demonstrations. Presenter mode itself is session-only. **Start over** in settings resets the adventure. Speech begins muted; enable it with the speaker button. Browser microphone APIs require browser support, permission, and localhost or HTTPS. Text always works.

## Screenshot exploration

**Bring your own mystery** opens a separate workspace. Upload a PNG, JPEG, or WebP under 5 MB, or type the claim. The real vision model extracts visible claims without issuing a verdict. If it is unavailable or cannot read reliably, the UI explains that and offers text input. Images never go to Keenable or browser local storage. Avoid personal details in images and search queries.

## Architecture and truth boundaries

- `lib/curriculum.ts`: protected mission answers and practice rubric. `lib/brain.ts`: evidence-backed reasoning rules and transfer behavior.
- `app/page.tsx`: sequential learning interaction, voice, local persistence, notebook, theme selection, screenshot explorer.
- `app/Robot.tsx`: animated SVG character, expressive states, reduced-motion support.
- `/api/search`: official Keenable SDK `search()`, optional credentials, eight-second timeout, clearly labeled official fallback clues. Custom searches never receive unrelated fallback evidence.
- `/api/source`: SDK `fetch()` for public HTTPS page content, rendered as plain text.
- `/api/coach`: optional OpenAI dialogue using current beliefs and selected evidence, used for incomplete explanations and custom-claim discussion. Retrieved content is untrusted data. The model cannot write answer keys or beliefs.
- `/api/vision`: real server-side vision requests with honest unavailable/unreadable states.

A supported evidence explanation and a conclusion matching the verified answer update Clumsy's evidence rule. Explaining why popularity is not proof also updates that separate rule. Future dialogue directly reads the updated state. Verified-answer screens are curated and labeled accordingly; they are not presented as model-generated verdicts.

The coached-practice keyword rubric is transparent and limited (it is separate from the 0–2 Thinking Skills rubric): 0 = no evidence, 1 = mentions checking/proof, 2 = names evidence/a source, 3 = includes an explanatory connection. It can miss paraphrases or accept weak reasoning. It is a practice aid, not validated mastery assessment. Demo inputs never establish independent student performance.

No database, auth, payments, or analytics. Explanations remain in local storage and are sent to OpenAI only for live dialogue. Search sends the search query. Official references: [NASA](https://www.nasa.gov/image-article/great-wall/) and [National Weather Service](https://www.weather.gov/safety/lightning-myths).

## Verify

```sh
npm run typecheck
npm test
npm run test:search
npm run test:e2e
```

Start the app before browser tests. They use `/usr/bin/google-chrome`; update `playwright.config.ts` for another environment. Use `CLUMSY_TEST_URL=http://127.0.0.1:3001 npm run test:e2e` for another port. Coverage includes both mysteries, persistence, reset, theme routing, mobile layout, actual source search/retrieval, and image input validation. Live OpenAI and microphone hardware require credentials/permissions and have not been independently verified in this environment.

## Character animation package

The Rive-ready animation spec, illustrator checklist, motion sheets, performance chart, and runtime interface are in [docs/animation](docs/animation/README.md). Visit `/animation-lab` for every input, layer combination, effect trigger, and a real audio-amplitude mouth driver. The official Rive runtime is integrated, but the final `.rev`/`.riv` still needs authoring in Rive; the child-facing app retains its working SVG until that asset exists.

The learning adventure now drives the shared character inputs directly: welcome wave, questioning tilt, thinking during searches, pointing while investigating, listening while explaining, recognition after a correction, and a summary celebration. Gaze reacts gently to a mouse over the robot; OS reduced-motion is honored. Browser speech activity drives a stylized talking motion, not an invented audio waveform. Settings → **Animation playground** opens the full animation lab.

Once the conforming Rive export exists, set `NEXT_PUBLIC_CLUMSY_RIVE_SRC=/clumsy.riv` and restart the app. `LearningCompanion` loads the official runtime only when configured; missing/invalid Rive assets retain the working SVG. These SVG reactions implement a practical subset of the design and are not a substitute for final Rive rig acceptance.

## Lumo Thinking Skills

The existing learning activity now includes optional before-and-after thinking mini-games for **Questioning, Investigating, and Explaining**, aimed at grades 3–5 (ages 8–11) within the K–5 product. Choose a mission to play the first mystery, teach Lumo as usual, then finish the adventure to try a new mystery independently. Settings → **Lumo Thinking Skills** opens the snapshots notebook.

Assessments provide no hints or demo inputs; voice and text are supported. Results are withheld until the final challenge is complete. Missing baselines and skipped explanations stay “Not assessed.” The fixed 0–2 rubric for each skill totals /6 only when complete. The separate AI evaluator uses strict JSON and supporting quotes; missing/uncertain evaluation stays Needs review. Per-skill differences describe only those responses, not intelligence, mastery, or scientifically proven learning gains. See [the rubric and architecture](docs/thinking-skills.md). Use `OPENAI_API_KEY` for live explanation evaluation; optional `OPENAI_ASSESSMENT_MODEL` selects its model. The learning flow and sample demo work without it.

## Parent/teacher view and sample demo

Settings → **Parent/Teacher View** shows actual before/after answers, per-skill changes, scoring evidence, practiced concepts, and review/practice recommendations. It is read-only and anonymous. Settings → **Run 90-second sample demo** runs the full cycle with clearly labeled sample responses and /6 scores, a separate demonstration brain, and preloaded official evidence. It never changes the actual student's saved records. **Student View** returns to the adventure.

New forms use real NASA facts and include both true and false claims. Earlier prototype /3 records remain archived for adult review and are not rescaled or compared with the /6 rubric. Search/retrieval is limited to selected science publishers; source reputation is never treated as proof that a claim is correct.
