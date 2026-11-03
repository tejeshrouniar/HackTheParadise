import { safeUrl } from '../lib/validation';
export interface MusicTrack {id:string;title:string;artist:string;url?:string;sourceUrl?:string;license?:string;licenseUrl?:string;preset?:string;}
export const soundscapes:MusicTrack[]=[
  {id:'twilight',preset:'twilight',title:'Twilight sanctuary',artist:'Storicode · synthesized soundscape'},
  {id:'citadel',preset:'citadel',title:'Cyber citadel',artist:'Storicode · synthesized soundscape'},
  {id:'meadow',preset:'meadow',title:'Arcane meadow',artist:'Storicode · synthesized soundscape'},
];
const cache=new Map<string,MusicTrack[]>();
export async function searchMusic(query:string,signal:AbortSignal):Promise<MusicTrack[]> {
  const term=query.trim().slice(0,100).toLowerCase();if(cache.has(term))return cache.get(term)!;
  const params=new URLSearchParams({q:term,license:'cc0,by',category:'music',mature:'false',page_size:'6'});
  const response=await fetch(`https://api.openverse.org/v1/audio/?${params}`,{signal});
  if(!response.ok)throw new Error(response.status===429?'The music catalog is busy. Wait a minute before searching again.':`Music search is unavailable (${response.status}). The included soundscapes still work.`);
  const data=await response.json();
  const tracks:MusicTrack[]=(Array.isArray(data.results)?data.results:[]).filter((item:any)=>!item.mature&&['by','cc0'].includes(item.license)&&safeUrl(item.url)&&safeUrl(item.license_url)&&safeUrl(item.foreign_landing_url)).map((item:any)=>({id:String(item.id),title:String(item.title||'Untitled'),artist:String(item.creator||'Unknown creator'),url:safeUrl(item.url),sourceUrl:safeUrl(item.foreign_landing_url),license:`CC ${item.license.toUpperCase()} ${item.license_version??''}`.trim(),licenseUrl:safeUrl(item.license_url)}));
  cache.set(term,tracks);return tracks;
}
