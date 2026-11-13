/** Explicitly authored demonstration responses; never independent assessment results. */
import {challenges,type ThinkingRecord,type ThinkingResponse} from './challenges';
import {scoreThinking,type AIEvaluation} from './rubric';
export const sampleResponses:Record<'before'|'after',ThinkingResponse>={
 before:{assessmentType:'before',challengeId:challenges.before.id,questioning:'unsure',source:'popular',explanation:'I am not sure. Many people liked it.',modality:'text'},
 after:{assessmentType:'after',challengeId:challenges.after.id,questioning:'check',source:'reference',explanation:'NASA studies the Sun. Its page explains that the Sun is a star, a hot ball of gas making light and heat. That evidence supports the claim, not the likes.',modality:'text'},
};
export function sampleAssessment(kind:'before'|'after'):ThinkingRecord{
 const ai:AIEvaluation=kind==='after'?{investigationJustified:true,investigationQuote:'NASA studies the Sun.',explanationScore:2,explanationQuote:'the Sun is a star, a hot ball of gas making light and heat',explanationReason:'Sample clearly links the science evidence to the claim.',needsReview:false}:{investigationJustified:false,investigationQuote:'',explanationScore:0,explanationQuote:'',explanationReason:'Sample response is unsupported.',needsReview:false};
 return {...scoreThinking(sampleResponses[kind],ai),independent:false,sampleData:true,aiAssistanceProvided:true,evaluationMethod:'sample'};
}
