'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const engine=require('../renderer/watchflow-intelligence-v23-8-105.js');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const qwen=require('../renderer/watchflow-qwen-native-v23-8-111.js');
const clock=Date.UTC(2026,10,23,14);
const originals=[
 {id:'1',name:'Asian Food Network Vietnam (1080p)',group:'Ẩm thực',url:'https://example.invalid/private.m3u8'},
 {id:'2',name:'An Ninh TV HD',group:'Pháp luật'}
];
const firstRows=[
 {start:clock-30000,end:clock+500000,title:'Tin tức kinh tế',description:'Tin tức thời sự'},
 {start:clock+500000,end:clock+1000000,title:'Món ngon ẩm thực',description:'Món ngon truyền hình'}
];
const memory=()=>{const values=new Map();return{
 getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),
 removeItem:key=>values.delete(key)
}};
async function scan(channels,rows,cache={},force=false){
 return auto.scanLocal({channels,guide:{programmes:rows},guideLib:{find:()=>rows},
  engine,clock,yieldNow:async()=>{},batchSize:12,cache,force});
}
test('First channel scan persists results; unchanged startup reuses base and EPG classifications',async()=>{
 const initial=await scan(originals,firstRows);
 const store=memory();
 assert.equal(initial.newChannels,2);assert.equal(initial.newProgrammes,4);
 assert.equal(auto.saveChannelCache(store,initial.entries),true);
 const stored=auto.readChannelCache(store);
 assert.equal(Object.keys(stored).length,2);
 assert.ok(!JSON.stringify(stored).includes('private.m3u8'));
 const again=await scan(originals,firstRows,stored);
 assert.equal(again.newChannels,0);assert.equal(again.newProgrammes,0);
 assert.deepEqual(again.analysis.get('1').labels,initial.analysis.get('1').labels);
});
test('Changed broadcast time does not rerun unchanged programme classifications',async()=>{
 const before=await scan(originals,firstRows);
 const shifted=firstRows.map(p=>({...p,start:p.start+65000,end:p.end+65000}));
 const after=await scan(originals,shifted,before.entries);
 assert.equal(after.newChannels,0);
 assert.equal(after.newProgrammes,0);
 assert.equal(engine.programmeKey(firstRows[0]),engine.programmeKey(shifted[0]));
});
test('New EPG content is analyzed without reclassifying channels, new channel only triggers one channel',async()=>{
 const before=await scan(originals,firstRows);
 const appended=[...firstRows,{start:clock+1100000,end:clock+1800000,title:'Giải bóng đá hôm nay',description:'Thể thao'}];
 const newer=await scan(originals,appended,before.entries);
 assert.equal(newer.newChannels,0);assert.equal(newer.newProgrammes,2);
 const list=[...originals,{id:'3',name:'Cao Bang TV',group:'Địa phương'}];
 const withNew=await scan(list,appended,newer.entries);
 assert.equal(withNew.newChannels,1);assert.equal(withNew.analysis.size,3);
});
test('Full reclassification requires manual force; changed channel identity is also recognized',async()=>{
 const before=await scan(originals,firstRows);
 const repeated=await scan(originals,firstRows,before.entries,true);
 assert.equal(repeated.manual,true);assert.equal(repeated.newChannels,2);
 const edited=[{...originals[0],name:'Food TV renamed'},originals[1]];
 const changed=await scan(edited,firstRows,before.entries);
 assert.equal(changed.newChannels,1);
 assert.notEqual(auto.channelSignature(edited[0]),auto.channelSignature(originals[0]));
 assert.equal(auto.channelSignature({...originals[0],url:'https://private.invalid/new'}),auto.channelSignature(originals[0]));
});
test('Previously cached channel folders are synchronously restored before new EPG becomes available',async()=>{
 const initial=await scan(originals,firstRows),storage=memory();
 auto.saveChannelCache(storage,initial.entries);
 const callbacks=[],intervals=[],events=[],listeners={};
 const doc={dispatchEvent:ev=>{events.push(ev.detail);for(const cb of listeners[ev.type]||[])cb(ev);},
  addEventListener:(name,cb)=>{(listeners[name]??=[]).push(cb);}};
 const win={document:doc,localStorage:storage,IPTVState:{getChannels:()=>originals},
  IPTVExtras:{getGuide:()=>null},IPTVGuide:{find:()=>[]},
  CustomEvent:class {constructor(type,opts){this.type=type;this.detail=opts.detail;}},
  setTimeout:(fn,ms)=>{callbacks.push({fn,ms});return 1;},
  setInterval:(fn,ms)=>{intervals.push({fn,ms});return 1;},
  addEventListener:()=>{}};
 assert.equal(auto.start(win,engine),true);
 assert.equal(auto.getBackgroundAnalysis(win).size,2);
 assert.ok(events.some(ev=>ev.restored===true));
 const first=callbacks.find(x=>x.ms===200);
 assert.ok(first);first.fn();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(auto.getLocalStatus(win).newChannels,0);
 assert.equal(auto.getBackgroundAnalysis(win).size,2);
 assert.equal(intervals.some(x=>x.ms===3000),true);
 assert.equal(intervals.some(x=>x.ms===2*60*1000),false,'Never poll Internet every two minutes');
});
test('Qwen3 channel identity never includes EPG data, caches empty labels permanently',()=>{
 const key=qwen.channelKey('qwen17',originals[0]);
 assert.equal(key,qwen.channelKey('qwen17',{...originals[0],url:'https://private.invalid/live2.m3u8'}));
 assert.notEqual(key,qwen.channelKey('qwen06',originals[0]));
 const storage=memory();
 assert.equal(qwen.save(storage,{[key]:{at:clock-100*86400000,labels:[]}}),true);
 assert.deepEqual(qwen.read(storage)[key].labels,[]);
 const source=fs.readFileSync('renderer/watchflow-qwen-native-v23-8-111.js','utf8');
 assert.doesNotMatch(source,/CACHE_MS/);
 assert.match(source,/const pendingChannels=force\?ordered:toClassify/);
 assert.match(source,/manualWaiting/);
 assert.match(source,/EPG updates never enqueue Qwen inference/);
});
test('Open folders and expanded page sizes survive UI refresh while native inference progresses',()=>{
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 const css=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.css','utf8');
 assert.match(ui,/const expandedFolders=new Set\(\),folderPageSizes=new Map\(\)/);
 assert.match(ui,/rememberFolder\(folder,folder\.dataset\.folderKey\)/);
 assert.match(ui,/if\(expandedFolders\.has\(key\)\)\{folder\.open=true;draw\(\);\}/);
 assert.match(ui,/folderPageSizes\.set\(key,limit\)/);
 assert.match(ui,/id="wfScanAgain"/);
 assert.match(ui,/openiptv:watchflow-manual-rescan/);
 assert.match(ui,/if\(!panel\.hidden&&event\.detail\?\.complete\)scheduleResultsUpdate\(\)/);
 assert.match(css,/#wfScanAgain/);
});
test('EPG event forces latest guide comparison; no artificial 30-minute rescans',()=>{
 const source=fs.readFileSync('renderer/watchflow-auto-discovery-v23-8-106.js','utf8');
 assert.match(source,/lastKey='';inspect\(\)/);
 assert.match(source,/inspect\(\{force:true\}\)/);
 assert.doesNotMatch(source,/Math\.floor\(Date\.now\(\)\/\(30\*60000\)\)/);
 assert.match(source,/CHANNEL_CACHE_VERSION=4/);
});
