# Runtime interface — Clumsy v1

Binding spec: `01-design-spec.md`; executable contract: `lib/animation/contract.ts`.

## Asset identity and API

Artboard: `Clumsy`. State machine: `ClumsyController`. Runtime file: `/clumsy.riv` after authoring/export. React component: `components/animation/ClumsyCharacter.tsx`. Official runtime: `@rive-app/react-canvas` pinned to 4.39.0; its Canvas dependency is lockfile-pinned. Current runtime supports this input contract but upstream marks state-machine inputs/state-change subscriptions deprecated. A future upgrade must explicitly migrate this binding contract; do not rename inputs in the editor alone.

The component accepts every Rive input using the exact name below. Enum props are numeric. Finite numeric values are clamped; enums rounded to nearest integer; non-finite numeric values use defaults. Inputs are applied before playback. Missing or mistyped asset inputs reject the file. This verifies the API surface, not the hidden authoring layer structure.

### Complete input table

| Name | Rive type | Default | Range | Trigger/notification behavior |
|---|---|---|---|---|
| coreState | Number | 0 | integer 0–7: idle/listen/think/speak/investigate/learn/celebrate/unsure | transitions on changed value; entry event; only Learn/Celebrate emit done |
| emotion | Number | 0 | integer 0–3: neutral/curious/encouraging/uncertain | replace overlay; no required events |
| gesture | Number | 0 | integer 0–4: none/wave/nod/shrug/point | replace overlay; one completion event; reset through 0 to replay |
| mouthOpen | Number | 0 | 0–1 | live continuous aperture; no events |
| lookX | Number | 0 | -1–1 | live horizontal pupils, viewer coordinates; no events |
| lookY | Number | 0 | -1–1 | live vertical pupils, positive down; no events |
| energy | Number | .5 | 0–1 | displacement factor .65–1; no tempo changes/events |
| motionScale | Number | 1 | 0–1 | decorative amplitude multiplier; no events |
| reducedMotion | Boolean | false | false/true | static settled poses, subtle blink, fade-only effects; no events |
| fxSpark | Trigger | unfired (React counter 0) | fire, React finite counter | fire once per counter change; completed effect emits fxSpark_done |
| fxQuestion | Trigger | unfired (React counter 0) | fire, React finite counter | fire once per counter change; emits fxQuestion_done |
| fxCheck | Trigger | unfired (React counter 0) | fire, React finite counter | fire once per counter change; emits fxCheck_done |

React trigger props are sequence counters, not Rive Number inputs. Increment to fire. Initial counter values establish a baseline and do not fire on mount/load. Trigger changes while an asset is not loaded are not queued. Runtime inputs and overlays never decide whether a claim is true.

### One code example per input

Each line is an independent component example; wrap in a parent with explicit width/height. Unspecified values use defaults.

```tsx
<ClumsyCharacter src="/clumsy.riv" coreState={1} />     // Listen
<ClumsyCharacter src="/clumsy.riv" emotion={1} />       // Curious overlay
<ClumsyCharacter src="/clumsy.riv" gesture={4} />       // Held point overlay
<ClumsyCharacter src="/clumsy.riv" mouthOpen={0.55} />  // Medium aperture
<ClumsyCharacter src="/clumsy.riv" lookX={-0.7} />      // Viewer left
<ClumsyCharacter src="/clumsy.riv" lookY={0.4} />       // Down
<ClumsyCharacter src="/clumsy.riv" energy={0.35} />     // Gentle amplitude
<ClumsyCharacter src="/clumsy.riv" motionScale={0.5} /> // Half decorative amplitude
<ClumsyCharacter src="/clumsy.riv" reducedMotion={true} />
```

Trigger examples (all three counters initially zero):

```tsx
const [fxSpark, setSpark] = useState(0);
const [fxQuestion, setQuestion] = useState(0);
const [fxCheck, setCheck] = useState(0);
// Render this once; subsequent counter changes fire the matching triggers.
<ClumsyCharacter src="/clumsy.riv" fxSpark={fxSpark}
  fxQuestion={fxQuestion} fxCheck={fxCheck} />;
// One example for each Trigger input:
<button onClick={() => setSpark(n => n + 1)}>Spark</button>;
<button onClick={() => setQuestion(n => n + 1)}>Question</button>;
<button onClick={() => setCheck(n => n + 1)}>Check</button>;
```

