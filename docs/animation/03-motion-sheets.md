# Clumsy — motion direction sheets

Binding source: `01-design-spec.md`. All times are seconds. Each sheet is below 200 words. Timings are animation directions to author, not claims about an existing `.riv`.

Life is a separate continuous layer. The breath/blink/brow drift described below must never be baked into these clips. Runtime mouth and gaze retain ownership throughout. Gesture offsets are on separate carriers. Reduced-motion variants retain the settled readable pose, subtle blinking, and live mouth/gaze; suppress decorative bounce, sway, overshoot, and particles.

## Core 0 — Idle (4.2 s loop)

0.00: balanced feet and relaxed elbows. 1.40: head eases 1° right. 2.80: return through center toward 1° left. 4.20: exact first pose. Cubic in/out, no held-body stiffness; no overshoot.

Brows sit open and friendly, with separate ≤0.5-unit life drift. Eyes stay attentive; life blink runs independently. Mouth rests at current `mouthOpen`, not a timeline smile. Head motion is tiny; arms hang with palms slightly visible. Body has no core bounce: life breathing supplies the 2-unit rise and 0.8% torso expansion. Shadow life multiplier follows breath without changing root placement.

Loop seamlessly. Any core request crossfades out in 0.24 s without waiting for loop end. No completion event; entry emits `core_idle_enter`.

## Core 1 — Listen (2.8 s loop)

0.00–0.35: lean torso forward to 3° with a gentle 1-unit anticipation. 0.35–1.40: hold receptive pose. 1.40–2.80: tiny 1° head acknowledgment, then return to held listening baseline. Slow-out arrival; no rhythmic nodding that could imply agreement.

Brows neutral-raised; separate micro drift continues. Eyes take live gaze and blink independently. Mouth aperture is runtime-owned and usually zero. Hands open at waist; elbows clear the torso. Core body lean is separate from the continuing life breath and very soft rise.

Loop the receptive pose. Transition into/out of any core with 0.22 s blends. It must look like listening, not affirming the child's claim. Emit `core_listen_enter`; no done event.

## Core 2 — Think (3.6 s loop)

0.00–0.35: slight 1-unit backward anticipation. 0.35–0.85: head tips 6°; near hand approaches chin, remaining below screen. 0.85–2.70: hold with a small elbow settle. 2.70–3.60: head eases 1° toward center and returns to thought baseline.

Brows core baseline becomes mildly asymmetric; emotion/micro offsets remain separate. Eyes use live gaze, never a baked eye roll; blinks continue. Mouth remains live. Far arm stays relaxed. No core bounce; breathing/brow drift continue underneath.

Use rounded cubic easing with one ≤1-unit overshoot at chin arrival. Blend 0.32 s on interruption. The held-thinking loop must not repeatedly raise the hand from rest. Entry emits `core_think_enter`; no completion event.

## Core 3 — Speak (2.4 s loop)

0.00–0.40: elbows open gently. 0.40–1.20: one palm moves outward 4 units. 1.20–2.00: head accents downward at most 2°. 2.00–2.40: return to speaking baseline. Soft rhythmic accents, never mechanically timed to syllables.

Brows hold a friendly baseline with continuing life micro drift. Eyes preserve runtime gaze and independent blink. Mouth is **entirely** `mouthOpen`; do not key mouth paths in this clip. Hands avoid face overlap. Life breathing and tiny body rise continue; there is no extra speaking bounce.

Loop while the host requests Speak. When audio ends, mouth driver closes independently; host changes core state to Listen/Idle. Blend 0.20 s. Entry emits `core_speak_enter`; no done event.

## Core 4 — Investigate (3.2 s loop)

0.00–0.50: lean 2° toward the evidence side. 0.50–1.10: head follows 3°, then settle 1 unit. 1.10–2.60: attentive stillness. 2.60–3.20: return to the investigation baseline, not neutral.

Brows lift slightly at the center; separate micro drift persists. Eyes track only live `lookX/lookY`, and blink remains present. Mouth aperture stays runtime-driven. Arms are ready but not extended; the Point overlay adds pointing independently. Life breath/body rise runs under the core lean.

Use curious slow-in/slow-out with no eye dart. 0.28 s transition in/out; continuous attentive loop. Entry emits `core_investigate_enter`; no done event. Never present this pose as a verdict.

## Core 5 — Learn (1.8 s one-shot → hold)

0.00–0.20: head retracts 1 unit in gentle recognition. 0.20–0.65: head lifts 3°, hands open. 0.65–1.10: torso rises 3 units; ≤1-unit overshoot. 1.10–1.80: settle into receptive planted pose.

Brows become a little higher, without anger/surprise extremes; micro drift continues. Eyes remain open and blink naturally. Runtime mouth is independent, allowing “Oh!” without a baked mouth. Arms open outward ≤20°. Body rise composes with continuing life breath; cap total rise to 5 units.

Blend 0.26 s from any core. After action, hold final core pose while life breathing, blink, and brow motion continue. Emit `core_learn_enter`, then `core_learn_done` once. Interruption cancels completion. Host must move core away and back to replay.

## Core 6 — Celebrate (2.0 s one-shot → hold)

0.00–0.25: soft 1-unit anticipation. 0.25–0.85: lift chest 4 units and raise hands below antenna height. 0.85–1.25: rounded 1-unit overshoot. 1.25–2.00: settle, open palms, feet planted. No jump, spin, rapid pumping, or camera shake.

Brows lift warmly; eye lid base narrows a little, still allowing live gaze and life blinks. Mouth remains live, not forced open. Head tips 3° toward child. Life breath and brow drift continue underneath, including the final held pose. Effects happen only if separately triggered.

