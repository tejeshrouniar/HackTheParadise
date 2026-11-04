import test from 'node:test';
import assert from 'node:assert/strict';
import { journeyProgress, canEnterLevel } from '../src/features/learning/journeyProgress.ts';
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
