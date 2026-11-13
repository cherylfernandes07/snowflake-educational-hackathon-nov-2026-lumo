import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scoreThinking,validateResponse,compareScore,type AIEvaluation} from '../lib/thinking/rubric';
import {validateEvaluation,evaluateExplanation} from '../lib/thinking/evaluator';
import {restoreThinkingSession} from '../lib/thinking/session';
import {newThinkingSession,selectChallengeForms,challengeLibrary,type ThinkingResponse} from '../lib/thinking/challenges';
import {sampleAssessment} from '../lib/thinking/samples';
const response:ThinkingResponse={assessmentType:'before',challengeId:'moonlight-a',questioning:'check',source:'reference',explanation:'NASA studies the Moon. Its page says sunlight bounces off the Moon. This shows the Moon does not make its own light.',modality:'voice'};
const ai:AIEvaluation={investigationJustified:true,investigationQuote:'NASA studies the Moon.',explanationScore:2,explanationQuote:'sunlight bounces off the Moon',explanationReason:'Evidence is connected to the conclusion.',needsReview:false};
test('all skills use 0–2, total /6, with specific supporting evidence',()=>{
 const r=scoreThinking(response,ai);assert.equal(r.overallScore,6);assert.equal(r.maxScore,6);
 for(const s of Object.values(r.scores)){assert.equal(s.max,2);assert.equal(s.score,2);assert.ok(s.evidence.length);}
 assert.equal(r.assessmentType,'before');assert.equal(r.aiAssistanceProvided,false);
});
test('choice grading distinguishes superficial evidence and uncertainty from a relevant plan',()=>{
 const r=scoreThinking({...response,questioning:'unsure',source:'popular'},ai);
 assert.equal(r.scores.Questioning.score,1);assert.equal(r.scores.Investigating.score,0);
 const limited=scoreThinking(response,{...ai,investigationJustified:false,investigationQuote:''});
 assert.equal(limited.scores.Investigating.score,1);
});
test('unavailable/uncertain AI produces review flags and no fabricated total',()=>{
 const r=scoreThinking(response);assert.equal(r.scores.Explaining.score,null);assert.equal(r.scores.Investigating.score,null);
 assert.equal(r.evaluationStatus,'requires-review');assert.equal(r.overallScore,null);assert.equal(r.knownSubtotal,2);
 assert.equal(scoreThinking(response,{...ai,needsReview:true}).scores.Explaining.status,'requires-review');
});
test('empty explanation stays unassessed and source selection earns at most partial credit',()=>{
 const r=scoreThinking({...response,explanation:''});assert.equal(r.scores.Investigating.score,1);assert.equal(r.scores.Explaining.status,'not-assessed');assert.equal(r.overallScore,null);
});
test('AI outputs cannot invent criteria, quotes, scores or override factual keys',()=>{
 assert.ok(validateEvaluation(ai,response.explanation));
 assert.ok(!validateEvaluation({...ai,explanationScore:3},response.explanation));
 assert.ok(!validateEvaluation({...ai,explanationQuote:'a quote the child never said'},response.explanation));
 assert.ok(!validateEvaluation({...ai,newCriterion:2},response.explanation));
 const original=challengeLibrary[0].verifiedAnswer;scoreThinking(response,ai);assert.equal(challengeLibrary[0].verifiedAnswer,original);
});
test('equivalent forms have different IDs and questions, equal difficulty and real sources, including true/false',()=>{
 const p=selectChallengeForms();assert.notEqual(p.before.id,p.after.id);assert.notEqual(p.before.question,p.after.question);
 assert.equal(p.before.difficulty,p.after.difficulty);assert.equal(p.before.gradeBand,p.after.gradeBand);
 assert.deepEqual(new Set(challengeLibrary.map(c=>c.verifiedAnswer)),new Set(['true','false']));
 challengeLibrary.forEach(c=>{assert.equal(c.skill.length,3);assert.ok(c.referenceSources.every(s=>s.url.startsWith('https://science.nasa.gov/')));});
 assert.equal(selectChallengeForms(p.after.id).after.id,p.before.id);
});
test('comparisons report equal/lower results and exclude assisted/sample mixed pairs',()=>{
 const b=scoreThinking(response,ai),a=scoreThinking({...response,assessmentType:'after',challengeId:'sun-star-b',questioning:'trust'},ai);
 assert.equal(compareScore(b,a,'Questioning'),-2);assert.equal(compareScore(b,a,'Explaining'),0);assert.equal(compareScore(b,b,'Explaining'),null);
 assert.equal(compareScore(null,a,'Questioning'),null);
 assert.equal(compareScore({...b,aiAssistanceProvided:true},a,'Questioning'),null);
 assert.equal(compareScore(sampleAssessment('before'),a,'Questioning'),null);
 assert.equal(compareScore(sampleAssessment('before'),sampleAssessment('after'),'Questioning'),1);
});
test('new records/drafts restore, v1 data is archived without rescaling or invented baseline',()=>{
 const s=newThinkingSession();s.before=scoreThinking(response,ai);s.afterDraft={step:2,questioning:'check',source:'reference',explanation:'saved',modality:'text'};
 assert.deepEqual(restoreThinkingSession(JSON.parse(JSON.stringify(s))),s);
 const old=restoreThinkingSession({before:{rubricVersion:'thinking-v1',scores:{Explaining:{score:3,max:3}}}});
 assert.equal(old.before,null);assert.equal(old.legacyRecords.length,1);assert.ok(old.baselineUnavailable);
 assert.equal(restoreThinkingSession({before:{rubricVersion:'thinking-v2',scores:'bad'}}).before,null);
});
test('invalid response fields and unrecognized scenarios are rejected',()=>{
 assert.ok(validateResponse(response));
 for(const patch of [{assessmentType:'practice'},{challengeId:'moon-shoes'},{source:'timing'},{explanation:1},{explanation:'x'.repeat(2001)},{modality:'demo'}])assert.ok(!validateResponse({...response,...patch}));
});
test('evaluator failure stays reviewable instead of substituting a heuristic score',async()=>{
 const prior=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='test-not-a-real-key';
 try{const failed=await evaluateExplanation(response,async()=>{throw Error('offline');});assert.equal(failed,null);
 const malformed=await evaluateExplanation(response,async()=>new Response(JSON.stringify({choices:[{message:{content:'{}'}}]})));assert.equal(malformed,null);
 }finally{if(prior===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=prior;}
});
