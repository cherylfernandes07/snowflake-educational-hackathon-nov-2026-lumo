'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ClumsyCharacter from '@/components/animation/ClumsyCharacter';
import { defaults, coreStates, emotions, gestures, inputSpec, triggerNames, type CharacterInputs, type NumericName } from '@/lib/animation/contract';
import { createMouthDriver } from '@/lib/animation/mouth-driver';
import './lab.css';

export default function AnimationLab() {
  const [inputs, setInputs] = useState<CharacterInputs>({ ...defaults });
  const [src, setSrc] = useState('');
  const [status, setStatus] = useState('Interactive SVG preview · no Rive asset loaded.');
  const [events, setEvents] = useState<string[]>([]);
  const [audioSrc, setAudioSrc] = useState('');
  const [audioStatus, setAudioStatus] = useState('Upload speech audio to test the amplitude driver.');
  const audioRef = useRef<HTMLAudioElement>(null);
  const driver = useRef<ReturnType<typeof createMouthDriver> | null>(null);
  const objectUrls = useRef<string[]>([]);
  const log = (message: string) => setEvents(e => [message, ...e].slice(0, 30));
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setInputs(p => ({ ...p, reducedMotion:media.matches })); change();
    media.addEventListener('change', change);
    return () => { media.removeEventListener('change', change); driver.current?.dispose(); objectUrls.current.forEach(u => URL.revokeObjectURL(u)); };
  }, []);
  function url(file: File) { const value = URL.createObjectURL(file); objectUrls.current.push(value); return value; }
  function setNumber(name: NumericName, value: number) {
    if (name === 'mouthOpen' && driver.current) driver.current.setMouthOpen(value);
    setInputs(p => ({ ...p, [name]:value }));
  }
  async function startAudio() {
    if (!audioRef.current) return;
    if (!driver.current) driver.current = createMouthDriver({ audio:audioRef.current, onMouthOpen:value => setInputs(p => ({ ...p, mouthOpen:value })) });
    try { await driver.current.start(); await audioRef.current.play(); setAudioStatus('Amplitude driver running. Mouth follows the audio; not phoneme lip-sync.'); }
    catch { setAudioStatus('Audio could not start. Check the file and browser permission.'); }
  }
  return <div className="animation-lab">
    <header><Link href="/">← Back to Lumo</Link><h1>Lumo’s animation lab</h1><p>Engineering preview · the final Rive rig must be authored and exported separately.</p></header>
    <div className="lab-grid"><section className="lab-preview"><div className="character-box"><ClumsyCharacter src={src || undefined} {...inputs} onStatus={setStatus} onStateChange={s => log(`State: ${s.join(', ')}`)} onEvent={e => log(`Event: ${e.name}`)}/></div><p role="status">{status}</p><label>Load Clumsy .riv<input type="file" accept=".riv" onChange={e => { const file = e.target.files?.[0]; if (file) { setSrc(url(file)); setEvents([]); setStatus('Loading supplied asset…'); } }}/></label><button onClick={async () => { try { const r = await fetch('/clumsy.riv'); if (!r.ok || !r.headers.get('content-type')?.includes('octet-stream') && r.headers.get('content-type')?.includes('text/html')) throw Error(); setSrc('/clumsy.riv'); setStatus('Loading /clumsy.riv…'); } catch { setStatus('public/clumsy.riv is not installed. Upload the exported rig above.'); } }}>Load public/clumsy.riv</button><button onClick={() => { setSrc(''); setStatus('Interactive SVG preview · no Rive asset loaded.'); }}>Use SVG preview</button>
    <h2>Multi-layer combination</h2><p>Think + curious + point. Move lookX while these layers stay active.</p><button onClick={() => setInputs(p => ({ ...p, coreState:2, emotion:1, gesture:4, energy:.35 }))}>Try the combination</button><p className="lab-note">All controls update the SVG character live. Load a compatible .riv to compare the authored Rive rig; only real Rive notifications appear in the event log.</p></section>
    <section className="lab-controls"><h2>States and overlays</h2>{([['coreState',coreStates],['emotion',emotions],['gesture',gestures]] as const).map(([name,values]) => <label key={name}>{name}<select aria-label={name} value={inputs[name]} onChange={e => setNumber(name, Number(e.target.value))}>{values.map((v,i) => <option value={i} key={v}>{i} · {v}</option>)}</select></label>)}
    <h2>Live numeric inputs</h2>{(['mouthOpen','lookX','lookY','energy','motionScale'] as const).map(name => <label key={name}>{name} <output>{inputs[name].toFixed(2)}</output><input aria-label={name} type="range" min={inputSpec[name].min} max={inputSpec[name].max} step="0.01" value={inputs[name]} onChange={e => setNumber(name, Number(e.target.value))}/></label>)}<label className="lab-check"><input type="checkbox" checked={inputs.reducedMotion} onChange={e => setInputs(p => ({ ...p, reducedMotion:e.target.checked }))}/> reducedMotion</label>
    <h2>Effects</h2><div className="lab-triggers">{triggerNames.map(name => <button key={name} onClick={() => setInputs(p => ({ ...p, [name]:p[name] + 1 }))}>{name} ({inputs[name]})</button>)}</div><button onClick={() => { driver.current?.setMouthOpen(0); setInputs({ ...defaults }); }}>Reset all inputs</button>
    </section></div>
    <section className="lab-audio"><h2>Speech / mouth driver</h2><p>Audio stays on this device. Browser speech synthesis does not expose an audio waveform, so it cannot drive this analyser.</p><label>Speech audio file<input type="file" accept="audio/*" onChange={e => { const file = e.target.files?.[0]; if (file) { driver.current?.dispose(); driver.current = null; setAudioSrc(url(file)); setAudioStatus('Audio loaded. Start it with the button below.'); } }}/></label><audio key={audioSrc} ref={audioRef} src={audioSrc || undefined} onEnded={() => { driver.current?.stop(); setAudioStatus('Audio ended · mouth easing closed.'); }}/><div><button disabled={!audioSrc} onClick={() => void startAudio()}>Start speech + mouth</button><button onClick={() => { audioRef.current?.pause(); driver.current?.stop(); setAudioStatus('Stopped · mouth easing closed.'); }}>Stop</button></div><p role="status">{audioStatus}</p></section>
    <section><h2>Runtime event log</h2><p>Only actual Rive notifications appear here. Loading another file clears the log.</p><ol className="event-log">{events.map((event,i) => <li key={`${i}-${event}`}>{event}</li>)}</ol>{events.length === 0 && <p>No runtime events received.</p>}</section>
  </div>;
}
