import {NextResponse} from 'next/server';
import {Keenable} from 'keenable';
import {missions} from '@/lib/curriculum';
import {allowedSource,searchDomain} from '@/lib/source-policy';
export async function POST(req:Request){
 const body=await req.json().catch(()=>({})),mission=body.mission===1?1:0,m=missions[mission];
 const query=typeof body.query==='string'?body.query.trim().slice(0,300):m.query;
 if(!query)return NextResponse.json({error:'Enter something to search.'},{status:400});
 const site=searchDomain(query,mission,!!body.custom);
 try{
  const client=new Keenable({apiKey:process.env.KEENABLE_API_KEY,timeoutMs:8000});
  const result=await client.search(query,{maxResults:4,site,snippetMaxLength:550});
  const sources=result.results.filter(r=>allowedSource(r.url)).slice(0,3).map(r=>({publisher:new URL(r.url).hostname.replace('www.',''),title:r.title,excerpt:r.snippet.slice(0,550),url:r.url,date:r.publishedAt}));
  if(!sources.length)throw Error();
  return NextResponse.json({sources,mode:'Live Keenable search · selected science sources',scope:site,notice:'Expertise helps us choose a source. Check whether its evidence actually supports this claim.'});
 }catch{return NextResponse.json({sources:body.custom?[]:[m.source],mode:body.custom?'Search unavailable · insufficient evidence for this claim':'Preloaded official evidence · search unavailable',scope:site});}
}
