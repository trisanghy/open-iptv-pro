'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const audit=require('../renderer/watchflow-audit-v23-8-138.js');
const topics=require('../renderer/watchflow-topic-catalog-v23-8-117.js');
const engine=require('../renderer/watchflow-intelligence-v23-8-105.js');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const time=Date.UTC(2026,10,23);
function store(queries){return{getItem:key=>key===auto.KEY?JSON.stringify({version:1,day:'2026-11-23',used:0,updatedAt:time,queries}):null};}
const channels=[{id:'news',name:'VTV1 HD',group:'Tin tức',url:'https://private.example/stream.m3u8'},
 {id:'sports',name:'SPORT TV',group:'Thể thao'}, {id:'unknown',name:'Kênh vô danh',group:'Khác'}];
const analysis=new Map([['news',{label:'Tin tức',from:'EPG',epgCount:2,programme:'Thời sự 19h',topics:[{label:'Tin tức',score:8}],programmes:[{title:'Thời sự 19h',labels:['Tin tức']}]}],
 ['sports',{label:'Thể thao',epgCount:1,programme:'Đá bóng trực tiếp',topics:[{label:'Thể thao',score:3}]}],
 ['unknown',{label:'Chưa phân loại',epgCount:0,programme:'',topics:[]}]]);
const evidence={vtv1:{at:time,items:[{name:'VTV1',description:'Vietnamese news television channel',url:'https://www.wikidata.org/wiki/Q100'}]},
 'sport tv':{at:time,items:[{name:'Other sports',description:'sports television channel',url:'https://www.wikidata.org/wiki/Q200'}]}};
function get(){return audit.buildRows({channels,analysis,storage:store(evidence),auto,engine,topics,clock:time+1000,currentId:'sports'});}
test('Audit reports actual current playlist, distinct channel EPG and exact-match internet classifications',()=>{
 const rows=get(),n=rows[0],sports=rows[1];
 assert.equal(rows.length,3);assert.equal(n.name,'VTV1 HD');
 assert.ok(n.nameLabels.includes('Tin tức'));assert.ok(n.epg.labels.includes('Tin tức'));
 assert.equal(n.internet.status,'matched');assert.match(n.internet.label,/Tin tức/);
 assert.equal(n.final,'Tin tức');assert.equal(n.vote,3);
 assert.equal(sports.isCurrent,true);
 assert.equal(sports.internet.status,'no-match','Unrelated Wikidata entity must not classify another channel');
 assert.equal(rows[2].internet.status,'pending');
});
test('Never leak channel stream URLs or incorrectly claim all 560 channels were searched',()=>{
 const str=JSON.stringify(get());
 assert.doesNotMatch(str,/private\.example|\.m3u8/);
 const totals=audit.totals(get());assert.equal(totals.total,3);
 assert.equal(totals.searched,2);assert.equal(totals.matched,1);
 assert.equal(totals.epg,2);assert.equal(totals.epgClassified,2);
});
test('Opted-out internet search is displayed as disabled, not fabricated evidence',()=>{
 const rows=audit.buildRows({channels,analysis,storage:store(evidence),auto,engine,topics,clock:time+1000,internetDisabled:true});
 assert.ok(rows.every(r=>r.internet.status==='disabled'));
 assert.equal(audit.totals(rows).searched,0);
});
test('Results sort by classification, evidence, name or currently viewed channel',()=>{
 const rows=get();
 assert.equal(audit.sortRows([...rows],'current')[0].id,'sports');
 assert.equal(audit.sortRows([...rows],'evidence')[0].id,'news');
 assert.equal(audit.sortRows([...rows],'name')[0].id,'unknown');
 assert.equal(audit.sortRows([...rows],'category','bóng đá').length,0);
 assert.equal(audit.sortRows([...rows],'category','thể thao').length,1);
});
test('Button and result table use real channels, existing capped network lookup, no playlist editing',()=>{
 const ui=fs.readFileSync('renderer/watchflow-audit-v23-8-138.js','utf8');
 const html=fs.readFileSync('renderer/index.html','utf8');
 assert.match(ui,/wfAuditRun/);assert.match(ui,/wfAuditPanel/);
 assert.match(ui,/await auto.scanLocal/);assert.match(ui,/budget:6/);
 assert.match(ui,/engine.searchInternet\(q\)/);
 assert.match(ui,/chưa tra cứu/i);
 assert.doesNotMatch(ui,/playChannel\(|addChannel\(|parseM3U\(|streamUrl/);
 assert.ok(html.indexOf('watchflow-ai-demo-v23-8-102.js')<html.indexOf('watchflow-audit-v23-8-138.js'));
});
test('No changes to release safety or WebAssembly CSP fix',()=>{
 const y=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8');
 const html=fs.readFileSync('renderer/index.html','utf8');
 assert.match(y,/prerelease: true/);assert.match(y,/make_latest: false/);
 assert.match(html,/wasm-unsafe-eval/);assert.doesNotMatch(html,/'unsafe-eval'/);
});
