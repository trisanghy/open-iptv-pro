'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=require('../renderer/watchflow-intelligence-v23-8-105.js');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const qwen=require('../renderer/watchflow-qwen-native-v23-8-111.js');
const audit=require('../renderer/watchflow-audit-v23-8-138.js');
const now=Date.UTC(2026,10,23);
const ch={id:'music',name:'ON Music (1080p)',group:'VTVcab',url:'https://secret.example/stream.m3u8'};
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
test('Wikidata misses a real channel: Wikipedia Vietnamese result is verified with a source link',async()=>{
 const calls=[];
 const result=await engine.searchChannelMetadata('ON Music',async url=>{
  calls.push(url);
  if(url.includes('wikidata.org'))return{ok:true,json:async()=>({search:[]})};
  assert.match(url,/vi\.wikipedia\.org/);assert.match(url,/origin=\*/);
  return{ok:true,json:async()=>({query:{search:[
   {title:'ON Music',snippet:'<span class="searchmatch">ON Music</span> là kênh truyền hình âm nhạc'},
   {title:'Music festivals',snippet:'Lễ hội âm nhạc không phải kênh truyền hình'}
  ]}})};
 });
 assert.equal(calls.length,2);
 assert.equal(result.length,1);
 assert.match(result[0].url,/^https:\/\/vi\.wikipedia\.org\/wiki\//);
 assert.equal(result[0].name,'ON Music');
 assert.match(result[0].description,/truyền hình/);
 const st=memory(),params={storage:st,channels:[ch],engine,clock:()=>now,
  lookup:async()=>result,budget:1};
 const scanned=await auto.scan(params);assert.equal(scanned.requests,1);
 const cache=auto.read(st).queries;
 const entry=cache['on music'];assert.ok(entry,'ON Music must be cached under sanitized public display name');
 const evidence=audit.internetFor(ch,cache,auto,require('../renderer/watchflow-topic-catalog-v23-8-117.js'),now+1000);
 assert.equal(evidence.status,'matched');assert.match(evidence.label,/Âm nhạc/);
 assert.match(evidence.url,/vi\.wikipedia\.org/);
 const native=qwen.verifiedInternet(ch,cache,auto,now+1000);
 assert.match(qwen.metadata(ch,null,null,native),/Dữ kiện Internet \(Wikidata\/Wikipedia\)/);
 assert.doesNotMatch(JSON.stringify(cache),/secret\.example|\.m3u8/);
});
test('Do not classify a province, song, movie or similar unrelated name as a TV channel',async()=>{
 const results=await engine.searchChannelMetadata('Sơn La',async url=>
  url.includes('wikidata')?{ok:true,json:async()=>({search:[]})}:
  {ok:true,json:async()=>({query:{search:[{title:'Sơn La',snippet:'Tỉnh Sơn La thuộc vùng Tây Bắc'}]}})});
 assert.deepEqual(results,[]);
 const store=memory(),record=auto.read(store),key='son la';
 record.day='2026-11-23';record.queries[key]={at:now,items:[]};
 store.setItem(auto.KEY,JSON.stringify(record));
 const info=audit.internetFor({name:'Sơn La'},auto.read(store).queries,auto,null,now+1000);
 assert.equal(info.status,'no-match');
 assert.match(info.label,/Đã tìm/);
});
test('Blocked Internet does not count as successful research and stays visible as an error',async()=>{
 const st=memory();
 const result=await auto.scan({storage:st,channels:[{id:'news',name:'VOV Giao thông Hà Nội'}],engine,
  budget:1,clock:()=>now,lookup:async()=>{throw Error('CORS/connection refused')}});
 assert.equal(result.errors,1);
 const info=auto.read(st).queries['vov giao thông hà nội'];
 assert.equal(info.failed,true);
 const row=audit.internetFor({name:'VOV Giao thông Hà Nội'},auto.read(st).queries,auto,null,now+1000);
 assert.equal(row.status,'failed');
 assert.equal(auto.internetProgress(st,[{name:'VOV Giao thông Hà Nội'}],now+1000).searched,0);
});
test('Internet lookup concurrent requests share one in-flight scan and daily quota',async()=>{
 const st=memory(),ch=[{id:'1',name:'VTV1'}];let count=0;
 let release;
 const gate=new Promise(r=>{release=r});
 const args={storage:st,channels:ch,engine,clock:()=>now,budget:1,
  lookup:async()=>{count++;await gate;return [];}};
 const a=auto.scan(args),b=auto.scan(args);
 assert.strictEqual(a,b);
 release();await Promise.all([a,b]);
 assert.equal(count,1);assert.equal(auto.read(st).used,1);
});
test('Audit has a direct Internet lookup button, unknown-first sorting, honest source statuses',()=>{
 const ui=fs.readFileSync('renderer/watchflow-audit-v23-8-138.js','utf8');
 assert.match(ui,/wfAuditResearch/);
 assert.match(ui,/searchChannelMetadata/);
 assert.match(ui,/sort='unknown'/);
 assert.match(ui,/Không có nguồn khớp|không có nguồn khớp/);
 assert.match(ui,/n\.noMatch/);
 assert.match(ui,/n\.unsearched/);
 const wf=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8');
 assert.match(wf,/prerelease: true/);assert.match(wf,/make_latest: false/);
});
