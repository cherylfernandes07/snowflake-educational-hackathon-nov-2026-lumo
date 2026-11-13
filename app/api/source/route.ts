import { NextResponse } from 'next/server';
import { Keenable } from 'keenable';
import { allowedSource } from '@/lib/source-policy';
import { missions } from '@/lib/curriculum';
export async function POST(req:Request){
 const body=await req.json().catch(()=>({}));const {url}=body;
 if(typeof url!=='string'||!allowedSource(url))return NextResponse.json({error:'Choose one of our selected science sources.'},{status:400});
 try{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname.includes('.')||/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname))throw Error();}
 catch{return NextResponse.json({error:'Choose a public HTTPS source.'},{status:400})}
 const source=missions.find(m=>m.source.url===url);
 try{const client=new Keenable({apiKey:process.env.KEENABLE_API_KEY,timeoutMs:8000});const page=await client.fetch(url);return NextResponse.json({content:page.content.slice(0,10000),mode:'Live Keenable page retrieval'});}
 catch{return NextResponse.json({content:source?.source.excerpt||'The page could not be retrieved. Open the original source to read it.',mode:source?'Preloaded official source summary':'Page retrieval unavailable'});}
}
