import {newThinkingSession,skillNames,getChallenge,challenges,type ThinkingSession,type ThinkingRecord,type ThinkingDraft} from './challenges';
import {validateResponse} from './rubric';
export function validThinkingRecord(r:unknown):r is ThinkingRecord{
 if(!r||typeof r!=='object')return false;const x=r as ThinkingRecord;
 if(!validateResponse(x.response)||x.rubricVersion!=='thinking-v2'||x.assessmentType!==x.response.assessmentType||typeof x.independent!=='boolean'||typeof x.sampleData!=='boolean'||typeof x.aiAssistanceProvided!=='boolean'||typeof x.completedAt!=='string'||x.maxScore!==6||!x.scores)return false;
 if(!skillNames.every(k=>{const v=x.scores[k];return !!v&&v.max===2&&(v.score===null||Number.isInteger(v.score)&&v.score>=0&&v.score<=2)&&typeof v.reason==='string'&&Array.isArray(v.evidence)&&v.evidence.every(e=>typeof e==='string')&&['scored','requires-review','not-assessed'].includes(v.status)&&(v.status==='scored'?v.score!==null:v.score===null);} ))return false;
 const values=skillNames.map(k=>x.scores[k].score),sum=values.reduce<number>((n,v)=>n+(v??0),0);
 return x.knownSubtotal===sum&&x.overallScore===(values.every(v=>v!==null)?sum:null)&&['complete','requires-review','incomplete'].includes(x.evaluationStatus)&&['ai-rubric','deterministic','requires-review','sample'].includes(x.evaluationMethod);
}
function validDraft(x:unknown,formId:string):x is ThinkingDraft{
 if(!x||typeof x!=='object')return false;const d=x as ThinkingDraft,c=getChallenge(formId)!;
 return [0,1,2,3].includes(d.step)&&(!d.questioning||c.questioningOptions.some(o=>o.id===d.questioning))&&(!d.source||d.source==='unsure'||c.sources.some(s=>s.id===d.source))&&typeof d.explanation==='string'&&d.explanation.length<=2000&&['text','voice','mixed'].includes(d.modality);
}
export function restoreThinkingSession(raw:unknown):ThinkingSession{
 const out=newThinkingSession();if(!raw||typeof raw!=='object')return out;const s=raw as ThinkingSession;
 for(const kind of ['before','after'] as const){
  const r=s[kind];
  if(validThinkingRecord(r)&&r.assessmentType===kind&&!r.sampleData)out[kind]=r;
  else if(r&&typeof r==='object'&&'rubricVersion' in r&&String(r.rubricVersion)==='thinking-v1'){out.legacyRecords.push({rubricVersion:'thinking-v1',raw:r});out.baselineUnavailable=true;}
 }
 if(Array.isArray(s.legacyRecords))out.legacyRecords.push(...s.legacyRecords.filter(r=>r&&r.rubricVersion==='thinking-v1').slice(0,2));
 if(!out.legacyRecords.length){if(validDraft(s.beforeDraft,challenges.before.id))out.beforeDraft=s.beforeDraft;if(validDraft(s.afterDraft,challenges.after.id))out.afterDraft=s.afterDraft;}
 if((s.active==='before'&&!out.before&&!out.baselineUnavailable)||(s.active==='after'&&!out.after))out.active=s.active;
 out.pendingMission=s.pendingMission===1?1:0;out.baselineUnavailable=out.baselineUnavailable||!!s.baselineUnavailable;
 return out;
}
