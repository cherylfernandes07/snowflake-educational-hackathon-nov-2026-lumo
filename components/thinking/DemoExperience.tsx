'use client';
import {useState} from 'react';
import {ArrowRight,Search} from 'lucide-react';
import LearningCompanion from '@/components/animation/LearningCompanion';
import {newBrain,teachBrain,brainTransfer} from '@/lib/brain';
import {missions,type Evidence} from '@/lib/curriculum';
import {newThinkingSession} from '@/lib/thinking/challenges';
import {sampleAssessment,sampleResponses} from '@/lib/thinking/samples';
import ThinkingSummary from './ThinkingSummary';
import BrainNotebook from './BrainNotebook';
const explanation='NASA explains that the Great Wall cannot be seen from the Moon with the unaided eye. Lots of likes do not make it true; we need evidence from experts.';
export default function DemoExperience(){
 const[step,setStep]=useState(0),[brain,setBrain]=useState(newBrain),[sources,setSources]=useState<Evidence[]>([]),[mode,setMode]=useState(''),[busy,setBusy]=useState(false);
 const[session,setSession]=useState(newThinkingSession);const[text,setText]=useState(explanation);
 async function search(){setBusy(true);try{const r=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:missions[0].query,mission:0})});const d=await r.json();setSources(d.sources?.length?d.sources:[missions[0].source]);setMode(d.mode||'Preloaded official evidence');}catch{setSources([missions[0].source]);setMode('Preloaded official evidence · network unavailable');}finally{setBusy(false);}}
 return <section className="demo-experience" aria-label="Sample demonstration"><span className="eyebrow">SAMPLE DEMO · NOT STUDENT PROGRESS</span><p className="demo-banner">Prepared inputs and scores are sample data. This demo does not overwrite the student’s session.</p>
 {step<6&&<div className="demo-robot"><LearningCompanion coreState={step===4?5:step===3?4:step===5?7:0} emotion={1} gesture={step===3?4:0}/></div>}
 {step===0&&<><h2>A first thinking snapshot</h2><p>Example learner: “{sampleResponses.before.explanation}”</p><button className="primary" onClick={()=>{setSession(s=>({...s,before:sampleAssessment('before')}));setStep(1);}}>Use sample first moves <ArrowRight size={17}/></button></>}
 {step===1&&<><h2>“Lots of likes… it must be true?”</h2><p>{missions[0].claim}</p><span className="status unknown">? NOT VERIFIED</span><button className="primary" onClick={()=>setStep(2)}>Challenge Lumo’s guess <ArrowRight size={17}/></button></>}
 {step===2&&<><h2>Popularity is not proof.</h2><p>Demonstration input: “Let’s check what space scientists observed.”</p><button className="primary" onClick={()=>{setStep(3);setSources([missions[0].source]);setMode('Preloaded official evidence · sample demo');}}>Find a clue <Search size={17}/></button></>}
 {step===3&&<><h2>What does the evidence show?</h2><small className="service-label">{mode}</small>{sources.map(s=><article className="clue-card" key={s.url}><small>{s.publisher}</small><h3>{s.title}</h3><p>{s.excerpt.slice(0,260)}</p><a href={s.url} target="_blank" rel="noopener noreferrer">Original source ↗</a></article>)}<button className="text-button" disabled={busy} onClick={()=>void search()}>{busy?'Searching…':'Try live Keenable search'}</button><label htmlFor="demo-lesson">Demonstration explanation (editable)</label><textarea id="demo-lesson" value={text} onChange={e=>setText(e.target.value)}/><button className="primary" onClick={()=>{const next=teachBrain(brain,text,0,'false',missions[0].source);setBrain(next);if(next.beliefs.some(b=>b.status==='correct'))setStep(4);else setMode('Explain what NASA says about seeing the Wall from the Moon, and why likes are not proof.');}}>Teach this principle <ArrowRight size={17}/></button></>}
 {step===4&&<><h2>You changed my thinking.</h2><span className="status incorrect">× INCORRECT CLAIM</span><p>{missions[0].answer}</p><BrainNotebook brain={brain}/><button className="primary" onClick={()=>setStep(5)}>Try a new situation <ArrowRight size={17}/></button></>}
 {step===5&&<><h2>“The Sun is a star.”</h2><p>{brainTransfer(brain)}</p><p>Different claim. In the sample final response, the learner checks NASA and explains why its evidence supports this true claim.</p><details><summary>Sample final explanation</summary><p>{sampleResponses.after.explanation}</p></details><button className="primary" onClick={()=>{setSession(s=>({...s,after:sampleAssessment('after')}));setStep(6);}}>Use sample final moves <ArrowRight size={17}/></button></>}
 {step===6&&<><ThinkingSummary session={session}/><button className="primary" onClick={()=>{setStep(0);setBrain(newBrain());setSession(newThinkingSession());}}>Replay sample demo</button></>}
 </section>;
}
