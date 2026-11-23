'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const ml=require('../renderer/watchflow-intelligence-v23-8-105.js');
function memory(){const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
const response=[{name:'Sports TV',description:'sports television channel',url:'https://www.wikidata.org/wiki/Q177777'}];
test('Proactive discovery requests channel names and topic searches without a user query',async()=>{
 const storage=memory(),calls=[];
 const result=await auto.scan({storage,engine:ml,channels:[{id:'v1',name:'VTV1 HD',url:'https://private/live.m3u8'}],lookup:async q=>{calls.push(q);return response;},clock:()=>Date.UTC(2026,10,23),budget:5});
 assert.ok(calls.includes('vtv1'));assert.ok(calls.some(q=>/television channel/.test(q)));assert.equal(result.requests,calls.length);
 assert.ok(!calls.join(' ').includes('private'));assert.ok(!calls.join(' ').includes('m3u8'));
});
test('Limits daily lookups, caches results and honors off switch',async()=>{
 const storage=memory();let count=0;const params={storage,engine:ml,channels:[],lookup:async()=>{count++;return response;},clock:()=>Date.UTC(2026,10,23)};
 await auto.scan(params);await auto.scan(params);assert.equal(count,3);auto.setEnabled(storage,false);
 const stopped=await auto.scan(params);assert.equal(stopped.disabled,true);assert.equal(count,3);
});
test('Rejects unsafe playlist fields and fake public discovery links',async()=>{
 assert.equal(auto.publicName('http://example.org/stream.m3u8'),'');
 assert.equal(auto.publicName('VTV3 HD'),'VTV3');
 const storage=memory();await auto.scan({storage,engine:ml,channels:[],lookup:async()=>[{name:'bad',description:'channel',url:'https://attacker.com/Q8'}],clock:()=>Date.UTC(2026,10,23)});
 assert.equal(auto.collect(storage,[],ml).length,0);
});
test('Use verified exact-channel metadata, but EPG has priority',()=>{
 const storage=memory(),state=auto.read(storage);
 state.queries.vtv1={at:Date.now(),items:[{name:'VTV1',description:'Vietnamese news television channel',url:'https://www.wikidata.org/wiki/Q99'}]};storage.setItem(auto.KEY,JSON.stringify(state));
 const c=[{id:'a',name:'VTV1 HD'}],original=new Map([['a',{label:'Chưa phân loại',confidence:0}]]);
 const result=auto.enrich(original,c,storage,ml);assert.equal(result.get('a').from,'Internet/Wikidata');
 const epg=auto.enrich(new Map([['a',{label:'Phim truyện',confidence:90,from:'EPG'}]]),c,storage,ml);assert.equal(epg.get('a').label,'Phim truyện');
});
test('Renders auto switch and starts scan as soon as the player is ready',()=>{
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8'),html=fs.readFileSync('renderer/index.html','utf8');
 assert.match(ui,/auto\?\.start\(root,engine\)/);assert.match(ui,/id="wfAutoEnabled"/);
 assert.match(html,/watchflow-auto-discovery-v23-8-106\.js/);
});
test('Still prerelease-only with immutable tags and no Latest change',()=>{
 const w=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8'),x=fs.readFileSync('.github/workflows/rustlab-windows-exe-on-push.yml','utf8');
 assert.match(w,/prerelease: true/);assert.match(w,/make_latest: false/);assert.match(x,/--prerelease --latest=false/);
});
test('Confident Internet description is used even when Bayesian vocabulary is sparse',()=>{
 const store=memory(),v=auto.read(store);
 v.queries.htv7={at:Date.now(),items:[{name:'HTV7',description:'Vietnamese entertainment television channel',url:'https://www.wikidata.org/wiki/Q100'}]};
 store.setItem(auto.KEY,JSON.stringify(v));
 const result=auto.enrich(new Map([['x',{label:'Chưa phân loại',confidence:0}]]),[{id:'x',name:'HTV7 HD'}],store,ml);
 assert.equal(result.get('x').label,'Giải trí');assert.equal(result.get('x').from,'Internet/Wikidata');
});
test('Background EPG analysis available even without opening WatchFlow panel',()=>{
 const file=fs.readFileSync('renderer/watchflow-auto-discovery-v23-8-106.js','utf8');
 assert.match(file,/backgroundAnalysis\.set\(win,progress\.analysis\)/);
 assert.match(file,/backgroundAnalysis\.set\(win,mergeSavedNative\(win,enrich\(result\.analysis,list/);
 assert.match(file,/getBackgroundAnalysis:/);
});
