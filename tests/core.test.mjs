import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileQuestCode,QuestCodeError} from '../src/features/learning/questCompiler.ts';
import {normalizeUsername,usernameError,mergeLessons,safeUrl,messageError} from '../src/lib/validation.ts';
import {CODEDEX_LESSONS} from '../src/data/codedexLessons.ts';

test('all eight supplied quest solutions compile into real actions',()=>{
  for(const lesson of CODEDEX_LESSONS){const instructions=compileQuestCode(lesson.solutionCode);assert.ok(instructions.length>0,lesson.title);}
});
test('bridge functions only run when invoked and expand their real loop body',()=>{
  const solution=CODEDEX_LESSONS.find(l=>l.stageType==='bridge').solutionCode;
  assert.equal(compileQuestCode(solution).filter(i=>i.name==='place_starlight_tile').length,4);
  assert.deepEqual(compileQuestCode('def build_bridge():\n    place_starlight_tile()'),[]);
  assert.throws(()=>compileQuestCode('build_bridge()'),/Unknown command/);
});
test('stargate return values are calculated, not assumed to be 200',()=>{
  const solution=CODEDEX_LESSONS.find(l=>l.stageType==='stargate').solutionCode;
  assert.equal(compileQuestCode(solution).find(i=>i.name==='charge_stargate').args[0],200);
  assert.equal(compileQuestCode(solution.replace('calculate_flux(100)','calculate_flux(30)')).find(i=>i.name==='charge_stargate').args[0],60);
});
test('boss shield and all loop attacks execute',()=>{
  const actions=compileQuestCode(CODEDEX_LESSONS.at(-1).solutionCode);
  assert.deepEqual(actions[0],{line:1,name:'assign:mana_shield',args:[100]});
  assert.equal(actions.filter(a=>a.name==='cast_starlight_bolt').length,3);
});
test('sorting keeps the actual list values',()=>{
  assert.deepEqual(compileQuestCode('crystals = [5, 1, 3]\ncrystals.sort()').at(-1).args,[[1,3,5]]);
});
test('syntax errors keep their source location',()=>{
  assert.throws(()=>compileQuestCode('# hi\ndragon.fly()'),e=>e instanceof QuestCodeError&&e.line===1);
  assert.throws(()=>compileQuestCode('for step in range(4):\ngrow_flower()'),/indented body/);
  assert.throws(()=>compileQuestCode('    grow_flower()'),/left edge/);
  assert.throws(()=>compileQuestCode('purify_rune(1,2)'),/needs 1/);
});
test('untrusted code cannot execute JS, unlimited loops or recursion',()=>{
  for(const code of ['fetch("https://example.com")','eval(1)','while True:\n    grow_flower()','for x in range(100000000):\n    grow_flower()','def recurse():\n    recurse()\nrecurse()','for x in range(100):\n    for y in range(100):\n        grow_flower()'])assert.throws(()=>compileQuestCode(code));
});
test('usernames normalize consistently and reject invalid names',()=>{
  assert.equal(normalizeUsername('  Sparky_42 '),'sparky_42');
  assert.equal(usernameError('sparky_42'),'');
  for(const value of ['a','ABCD','bad name','name@here','x'.repeat(37),'a\nb'])assert.ok(usernameError(value));
});
test('progress merges without losing completions and ignores corrupted local data',()=>{
  assert.deepEqual(mergeLessons([1,3],[2,3,8],null,'oops',[0,9,'4',NaN]),[1,2,3,8]);
});
test('only https media links are usable and messages have real limits',()=>{
  assert.equal(safeUrl('javascript:alert(1)'),undefined);assert.equal(safeUrl('data:image/svg+xml,abc'),undefined);
  assert.equal(safeUrl('https://example.com/a'),'https://example.com/a');assert.ok(messageError(' '));assert.ok(messageError('a'.repeat(2001)));assert.equal(messageError('hello'),'');
});
test('writer content has stable, unique IDs and valid quest links',()=>{
  const story=JSON.parse(readFileSync(new URL('../src/content/stories/first-light.json',import.meta.url),'utf8'));
  const chapters=new Set();const positions=new Set();
  for(const chapter of story.chapters){assert.ok(!chapters.has(chapter.id));chapters.add(chapter.id);assert.ok(!positions.has(chapter.position));positions.add(chapter.position);assert.ok(CODEDEX_LESSONS.some(l=>l.id===chapter.lesson_id));const sections=new Set();for(const section of chapter.content){assert.ok(!sections.has(section.id));sections.add(section.id);assert.ok(['narration','dialogue','choice'].includes(section.type));if(section.type==='choice'){assert.ok(section.options.length>1);assert.equal(new Set(section.options.map(o=>o.id)).size,section.options.length);}}}
});
