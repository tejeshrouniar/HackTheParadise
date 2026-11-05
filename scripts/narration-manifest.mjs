import { readFileSync, writeFileSync } from "node:fs";
const recap=readFileSync(new URL('../src/features/learning/QuestAftermath.tsx',import.meta.url),'utf8');
const readArray=name=>JSON.parse(recap.match(new RegExp('const '+name+' = (\\[.*?\\]);','s'))[1]);
const outcomes=readArray('outcomes'), explanations=readArray('explanations');
const journeySource=readFileSync(new URL('../src/content/journey.ts',import.meta.url),'utf8');
const journey=JSON.parse(journeySource.slice(journeySource.indexOf('['),journeySource.indexOf('] as const')+1));
const lines=Object.fromEntries(outcomes.map((line,i)=>['quest-'+(i+1),line+' '+explanations[i]]));
journey.forEach((chapter,c)=>chapter.lines.forEach((line,b)=>{lines['story-'+c+'-'+b]=line;}));
writeFileSync(new URL('narration.json',import.meta.url),JSON.stringify(lines,null,2)+'\n');
