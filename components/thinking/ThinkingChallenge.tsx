'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Mic, Volume2 } from 'lucide-react';
import LearningCompanion from '@/components/animation/LearningCompanion';
import { challenges, type ThinkingDraft, type ThinkingRecord } from '@/lib/thinking/challenges';

type Recognition = {lang:string;interimResults:boolean;onresult:((e:any)=>void)|null;onerror:((e:any)=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
export default function ThinkingChallenge({kind,draft,onDraft,onComplete,onSkip}:{
 kind:'before'|'after';draft:ThinkingDraft;onDraft:(draft:ThinkingDraft)=>void;
 onComplete:(record:ThinkingRecord)=>void;onSkip:()=>void;
}) {
 const challenge=challenges[kind];
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[listening,setListening]=useState(false);
 const recognition=useRef<Recognition|null>(null);
 const mounted=useRef(true);
 const current=useRef(draft);current.current=draft;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;recognition.current?.abort();if('speechSynthesis' in window)speechSynthesis.cancel();};},[]);
 function update(patch:Partial<ThinkingDraft>){onDraft({...current.current,...patch});setNotice('');}
 function stopVoice(){recognition.current?.stop();setListening(false);}
 function next(){stopVoice();if('speechSynthesis' in window)speechSynthesis.cancel();update({step:(draft.step+1) as ThinkingDraft['step']});}
 function speak(){
  if(!('speechSynthesis' in window)){setNotice('Reading aloud is not available here. All the words are on screen.');return;}
  stopVoice();speechSynthesis.cancel();
  const words=draft.step===0?'A little thinking adventure. Make three moves using your own ideas. No hints this time.'
   :draft.step===1?`${challenge.claim} ${challenge.context} ${challenge.question} ${challenge.questioningOptions.map(o=>o.label).join('. ')}`
   :draft.step===2?`Which clue would you use? ${challenge.sources.map(s=>`${s.publisher}. ${s.title}. ${s.body}`).join(' ')}`
   :'Why is your clue useful? What does it show about the claim?';
  speechSynthesis.speak(new SpeechSynthesisUtterance(words));
 }
 function microphone(){
  if(listening){stopVoice();return;}
  const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
  const C=w.SpeechRecognition||w.webkitSpeechRecognition;
  if(!C){setNotice('This browser can’t hear your voice. You can type your idea instead.');return;}
  if('speechSynthesis' in window)speechSynthesis.cancel();
  const base=current.current.explanation.trim();const r=new C();recognition.current=r;
  r.lang='en-US';r.interimResults=true;
  r.onresult=e=>{if(!mounted.current)return;const transcript=Array.from(e.results).map((x:any)=>x[0].transcript).join(' ');onDraft({...current.current,explanation:[base,transcript].filter(Boolean).join(' ').slice(0,2000),modality:base?'mixed':'voice'});};
  r.onerror=()=>{if(mounted.current){setListening(false);setNotice('Microphone unavailable. You can type your idea instead.');}};
  r.onend=()=>{if(mounted.current)setListening(false);};
  try{r.start();setListening(true);}catch{setNotice('Couldn’t start the microphone. You can type instead.');}
 }
 async function submit(){
  stopVoice();setBusy(true);setNotice('');
  try{
   const r=await fetch('/api/thinking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challengeId:challenge.id,assessmentType:kind,questioning:draft.questioning,source:draft.source,explanation:draft.explanation,modality:draft.modality})});
   const data=await r.json();if(!r.ok||!data.record)throw Error(data.error||'Could not save.');
   if(mounted.current)onComplete(data.record);
  }catch{if(mounted.current)setNotice('Your answers are still here. Couldn’t save them yet—please try again.');}
  finally{if(mounted.current)setBusy(false);}
 }
 return <section className="thinking-challenge" aria-label={`${kind==='before'?'First':'Final'} Thinking Challenge`}>
  <div className="thinking-topline"><span className="eyebrow">LUMO THINKING SKILLS · {kind==='before'?'FIRST ADVENTURE':'ONE ON YOUR OWN'}</span><button className="text-button" aria-label="Read this move aloud" onClick={speak}><Volume2 size={18}/> Listen</button></div>
  {draft.step===0?<div className="thinking-intro"><div className="thinking-buddy"><LearningCompanion coreState={0} emotion={0}/></div><h1>{kind==='before'?'A little mystery, just for you.':'One more mystery. Your ideas!'}</h1><p>{kind==='before'?'First, make three moves on your own. Then you’ll teach Lumo.':'You’ve helped Lumo. Now try a different mystery on your own.'}</p><p className="thinking-neutral">No hints this time. “I’m not sure” is okay.</p><button className="primary" onClick={next}>Let’s play <ArrowRight size={18}/></button></div>:<>
   <div className="thinking-progress" aria-label={`Move ${draft.step} of 3`}>{[1,2,3].map(n=><span className={n<=draft.step?'visited':''} key={n}/>)}<small>Move {draft.step} of 3</small></div>
   <div className="thinking-scenario"><span aria-hidden="true">{challenge.illustration}</span><div><small>FICTIONAL POST · REAL SCIENCE CLUES</small><h2>{challenge.claim}</h2><p>{challenge.context}</p></div></div>
   {draft.step===1&&<><h1 className="thinking-question">{challenge.question}</h1><div className="thinking-options">{challenge.questioningOptions.map(option=><button aria-pressed={draft.questioning===option.id} className={draft.questioning===option.id?'picked':''} key={option.id} onClick={()=>update({questioning:option.id})}>{option.label}</button>)}</div><button className="primary" disabled={!draft.questioning} onClick={next}>Keep going <ArrowRight size={17}/></button></>}
   {draft.step===2&&<><h1 className="thinking-question">Which clue would you use?</h1><div className="thinking-sources">{challenge.sources.map(source=><button aria-pressed={draft.source===source.id} className={draft.source===source.id?'picked':''} key={source.id} onClick={()=>update({source:source.id})}><small>{source.publisher}</small><h3>{source.title}</h3><p>{source.body}</p></button>)}<button aria-pressed={draft.source==='unsure'} className={draft.source==='unsure'?'picked':''} onClick={()=>update({source:'unsure'})}>I’m not sure which clue to use</button></div><button className="primary" disabled={!draft.source} onClick={next}>My last move <ArrowRight size={17}/></button></>}
   {draft.step===3&&<><h1 className="thinking-question">Tell your thinking story.</h1><p className="thinking-prompt">Why is your clue useful? What does it show about the claim?</p><details className="reading"><summary>Look at the clues again</summary>{challenge.sources.map(s=><p key={s.id}><b>{s.title}:</b> {s.body} {s.url&&<a href={s.url} target="_blank" rel="noopener noreferrer">Original source ↗</a>}</p>)}</details><label htmlFor="thinking-explanation">Your idea</label><div className="composer"><textarea id="thinking-explanation" value={draft.explanation} onChange={e=>update({explanation:e.target.value,modality:draft.modality==='voice'||draft.modality==='mixed'?'mixed':'text'})} maxLength={2000} rows={4} placeholder="Tell it your way…"/><button className={listening?'mic listening':'mic'} aria-label={listening?'Stop recording thinking':'Speak your thinking'} onClick={microphone}><Mic size={17}/>{listening?'Listening…':'Say it out loud'}</button></div><button className="primary" disabled={busy||listening} onClick={()=>void submit()}>{busy?'Saving your moves…':'Save my moves'} <ArrowRight size={17}/></button>{!draft.explanation.trim()&&<p className="fine-print">You can save without an explanation. Explaining will be marked “Not assessed.”</p>}</>}
   {draft.step>1&&<button className="text-button thinking-back" disabled={busy} onClick={()=>{stopVoice();update({step:(draft.step-1) as ThinkingDraft['step']});}}><ArrowLeft size={15}/> Back one move</button>}
  </>}
  {notice&&<p className="notice" role="status">{notice}</p>}
  <button className="text-button thinking-skip" disabled={busy} onClick={()=>{stopVoice();onSkip();}}>Skip this challenge for now</button>
 </section>;
}
