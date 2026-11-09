import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { journeyProgress, canEnterLevel } from '../src/features/learning/journeyProgress.ts';
const readJson=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
test('journey unlocks strictly in order and advances after each third spell',()=>{
  assert.equal(canEnterLevel(1,[]),true);
  assert.equal(canEnterLevel(2,[]),false);
  for(let count=0;count<=12;count++) {
    const done=Array.from({length:count},(_,i)=>i+1);
    assert.equal(journeyProgress(done).chapter,Math.min(3,Math.floor(count/3)));
    assert.equal(journeyProgress(done).cleared,count);
    assert.equal(canEnterLevel(count+2,done),false);
  }
});
test('old out-of-order saves do not bypass gaps and replay remains available',()=>{
  const saved=[1,2,4,12];
  assert.deepEqual(journeyProgress(saved),{cleared:2,next:3,chapter:0,finished:false});
  assert.equal(canEnterLevel(4,saved),false);
  assert.equal(canEnterLevel(1,saved),true);
  assert.equal(journeyProgress([...saved,3]).next,5);
  assert.equal(canEnterLevel(NaN,saved),false);
});
test('the current story and generated narration stay aligned',()=>{
  const chapters=readJson('../src/content/journey.json');
  const narration=readJson('../src/content/quest-narration.json');
  const manifest=readJson('../scripts/narration.json');
  assert.equal(chapters.length,4);
  assert.deepEqual(chapters.flatMap(chapter=>chapter.levels),Array.from({length:12},(_,index)=>index+1));
  for(const chapter of chapters){
    assert.equal(chapter.levels.length,3);
    assert.equal(chapter.stops.length,3);
    assert.equal(chapter.lines.length,3);
    assert.ok(['dawn','moon','amber','sunrise'].includes(chapter.theme));
  }
  assert.equal(narration.outcomes.length,12);
  assert.equal(narration.explanations.length,12);
  narration.outcomes.forEach((outcome,index)=>{
    assert.equal(manifest[`quest-${index+1}`],`${outcome} ${narration.explanations[index]}`);
  });
  chapters.forEach((chapter,chapterIndex)=>chapter.lines.forEach((line,beat)=>{
    assert.equal(manifest[`story-${chapterIndex}-${beat}`],line);
  }));
});
