import { getChallenge, skillNames, type ThinkingRecord, type ThinkingResponse, type ThinkingScore } from './challenges';
export const RUBRIC_VERSION='thinking-v2';
export const fixedRubric={
 Questioning:['Accepts unsupported information or reaches an unsupported verdict.','Recognizes uncertainty but cannot explain what to check.','Identifies what needs verification and proposes a relevant check.'],
 Investigating:['Irrelevant evidence or superficial indicators only.','Potentially useful evidence with limited justification.','Relevant evidence and an explanation of why it helps evaluate the claim.'],
 Explaining:['Unsupported or incorrect explanation.','Partially correct explanation.','Clearly connects relevant evidence to a justified conclusion.'],
} as const;
export function validateResponse(value:unknown):value is ThinkingResponse{
 if(!value||typeof value!=='object')return false;const r=value as ThinkingResponse,c=getChallenge(r.challengeId);
 return !!c&&['before','after'].includes(r.assessmentType)&&c.questioningOptions.some(o=>o.id===r.questioning)
 &&(r.source==='unsure'||c.sources.some(s=>s.id===r.source))&&typeof r.explanation==='string'&&r.explanation.length<=2000&&['text','voice','mixed'].includes(r.modality);
}
export type AIEvaluation={investigationJustified:boolean;investigationQuote:string;explanationScore:0|1|2;explanationQuote:string;explanationReason:string;needsReview:boolean};
const score=(value:number|null,reason:string,evidence:string[],status:ThinkingScore['status']='scored'):ThinkingScore=>({score:value,max:2,reason,evidence,status});
/** Multiple choice is deterministic. Open responses are unscored until strict AI review succeeds. */
export function scoreThinking(r:ThinkingResponse, ai:AIEvaluation|null=null, now=new Date()):ThinkingRecord{
 const c=getChallenge(r.challengeId)!;const choice=c.questioningOptions.find(o=>o.id===r.questioning)!;
 const source=c.sources.find(s=>s.id===r.source);const text=r.explanation.trim();
 const q=score(choice.points,fixedRubric.Questioning[choice.points],[choice.label]);
 const i=!source?score(null,'No source selected.',[],'not-assessed')
  :source.relevance!=='relevant'?score(0,fixedRubric.Investigating[0],[`${source.publisher}: ${source.title}`])
  :!text?score(1,fixedRubric.Investigating[1],[`${source.publisher}: ${source.title}`])
  :!ai||ai.needsReview?score(null,'The source choice is saved; its justification needs review.',[`${source.publisher}: ${source.title}`],'requires-review')
  :score(ai.investigationJustified?2:1,fixedRubric.Investigating[ai.investigationJustified?2:1],[source.title,...(ai.investigationQuote?[ai.investigationQuote]:[])]);
 const e=!text?score(null,'No explanation recorded.',[],'not-assessed')
  :!ai||ai.needsReview?score(null,'The explanation is saved and needs review. No AI score was assumed.',[text],'requires-review')
  :score(ai.explanationScore,fixedRubric.Explaining[ai.explanationScore],[ai.explanationQuote||text]);
 const scores={Questioning:q,Investigating:i,Explaining:e};
 const values=skillNames.map(k=>scores[k]);const complete=values.every(v=>v.score!==null);
 const knownSubtotal=values.reduce((n,v)=>n+(v.score??0),0);
 return {response:{...r},scores,completedAt:now.toISOString(),rubricVersion:RUBRIC_VERSION,independent:true,
  assessmentType:r.assessmentType,overallScore:complete?knownSubtotal:null,maxScore:6,knownSubtotal,
  aiAssistanceProvided:false,sampleData:false,evaluationMethod:text?(ai&&!ai.needsReview?'ai-rubric':'requires-review'):'deterministic',
  evaluationStatus:values.some(v=>v.status==='requires-review')?'requires-review':complete?'complete':'incomplete'};
}
export function compareScore(before:ThinkingRecord|null,after:ThinkingRecord|null,skill:keyof ThinkingRecord['scores']){
 if(!before||!after||before.rubricVersion!==after.rubricVersion||before.sampleData!==after.sampleData)return null;
 const first=getChallenge(before.response.challengeId),last=getChallenge(after.response.challengeId);
 if(!first||!last||first.id===last.id||first.equivalenceGroup!==last.equivalenceGroup||first.gradeBand!==last.gradeBand||first.difficulty!==last.difficulty)return null;
 if(!before.sampleData&&(!before.independent||!after.independent||before.aiAssistanceProvided||after.aiAssistanceProvided))return null;
 const b=before.scores[skill].score,a=after.scores[skill].score;return b===null||a===null?null:a-b;
}
