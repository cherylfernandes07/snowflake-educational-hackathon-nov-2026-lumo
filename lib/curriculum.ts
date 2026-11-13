export type Evidence = {publisher:string;title:string;excerpt:string;url:string;date?:string};
export const missions = [
 {id:'wall',title:'The view from the Moon',claim:'Scientists confirm the Great Wall of China can be seen from the Moon!',query:'NASA Great Wall visible from Moon unaided eye',answer:'The Great Wall cannot be seen from the Moon with the unaided eye.',source:{publisher:'NASA',title:'Great Wall',excerpt:'NASA explains that the Great Wall cannot be seen from the Moon with the unaided eye. Seeing something from low Earth orbit is different from seeing it from the much more distant Moon.',url:'https://www.nasa.gov/image-article/great-wall/'},detail:'The Moon is much farther away than low Earth orbit. A popular post is not a measurement. NASA provides relevant expertise and an explanation you can check.'},
 {id:'lightning',title:'A striking new challenge',claim:'Lightning never strikes the same place twice.',query:'National Weather Service lightning same place twice myth',answer:'Lightning can strike the same place more than once.',source:{publisher:'National Weather Service',title:'Lightning Myths and Facts',excerpt:'The National Weather Service explains that lightning can strike the same location repeatedly, especially tall, pointy, isolated objects. Observations contradict the saying that it never strikes twice.',url:'https://www.weather.gov/safety/lightning-myths'},detail:'The National Weather Service explains that lightning can hit a location repeatedly. Its observations contradict the word “never” in the claim.'}
] as const;
export type Assessment = {score:number;popularity:boolean;evidence:boolean;connection:boolean;source:boolean};
export function assess(text:string):Assessment {
 const t=text.toLowerCase().replace(/[’‘]/g, "'");
 const popularity=/(like|popular|share|viral|people)/.test(t)&&/(not|n't|doesn|isn|aren|does not|no proof)/.test(t);
 const evidence=/(evidence|nasa|weather service|research|observation|measure|official|source)/.test(t);
 const connection=/(because|shows|explains|cannot|can't|repeated|more than once|too far|unaided|contradict)/.test(t);
 const source=/(nasa|weather service|expert|official|space agency|specialist)/.test(t);
 return {popularity,evidence,connection,source,score:evidence?(connection?3:2):(/check|proof|verify/.test(t)?1:0)};
}
export const initialBeliefs={popularity:false,ai:false,independent:false,evidence:false};
export type Beliefs=typeof initialBeliefs;
export function transferSpeech(b:Beliefs){return b.popularity?'Wait! You taught me that popular doesn’t mean true. Let’s look for evidence before I believe this.':b.evidence?'You taught me to check the evidence first. Let’s investigate this new claim together!':'Lots of people say this, but it is still an unverified guess. How can we check it?'}
