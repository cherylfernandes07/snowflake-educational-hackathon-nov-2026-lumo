# Clumsy animation system — binding specification v1

Character: Clumsy, a round, slightly clumsy robot apprentice with a sage shell, dark face screen, mint eyes, warm cheek lights, and an amber antenna.
Product: Lumo, a source-criticism learning game. Internal Rive character and input names stay unchanged for asset compatibility.
Audience: elementary school (K–5), initially grades 3–5, approximately ages 8–11.
Personality: curious, patient, warm, occasionally uncertain; celebrates reasoning rather than speed or obedience.

This document defines the intended Rive rig. It does **not** describe an already exported rig. `lib/animation/contract.ts` is its executable input contract. Missing production artifacts and measurements are listed in section 7. No claim verdict may be communicated by character color alone.

## 1. Part separation and coordinates

Artboard `Clumsy`: 480 × 480 design units, transparent, centered character. Existing silhouette uses a 320 × 350 local design space, translated by (80,65). Coordinates below are **local** coordinates before this translation; illustrator must preserve them. Positive X = viewer right; positive Y = down. L/R mean viewer left/right. Never mirror these labels based on the character's perspective.

Each row is a separate transform group; comma-separated subparts are individually named shapes inside it. Parent transforms must not be baked into paths.

| Group | Separate shapes | Local pivot |
|---|---|---|
| `clumsy_root` | no visible shape | (160,300), stable placement |
| `life_carrier` | no visible shape | (160,300), life offsets only |
| `core_carrier` | no visible shape | (160,250), core pose only |
| `gesture_carrier` | no visible shape | (160,250), gesture offsets only |
| `antenna_stem` | stem, base cap | (156,60) |
| `antenna_tip` | bulb, highlight | (156,26) |
| `ear_L`, `ear_R` | shell, inner shadow | (74,123), (246,123) |
| `head_shell` | shell fill, rim, highlight | (160,202), neck hinge |
| `face_screen` | screen fill, inner rim | (160,130), child of head |
| `eye_L`, `eye_R` | outer mask, pupil, glint | (122,124), (198,124) |
| `lid_L_upper`, `lid_L_lower` | closed lid paths | (122,110), (122,138) |
| `lid_R_upper`, `lid_R_lower` | closed lid paths | (198,110), (198,138) |
| `brow_L`, `brow_R` | rounded closed brow shapes | (122,98), (198,98) |
| `cheek_L`, `cheek_R` | diffuse oval fill | (106,147), (215,147) |
| `mouth_socket` | mouth mask, inner dark fill | (160,149) |
| `mouth_rest`, `mouth_small`, `mouth_mid`, `mouth_wide` | compatible-topology paths | (160,149), shared |
| `neck` | stem, collar, underside | (160,204) |
| `torso` | shell, rim, highlight | (160,253) |
| `chest_panel` | inset, plus badge, status light | (160,251) |
| `shoulder_L`, `shoulder_R` | cover caps | (106,231), (216,231) |
| `upper_arm_L`, `upper_arm_R` | front shell, underside | (106,231), (216,231) |
| `forearm_L`, `forearm_R` | shell, elbow cap | (86,250), (240,226) |
| `hand_L`, `hand_R` | mitten palm, thumb, wrist cuff | (74,268), (259,204) |
| `hip_L`, `hip_R` | hidden connector covers | (130,291), (195,291) |
| `foot_L`, `foot_R` | shoe shell, sole | (130,297), (195,297) |
| `ground_shadow` | one soft vector ellipse | (160,322), artboard child, not body child |
| `fx_spark`, `fx_question`, `fx_check` | 4 spark shapes / outlined question / outlined check | local (245,65), (76,60), (235,95) |

Draw order back-to-front: shadow; far arms/feet; neck; torso; near arms/hands; ears; head shell; screen; eye masks/pupils/lids; brows; mouth; cheeks; antenna; effects. Pointing never covers the eyes or the evidence text outside the artboard. All robot shapes stay within a 360 × 390 safe envelope after translation; effects within 456 × 456.

