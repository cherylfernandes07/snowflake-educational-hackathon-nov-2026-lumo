'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Robot from '@/app/Robot';
import { type CharacterInputs } from '@/lib/animation/contract';

const RiveCharacter = dynamic(() => import('./ClumsyCharacter'), { ssr:false });
const configuredAsset = process.env.NEXT_PUBLIC_CLUMSY_RIVE_SRC;

/** Same live inputs drive today's SVG and an optional future Rive export. */
export default function LearningCompanion(props: Partial<CharacterInputs> & { speaking?:boolean }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [effects, setEffects] = useState({ fxSpark:0, fxCheck:0, fxQuestion:0 });
  const [gaze, setGaze] = useState({lookX:0,lookY:0});
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches); update(); query.addEventListener('change',update);
    return () => query.removeEventListener('change',update);
  },[]);
  useEffect(() => {
    if (props.coreState === 5) setEffects(e => ({...e,fxCheck:e.fxCheck+1}));
    if (props.coreState === 6) setEffects(e => ({...e,fxSpark:e.fxSpark+1}));
    if (props.coreState === 7) setEffects(e => ({...e,fxQuestion:e.fxQuestion+1}));
  },[props.coreState]);
  const inputs = {...gaze,...effects,...props,reducedMotion:reducedMotion || props.reducedMotion};
  const fallback = <Robot {...inputs} embedded/>;
  return <div className="robot-wrap learning-companion" data-renderer={configuredAsset ? 'rive-with-svg-fallback' : 'svg'} onPointerMove={e => {
    if (e.pointerType !== 'mouse' || reducedMotion) return;
    const bounds=e.currentTarget.getBoundingClientRect();
    setGaze({lookX:Math.max(-1,Math.min(1,((e.clientX-bounds.left)/bounds.width-.5)*2)),lookY:Math.max(-1,Math.min(1,((e.clientY-bounds.top)/bounds.height-.5)*2))});
  }} onPointerLeave={() => setGaze({lookX:0,lookY:0})}>
    {configuredAsset ? <RiveCharacter src={configuredAsset} {...inputs} fallback={fallback}/> : fallback}
  </div>;
}
