'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const js=fs.readFileSync(path.join(root,'features.js'),'utf8');
const reader=js.slice(js.indexOf(' async function readFreshGuide('),js.indexOf(' async function refreshEPG('));
const primary='https://epg.io.vn/epg.xml.gz',standard='https://epg.io.vn/epg.xml',localized='https://epg.io.vn/epgu.xml.gz';
const legacy='https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz',standby='https://epg.pw/xmltv/epg_VN.xml';
function configFor(previous){
 const snippet=js.slice(js.indexOf(' const defaultSources=['),js.indexOf(' const saveConfig='));
 return vm.runInNewContext('(()=>{'+snippet+';return config;})()',{
  localStorage:{getItem:()=>previous?JSON.stringify(previous):null}});
}
test('fresh installs use VNEPG gzip; other presets stay opt-in',()=>{
 const c=configFor();
 assert.equal(c.sources[0].url,primary);
 assert.equal(c.sources[0].enabled,true);
 assert.equal(c.sources[1].url,standard);
 assert.equal(c.sources[1].enabled,false);
 assert.equal(c.sources[2].url,localized);
 assert.equal(c.sources[2].enabled,false);
 assert.equal(c.sources.find(s=>s.url===legacy).enabled,false);
 assert.equal(c.sources.at(-1).url,standby);
 assert.equal(c.sources.at(-1).enabled,false);
 for(const url of [primary,standard,localized,legacy,standby])assert.equal(c.sources.filter(s=>s.url===url).length,1);
 assert.equal(c.autoRefreshEPGOnStartup,true);
});
test('exclusive EPG.pw upgrade restores primary, keeps former custom feeds and startup opt-out',()=>{
 const c=configFor({epgSourcePolicy:'epg-pw-vn-only-20261119',sources:[
  {name:'EPG.pw',url:standby,enabled:true},
  {name:'Legacy',url:legacy,enabled:false},
  {name:'Custom',url:'https://example.test/my.xml',enabled:false},
  {name:'Tracking',url:standby+'?utm_source=chatgpt.com',enabled:true}
 ],autoRefreshEPGOnStartup:false});
 assert.equal(c.sources[0].url,primary);
 assert.equal(c.sources[0].enabled,true);
 assert.equal(c.sources.find(s=>s.url===legacy).enabled,false);
 assert.equal(c.sources.find(s=>s.url==='https://example.test/my.xml').enabled,false);
 assert.equal(c.sources.at(-1).url,standby);
 assert.equal(c.sources.at(-1).enabled,false);
 assert.equal(c.sources.filter(s=>s.url===standby).length,1);
 assert.equal(c.sources.filter(s=>s.url.startsWith(standby)).length,1);
 assert.equal(c.autoRefreshEPGOnStartup,false);
});
test('user-enabled alternate EPG is preserved while EPG.pw defaults off',()=>{
 const c=configFor({sources:[
  {name:'Custom',url:'https://example.test/custom.xml',enabled:true},
  {name:'EPG.pw',url:standby,enabled:true}
 ]});
 assert.equal(c.sources.find(s=>s.url==='https://example.test/custom.xml').enabled,true);
 assert.equal(c.sources.find(s=>s.url===standby).enabled,false);
 assert.equal(c.sources.filter(s=>s.url===standby).length,1);
});
test('upgrade makes VNEPG gzip primary without losing custom feeds or auto-refresh opt-out',()=>{
 const c=configFor({epgSourcePolicy:'epg-pw-disabled-backup-20261119',sources:[
  {name:'EPGShare01',url:legacy,enabled:true},
  {name:'Custom',url:'https://example.test/custom.xml',enabled:true},
  {name:'VNEPG gzip old query',url:primary+'?x=1',enabled:false},
  {name:'VNEPG XML',url:standard,enabled:true}
 ],autoRefreshEPGOnStartup:false});
 assert.equal(c.sources[0].url,primary);
 assert.equal(c.sources[0].enabled,true);
 assert.equal(c.sources.find(s=>s.url===legacy).enabled,false);
 assert.equal(c.sources.find(s=>s.url==='https://example.test/custom.xml').enabled,true);
 assert.equal(c.sources.filter(s=>s.url.startsWith(primary)).length,1);
 assert.equal(c.sources.filter(s=>s.url===standard).length,1);
 assert.equal(c.autoRefreshEPGOnStartup,false);
 assert.equal(c.vnepgSourcePolicy,'vnepg-gzip-default-20261120');
});
test('later user-enabled sources remain enabled after one-time VNEPG migration',()=>{
 const c=configFor({vnepgSourcePolicy:'vnepg-gzip-default-20261120',epgSourcePolicy:'epg-pw-disabled-backup-20261119',sources:[
  {name:'VNEPG Gzip',url:primary,enabled:false},
  {name:'VNEPG standard',url:standard,enabled:true},
  {name:'VNEPG localized',url:localized,enabled:true},
  {name:'EPGShare01',url:legacy,enabled:true}
 ],autoRefreshEPGOnStartup:false});
 assert.equal(c.sources.find(s=>s.url===primary).enabled,false);
 assert.equal(c.sources.find(s=>s.url===standard).enabled,true);
 assert.equal(c.sources.find(s=>s.url===localized).enabled,true);
 assert.equal(c.sources.find(s=>s.url===legacy).enabled,true);
 assert.equal(c.autoRefreshEPGOnStartup,false);
});
test('startup only requests enabled source; EPG.pw is never retried automatically',async()=>{
 const urls=[];
 const read=vm.runInNewContext(reader+';readFreshGuide',{
  window:{},fetchXML:async url=>{urls.push(url);return 0;},
  guideLib:{parse:end=>({programmes:[{end}]})}
 });
 await assert.rejects(read(primary,[]),/hết lịch/);
 assert.deepEqual(urls,[primary]);
});
test('main and backup have distinct GitHub Pages mirrors',()=>{
 const python=fs.readFileSync(path.join(root,'web-online/fetch-epg.py'),'utf8');
 const canonical=fs.readFileSync(path.join(root,'web-online/epg-fetch-function.txt'),'utf8');
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/deploy-openiptv-web.yml'),'utf8');
 assert.match(python,/\("EPGShare01", "https:\/\/epgshare01\.online\//);
 assert.match(python,/STANDBY_FEEDS = \(\("EPG\.pw", "https:\/\/epg\.pw\//);
 assert.match(workflow,/fetch-epg\.py _site\/epg\/vn\.xml/);
 assert.match(workflow,/fetch-epg\.py _site\/epg\/epg-pw-vn\.xml --standby-epgpw/);
 assert.match(canonical,/epg\/vn\.xml/);
 assert.match(canonical,/epg\/epg-pw-vn\.xml/);
});
test('VTV3 with playlist suffix resolves current and following XMLTV entries',()=>{
 const env={};vm.runInNewContext(fs.readFileSync(path.join(root,'epg.js'),'utf8'),env);
 const g=env.IPTVGuide,clock=g.when('20261119080200 +0700');
 const guide={names:{vtv3:'VTV3.vn'},programmes:[
  {id:'VTV3.vn',start:g.when('20261119005800 +0000'),end:g.when('20261119011000 +0000'),title:'A'},
  {id:'VTV3.vn',start:g.when('20261119011000 +0000'),end:g.when('20261119013000 +0000'),title:'B'}]};
 const pair=g.current(guide,{name:'VTV3 (Nguồn 1)',tvgId:'vtv3hd'},clock);
 assert.equal(pair.now.title,'A');assert.equal(pair.next.title,'B');
 assert.notEqual(g.tidy('VTV5 Tây Nguyên (Nguồn 3)'),g.tidy('VTV5'));
});

test('XMLTV parser keeps programmes beyond 12,000 and indexes late-channel schedules',()=>{
 const source=fs.readFileSync(path.join(root,'epg.js'),'utf8');
 const clock=new Date(Date.now()+3600000);
 const stamp=date=>date.toISOString().replace(/[-:T]/g,'').slice(0,14)+' +0000';
 const start=stamp(clock),stop=stamp(new Date(clock.getTime()+1800000));
 const early={getAttribute:key=>key==='id'?'early':'',getElementsByTagName:()=>[{textContent:'Early'}]};
 const late={getAttribute:key=>key==='id'?'late':'',getElementsByTagName:()=>[{textContent:'Late'}]};
 const programme=ch=>({
  getAttribute:key=>key==='channel'?ch:key==='start'?start:key==='stop'?stop:'',
  getElementsByTagName:key=>[{textContent:key==='title'?ch+' broadcast':'Description'}]
 });
 const entries=Array.from({length:13015},()=>programme('early'));
 entries.push(programme('late'));
 const doc={documentElement:{tagName:'tv'},querySelector:()=>null,getElementsByTagName:key=>
  key==='channel'?[early,late]:key==='programme'?entries:[]};
 const env={DOMParser:class{parseFromString(){return doc;}}};
 vm.runInNewContext(source,env);
 const guide=env.IPTVGuide.parse('<tv/>',[{id:'late',tvgId:'late',name:'Late'}]);
 assert.equal(guide.programmes.length,13016);
 const last=env.IPTVGuide.find(guide,{id:'late',tvgId:'late',name:'Late'});
 assert.equal(last.length,1);
 assert.equal(last[0].title,'late broadcast');
 assert.equal(env.IPTVGuide.current(guide,{id:'late',tvgId:'late',name:'Late'},clock.getTime()-1).next.title,'late broadcast');
 assert.match(source,/programmeIndexes=new WeakMap/);
});
test('full EPG survives a simulated IndexedDB save/reload without localStorage quota',async()=>{
 const cacheBlock=js.slice(js.indexOf(' let guide={names:{},programmes:[]'),js.indexOf(' function rgbToHsv('));
 assert.match(cacheBlock,/async function saveGuideInDatabase/);
 let stored;
 const indexedDB={
  open:()=>{const database={
   objectStoreNames:{contains:()=>true},createObjectStore:()=>{},close:()=>{},
   transaction:()=>{
    const tx={};
    tx.objectStore=()=>({
     put:(value)=>{stored=structuredClone(value);queueMicrotask(()=>tx.oncomplete?.());},
     get:()=>{const req={};queueMicrotask(()=>{req.result=stored;req.onsuccess?.();});return req;}
    });
    return tx;
   }
  };const req={result:database};queueMicrotask(()=>req.onsuccess?.());return req;}
 };
 const localStorage={getItem:()=>null,setItem:()=>{throw Error('QuotaExceededError');},removeItem:()=>{}};
 function harness(){
  return vm.runInNewContext('(()=>{'+cacheBlock+';return {cacheGuide,restoreGuideCache,setGuide:(g)=>{guide=g;updatedAt=new Date().toISOString();},getGuide:()=>guide};})()',{
   indexedDB,localStorage,config:{manualMappings:{'user':'late'},offsetMinutes:30},
   ctx:{toast:()=>{},renderList:()=>{}},renderGuidePages:()=>{},structuredClone,queueMicrotask
  });
 }
 const first=harness();
 const programmes=Array.from({length:13077},(_,i)=>({id:'late',start:i,end:i+1,title:'show '+i,description:''}));
 first.setGuide({names:{late:'late'},aliasesById:{late:['Late']},programmes});
 assert.equal(await first.cacheGuide(),true);
 assert.equal(stored.guide.programmes.length,13077);
 const second=harness();
 await second.restoreGuideCache();
 assert.equal(second.getGuide().programmes.length,13077);
 assert.equal(second.getGuide().manualMappings.user,'late');
 assert.equal(second.getGuide().offsetMinutes,30);
});
test('Web merge and import never truncate schedules at 12,000 items',()=>{
 assert.doesNotMatch(js,/programmes\.slice\(0,\s*12000\)/);
 const source=fs.readFileSync(path.join(root,'epg.js'),'utf8');
 assert.doesNotMatch(source,/out\.length\s*>=\s*12000/);
 const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
 assert.match(builder,/uncapped EPG merge\/import/);
 assert.match(builder,/IndexedDB guide cache/);
});