Blend 0.28 s. Emit `core_celebrate_enter` and `core_celebrate_done` at the settled hold. Interrupted actions emit no done. Praise evidence-based explanation, not speed. Reduced-motion version uses a static open-palm acknowledgment.

## Core 7 — Unsure (2.6 s loop)

0.00–0.40: head tilts 4° with a small backward settle. 0.40–1.80: soft questioning hold. 1.80–2.60: return 1° toward center and back to baseline. No repeated head shaking.

Brows baseline is gently asymmetric, never a worried V; separate life drift continues. Eyes retain live gaze and ordinary blinks. Mouth stays on runtime aperture rather than frowning. Hands relax, palms visible; Shrug can be layered independently. Life breathing and tiny body rise are present throughout, so uncertainty never looks frozen or distressed.

Use warm cubic easing, no sharp anticipation. Blend 0.30 s from/to any core. Emit `core_unsure_enter`; no completion event.

## Emotion 1 — Curious (0.25 s arrival → hold)

0.00: inherit the current core. 0.00–0.25: raise left brow emotion offset by 2 units and increase lid openness 4%. Hold until another emotion is selected; fade to Neutral over 0.18 s.

Brows' core baseline and life micro drift remain visible below the offset. Eyes retain runtime gaze; life blink closes the composed lids normally. Mouth aperture remains entirely live. Head, arms, and body core pose are untouched. Separate life breathing and body rise continue.

Slow-out ease, no overshoot. This is an overlay, not a new full animation. Use while investigating or hearing an explanation. No event is required for emotion arrival.

## Emotion 2 — Encouraging (0.30 s arrival → hold)

0.00–0.30: soften brows upward, increase cheek intensity by 10%, reduce lid base openness by 3%. Do not change eye color or mouth aperture. Hold without pulsing. Crossfade away over 0.18 s.

Brows retain life micro drift; eyes preserve gaze and independent blink. Head, arms, and body pose remain owned by the core/gesture; life breath and body bounce continue. Mouth is runtime-driven, so encouragement never competes with speech.

Warm cubic ease, no anticipation or overshoot. Avoid an exaggerated grin that suggests every child answer is correct. This overlay communicates patience, not verification. No completion event.

## Emotion 3 — Uncertain (0.28 s arrival → hold)

0.00–0.28: add a 1.5-unit brow asymmetry and reduce lids 5%. Keep corners relaxed; no sadness, sweat, red alarm, or frown. Hold until replaced, then blend out over 0.18 s.

Brows retain small independent life drift. Eyes still blink and follow live gaze. Mouth remains runtime-owned. Head, arms, and body are unchanged by this overlay; life breathing and tiny rise run underneath the current core.

Ease slowly into the expression without overshoot. Combine with any behavior, including Speak, while Clumsy asks for more evidence. No completion event; no whole-character “confused” replacement clip.

## Gesture 1 — Wave (1.4 s one-shot → neutral gesture hold)

0.00–0.25: right elbow lifts on its gesture carrier. 0.25–0.65: wrist arcs outward 12° and back. 0.65–1.05: a second 10° arc. 1.05–1.40: hand returns to zero gesture offset. No fast wrist flapping.

Brows and eyes remain controlled by core/emotion plus ongoing micro drift and blink. Mouth stays live. Head pose is untouched. Left arm remains on its core pose; body life breath/rise continues. Clamp combined shoulder rotation to ±55°.

Soft anticipation, rounded arcs, slow settle. On completion emit `gesture_wave_done`; hold zero offset without replaying. Reset gesture to None before requesting Wave again. Interrupted gestures crossfade out in 0.18 s without a done event.

## Gesture 2 — Nod (0.9 s one-shot → neutral gesture hold)

0.00–0.15: tiny upward anticipation, 0.5°. 0.15–0.40: head dips 2°. 0.40–0.65: return with ≤0.5° overshoot. 0.65–0.90: settle to zero gesture offset.

Do not move brows, eyes, or mouth in this overlay: their core/emotion/micro controls continue, including blinks and live aperture/gaze. Arms and body core remain unchanged; life breathing and tiny rise remain present.

Use a single readable nod, not a repeating agreement cycle. Head gesture composes with core tilt; cap total head rotation to 9°. Emit `gesture_nod_done` when neutral offset is reached. Reset through None to replay; 0.18 s interruption blend.

## Gesture 3 — Shrug (1.2 s one-shot → neutral gesture hold)

0.00–0.20: palms loosen with no downward body recoil. 0.20–0.50: lift shoulders 3 units and rotate palms outward 10°. 0.50–0.75: questioning hold. 0.75–1.20: return gently to zero offsets.

Brows and eyes are untouched by gesture and retain micro drift/blink; Uncertain emotion may be independently selected. Mouth remains live; head remains on its core carrier. Body stays planted with continuing separate life breath and bounce.

Ease in/out, minimal anticipation, no helpless collapse. Emit `gesture_shrug_done` on settle. Reset to None before replay. If replaced, crossfade over 0.18 s and cancel completion.

## Gesture 4 — Point (0.5 s arrival → hold)

0.00–0.10: right elbow gathers inward 1 unit. 0.10–0.40: arm extends toward the artboard's source side, not across the screen. 0.40–0.50: settle ≤1 unit. Use the mitten thumb/palm silhouette rather than adding a new sharp finger.

Brows and eyes retain core/emotion plus micro motion; runtime gaze may follow a source but is not keyed here. Mouth remains live. Head/core pose stays intact. Right arm offsets take readability priority within the ±55° cap; left arm and life breath/body rise continue.

Emit `gesture_point_done` at arrival, then hold the pointing offset. None releases it over 0.18 s. With Think, use carriers to compose and prevent face occlusion. Reduced motion uses the settled point pose without travel.
