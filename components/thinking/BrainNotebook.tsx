'use client';
import {Check,HelpCircle,X} from 'lucide-react';
import {type Brain} from '@/lib/brain';
export default function BrainNotebook({brain}:{brain:Brain}){
 return <div className="brain-notebook"><h2>My thinking rules</h2><p>What you teach me changes how I check the next claim.</p>{brain.beliefs.map(b=><article key={`${b.id}-${b.status}`} className={`brain-rule ${b.status}`}><span className="brain-rule-status">{b.status==='correct'?<Check size={16}/>:b.status==='incorrect'?<X size={16}/>:<HelpCircle size={16}/>} {b.status==='correct'?'CORRECT':b.status==='incorrect'?'INCORRECT':'NOT VERIFIED'}</span><p>{b.status==='correct'?b.correctBelief:b.originalBelief}</p>{b.studentEvidence&&<details><summary>You taught me this</summary><blockquote>{b.studentEvidence.explanation}</blockquote>{b.studentEvidence.sourceUrls.map(url=><a href={url} key={url} target="_blank" rel="noopener noreferrer">Read the evidence ↗</a>)}</details>}{b.migrated&&<small>Remembered from earlier practice; the original explanation was not recorded.</small>}</article>)}</div>;
}