## 2. Rig design

Transform hierarchy: root → life carrier → core carrier → gesture carrier → torso/head/limbs. Keep layers separate; never bake life motion into the core clips.

Bone chains: torso/neck/head; shoulder/upper-arm/forearm/hand per side; hip/foot per side; antenna-base/tip. Feet remain planted during most states. Use forward kinematics initially; no foot IK requirement. Arm motion is primarily rotation; one 6–10 vertex mesh per elbow may soften the bend. Limit meshes to the two elbows, torso squash, and antenna flex; target ≤ 96 deform vertices total. Face screen and shell stay rigid. Mouth uses same-topology shape interpolation; eyes use bounded transforms behind masks. Do not deform the whole head to blink.

### Layer ownership (not optional)

1. **Life:** its own continuously running layer, keys only life carriers, eyelid blink multiplier, brow micro carriers, and shadow life multiplier. Breath: 4.2 s, 0.8% torso Y expansion; body rise ≤ 2 units. Blink closes/holds/opens over 0.06/0.04/0.10 s, gaps cycle 3.2/4.8/3.9 s. Brow drift ≤ 0.5 units. Life remains active under every core/overlay, including hold poses. `reducedMotion` suppresses breath/bounce/brow drift, retaining a subtle blink. `motionScale=0` suppresses all decorative life transforms.
2. **Core:** eight full-body behavior clips. Keys only core pose carriers, limb core offsets, lid base openness, brow core baseline. Never keys the live mouth or gaze channels.
3. **Emotion/Gesture:** independent emotion and gesture sublayers; seven non-neutral overlays total. Emotion owns brow emotion offsets, cheek intensity and lid emotion offsets. Gesture owns dedicated limb/head gesture offsets. No full-body behavior clips here.
4. **Runtime:** separate last-stage controls own pupil X/Y and mouth aperture. `mouthOpen`, `lookX`, `lookY` are set by app values, never timeline-recorded speech or eye tracking. `energy` and `motionScale` drive nested blend states for amplitude, not playback speed. `reducedMotion` selects calm paths.
5. **Effects:** three independent triggered vector effect sublayers, transparent at rest; no skeletal keys.

Use dedicated carrier groups and blend states because overlapping Rive timeline properties do not automatically become additive. For the mouth: four compatible paths define an aperture blend, with continuous interpolation. For gaze: clamp pupil travel to ±6 X / ±4 Y units, plus glints ±1 unit. Brows are a new addition to the current SVG silhouette; final brow shape requires illustrator review.

## 3. Core states

The `coreState` input is an integer enum; host owns it. Every core can be interrupted by every other core. `learn` and `celebrate` finish to their own hold pose; they do not secretly change the input.

| Value / state | Key direction | Length / repeat | Transition and easing |
|---|---|---|---|
| 0 idle | Balanced planted feet, slight head tilt, hands relaxed | 4.2 s seamless loop | 0.24 s blend; soft cubic in/out |
| 1 listen | Lean forward 3°, hands open, focus on child | 2.8 s loop | 0.22 s blend; slow arrival, no bouncing interruption |
| 2 think | Head tips 6°, one hand approaches chin without covering mouth | 3.6 s loop | 0.32 s blend; tiny anticipation then eased hold |
| 3 speak | Open hands at waist, 2° head accents; mouth remains runtime-driven | 2.4 s loop | 0.20 s blend; calm accents, no prerecorded visemes |
| 4 investigate | Lean toward source, attentive eyes, hand ready near side | 3.2 s loop | 0.28 s blend; curious approach and settle |
| 5 learn | Small recoil, recognition lift, then open receptive hands | 1.8 s one-shot → hold | 0.26 s blend; 1-unit overshoot then settle |
| 6 celebrate | 4-unit rise with planted-foot illusion, hands lift gently | 2.0 s one-shot → hold | 0.28 s blend; rounded arc, no jump/flash |
| 7 unsure | Small head tilt, palms loosen, no distressed face | 2.6 s loop | 0.30 s blend; warm, unhurried cubic ease |

