'use client';

import { useId, type CSSProperties } from 'react';
import { clampInput, coreStates, defaults, type CharacterInputs } from '@/lib/animation/contract';

type RobotProps = Partial<CharacterInputs> & { happy?: boolean; thinking?: boolean; embedded?: boolean; speaking?: boolean };

/** Working SVG interpretation of the shared animation inputs, not a Rive export. */
export default function Robot(props: RobotProps) {
  const id = useId().replace(/:/g, '');
  const coreState = clampInput('coreState', props.coreState ?? (props.thinking ? 2 : props.happy ? 6 : 0));
  const emotion = clampInput('emotion', props.emotion ?? 0);
  const gesture = clampInput('gesture', props.gesture ?? 0);
  const happy = coreState === 5 || coreState === 6 || emotion === 2;
  const lookX = clampInput('lookX', props.lookX ?? 0) * 6;
  const lookY = clampInput('lookY', props.lookY ?? 0) * 4;
  const mouth = clampInput('mouthOpen', props.mouthOpen ?? 0);
  const scale = clampInput('motionScale', props.motionScale ?? defaults.motionScale);
  const energy = .65 + clampInput('energy', props.energy ?? defaults.energy) * .35;
  const quiet = props.reducedMotion || scale === 0;
  const tilt = (coreState === 2 ? -6 : coreState === 7 ? 4 : coreState === 1 ? 2 : coreState === 4 ? 3 : 0) * scale * energy;
  const headTransform = `rotate(${tilt} 160 202)`;
  const handRotation = (gesture === 4 ? 28 : gesture === 3 ? -12 : coreState === 2 ? -30 : happy ? -15 : 0) * scale * energy;
  const style = { '--motion-scale': scale, '--motion-energy': energy, '--motion-amplitude': scale * energy } as CSSProperties;
  return <div className={`${props.embedded ? 'robot-visual' : 'robot-wrap'} robot-character ${quiet ? 'quiet-motion' : ''} ${props.speaking ? 'is-speaking' : ''}`} style={style} data-core={coreStates[coreState]} data-gesture={gesture} data-emotion={emotion}>
    <svg role="img" aria-label={`Lumo is ${props.speaking ? 'speaking' : coreStates[coreState] === 'idle' ? 'curious' : coreStates[coreState] === 'listen' ? 'listening' : coreStates[coreState] === 'think' ? 'thinking' : coreStates[coreState] === 'learn' ? 'learning' : coreStates[coreState] === 'celebrate' ? 'celebrating' : coreStates[coreState] === 'investigate' ? 'investigating' : coreStates[coreState]}`} viewBox="0 0 320 350">
      <defs><linearGradient id={`${id}-shell`} x2=".8" y2="1"><stop stopColor="#fffef6"/><stop offset="1" stopColor="#c7d2c6"/></linearGradient><linearGradient id={`${id}-body`} x2="1" y2="1"><stop stopColor="#eaf0de"/><stop offset="1" stopColor="#a5b8a1"/></linearGradient></defs>
      <ellipse cx="162" cy="322" rx="83" ry="12" fill="#344e35" opacity=".10"/>
      <g className="robot-life"><g className="robot-core">
        <rect x="113" y="294" width="34" height="22" rx="10" fill="#6c8362"/><rect x="178" y="294" width="34" height="22" rx="10" fill="#6c8362"/>
        <g className="robot-left-arm"><path d="M104 227q-25 12-31 41" stroke="#899d7f" strokeWidth="19" strokeLinecap="round"/><circle cx="73" cy="268" r="12" fill="#dce3cd"/></g>
        <g className="robot-arm-pose" transform={`rotate(${handRotation} 216 229)`}><g className={`robot-right-arm ${gesture === 1 ? 'robot-wave' : ''}`}><path d="M216 229q32 10 41-17" stroke="#899d7f" strokeWidth="19" strokeLinecap="round"/><circle cx="259" cy="204" r="13" fill="#dce3cd"/></g></g>
        <g className="robot-torso"><rect x="102" y="211" width="118" height="89" rx="31" fill={`url(#${id}-body)`} stroke="#a3b197" strokeWidth="2"/><rect x="135" y="234" width="51" height="34" rx="11" fill="#f5f5e6"/><path d="M148 251h24m-12-12v24" stroke="#7a956e" strokeWidth="4" strokeLinecap="round"/><circle className="robot-chest-light" cx="161" cy="282" r="4" fill="#f1b84e"/></g>
        <rect x="143" y="200" width="36" height="15" rx="5" fill="#6b8162"/>
        <g className="robot-head-pose" transform={headTransform}><g className={gesture === 2 ? 'robot-nod' : 'robot-head'}>
          <path d="M156 58V33" stroke="#596e55" strokeWidth="7"/><circle className="robot-antenna" cx="156" cy="26" r="10" fill="#f3b94f"/>
          <rect x="54" y="92" width="25" height="64" rx="12" fill="#a4b59c"/><rect x="244" y="92" width="25" height="64" rx="12" fill="#a4b59c"/>
          <rect x="69" y="58" width="183" height="143" rx="48" fill={`url(#${id}-shell)`} stroke="#b8c4af" strokeWidth="2"/>
          <rect x="88" y="83" width="146" height="93" rx="29" fill="#213f35"/>
          <g className="robot-brows" fill="none" stroke="#c4f29d" strokeWidth="3" strokeLinecap="round" opacity=".6"><path d={emotion === 1 || emotion === 3 ? 'M112 100q10-7 20-3' : 'M112 100q10-4 20 0'}/><path d={emotion === 3 ? 'M187 99q10 4 20 2' : 'M187 100q10-4 20 0'}/></g>
          <g className="robot-blink"><g className="robot-gaze" transform={`translate(${lookX} ${lookY})`} fill="#c4f29d">{happy ? <><path d="M110 122q12-22 24 0M185 122q12-22 24 0" fill="none" stroke="#c4f29d" strokeWidth="7" strokeLinecap="round"/></> : <><rect x="113" y="110" width="18" height="28" rx="9"/><rect x="189" y="110" width="18" height="28" rx="9"/></>}</g></g>
          <g className="robot-mouth"><ellipse className="robot-aperture" cx="160" cy="149" rx={9 + mouth * 3} ry={mouth > 0 ? 1 + mouth * 6 : .01} fill="#c4f29d"/><path d={coreState === 7 ? 'M150 151q10-5 20 0' : 'M148 148q12 10 24-1'} stroke="#c4f29d" strokeWidth="4" strokeLinecap="round" fill="none" opacity={mouth > .2 ? 0 : 1}/></g>
          <ellipse cx="106" cy="147" rx="8" ry="4" fill="#eaa885" opacity={emotion === 2 ? .9 : .65}/><ellipse cx="215" cy="147" rx="8" ry="4" fill="#eaa885" opacity={emotion === 2 ? .9 : .65}/>
        </g></g>
      </g></g>
      {(props.fxSpark ?? 0) > 0 && <g key={`spark-${props.fxSpark}`} className="robot-effect robot-sparks" fill="#d0aa48"><path d="M270 61l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M45 172l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g>}
      {(props.fxCheck ?? 0) > 0 && <g key={`check-${props.fxCheck}`} className="robot-effect" fill="none" stroke="#87a46a" strokeWidth="5" strokeLinecap="round"><path d="M257 89l8 8 16-19"/></g>}
      {(props.fxQuestion ?? 0) > 0 && <text key={`question-${props.fxQuestion}`} className="robot-effect" x="40" y="80" fill="#a5af8e" fontSize="28">?</text>}
    </svg>
    {coreState === 2 && <span className="robot-thought" aria-hidden="true"><i/><i/><i/></span>}
  </div>;
}