Replay a one-shot gesture by setting `gesture=0`, allowing a render/runtime advance, then selecting its enum again. Resetting and restoring in the same React batch will not replay it. Completed wave/nod/shrug retain zero offset until selection changes; point retains its pointing offset.

## Event notifications

| Authored General Event | Timing |
|---|---|
| core_idle_enter, core_listen_enter, core_think_enter, core_speak_enter | matching core entry |
| core_investigate_enter, core_learn_enter, core_celebrate_enter, core_unsure_enter | matching core entry |
| core_learn_done, core_celebrate_done | action settles to own hold pose |
| gesture_wave_done, gesture_nod_done, gesture_shrug_done | one-shot returns to neutral offset |
| gesture_point_done | point arrival settles, before held point |
| fxSpark_done, fxQuestion_done, fxCheck_done | matching effect fully completes |

No done events for looping cores. Cancelled actions/effects emit no completion event. Same-effect retrigger restarts its timeline. Events must be authored in the Rive file; JS does not fabricate them.

`onStateChange(states: string[])` relays actual `EventType.StateChange` state names, including layer/internal state names. `onEvent({name,data})` relays Rive events. `onStatus(string)` reports loading/validation/failure; it is an application callback, not a machine input or authored event. No automatic URL event handling.

```tsx
<div style={{ width:360, height:400 }}>
  <ClumsyCharacter src="/clumsy.riv" coreState={2} emotion={1} gesture={4}
    lookX={gazeX}
    onStateChange={states => console.log('Actual machine states', states)}
    onEvent={event => console.log('Authored event', event.name)}
    onStatus={status => console.log('Asset validation', status)} />
</div>
```

The demo at `/animation-lab` exercises every input, including Think + Curious + Point while a numeric slider changes. It accepts a local `.riv` as a browser object URL; it does not send the file to a server. Without an asset, a labeled interactive SVG preview receives every input directly. Mouth, gaze, poses, and effects work immediately; it never emits fabricated Rive notifications. Missing input names/types show a contract-mismatch error instead of silently continuing. Parent must have explicit dimensions. Layout is Contain/Center and automatically resizes its canvas.

## Audio mouth API

```ts
import { createMouthDriver } from '@/lib/animation/mouth-driver';
const driver = createMouthDriver({
  audio: document.querySelector('audio')!,
  onMouthOpen: value => setMouthOpen(value),
});
await driver.start(); // user gesture; prepares/resumes audio graph
await audio.play();  // start() does not force media playback
// On pause/end:
driver.stop();       // ease shut; does not pause the audio element itself
// Manual override until the next start():
driver.setMouthOpen(0.4);
// On final teardown:
driver.dispose();
```

Alternatively supply `{ analyser, onMouthOpen }` for a caller-connected Web Audio AnalyserNode. Caller owns graph connections and audio playback; driver never connects an external analyser to the speakers. Only one driver per media element. For media-element input, the driver creates and reuses one graph across starts/stops; final disposal disconnects it and closes its context. After disposal use a fresh audio element, because browsers prevent attaching a second MediaElementSource to the same element. `dispose()` is idempotent.

Manual override values are clamped to 0–1, non-finite values become 0. Override transitions still interpolate each animation frame, then stay under manual control. `start()` resumes automatic driving. Attack 35 ms; release 140 ms; ≥300 ms silence forces a closed target. `stop()` eases to zero; `dispose()` resets immediately and cancels RAF.

Local files are simplest. Cross-origin media needs CORS permission and `crossOrigin="anonymous"` set before its source; browser policies may otherwise yield silence. Browser speech synthesis exposes no waveform/analyser stream, so this module cannot claim true lip-sync for `speechSynthesis`. Use actual speech audio or a connected analyser. No inference of phonemes or fabricated waveform.
