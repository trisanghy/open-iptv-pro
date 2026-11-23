'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
const begin=html.indexOf('function resumeLastChannel(){');
const end=html.indexOf('\nfunction changeChannel(',begin);
assert.ok(begin>0&&end>begin,'last-channel restore function exists');
const restoreCode=html.slice(begin,end);
function run({recent=[],items=[],playing=null,modalOpen=false}={}){
 const calls={selected:[],played:[]};
 const resume=Function('state','items','playing','byId','select','play',restoreCode+'\nreturn resumeLastChannel;')(
  {recent},items,playing,id=>id==='modal'?{hidden:!modalOpen}:null,
  channel=>calls.selected.push(channel.id),channel=>calls.played.push(channel.id)
 );
 return {restored:resume(),calls};
}
test('opening the app resumes the most recent visible channel',()=>{
 const items=[{id:'1'},{id:'2'}];
 assert.deepEqual(run({recent:['2','1'],items}),{restored:true,calls:{selected:['2'],played:['2']}});
});
test('first launch with no watch history stays in the channel list',()=>{
 assert.deepEqual(run({items:[{id:'1'}]}),{restored:false,calls:{selected:[],played:[]}});
});
test('removed or hidden last channel is not replaced with an unrelated channel',()=>{
 assert.deepEqual(run({recent:['removed','1'],items:[{id:'1'}]}),{restored:false,calls:{selected:[],played:[]}});
});
test('restore does not interrupt active playback or an open QR/dialog',()=>{
 const data={recent:['1'],items:[{id:'1'}]};
 assert.equal(run({...data,playing:{id:'2'}}).restored,false);
 assert.equal(run({...data,modalOpen:true}).restored,false);
});
test('start-up calls resume after drawing, and last watch history is persisted',()=>{
 assert.match(html,/applyTvTheme\(state\.theme\);draw\(\);updateBottomActions\(\);refreshTizenBrewModules\(\);ensureTizenHlsRelayService\(\);setTimeout\(function\(\)\{if\(resumeLastChannel\(\)\)/);
 assert.match(html,/state\.recent=\[c\.id\]\.concat\(state\.recent\.filter/);
 assert.match(html,/\.slice\(0,60\);save\(\)/);
 assert.match(html,/id="exitModuleBtn"/);
});
test('inline application scripts remain valid JavaScript',()=>{
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  assert.doesNotThrow(()=>new Function(match[1]));
 }
});
