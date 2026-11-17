'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../cloud-core.js');
test('snapshot excludes images and auth/session internals',()=>{
 const a={sources:[{url:'https://iptv.example/a.m3u?token=123'}],channels:[{id:'one'}],
   favorites:['one'],snapshots:{large:'x'.repeat(40000)},epgCache:{secret:'x'},
   cloudSession:'s',_internal:'x',volume:.6};
 const b=core.snapshot(a);
 assert.equal(b.snapshots,undefined);assert.equal(b.cloudSession,undefined);
 assert.equal(b._internal,undefined);assert.equal(b.sources[0].url,a.sources[0].url);
 assert.deepEqual(b.favorites,['one']);assert.equal(b.volume,.6);
});
test('snapshot cannot mutate the app store',()=>{
 const a={channels:[{id:'one',name:'Original'}]};const b=core.snapshot(a);
 b.channels[0].name='Changed';assert.equal(a.channels[0].name,'Original');
});
test('per-user conflict policy never silently overwrites two populated states',()=>{
 const local={sources:[{id:'home'}]},remote={payload:{sources:[{id:'cloud'}]},revision:4};
 assert.equal(core.decision({local,remote}),'conflict');
});
test('first cloud login with imported local data asks permission',()=>{
 assert.equal(core.decision({local:{sources:[{id:'a'}]},remote:null}),'ask-first-upload');
});
test('first login on empty browser downloads cloud automatically',()=>{
 assert.equal(core.decision({local:{sources:[],channels:[]},
  remote:{payload:{sources:[{id:'x'}]},revision:1}}),'download');
});
test('if local and remote are already equal, no overwrite required',()=>{
 const data={sources:[{id:'a'}],channels:[]};
 assert.equal(core.decision({local:data,remote:{payload:data,revision:2}}),'synced');
});
test('known same remote revision with offline local edits can upload',()=>{
 const baseline={sources:[{id:'a'}]},local={sources:[{id:'a'},{id:'b'}]};
 assert.equal(core.decision({local,remote:{payload:baseline,revision:3},knownRevision:3,knownPayload:baseline}),'upload');
});
test('known unedited local and newer remote can download',()=>{
 const baseline={sources:[{id:'a'}]};
 assert.equal(core.decision({local:baseline,remote:{payload:{sources:[{id:'b'}]},revision:4},knownRevision:3,knownPayload:baseline}),'download');
});
test('oversized cloud payload is rejected before upload',()=>{
 const huge={channels:[{name:'a'.repeat(core.MAX_BYTES+100)}]};
 assert.throws(()=>core.validate(huge),/quá lớn/);
});
test('JSON snapshot preserves custom folder order and channel links',()=>{
 const a={groupOrder:['Z','A'],channelOrder:{Z:['z2','z1']},autoEnableAudio:true,
  sources:[{url:'https://x.m3u'}]};
 const b=core.validate(a).payload;
 assert.deepEqual(b.groupOrder,['Z','A']);
 assert.deepEqual(b.channelOrder.Z,['z2','z1']);
 assert.equal(b.sources[0].url,'https://x.m3u');
});
