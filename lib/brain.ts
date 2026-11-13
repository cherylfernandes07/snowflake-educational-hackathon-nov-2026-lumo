import {initialBeliefs,missions,type Beliefs,type Evidence} from './curriculum';
export type PrincipleId=keyof Beliefs;
export type BrainBelief={id:PrincipleId;originalBelief:string;correctBelief:string;status:'incorrect'|'not-verified'|'correct';studentEvidence:null|{explanation:string;sourceUrls:string[];taughtAt:string};migrated?:boolean};
export type Brain={version:1;beliefs:BrainBelief[]};
export function newBrain():Brain{return {version:1,beliefs:[
 {id:'popularity',originalBelief:'Popular claims are always true.',correctBelief:'Popularity is not proof. Check evidence.',status:'incorrect',studentEvidence:null},
 {id:'evidence',originalBelief:'A confident answer is enough without evidence.',correctBelief:'Use relevant evidence before deciding.',status:'incorrect',studentEvidence:null},
 {id:'ai',originalBelief:'AI answers are always accurate.',correctBelief:'AI can make mistakes. Check its evidence.',status:'incorrect',studentEvidence:null},
 {id:'independent',originalBelief:'Independent sources might help check information.',correctBelief:'Compare relevant, independent sources.',status:'not-verified',studentEvidence:null},
]};}
export function beliefFlags(brain:Brain):Beliefs{
 const flags={...initialBeliefs};brain.beliefs.forEach(b=>{flags[b.id]=b.status==='correct';});return flags;
}
export function restoreBrain(raw:unknown,legacy?:Partial<Beliefs>):Brain{
 const brain=newBrain();const source=raw as Brain|undefined;
 for(const b of brain.beliefs){
  const stored=source?.version===1&&Array.isArray(source.beliefs)?source.beliefs.find(v=>v.id===b.id):undefined;
  if(stored&&['correct','incorrect','not-verified'].includes(stored.status)){
   b.status=stored.status;
   if(stored.studentEvidence&&typeof stored.studentEvidence.explanation==='string'&&Array.isArray(stored.studentEvidence.sourceUrls)&&stored.studentEvidence.sourceUrls.every(u=>typeof u==='string'&&/^https:\/\//.test(u))&&typeof stored.studentEvidence.taughtAt==='string'){ b.studentEvidence={...stored.studentEvidence}; b.migrated=false; }
   if(b.status==='correct'&&!b.studentEvidence)b.migrated=true;
  }else if(legacy?.[b.id]){b.status='correct';b.migrated=true;}
 }
 return brain;
}
export function evaluateTeaching(explanation:string,mission:number,conclusion:string,source:Evidence|null){
 const text=explanation.toLowerCase().replace(/[’‘]/g,"'");
 let relevantSource=false;
 try{const host=new URL(source?.url||'').hostname;relevantSource=mission===1?host==='weather.gov'||host.endsWith('.weather.gov'):host==='nasa.gov'||host.endsWith('.nasa.gov');}catch{}
 const wall=/(great wall|wall|it)/.test(text)&&/(moon|unaided)/.test(text)&&/(cannot|can't|not visible|not seen|can't be seen|too far|doesn't|do not|not be seen)/.test(text);
 const lightning=/lightning|it/.test(text)&&/(same place|same spot|twice|repeated|more than once)/.test(text)&&!/(never|can't|cannot|not strike|doesn't strike)/.test(text);
 const usesEvidence=/(nasa|weather service|source|evidence|observ|research|expert|explain)/.test(text);
 const supported=conclusion==='false'&&relevantSource&&usesEvidence&&(mission===1?lightning:wall);
 const clauses=text.split(/[.!?;]+/);
 const popularity=clauses.some(c=>/(like|popular|share|viral|people)/.test(c)&&/(not (proof|evidence|truth|mean|make|prove|establish|enough)|n't (mean|make|prove|establish)|no proof|not always (true|right|correct))/.test(c));
 const ai=clauses.some(c=>/(\bai\b|artificial intelligence)/.test(c)&&/(can make mistakes|can be wrong|not always (accurate|right|correct)|sometimes (gets|is|can be).*wrong)/.test(c));
 return {supported,principles:supported?(['evidence',...(popularity?['popularity']:[]),...(ai?['ai']:[])] as PrincipleId[]):[],hint:!relevantSource?'Let’s choose a source with knowledge about this claim first.':'What does your source show about this claim? Explain how it supports your answer.'};
}
export function teachBrain(brain:Brain,explanation:string,mission:number,conclusion:string,source:Evidence|null,now=new Date()):Brain{
 const evaluated=evaluateTeaching(explanation,mission,conclusion,source);
 return {...brain,beliefs:brain.beliefs.map(b=>evaluated.principles.includes(b.id)?{...b,status:'correct',migrated:false,studentEvidence:{explanation,sourceUrls:source?[source.url]:[],taughtAt:now.toISOString()}}:{...b})};
}
export function brainTransfer(brain:Brain){
 const flags=beliefFlags(brain);
 return flags.popularity?'Wait! You taught me that popular doesn’t mean true. Let’s look for evidence before I believe this.'
 :flags.evidence?'You taught me to check relevant evidence first. I’ll investigate this new claim before deciding.'
 :'People repeat this claim, but it is still unverified. How can we check it?';
}
