import { NextResponse } from 'next/server';
import {validateResponse,scoreThinking} from '@/lib/thinking/rubric';
import {evaluateExplanation} from '@/lib/thinking/evaluator';
export async function POST(req:Request){try{
 const body=await req.json();if(!validateResponse(body))return NextResponse.json({error:'Please choose your moves and keep your explanation under 2,000 characters.'},{status:400});
 const evaluation=await evaluateExplanation(body);
 return NextResponse.json({record:scoreThinking(body,evaluation)},{headers:{'Cache-Control':'no-store'}});
}catch{return NextResponse.json({error:'Could not save. Your answers are still here; please try again.'},{status:400});}}