At motion scale 1, translation limits: core ±5 units, head ±7°, torso ±4°, arms ≤35° from neutral. Gesture maximums separately defined. Energy 0–1 multiplies displacement by 0.65–1.0. Full timings and individual facial/limb actions: `03-motion-sheets.md`.

## 4. Overlays and combination policy

Emotion enum: 0 neutral, 1 curious, 2 encouraging, 3 uncertain. Gesture enum: 0 none, 1 wave, 2 nod, 3 shrug, 4 point. Exactly one emotion and one gesture are active at a time. Both can combine with every core. A requested overlay replaces the previous overlay with a 0.18 s blend, not a queue.

| Overlay | Owned controls | Length / policy |
|---|---|---|
| curious | left brow raise 2 units, lids +4%, cheek baseline | 0.25 s arrival → hold |
| encouraging | brows relaxed upward, cheeks +10%, lids -3% | 0.30 s arrival → hold |
| uncertain | brow asymmetry 1.5 units, lids -5%; no frown | 0.28 s arrival → hold |
| wave | right shoulder/forearm/hand offsets; wrist 2 slow arcs | 1.4 s one-shot → neutral gesture hold |
| nod | head gesture offset, 2° down/up once | 0.9 s one-shot → neutral gesture hold |
| shrug | shoulder gesture offsets +3 units, palms rotate outward 10° | 1.2 s one-shot → neutral gesture hold |
| point | right shoulder/elbow/hand extension toward source | 0.5 s arrival → held point |

Gesture clips must be relative offsets via carriers. `point` can coexist with `think`; gesture hand offset wins readability but does not delete the core clip. Reset gesture to 0, then choose it again to replay a one-shot. The host never relies on repeated identical numeric input retriggering.

| Conflict | Winner / composition |
|---|---|
| breathing vs core lean | separate life/core carriers, both remain |
| blink vs core/emotion lids | life blink multiplier closes the composed lid openness |
| core brow vs emotion brow vs micro drift | core baseline + bounded emotion offset + bounded micro offset |
| core arm vs gesture arm | separate carriers; cap resulting arm rotation to ±55° |
| runtime mouth vs any clip | runtime always owns aperture; no other layer keys it |
| runtime gaze vs head/eye emotion | runtime pupil translation; emotion may alter lids only |
| effects vs rig | separate groups, never move skeleton |
| reduced motion vs celebration/effects/life | accessibility wins: static settled core poses, no bounce/particles; effects use brief static icon fades |
| motionScale 0 vs expression | no decorative transforms; mouth/gaze still respond unless host stops them |

Reduced motion is not a paused state machine. Input changes, events, mouth, and functional gaze still work. Do not encode correctness with antenna hue, smiling, or effects alone; the application provides explicit text verdicts.

## 5. Runtime input contract

Artboard `Clumsy`, machine `ClumsyController`. Numeric enums use integer equality transitions. Defaults are also stored in `contract.ts`.

| Input | Type | Range | Default | Drives |
|---|---|---|---|---|
| coreState | Number | integer 0–7 | 0 | core selector |
| emotion | Number | integer 0–3 | 0 | emotion overlay selector |
| gesture | Number | integer 0–4 | 0 | gesture overlay selector |
| mouthOpen | Number | 0–1 | 0 | continuous aperture blend |
| lookX | Number | -1–1 | 0 | pupil horizontal, viewer coordinates |
| lookY | Number | -1–1 | 0 | pupil vertical, positive down |
| energy | Number | 0–1 | 0.5 | bounded core/gesture displacement, not tempo |
| motionScale | Number | 0–1 | 1 | decorative life/core/gesture amplitude |
| reducedMotion | Boolean | false/true | false | calm branch, honors OS preference in host |
| fxSpark | Trigger | fire | unfired | 4 sparks, 0.65 s |
| fxQuestion | Trigger | fire | unfired | outlined question, 0.8 s |
| fxCheck | Trigger | fire | unfired | outlined check, 0.7 s |

