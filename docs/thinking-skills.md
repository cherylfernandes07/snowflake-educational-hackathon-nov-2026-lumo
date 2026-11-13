# Lumo Thinking Skills — full-prompt implementation

Lumo is for K–5, initially grades 3–5 / ages 8–11. This extends the existing Next.js app, character, voice/text input, missions, image exploration, Keenable integration and local progress. Internal Clumsy animation/input names and the practice storage key remain compatible.

## Learning and assessment are separate

Choose a ready-to-play mission to begin a three-move initial challenge: select a verification strategy, choose a source, and explain. Read-aloud only reads the task. Voice creates a visible editable transcript. The student receives no scores, hints, correct-answer highlights, Lumo dialogue, presenter answers, or notebook access while answering.

The existing Great Wall/lightning activity is coached learning. Qualified explanations update Lumo's actual structured brain, with source links and the child's words. It is not counted as independent assessment.

Finishing offers a different parallel challenge. The student then sees **Your Thinking Skills**, with two-dot progress indicators, actual scores for each skill and a /6 total only when complete. Lower and equal results are shown as recorded. Missing values never become zero. Original responses and supporting scoring evidence can be inspected.

## Verified challenge library

`lib/thinking/challenges.ts` defines two grade-3–5 forms, each targeting Questioning, Investigating and Explaining. Both have difficulty 1 and the same equivalence group, but different claims, question wording and source order:

