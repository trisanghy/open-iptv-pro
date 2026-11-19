'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const js=fs.readFileSync(path.join(root,'features.js'),'utf8');
const reader=js.slice(js.indexOf(' async function readFreshGuide('),js.indexOf(' async function refreshEPG('));
function harness(ends){
 const urls=[],primary='https://example.test/epg.xml';
 const read=vm.runInNewContext(reader+';readFreshGuide',{defaultSources:[{url:primary}],window:{},
  fetchXML:async url=>{urls.push(url);return ends.shift();},guideLib:{parse:end=>({programmes:[{end}]})}});
 return {urls,primary,read};
}
test('expired mirror retries live XMLTV while a current mirror needs one request',async()=>{
 const future=Date.now()+60000;
 for(const ends of [[0,future],[future]]){
  const n=ends.length,h=harness(ends);
  assert.equal((await h.read(h.primary,[])).programmes[0].end,future);
  assert.equal(h.urls.length,n);
  if(n===2)assert.equal(h.urls[1],'https://lichphatsong.io.vn/epg.xml');
 }
});
test('expired guides cannot be committed as fresh, and custom feeds stay independent',async()=>{
 const h=harness([0,0]);await assert.rejects(h.read(h.primary,[]),/hết lịch/);
 const other=harness([0]);await assert.rejects(other.read('https://other.test/custom',[]),/hết lịch/);
 assert.equal(other.urls.length,1);
});
test('VTV3 with a playlist source suffix resolves the current and following XMLTV entries',()=>{
 const env={};vm.runInNewContext(fs.readFileSync(path.join(root,'epg.js'),'utf8'),env);
 const g=env.IPTVGuide,clock=g.when('20261119080200 +0700');
 const guide={names:{vtv3:'VTV3.vn'},programmes:[
  {id:'VTV3.vn',start:g.when('20261119005800 +0000'),end:g.when('20261119011000 +0000'),title:'A'},
  {id:'VTV3.vn',start:g.when('20261119011000 +0000'),end:g.when('20261119013000 +0000'),title:'B'}]};
 const pair=g.current(guide,{name:'VTV3 (Nguồn 1)',tvgId:'vtv3hd'},clock);
 assert.equal(pair.now.title,'A');assert.equal(pair.next.title,'B');
 assert.notEqual(g.tidy('VTV5 Tây Nguyên (Nguồn 3)'),g.tidy('VTV5'));
});
