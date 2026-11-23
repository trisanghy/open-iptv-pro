'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const qwen=require('../renderer/watchflow-qwen-native-v23-8-111.js');
const wait=()=>new Promise(resolve=>setImmediate(resolve));
async function until(check){
 for(let i=0;i<120;i++){if(check())return;await wait();}
 assert.fail('Scheduled asynchronous WatchFlow task did not complete');
}
test('Large EPG caches shrink gracefully and preserve channel labels under storage quota',()=>{
 const entries={};
 for(let i=0;i<560;i++){
  const p=Array.from({length:45},(_,j)=>({key:'p'+j,title:'Chương trình thời sự '+j,
   start:1700000000+j*1000,end:1700001000+j*1000,labels:['Tin tức'],confidence:85,from:'EPG/từ khóa'}));
  entries['channel'+i]={signature:'ch'+i,base:{explicit:['Tin tức'],name:{label:'Tin tức',confidence:85}},
   snapshot:{label:'Tin tức',labels:['Tin tức'],programmes:p,epgMatched:true},
   programmeTopics:p.map(({key,labels,confidence,from})=>({key,labels,confidence,from}))};
 }
 const writes=new Map(),storage={setItem:(k,v)=>{if(v.length>230000)throw Error('QuotaExceededError');writes.set(k,v);},
 getItem:k=>writes.get(k)||null};
 assert.equal(auto.saveChannelCache(storage,entries),true);
 const cache=auto.readChannelCache(storage);
 assert.equal(Object.keys(cache).length,560);
 assert.equal(cache.channel559.snapshot.label,'Tin tức');
 assert.ok(cache.channel559.programmeTopics.length<=160);
 assert.ok(writes.get(auto.CHANNEL_CACHE).length<=230000);
 assert.equal(cache.channel559.base.name.label,'Tin tức');
});
test('Intelligence Qwen3 calls native model only for new channels, manual rescan triggers all',async()=>{
 const listeners=new Map(),controls=new Map(),appended=[];
 const panel={append:(...nodes)=>{for(const n of nodes){controls.set(n.id,n);appended.push(n);}}};
 controls.set('wfIntelligenceModels',panel);
 controls.set('wfModelSelect',{value:'qwen17'});
 const doc={getElementById:id=>controls.get(id)||null,
  createElement:tag=>({tagName:tag,id:'',setAttribute(){},textContent:''}),
  addEventListener:(type,fn)=>listeners.set(type,[...(listeners.get(type)||[]),fn]),
  dispatchEvent:ev=>{for(const fn of listeners.get(ev.type)||[])fn(ev)}};
 const storageMap=new Map([['watchflow:demo-mode','intelligence']]);
 const storage={getItem:key=>storageMap.get(key)||null,setItem:(key,value)=>storageMap.set(key,value)};
 const channels=[{id:'1',name:'Tin tức TV'},{id:'2',name:'Địa phương TV'}];
 const calls=[],applied=[],results=new Map();
 const w={document:doc,localStorage:storage,IPTVState:{getChannels:()=>channels},
  IPTVExtras:{getGuide:()=>null},IPTVGuide:{find:()=>[]},
  streamleaf:{aiModelStatus:async()=>({models:{qwen17:{installed:true,runtimeReady:true}}}),
    aiClassifyChannel:async(model,metadata)=>{calls.push({model,metadata});return{labels:['Tin tức']};}},
  OpenIPTVWatchFlowAuto:{getBackgroundAnalysis:()=>results,
    setNativeTopics:(_win,ch,labels)=>{applied.push(ch.id);results.set(String(ch.id),{label:labels[0],labels});return true;}},
  CustomEvent:class {constructor(type,opts){this.type=type;this.detail=opts.detail;}},
  setTimeout:fn=>{queueMicrotask(fn);return 1;}};
 assert.equal(qwen.mount(w),true);
 await until(()=>calls.length===2&&qwen.read(storage)[qwen.channelKey('qwen17',channels[1])]);
 const cache=qwen.read(storage);
 assert.equal(cache[qwen.channelKey('qwen17',channels[0])].labels[0],'Tin tức');
 const update=detail=>doc.dispatchEvent(new w.CustomEvent('openiptv:watchflow-auto-update',{detail}));
 update({local:true,complete:true,newChannels:0,newProgrammes:12});
 for(let i=0;i<10;i++)await wait();
 assert.equal(calls.length,2,'EPG-only updates must not rerun Qwen');
 channels.push({id:'3',name:'Kênh mới'});
 update({local:true,complete:true,newChannels:1});
 await until(()=>calls.length===3);
 for(let i=0;i<8;i++)await wait();
 assert.equal(calls.length,3,'Only new channel should invoke Qwen');
 doc.dispatchEvent(new w.CustomEvent('openiptv:watchflow-manual-rescan',{}));
 update({local:true,complete:true,manual:true,newChannels:3});
 await until(()=>calls.length===6);
 assert.equal(applied.filter(id=>id==='1').length,2);
});