Mouth control points: rest at 0, small at 0.20, medium at 0.55, wide at 1.0. Interpolate between all control points: no discrete mouth popping. This is amplitude articulation, not language-specific phoneme matching. Speech is an independent core; mouth works in any core for interruption/transition.

## 6. State machine outline and event contract

One machine, five conceptual layers; the overlay and effect layers contain independent sublayers, not a flattened monolithic state matrix.

- `Life`: looping `LifeLoop`; reduced-motion and zero-scale blend paths remain active.
- `Core`: Any → matching enum state; each looping state emits `core_<name>_enter` on entry. Learn/Celebrate run Action → Hold, emitting `core_learn_done` / `core_celebrate_done` once. The `<name>` spellings are the lowercase names in the core table. No done events for looping states.
- `Emotion` sublayer: Any → Neutral/Curious/Encouraging/Uncertain by enum; 0.18 s blend.
- `Gesture` sublayer: None; WaveAction → WaveHold; NodAction → NodHold; ShrugAction → ShrugHold; PointArrival → PointHold. Completion emits `gesture_wave_done`, `gesture_nod_done`, `gesture_shrug_done`, `gesture_point_done` once. Re-entry requires changing enum away and back.
- `Runtime`: number-driven blend states/transforms; no timers, audio files, or baked mouth cycles.
- Effects sublayers: transparent Rest → Burst → Rest for each corresponding trigger. Same-effect retriggers restart its timeline; different effects may coexist. Emit `fxSpark_done`, `fxQuestion_done`, `fxCheck_done` only when the effect reaches completion, including its calm fade variant.

Event names above are Rive General Events (no URL actions). No gesture/effect completion event after cancellation. Interrupted core clips emit no done event. App's `onStateChange` relays actual runtime state names (including layer transitions), not inferred semantic state. `onEvent` relays the named authored events. The current input API is supported by the installed runtime but marked deprecated upstream; pin the runtime and plan an explicit data-binding migration rather than silently changing names.

## 7. Budgets, deliverables, and open items

Budgets are targets, not measured achievements. Target 60 fps rendering on a representative Chromebook and mid-range mobile browser; animate on 60 fps timelines with deliberate held poses. Target ≤150 KB uncompressed `.riv`, hard review at 250 KB; ≤200 vector paths, ≤1,800 anchors, ≤96 mesh vertices, ≤4 masks; no raster textures, fonts, external audio, or blur filters. CPU target p95 frame cost <4 ms for a single 360 px character at device-pixel-ratio ≤2; measure actual runtime and GPU impact. Official Canvas WASM is separate (~2.2 MB installed); it does not count as character-file size. Cache it locally. Background tabs should not be used for frame timing.

Deliverables:

| Artifact | Current status |
|---|---|
| Binding spec, vector checklist, motion sheets | supplied here |
| Performance chart and runtime interface | supplied; actual rig metrics unmeasured |
| React component, demo, mouth driver | supplied as code; needs conforming rig for visual integration acceptance |
| Illustrator's separated vector master | not authored; current SVG in `app/Robot.tsx` is reference art, not the full separated rig |
| `clumsy.rev` editable backup | missing; author and back up in Rive editor |
| `clumsy.riv` runtime export | missing; export conforming artboard/machine, install as `public/clumsy.riv` |
| Device performance capture | pending final asset and target devices |

Uncertainties to resolve during art/rig review: final brow styling; elbow mesh necessity; exact blending feel under extreme combined poses; glyph outline import fidelity; current Rive editor access/export entitlement; measured Canvas renderer performance. Do not represent these as completed or tested. The runtime component validates inputs/types, but cannot prove the five layers, curves, or events were authored correctly.
