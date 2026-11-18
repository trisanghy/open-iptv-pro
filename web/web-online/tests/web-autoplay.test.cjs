'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {start}=require('../web-autoplay.js');
const error=(name='NotAllowedError')=>Object.assign(new Error(name),{name});
function player(rejections=[]){
 const state={muted:false,defaultMuted:false,paused:true,calls:0,queue:rejections};
 state.play=()=>{
  state.calls++;
  const next=state.queue.shift();
  if(next)return Promise.reject(next);
  state.paused=false;
  return Promise.resolve();
 };
 return state;
}
test('audible playback is always attempted first',async()=>{
 const v=player();
 const done=await start(v);
 assert.equal(done.status,'audible');
 assert.equal(v.calls,1);
 assert.equal(v.muted,false);
});
test('on blocked sound, retry muted playback automatically',async()=>{
 const v=player([error()]);let notified=0;
 const done=await start(v,{onMuted:()=>notified++});
 assert.equal(done.status,'muted');
 assert.equal(done.fallback,true);
 assert.equal(v.calls,2);
 assert.equal(v.muted,true);
 assert.equal(v.defaultMuted,true);
 assert.equal(notified,1);
});
test('both rejected play promises require manual gesture',async()=>{
 const v=player([error(),error()]);let blocked=0;
 const done=await start(v,{onBlocked:()=>blocked++});
 assert.equal(done.status,'blocked');assert.equal(blocked,1);assert.equal(v.calls,2);
});
test('initially muted video does not need a second muted retry',async()=>{
 const v=player([error()]);v.muted=true;
 const done=await start(v);
 assert.equal(done.status,'blocked');assert.equal(v.calls,1);
});
test('non-autoplay network failure is treated as an error not policy',async()=>{
 const v=player([error('NotSupportedError')]);let observed;
 const done=await start(v,{onError:e=>{observed=e}});
 assert.equal(done.status,'error');assert.equal(observed.name,'NotSupportedError');
 assert.equal(v.calls,1);
});
test('AbortError skips recovery when channel has changed',async()=>{
 const v=player([error('AbortError')]);let blocked=false;
 const done=await start(v,{onBlocked:()=>blocked=true});
 assert.equal(done.status,'cancelled');assert.equal(blocked,false);
});
test('stale channel generation stops before play',async()=>{
 const v=player();
 const done=await start(v,{isCurrent:()=>false});
 assert.equal(done.status,'cancelled');assert.equal(v.calls,0);
});
test('stale rejected promise never starts a muted old channel',async()=>{
 const v=player([error()]);let gen=0;
 v.play=()=>{v.calls++;gen++;return Promise.reject(error());};
 const done=await start(v,{isCurrent:()=>gen===0});
 assert.equal(done.status,'cancelled');assert.equal(v.calls,1);
});
test('a late NotAllowedError does not pause an already playing stream',async()=>{
 const v=player([error()]);v.paused=false;
 const done=await start(v);
 assert.equal(done.status,'audible');assert.equal(v.calls,1);assert.equal(v.muted,false);
});
test('muted retry is suppressed if disabled by caller',async()=>{
 const v=player([error()]);
 const done=await start(v,{allowMutedFallback:false});
 assert.equal(done.status,'blocked');assert.equal(v.calls,1);
});
