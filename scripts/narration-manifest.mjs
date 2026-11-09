import { readFileSync, writeFileSync } from "node:fs";
// Keep generated speech aligned with the same JSON content the app imports.
const content = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const { outcomes, explanations } = content("../src/content/quest-narration.json");
const journey = content("../src/content/journey.json");
const lines=Object.fromEntries(outcomes.map((line,i)=>['quest-'+(i+1),line+' '+explanations[i]]));
journey.forEach((chapter,c)=>chapter.lines.forEach((line,b)=>{lines['story-'+c+'-'+b]=line;}));
writeFileSync(new URL('narration.json',import.meta.url),JSON.stringify(lines,null,2)+'\n');
