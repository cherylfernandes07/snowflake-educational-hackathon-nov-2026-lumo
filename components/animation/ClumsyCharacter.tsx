'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useRive, Layout, Fit, Alignment, EventType, StateMachineInputType, type Event, type StateMachineInput, RuntimeLoader } from '@rive-app/react-canvas';
import { ARTBOARD, STATE_MACHINE, defaults, inputSpec, numericNames, triggerNames, clampInput, type CharacterInputs } from '@/lib/animation/contract';
import Robot from '@/app/Robot';

RuntimeLoader.setWasmUrl('/animation/rive.wasm');

export type ClumsyCharacterProps = Partial<CharacterInputs> & {
  src?: string;
  fallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onStateChange?: (states: string[]) => void;
  onEvent?: (event: { name: string; data: unknown }) => void;
  onStatus?: (status: string) => void;
};

/** An absent asset uses a labeled SVG preview; it never pretends to be a Rive rig. */
export default function ClumsyCharacter(props: ClumsyCharacterProps) {
  if (!props.src && props.fallback) return <>{props.fallback}</>;
  if (!props.src) return <div className={props.className} style={{ width:'100%', height:'100%', ...props.style }}><Robot {...props}/><p className="asset-status">Interactive SVG preview · controls are live; Rive events require a .riv asset</p></div>;
  return <RiveCharacter key={props.src} {...props} src={props.src}/>;
}

function RiveCharacter(props: ClumsyCharacterProps & { src: string }) {
  const callbacks = useRef(props); callbacks.current = props;
  const [status, setStatus] = useState('Loading Rive asset…');
  const [valid, setValid] = useState(false);
  const priorTriggers = useRef<Record<string, number>>({});
  const { rive, RiveComponent } = useRive({
    src: props.src, artboard: ARTBOARD, stateMachines: STATE_MACHINE, autoplay: false,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    automaticallyHandleEvents: false,
    onStateChange: (event: Event) => {
      const states = Array.isArray(event.data) ? event.data.filter((s): s is string => typeof s === 'string') : typeof event.data === 'string' ? [event.data] : [];
      callbacks.current.onStateChange?.(states);
    },
    onLoadError: () => setStatus('Rive asset could not load. Check the file, artboard, network, and WASM availability.'),
  }, { shouldResizeCanvasToContainer: true, useDevicePixelRatio: true });

  useEffect(() => { callbacks.current.onStatus?.(status); }, [status]);
  useEffect(() => {
    if (!rive) return;
    let inputs: StateMachineInput[];
    try { inputs = rive.stateMachineInputs(STATE_MACHINE) || []; } catch { inputs = []; }
    const issues: string[] = [];
    for (const [name, spec] of Object.entries(inputSpec)) {
      const input = inputs.find(i => i.name === name);
      const expected = spec.type === 'number' ? StateMachineInputType.Number : spec.type === 'boolean' ? StateMachineInputType.Boolean : StateMachineInputType.Trigger;
      if (!input || input.type !== expected) issues.push(`${name} (${spec.type})`);
    }
    if (issues.length) { setStatus(`Asset contract mismatch: ${issues.join(', ')}`); return; }
    // Apply initial values before starting playback to avoid a default-pose flash.
    const p = callbacks.current;
    numericNames.forEach(name => { const i = inputs.find(v => v.name === name)!; i.value = clampInput(name, p[name] ?? defaults[name]); });
    inputs.find(i => i.name === 'reducedMotion')!.value = p.reducedMotion ?? defaults.reducedMotion;
    triggerNames.forEach(name => { priorTriggers.current[name] = p[name] ?? 0; });
    const handleEvent = (event: Event) => {
      const data = event.data;
      if (data && typeof data === 'object' && 'name' in data && typeof data.name === 'string') callbacks.current.onEvent?.({ name: data.name, data });
    };
    rive.on(EventType.RiveEvent, handleEvent);
    setValid(true); setStatus('Rive loaded · contract inputs validated'); rive.play(STATE_MACHINE);
    return () => { rive.off(EventType.RiveEvent, handleEvent); };
  }, [rive]);

  useEffect(() => {
    if (!rive || !valid) return;
    const inputs = rive.stateMachineInputs(STATE_MACHINE) || [];
    numericNames.forEach(name => { inputs.find(i => i.name === name)!.value = clampInput(name, props[name] ?? defaults[name]); });
    inputs.find(i => i.name === 'reducedMotion')!.value = props.reducedMotion ?? defaults.reducedMotion;
    triggerNames.forEach(name => {
      const counter = props[name] ?? 0;
      if (Number.isFinite(counter) && counter !== priorTriggers.current[name]) { inputs.find(i => i.name === name)!.fire(); priorTriggers.current[name] = counter; }
    });
  }, [rive, valid, props.coreState, props.emotion, props.gesture, props.mouthOpen, props.lookX, props.lookY, props.energy, props.motionScale, props.reducedMotion, props.fxSpark, props.fxQuestion, props.fxCheck]);

  return <div className={props.className} style={{ width:'100%', height:'100%', position:'relative', ...props.style }}>
    {!valid && props.fallback && <div style={{position:'absolute',inset:0}}>{props.fallback}</div>}
    <RiveComponent role="img" aria-label="Lumo animated character" style={{ width:'100%', height:'100%', visibility:valid ? 'visible' : 'hidden' }}/>
    {!valid && !props.fallback && <p className="asset-status" role="status">{status}</p>}
  </div>;
}
