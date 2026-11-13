'use client';
import {skillNames,getChallenge,type ThinkingSession,type ThinkingRecord,type ThinkingScore} from '@/lib/thinking/challenges';
import {compareScore} from '@/lib/thinking/rubric';

export function scoreLabel(s?:ThinkingScore){return s?.status==='requires-review'?'Needs review':s?.score==null?'Not assessed':`${s.score}/2`;}
function ScoreDots({value}:{value?:ThinkingScore}){
 return <span className="thinking-score"><span className="thinking-stars" aria-hidden="true">{[1,2].map(n=><i key={n} className={value?.score!=null&&value.score>=n?'earned':''}/>)}</span><small>{scoreLabel(value)}</small></span>;
}
export function ThinkingEvidence({record,label}:{record:ThinkingRecord;label:string}){
 const c=getChallenge(record.response.challengeId)!;
 return <article><h3>{label} · Form {c.form}</h3><p>{record.sampleData?'SAMPLE DATA · Demonstration input':record.aiAssistanceProvided?'AI assistance provided · not independent':'Uncoached assessment path · no in-app AI assistance'}</p><p>{c.questioningOptions.find(o=>o.id===record.response.questioning)?.label} · Selected {c.sources.find(s=>s.id===record.response.source)?.title||'no source'}.</p><blockquote>{record.response.explanation||'No explanation recorded.'}</blockquote><p className="fine-print">{record.response.modality} · {record.rubricVersion} · {record.evaluationMethod} · {new Date(record.completedAt).toLocaleString()}</p>{skillNames.map(skill=><div key={skill}><p><b>{skill} · {scoreLabel(record.scores[skill])}:</b> {record.scores[skill].reason}</p>{record.scores[skill].evidence.map((e,i)=><blockquote key={i}>{e}</blockquote>)}</div>)}<p><b>{c.verifiedAnswer==='true'?'✓ CORRECT CLAIM':'× INCORRECT CLAIM'}:</b> {c.verifiedExplanation}</p>{c.referenceSources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.publisher}: {s.title} ↗</a>)}</article>;
}
export default function ThinkingSummary({session,onTryFinal}:{session:ThinkingSession;onTryFinal?:()=>void}){
 const{before,after}=session;const sample=!!(before?.sampleData||after?.sampleData);
 return <section className="thinking-summary" aria-label="Lumo Thinking Skills"><span className="eyebrow">LUMO THINKING SKILLS{sample?' · SAMPLE DATA':''}</span><h2>Your Thinking Skills</h2>
 {!after?<><p>{before?'Your first moves are saved. Try the final mystery to see both snapshots.':'No before-and-after pair yet. You can still try a mystery on your own.'}</p>{onTryFinal&&<button className="primary" onClick={onTryFinal}>Try my own mystery</button>}</>:<>
 <p>{sample?'Sample responses show how the demo works. These are not student results.':'Three skills you practiced, one move at a time.'}</p>
 <div className="skill-comparison"><div className="skill-table-head"><span>Skill</span><span>Before</span><span>After</span></div>{skillNames.map(skill=>{
 const delta=compareScore(before,after,skill);
 return <div className="skill-row" key={skill}><div><b>{skill}</b><small>{delta===null?'No comparison yet':delta>0?`${sample?'Sample: ':''}+${delta} on this challenge`:delta===0?'Same score on these moves':`${delta} on this challenge · keep practicing`}</small></div><ScoreDots value={before?.scores[skill]}/><ScoreDots value={after.scores[skill]}/></div>;
 })}<div className="skill-row total-row"><b>Total</b><span>{before?.overallScore==null?before?'Incomplete':'Not assessed':`${before.overallScore}/6`}</span><span>{after.overallScore==null?'Incomplete':`${after.overallScore}/6`}</span></div></div>
 {after.evaluationStatus==='requires-review'&&<p className="review-note">Your ideas are saved. Some explanations need a grown-up to review them; we have not guessed a score.</p>}
 <p className="fine-print">Illustrative indicators from two different tasks, not scientifically validated learning gains or a measure of intelligence. Missing scores are not zeros.</p>
 {!before&&<p className="fine-print">The first challenge was skipped or practice had already begun. We cannot measure a before-and-after change.</p>}
 <details className="thinking-evidence"><summary>See my moves and what counted</summary>{before&&<ThinkingEvidence record={before} label="Before"/>}<ThinkingEvidence record={after} label="After"/></details>
 </>}
 {session.legacyRecords.length>0&&<p className="fine-print">An earlier prototype snapshot is preserved for the grown-up view. Its different rubric is not compared with this /6 scale.</p>}
 </section>;
}
