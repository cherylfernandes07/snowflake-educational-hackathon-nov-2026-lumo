# Clumsy animation handoff

This is an implementable design/engineering package for Clumsy, the existing robot in the children's learning app. The brief's placeholders have been resolved from the product context: ages 10–13, curious apprentice personality, existing cream/sage/mint silhouette.

## Read in order

1. [Binding design spec](01-design-spec.md): parts/pivots, rig/layer ownership, behavior/overlay contract, exact inputs, events and budgets.
2. [Vector preparation](02-vector-checklist.md): illustrator handoff and pass/fail gate.
3. [Motion sheets](03-motion-sheets.md): one sheet for each of 8 core states and 7 overlays, each under 200 words.
4. [Performance chart](04-performance-chart.md): animation matrix, mouth ranges, layer conflicts and unmeasured device targets.
5. [Runtime interface](05-runtime-interface.md): every input and event, code examples, speech integration.

## Install and preview

From the repository root:

```sh
nvm use
npm install
npm run dev
```

Visit http://localhost:3000/animation-lab (or the port printed by Next.js). The official `@rive-app/react-canvas` package is installed. `predev` and `prebuild` copy its matching official WASM to `public/animation/rive.wasm`; regenerate it after updating runtime dependencies. No external WASM CDN is required.

There is **no finished Clumsy Rive asset** in this repository. The default interactive SVG preview responds to all shared inputs, including mouth aperture, gaze, pose, overlays, motion settings, and effects. A compatible Rive file is still required to validate the authored Rive layers and their real runtime events. To test the full system:

1. Illustrator prepares the separated vector master against the checklist.
2. Animator authors the five separate layers, eight core behaviors, seven overlays, input bindings, events and accessibility branches in Rive.
3. Keep editable source in the Rive editor and deliver a `.rev` backup where supported. Export the actual `.riv`; neither file can be synthesized by renaming an SVG.
4. Put the exported runtime file at `public/clumsy.riv`, or load it locally in the demo. Use artboard `Clumsy` and machine `ClumsyController`, exact names/types from the spec.
5. Check that the demo reports “Rive loaded · contract inputs validated.” Then test every control, actual notifications, extreme layer combinations and speech audio. An input validation pass alone does not prove correct rig authoring.
6. Capture target-device performance and replace “Not measured” chart entries with actual measurements before acceptance.

## Integrate into the learning app

The primary child-facing app now uses `LearningCompanion` to drive SVG reactions through the shared inputs. It keeps the same working character if a configured Rive asset is missing or invalid. Settings → Animation playground opens the lab. To use the authored Rive export, set `NEXT_PUBLIC_CLUMSY_RIVE_SRC=/clumsy.riv` and restart. For standalone integration:

```tsx
import ClumsyCharacter from '@/components/animation/ClumsyCharacter';
<div style={{ width:'100%', height:360 }}>
  <ClumsyCharacter src="/clumsy.riv" coreState={4} emotion={1}
    gesture={4} lookX={0.5} mouthOpen={mouthOpen}
    reducedMotion={prefersReducedMotion}
    onStateChange={handleActualStateChanges} />
</div>
```

Core mapping suggestion: welcome Idle+Wave; child speaking Listen; pending search Think; evidence Investigate+Point; qualified correction Learn; summary Celebrate. Keep explicit textual claim-verdict UI. Runtime face/gesture/effects never grant truth status. The app, not the animation, owns verified answers.

## Verification and honest limits

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests require the app running and local Chrome; use `CLUMSY_TEST_URL` for a different port. Tests cover contract bounds, mouth-envelope behavior, layered-control UI and missing/invalid-asset states. A conforming `.riv`, authored event timing, visual blend quality, actual microphone/audio hardware, and target-device FPS cannot be verified without the final asset/devices. Deliverables still open: separated illustration, `.rev`, `.riv`, measured performance chart. The documents and engineering code do not misrepresent those as complete.

## Official references

Implementation verified against installed official runtime types/source and [Rive React source](https://github.com/rive-app/rive-react), [Rive runtime source](https://github.com/rive-app/rive-wasm), and [Rive React documentation](https://rive.app/docs/runtimes/react/react). The binding spec is this project's authored design, not a claim that a stock Rive file already has these inputs. The input/state-change API is deprecated upstream but still supported in the pinned version; plan a versioned data-binding migration separately.
