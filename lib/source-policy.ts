/** Editor-curated publishers for an elementary classroom, not a truth score. */
export const sourceDomains=['nasa.gov','weather.gov','noaa.gov','nps.gov','si.edu','usgs.gov'] as const;
export function allowedSource(url:string){try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&sourceDomains.some(d=>u.hostname===d||u.hostname.endsWith(`.${d}`));}catch{return false;}}
export function searchDomain(query:string,mission:number,custom:boolean){
 if(!custom)return mission===1?'weather.gov':'nasa.gov';
 if(/weather|lightning|storm|cloud|rain|snow/i.test(query))return 'weather.gov';
 if(/ocean|whale|dolphin|fish|sea /i.test(query))return 'noaa.gov';
 if(/animal|dinosaur|insect|bird|history|museum/i.test(query))return 'si.edu';
 if(/earthquake|rock|volcano|water|river/i.test(query))return 'usgs.gov';
 if(/space|moon|sun|star|planet|astronaut/i.test(query))return 'nasa.gov';
 return 'nps.gov';
}
