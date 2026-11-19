'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const js=fs.readFileSync(path.join(root,'features.js'),'utf8');
const reader=js.slice(js.indexOf(' async function readFreshGuide('),js.indexOf(' async function refreshEPG('));
const primary='https://epg.pw/xmltv/epg_VN.xml';
function harness(ends){
 const urls=[];
 const read=vm.runInNewContext(reader+';readFreshGuide',{window:{},
  fetchXML:async url=>{urls.push(url);return ends.shift();},guideLib:{parse:end=>({programmes:[{end}]})}});
 return {urls,read};
}
test('EPG.pw is the only requested source; expired data never triggers another provider',async()=>{
 const future=Date.now()+60000,ok=harness([future]);
 assert.equal((await ok.read(primary,[])).programmes[0].end,future);
 assert.deepEqual(ok.urls,[primary]);
 const expired=harness([0,future]);
 await assert.rejects(expired.read(primary,[]),/hết lịch/);
 assert.deepEqual(expired.urls,[primary]);
});
test('old enabled feeds are disabled, still saved; tracking variant of EPG.pw is deduplicated',()=>{
 const snippet=js.slice(js.indexOf(' const defaultSources=['),js.indexOf(' const saveConfig='));
 const previous={sources:[
  {name:'Legacy',url:'https://epgshare01.online/old.xml',enabled:true},
  {name:'Custom',url:'https://example.test/custom.xml',enabled:true},
  {name:'EPG.pw tracking',url:primary+'?utm_source=chatgpt.com',enabled:false}
 ],autoRefreshEPGOnStartup:false};
 const cfg=vm.runInNewContext('(()=>{'+snippet+';return config;})()',{
  localStorage:{getItem:()=>JSON.stringify(previous)}});
 assert.equal(cfg.sources.length,3);
 assert.equal(cfg.sources[0].url,primary);
 assert.equal(cfg.sources[0].enabled,true);
 assert.equal(cfg.sources.filter(s=>s.enabled).length,1);
 assert.equal(cfg.sources[1].url,previous.sources[0].url);
 assert.equal(cfg.sources[1].enabled,false);
 assert.equal(cfg.sources[2].url,previous.sources[1].url);
 assert.equal(cfg.sources[2].enabled,false);
 assert.equal(cfg.autoRefreshEPGOnStartup,false);
});
test('new installs enable EPG.pw and startup EPG refresh',()=>{
 const snippet=js.slice(js.indexOf(' const defaultSources=['),js.indexOf(' const saveConfig='));
 const cfg=vm.runInNewContext('(()=>{'+snippet+';return config;})()',{
  localStorage:{getItem:()=>null}});
 assert.equal(cfg.sources.length,1);
 assert.equal(cfg.sources[0].url,primary);
 assert.equal(cfg.sources[0].enabled,true);
 assert.equal(cfg.autoRefreshEPGOnStartup,true);
});
test('published mirror is fetched only from EPG.pw with a distinct filename',()=>{
 const fetcher=fs.readFileSync(path.join(root,'web-online/fetch-epg.py'),'utf8');
 const readerFile=fs.readFileSync(path.join(root,'web-online/epg-fetch-function.txt'),'utf8');
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/deploy-openiptv-web.yml'),'utf8');
 assert.match(fetcher,/\("EPG\.pw", "https:\/\/epg\.pw\/xmltv\/epg_VN\.xml"\)/);
 assert.doesNotMatch(fetcher,/epgshare01\.online|xmltv\.live|lichphatsong\.io\.vn/);
 assert.match(readerFile,/epg\/epg-pw-vn\.xml/);
 assert.match(workflow,/fetch-epg\.py _site\/epg\/epg-pw-vn\.xml/);
});
test('VTV3 with playlist suffix resolves now and next entries',()=>{
 const env={};vm.runInNewContext(fs.readFileSync(path.join(root,'epg.js'),'utf8'),env);
 const g=env.IPTVGuide,clock=g.when('20261119080200 +0700');
 const guide={names:{vtv3:'VTV3.vn'},programmes:[
  {id:'VTV3.vn',start:g.when('20261119005800 +0000'),end:g.when('20261119011000 +0000'),title:'A'},
  {id:'VTV3.vn',start:g.when('20261119011000 +0000'),end:g.when('20261119013000 +0000'),title:'B'}]};
 const pair=g.current(guide,{name:'VTV3 (Nguồn 1)',tvgId:'vtv3hd'},clock);
 assert.equal(pair.now.title,'A');assert.equal(pair.next.title,'B');
 assert.notEqual(g.tidy('VTV5 Tây Nguyên (Nguồn 3)'),g.tidy('VTV5'));
});
