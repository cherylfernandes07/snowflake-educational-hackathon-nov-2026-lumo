# Performance chart — Clumsy v1

Binding source: `01-design-spec.md`. Animation timings are specified; actual asset size/frame performance are **not measured** because the final `.riv` is absent.

## Core behaviors

All rows preserve independently running life breathing/blinking/brow micro-motion/body rise. All preserve live mouth/gaze ownership.

| Core | Purpose | Length | Loop / hold | In/out blend | Facial controls |
|---|---|---|---|---|---|
| idle / 0 | ready companion | 4.2 s | seamless loop | .24 s | neutral brow baseline, open lids |
| listen / 1 | attention to child | 2.8 s | receptive loop | .22 s | attentive baseline, runtime gaze |
| think / 2 | considering reasoning | 3.6 s | thinking-pose loop | .32 s | asymmetric brow baseline |
| speak / 3 | conversation | 2.4 s | body accents loop | .20 s | runtime mouth only, neutral brows |
| investigate / 4 | inspect source | 3.2 s | attentive loop | .28 s | brows slightly raised |
| learn / 5 | recognize correction | 1.8 s | one-shot → final hold | .26 s | lifted brow baseline, live mouth |
| celebrate / 6 | acknowledge evidence | 2.0 s | one-shot → final hold | .28 s | soft lid narrowing, raised brows |
| unsure / 7 | invite help | 2.6 s | gentle questioning loop | .30 s | asymmetry without distressed V |

## Emotion and gesture overlays

| Overlay | Purpose | Length | Loop / hold | Transition | Facial controls |
|---|---|---|---|---|---|
| curious / emotion 1 | invite examination | .25 s | held expression | .18 s out | brow offset +2, lids +4% |
| encouraging / emotion 2 | patient support | .30 s | held expression | .18 s out | relaxed brows, cheek +10%, lids -3% |
| uncertain / emotion 3 | question a claim | .28 s | held expression | .18 s out | asymmetry 1.5, lids -5% |
| wave / gesture 1 | friendly greeting | 1.4 s | one-shot → zero offset | .18 s interrupt | none; inherited live face |
| nod / gesture 2 | one acknowledgment | .9 s | one-shot → zero offset | .18 s interrupt | head offset only; inherited face |
| shrug / gesture 3 | ask for help | 1.2 s | one-shot → zero offset | .18 s interrupt | none; inherited face |
| point / gesture 4 | reference evidence | .5 s | arrival → held point | .18 s release | none; inherited face |

Neutral emotion/None gesture are zero-offset blend destinations, not extra full character clips. Do not count them as the seven designed overlays.

## Effects and mouth

| Effect | Length | Normal | Reduced motion | Restart |
|---|---|---|---|---|
| fxSpark | .65 s | four small expanding/fading vector stars | static star fades | same trigger restarts |
| fxQuestion | .80 s | outlined question rises ≤4 units/fades | static question fades | same trigger restarts |
| fxCheck | .70 s | outlined check scales 95→100%, fades | static check fades | same trigger restarts |

| mouthOpen interval | Interpolation | Control-pose aperture |
|---|---|---|
| 0 | rest | closed gentle curve |
| >0–.20 | rest → small | at .20: 3-unit vertical opening |
| >.20–.55 | small → medium | at .55: 7-unit opening |
| >.55–1 | medium → wide | at 1: 12-unit opening, ≤28-unit width |

No threshold switching. These ranges describe continuous shape blending, not viseme classes. RMS amplitude driver removes DC, applies a .012 floor and square-root compression, then smooths with 35 ms attack / 140 ms release. After ≥300 ms of silence target is forced to zero. Stop eases closed; dispose closes immediately for teardown. Manual overrides interpolate and suspend audio control until `start()`.

## Combination / priority acceptance table

| Inputs combined | Expected acceptance result |
|---|---|
| any core + life | breath/blink/micro drift continue, no property overwrite |
| think + curious + point + lookX changing | chin/point compose without face overlap; brow offset preserved; pupils follow live slider |
| speak + uncertain + nod + mouthOpen changing | live aperture continuous; one nod; unsure brow styling persists |
| celebrate + encouraging + wave + fxSpark | core and overlay separate; safe total arm angle; spark never changes skeleton |
| runtime mouth vs all other layers | runtime wins aperture, no clip keys it |
| blink vs base/offset lids | blink closes composed lid openness |
| motionScale 0 + any core | no decorative movement; live mouth/gaze still available |
| reducedMotion true + any core/effect | settled poses, subtle blink, static effect fades; no bounce/particle travel |
| repeated identical gesture value | no replay; must reset through 0 |
| repeated effect trigger | same effect restarts; unrelated effects continue |

## Device measurements to complete after export

Targets: ≤150 KB uncompressed character (review above 250 KB), ≤200 paths, ≤1,800 anchors, ≤96 mesh vertices, ≤4 masks. Installed official WASM is separate, approximately 2.2 MB. DPR≤2 measurement target, single character 360×360, warm cache.

| Environment | FPS target | p95 frame-cost target | Measured FPS / cost / asset bytes |
|---|---|---|---|
| representative classroom Chromebook / Chrome | 60 | <4 ms character work | Not measured |
| representative mid-range Android / Chrome | 60 | <4 ms character work | Not measured |
| iPhone / Safari, declared hardware generation | 60 | <4 ms character work | Not measured |
| desktop Chrome | 60 | <4 ms character work | Not measured |

Capture 30 seconds each: Idle, Think+Point+Curious with live gaze, Speak with speech audio, and Celebrate+Wave+three effects. Record device/OS/browser versions, viewport, DPR, power mode, asset bytes, cold/warm load times, FPS and p95 character work. Separate app/React costs from runtime work. Test reduced-motion variants and a background/foreground round trip. Do not mark the budget accepted until actual data is attached.
