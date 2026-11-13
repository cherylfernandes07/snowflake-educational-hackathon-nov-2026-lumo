# Illustrator preparation — Clumsy

Binding source: `01-design-spec.md`. Deliver a clean vector master, not flattened screenshots. The existing SVG is visual reference; it lacks separated forearms, lids, brows, and mouth targets required by this design.

## Groups, names, and hierarchy

Use exactly the group names from the spec's part table. Prefix nested shapes with their group: `head_shell_fill`, `head_shell_rim`, `head_shell_highlight`, etc. L/R always mean viewer left/right.

Required independent groups:

- Structure: `clumsy_root`, `life_carrier`, `core_carrier`, `gesture_carrier`.
- Head: `head_shell`, `ear_L`, `ear_R`, `antenna_stem`, `antenna_tip`, `face_screen`, `neck`.
- Face: `eye_L`, `eye_R`, `lid_L_upper`, `lid_L_lower`, `lid_R_upper`, `lid_R_lower`, `brow_L`, `brow_R`, `cheek_L`, `cheek_R`, `mouth_socket`, `mouth_rest`, `mouth_small`, `mouth_mid`, `mouth_wide`.
- Body: `torso`, `chest_panel`, `shoulder_L`, `shoulder_R`, `upper_arm_L`, `upper_arm_R`, `forearm_L`, `forearm_R`, `hand_L`, `hand_R`, `hip_L`, `hip_R`, `foot_L`, `foot_R`.
- Ground/effects: `ground_shadow`, `fx_spark`, `fx_question`, `fx_check`. Each spark is separate; question/check glyphs are outlined paths, never text or emoji.

Preserve torso shell/rim/highlight, panel/inset/badge/light, ear shell/shadow, arm underside/cap, hand palm/thumb/cuff, shoe/sole, screen/rim, eye mask/pupil/glint, stem/base cap, bulb/highlight as separately named children. Do not combine hand with forearm or pupils with screen. Build the hierarchy described in the binding spec; keep effects and ground shadow outside the body carrier.

## Paths and paint

- Preferred ≤24 anchors per simple organic path; hard maximum 32. Complex hero shell may use 64 only with animator sign-off. These are design budgets, not Rive format limits.
- Use symmetric Bézier handles for smooth surfaces. No stray points, duplicate stacked paths, zero-length segments, invisible off-canvas objects, or unnecessary clipping groups.
- All filled shapes closed; intentional stroked paths must have deliberate endpoints and round caps. Expand brush/text/variable-width strokes before export; preserve simple strokes only after import testing.
- Mouth targets share the same point count, winding, and point order. Deliver all four aligned to the identical socket pivot; never four incompatible SVG drawings.
- Gradients: at most two stops on a shape; keep a flat-color fallback. No raster shadows, live filter blur, patterns, blend-mode dependencies, embedded fonts, or linked assets. Ground shadow is a low-opacity ellipse.
- Screen and eye masks must fully cover all pupil/glint travel and blink extremes. Keep mask count ≤4 for the final asset; animator may consolidate left/right eye containment where safe.
- Export colors consistently: shell cream/sage, screen dark green, eyes mint, antenna amber. Do not introduce red/green verdict meanings into the robot.

## Paint behind every hinge

Paint hidden surfaces as full shapes, not clipped fragments. At the maximum combined arm rotation (±55°), head rotation (±9° including gesture), and scaled body pose, no transparent seam may appear.

| Joint | Required hidden/occluded coverage |
|---|---|
| antenna ↔ head | extend stem 8 units into shell; full circular base cap behind stem |
| ear ↔ head | ear shells continue at least 10 units behind head rim |
| neck ↔ head | full neck cylinder under the head, 10-unit overlap; head underside closed |
| neck ↔ torso | neck extends 8 units inside torso; full collar ring, no missing rear quadrant |
| shoulders ↔ torso | torso fully painted beneath arms; circular shoulder covers, radius ≥11 units |
| upper arm ↔ forearm | overlap 9 units each side; complete elbow caps, radius ≥10 units; underside continues through hinge |
| forearm ↔ hand | closed forearm end under cuff, overlap 7 units; palm/thumb complete behind wrist cuff |
| hips ↔ torso | connectors extend 10 units inside torso; underside painted across both hip areas |
| hip ↔ foot | connectors extend 8 units into shoes; shoe upper and rear remain closed |
| screen ↔ face elements | full screen fill behind every mouth/eye/brow position; no cut-out eye holes in screen path |
| lids ↔ eyes | lids overlap mask boundary by 2 units at full blink; no edge cracks |

Coverage amounts are starting minima. Increase any that fail extreme-pose testing; do not shrink the pose just to hide a drawing defect.

## Pivot placement

Supply a separate non-exported `GUIDES_pivots` group with crosshairs labeled using exact group names. Use the local coordinates in the binding spec. Highlights, rims, masks, and painted underside children inherit their parent pivot; do not create independent drifting centers.

- Root/life: (160,300); core/gesture: (160,250).
- Head hinge: (160,202); neck: (160,204); torso: (160,253); chest: (160,251).
- Antenna stem (156,60), tip (156,26); ears L (74,123), R (246,123).
- Eyes L (122,124), R (198,124); upper lids L/R (122/198,110); lower lids L/R (122/198,138).
- Brows L (122,98), R (198,98); cheeks L (106,147), R (215,147); all mouth targets/socket (160,149).
- Shoulders/upper arms L (106,231), R (216,231); forearms L (86,250), R (240,226); hands L (74,268), R (259,204).
- Hips L (130,291), R (195,291); feet L (130,297), R (195,297).
- Shadow (160,322); effects spark (245,65), question (76,60), check (235,95).

## Format and handoff

Deliver `clumsy-vector-master.svg` (480×480 viewBox, translated local artwork at +80,+65), editable native illustration file if available, color swatch sheet, and pivot guide screenshot. Keep a clean SVG without guides for import, and a labeled master with guides. Maintain exact IDs and transform grouping; SVG import may not preserve pivots, so verify/recreate them in the Rive editor against the guide. Inspect gradients and outline winding after import. No `.rev` or `.riv` can be produced by renaming this SVG.

## Animator pass/fail gate

Mark each box PASS or FAIL in the handoff review. Any failure blocks rig acceptance.

- [ ] All groups and named children present and independently selectable.
- [ ] 480×480 artboard, translation, safe envelope, L/R convention correct.
- [ ] Pivot guide present; every imported pivot verified.
- [ ] No joint holes at both extremes or in Think + Point + Curious.
- [ ] Mouth targets have compatible topology and common pivot.
- [ ] Pupil/mouth masks contain every runtime extreme.
- [ ] No stray points, open filled paths, duplicate shapes, hidden rasters, text, or external assets.
- [ ] Anchor, mask, and mesh budgets can be met without redraw.
- [ ] Blink/lids don't reveal seams or clip cheeks/brows.
- [ ] Ground shadow/effects are independent from skeleton transforms.
- [ ] All exports open successfully and preserve appearance in Rive.
- [ ] Illustrator and animator sign/date attached; unresolved differences recorded, not silently improvised.