- Form A: “The Moon makes its own light” — false. [NASA Moonlight](https://science.nasa.gov/moon/moonlight/) explains reflected sunlight.
- Form B: “The Sun is a star” — true. [NASA Sun Facts](https://science.nasa.gov/sun/facts/) identifies the Sun as a star.

The video posts/comments are explicitly fictional. Scientific clue cards are short paraphrases of the linked authoritative pages. No invented factual citations or product experiment data remain in new assessments. An irrelevant card can also name NASA: students must evaluate whether the content addresses the claim, not merely recognize a reputable brand. Form source notes, verified answers, references, skill targets, grade band, difficulty, question options and rubric metadata are data separate from UI.

`selectChallengeForms()` finds a different task at the same grade/difficulty/equivalence group. Additional challenges need data entries, not new rendering/scoring branches. The grade-band type permits K–2 later, but only grades 3–5 content is implemented. These forms are designed as parallel tasks; they are not empirically equated or scientifically validated.

## Rubric `thinking-v2`: 0–2 per skill, maximum 6

| Skill | 0 | 1 | 2 |
|---|---|---|---|
| Questioning | accepts unsupported information or makes an unsupported verdict | recognizes uncertainty without identifying a check | identifies what needs checking and a relevant check |
| Investigating | irrelevant evidence or superficial indicators | potentially useful evidence, limited justification | relevant evidence plus why it helps evaluate the claim |
| Explaining | unsupported/incorrect explanation | partially correct explanation | clear connection from relevant evidence to justified conclusion |

Questioning options encode a concrete verification plan for 2 points, uncertainty for 1, and unsupported acceptance/rejection for 0. Source selection is deterministic: irrelevant/superficial choices get 0; a relevant choice earns at most 1 without a justification. The separate AI evaluator determines whether the explanation supplies the useful-source rationale needed for Investigating 2 and assigns Explaining 0–2. All text and voice transcripts use the same rubric, without grammar/pronunciation penalties.

### Strict AI evaluation and review

`/api/thinking` validates input and invokes `lib/thinking/evaluator.ts`, separate from `/api/coach`. It uses OpenAI structured JSON schema with `strict:true`, no additional fields, fixed score enums, supporting quotes and an explicit `needsReview` flag. Only the fixed rubric appears in the system instructions; source/student data stays in user JSON as untrusted material. The server checks that supporting quotes actually occur in the child's response and never accepts extra assessment criteria or out-of-range scores. Displayed criteria are server-owned, not invented model criteria.

Set `OPENAI_API_KEY` for live evaluation; optional `OPENAI_ASSESSMENT_MODEL` defaults to the conversational model or `gpt-4o-mini`. If the key is missing, the model fails, returns malformed data, invents quotes, or marks uncertainty, affected open-response scores become **Needs review** with null values. There is no fabricated heuristic replacement. Deterministic choices can still be scored. Blank explanations are **Not assessed**. Totals are null/Incomplete until all three skills have scores; `knownSubtotal` preserves actual partial points.

Records store assessment type, challenge ID, raw choices/transcript/modality, individual scores/statuses, supporting evidence, overall/max/partial totals, timestamp, rubric version, evaluation method/status, independent flag, AI-assistance flag and sample-data flag. Evaluation by AI is distinct from giving AI assistance to the child.

## Comparisons and adult review

Comparisons require the same rubric, comparable measured scores and independent responses without AI assistance. Sample pairs compare only with sample pairs and always show sample labels. No score describes intelligence, diagnosis, mastery, or all of critical thinking. A difference between two responses is not proof that Lumo caused learning.

Settings → **Parent/Teacher View** opens a read-only report using actual local session data: initial/final skills, signed changes, totals, full answers, scoring evidence, practiced concepts, child explanations backing learned rules, and suggested practice areas. It has no grade-editing controls. **Student View** returns to the same adventure. No authentication, names or school-management platform are introduced.

Independent means the in-app uncoached path; the app cannot verify help outside the app. These are illustrative prototype indicators. Human review is needed when flagged; the read-only report does not silently assign a replacement score.

## Persistent, evidence-backed brain

`lib/brain.ts` stores each fixed principle's ID, original belief, corrected belief, explicit status and `studentEvidence` (explanation, source URLs, time). Wrong rules start Incorrect; unknown rules start Not verified. Updates require a claim-specific explanation, a conclusion matching the protected mission answer, and a source from the mission's relevant official publisher. Generic “evidence because NASA” cannot teach a rule.

A qualified lesson records its evidence, visibly shows Incorrect → Correct, persists the new state and changes next-challenge dialogue through `brainTransfer()`. Conversation requests receive the updated structured brain. Brain and factual answer keys remain separate; neither the conversational model nor retrieved text can edit verified answers. Legacy Boolean beliefs migrate as remembered knowledge **without inventing old explanations**.

## Elementary evidence retrieval

Keenable still performs actual SDK search and retrieval. `lib/source-policy.ts` restricts results/retrieval to selected science publishers (NASA, NWS, NOAA, Smithsonian, USGS, NPS). Mission search is scoped to the relevant publisher; custom exploration picks a suitable selected science domain. Cards are limited to three short excerpts with original links. Publisher selection is an editorial relevance filter, not automatic factual verification. The UI asks whether evidence fits the claim.

Official preloaded evidence is clearly labeled on service failure. Custom searches do not get unrelated fallback evidence and remain Insufficient evidence. Verified mission answers are immutable application content. Source/child text is serialized into untrusted user data in both AI endpoints; it is not interpolated into system instructions or executed as HTML.

## Fast, isolated sample demo

Settings → **Run 90-second sample demo** opens a separate interactive sequence: sample baseline → questionable claim → challenge reasoning → real/preloaded source → editable teaching explanation → visibly updated brain → a different true claim → sample results.

Every prepared input/result is labeled **SAMPLE DATA**. `sampleAssessment()` uses explicitly authored sample evaluations, independent=false and AI-assistance=true. Demo brain and scores live only inside the demo component; no student progress is overwritten. Default preloaded official evidence avoids network waits; an optional live Keenable button remains available. Missing OpenAI/search services do not break it. Student **Presenter mode** still offers labeled practice inputs, never independent assessment answers.

## Local persistence and migration

Practice uses `clumsy-v2`, now including structured brain plus compatible derived flags. Assessments retain `lumo-thinking-v1` as the storage key, but records use rubric **thinking-v2**. Earlier `thinking-v1` records are preserved in a read-only legacy archive, never rescaled from /3 to /2 or mixed with new scores. Existing practiced sessions do not retroactively create a before-learning baseline. Partial drafts persist; invalid data is rejected safely. **Start over** resets practice and assessments for a fresh anonymous round.

Browser recognition may use the browser provider. Lumo sends transcripts, not raw recordings, to its server; live assessment sends the explanation and fixed challenge material to OpenAI. Images never go to Keenable. No extra identifying fields or database are collected. Browser-local records are user-editable and not tamper-proof institutional records.

## Verification limits

Unit tests cover rubric boundaries, totals, review states, AI schema/quote validation, true/false form selection, belief evidence/migration, source curation, comparisons including lower scores, and persistence. Browser tests cover independent before/practice/after, voice transcript handling, real missing-evaluator review, fixture-based lower-score rendering, parent/teacher view, unchanged existing learning/animations, and offline sample-demo isolation. Model-success UI cases use explicit test fixtures; they do not claim live OpenAI grading has been verified without credentials. Microphone hardware and model grading quality still require real-device/human validation.
