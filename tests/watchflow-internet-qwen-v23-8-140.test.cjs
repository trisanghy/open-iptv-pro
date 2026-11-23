'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const qwen=require('../renderer/watchflow-qwen-native-v23-8-111.js');
const engine=require('../renderer/watchflow-intelligence-v23-8-105.js');
const clock=Date.UTC(2026,10,23);
const channel={id:'vtv1',name:'VTV1 HD',group:'Tin tức',url:'https://secret.local/stream.m3u8'};
function memory(){const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};}
function sample(storage){const x=auto.read(storage);x.day='2026-11-23';x.queries.vtv1={at:clock,items:[
 {name:'VTV1',description:'Vietnamese news television channel',url:'https://www.wikidata.org/wiki/Q12345'}]};
 storage.setItem(auto.KEY,JSON.stringify(x));}
test('Wikidata exact-name facts reach Qwen3 prompt, never IPTV stream URLs',()=>{
 const storage=memory();sample(storage);
 const evidence=qwen.verifiedInternet(channel,auto.read(storage).queries,auto,clock+1000);
 assert.match(evidence,/Vietnamese news television channel/);
 const prompt=qwen.metadata(channel,null,null,evidence);
 assert.match(prompt,/Dữ kiện Internet \(Wikidata\)/);
 assert.match(prompt,/Vietnamese news/);
 assert.doesNotMatch(prompt,/secret\.local|\.m3u8|wikidata\.org\/wiki/);
 assert.notEqual(qwen.channelKey('qwen06',channel),qwen.channelKey('qwen06',channel,evidence));
});
test('Reject unrelated Wikidata entities, invalid URLs and failed searches',()=>{
 const storage=memory();sample(storage);
 const query=auto.read(storage).queries;
 assert.equal(qwen.verifiedInternet({name:'Different TV'},query,auto,clock+1000),'');
 assert.equal(qwen.verifiedInternet(channel,{vtv1:{at:clock,failed:true,items:query.vtv1.items}},auto,clock+1000),'');
 assert.equal(qwen.verifiedInternet(channel,{vtv1:{at:clock,items:[{
  name:'Unrelated station',description:'news television channel',url:'https://www.wikidata.org/wiki/Q333'
 }]}},auto,clock+1000),'');
 assert.equal(qwen.verifiedInternet(channel,{vtv1:{at:clock,items:[{
  name:'VTV1',description:'news television channel',url:'https://untrusted.example/Q3'
 }]}},auto,clock+1000),'');
});
test('Internet progress distinguishes queried, failed, unqueried and opt-out',async()=>{
 const s=memory();sample(s);
 const channels=[channel,{id:'sports',name:'Sports TV'},{id:'movies',name:'Movies TV'}];
 const first=auto.internetProgress(s,channels,clock+1000);
 assert.equal(first.total,3);assert.equal(first.searched,1);assert.equal(first.matched,1);assert.equal(first.remaining,2);
 assert.equal(first.limit,72);
 let calls=0;
 await auto.scan({storage:s,channels,engine,clock:()=>clock+1500,budget:2,
  lookup:async q=>{calls++;throw Error('CORS blocked '+q)}});
 assert.equal(calls,2);
 const later=auto.internetProgress(s,channels,clock+2000);
 assert.equal(later.searched,1,'Failed requests are NOT successful research');
 assert.equal(later.failed,2);assert.match(later.error,/CORS blocked/);
 auto.setEnabled(s,false);
 assert.equal(auto.internetProgress(s,channels,clock+3000).enabled,false);
});
test('560-channel result cache can retain more than the previous 80 entries',()=>{
 const s=memory(),state=auto.read(s);state.day='2026-11-23';
 for(let i=0;i<560;i++)state.queries['tv'+i]={at:clock,items:[]};
 s.setItem(auto.KEY,JSON.stringify(state));
 assert.equal(Object.keys(auto.read(s).queries).length,560);
});
test('The AI model accordion is exclusive; choosing Qwen3 activates research',()=>{
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 const native=fs.readFileSync('renderer/watchflow-qwen-native-v23-8-111.js','utf8');
 const internet=fs.readFileSync('renderer/watchflow-auto-discovery-v23-8-106.js','utf8');
 assert.match(ui,/standardArea.hidden=mode!=='standard'/);
 assert.match(ui,/smartArea.hidden=mode!=='smart'/);
 assert.match(ui,/modelArea.hidden=mode!=='intelligence'/);
 assert.match(ui,/mode='intelligence'/);
 assert.match(ui,/openiptv:watchflow-auto-rescan/);
 assert.match(native,/verifiedInternet\(ch,queries,auto\)/);
 assert.match(native,/metadata\(channel,guide,win\.IPTVGuide,facts\)/);
 assert.match(native,/event\.detail\?\.internet/);
 assert.match(native,/wfInternetResearchStatus/);
 assert.match(internet,/webFollowup/);
 assert.match(internet,/const DAY_LIMIT=72,RUN_LIMIT=6/);
});
test('Keep strict release prerelease and no main/Latest modification',()=>{
 const wf=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8');
 assert.match(wf,/prerelease: true/);assert.match(wf,/make_latest: false/);
 const html=fs.readFileSync('renderer/index.html','utf8');
 assert.match(html,/wasm-unsafe-eval/);assert.doesNotMatch(html,/'unsafe-eval'/);
});
