/** Curated parallel forms. Fictional posts; factual source notes are verified NASA paraphrases. */
export type ChallengeId = string;
export type AssessmentType='before'|'after';
export type GradeBand='K-2'|'3-5';
export const skillNames=['Questioning','Investigating','Explaining'] as const;
export type Skill=typeof skillNames[number];
export type Challenge = {
 id:string;form:string;gradeBand:GradeBand;skill:readonly Skill[];difficulty:number;equivalenceGroup:string;
 label:string;illustration:string;claim:string;context:string;question:string;
 verifiedAnswer:'true'|'false';verifiedExplanation:string;
 referenceSources:readonly {publisher:string;title:string;url:string}[];
 assessmentRubric:{version:'thinking-v2';maxPerSkill:2};
 questioningOptions:readonly {id:string;label:string;points:0|1|2}[];
 sources:readonly {id:string;publisher:string;title:string;body:string;url?:string;relevance:'relevant'|'superficial'|'irrelevant'}[];
};
export const challengeLibrary:readonly Challenge[]=[
 {
  id:'moonlight-a',form:'A',gradeBand:'3-5',skill:skillNames,difficulty:1,equivalenceGroup:'space-source-check',
  label:'The moonlight mystery',illustration:'🌙',claim:'“The Moon makes its own light.”',
  context:'A made-up video has 10,000 likes. Lumo wonders whether the claim is right.',
  question:'What would you do before sharing this Moon claim?',verifiedAnswer:'false',
  verifiedExplanation:'The Moon does not make its own light. We see sunlight reflected from its surface.',
  referenceSources:[{publisher:'NASA',title:'Moonlight',url:'https://science.nasa.gov/moon/moonlight/'}],
  assessmentRubric:{version:'thinking-v2',maxPerSkill:2},
  questioningOptions:[
   {id:'trust',label:'Trust it because the video has lots of likes',points:0},
   {id:'check',label:'Check where moonlight comes from using space scientists’ observations',points:2},
   {id:'reject',label:'Decide it is false without checking',points:0},
   {id:'unsure',label:'I’m unsure, but I don’t know what to check',points:1},
  ],
  sources:[
   {id:'popular',publisher:'Fictional video comments',title:'What viewers say',body:'Many viewers repeat the claim and tap “like.” They do not describe any observations.',relevance:'superficial'},
   {id:'unrelated',publisher:'NASA',title:'A different space topic',body:'NASA describes the Sun as a star. This card does not explain why the Moon looks bright.',url:'https://science.nasa.gov/sun/facts/',relevance:'irrelevant'},
   {id:'reference',publisher:'NASA',title:'Moonlight',body:'NASA explains that the Moon does not create its own light. Sunlight bounces off the Moon and reaches our eyes.',url:'https://science.nasa.gov/moon/moonlight/',relevance:'relevant'},
  ],
 },
 {
  id:'sun-star-b',form:'B',gradeBand:'3-5',skill:skillNames,difficulty:1,equivalenceGroup:'space-source-check',
  label:'The daytime-star mystery',illustration:'☀️',claim:'“The Sun is a star.”',
  context:'A made-up video has 12,000 likes. Lumo wonders whether this claim is right.',
  question:'Lumo wants to repeat this Sun claim. What is your first move?',verifiedAnswer:'true',
  verifiedExplanation:'The Sun is a star: a hot ball of gas that produces light and heat.',
  referenceSources:[{publisher:'NASA',title:'Sun Facts',url:'https://science.nasa.gov/sun/facts/'}],
  assessmentRubric:{version:'thinking-v2',maxPerSkill:2},
  questioningOptions:[
   {id:'reject',label:'Call it wrong because an AI might make mistakes',points:0},
   {id:'unsure',label:'I have doubts, but I don’t know what to check',points:1},
   {id:'check',label:'Check what the Sun is using space scientists’ observations',points:2},
   {id:'trust',label:'Repeat it because thousands of people liked it',points:0},
  ],
  sources:[
   {id:'unrelated',publisher:'NASA',title:'A different space topic',body:'NASA describes craters on the Moon. This card does not say what kind of object the Sun is.',url:'https://science.nasa.gov/moon/facts/',relevance:'irrelevant'},
   {id:'reference',publisher:'NASA',title:'Sun Facts',body:'NASA describes the Sun as a star. It is a hot ball of gas, making the light and heat that reach Earth.',url:'https://science.nasa.gov/sun/facts/',relevance:'relevant'},
   {id:'popular',publisher:'Fictional video comments',title:'What viewers say',body:'Many viewers say the video is great. Nobody explains how they checked what the Sun is.',relevance:'superficial'},
  ],
 },
];
export function selectChallengeForms(firstId=challengeLibrary[0].id):{before:Challenge;after:Challenge} {
 const before=challengeLibrary.find(c=>c.id===firstId);if(!before)throw Error('Unknown first form');
 const after=challengeLibrary.find(c=>c.id!==before.id&&c.equivalenceGroup===before.equivalenceGroup&&c.difficulty===before.difficulty&&c.gradeBand===before.gradeBand);
 if(!after)throw Error('No equivalent alternate form');return{before,after};
}
export const challenges=selectChallengeForms();
export const questioningOptions=challenges.before.questioningOptions;
export function getChallenge(id:string){return challengeLibrary.find(c=>c.id===id);}
export type ThinkingResponse={challengeId:string;assessmentType:AssessmentType;questioning:string;source:string;explanation:string;modality:'text'|'voice'|'mixed'};
export type ThinkingDraft={step:0|1|2|3;questioning:string;source:string;explanation:string;modality:'text'|'voice'|'mixed'};
export const emptyDraft:ThinkingDraft={step:0,questioning:'',source:'',explanation:'',modality:'text'};
export type ThinkingScore={score:number|null;max:2;reason:string;evidence:string[];status:'scored'|'requires-review'|'not-assessed'};
export type ThinkingRecord={
 response:ThinkingResponse;scores:Record<Skill,ThinkingScore>;completedAt:string;rubricVersion:'thinking-v2';independent:boolean;
 assessmentType:AssessmentType;overallScore:number|null;maxScore:6;knownSubtotal:number;
 aiAssistanceProvided:boolean;sampleData:boolean;evaluationMethod:'ai-rubric'|'deterministic'|'requires-review'|'sample';
 evaluationStatus:'complete'|'requires-review'|'incomplete';
};
export type ThinkingSession={
 before:ThinkingRecord|null;after:ThinkingRecord|null;beforeDraft:ThinkingDraft;afterDraft:ThinkingDraft;
 active:AssessmentType|null;pendingMission:number;baselineUnavailable:boolean;
 legacyRecords:{rubricVersion:string;raw:unknown}[];
};
export function newThinkingSession():ThinkingSession{return {before:null,after:null,beforeDraft:{...emptyDraft},afterDraft:{...emptyDraft},active:null,pendingMission:0,baselineUnavailable:false,legacyRecords:[]};}
