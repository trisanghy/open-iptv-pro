'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const discoveryScript=fs.readFileSync(path.join(__dirname,'../renderer/smart-discovery-ui.js'),'utf8');
const doctorScript=fs.readFileSync(path.join(__dirname,'../renderer/doctor-v3.js'),'utf8');
const core=require('../renderer/doctor-v3-core.js');
function mockDOM(){
 const all=new Map();
 function node(id=''){
  return {id,value:'',disabled:false,checked:false,className:'',textContent:'',children:[],style:{},
    callbacks:{},addEventListener(name,fn){this.callbacks[name]=fn;},append(...items){this.children.push(...items);},
    replaceChildren(...items){this.children=[...items];this.textContent='';},setAttribute(name,v){this[name]=v;},
    get childElementCount(){return this.children.length;}};
 }
 const get=id=>{if(!all.has(id))all.set(id,node(id));return all.get(id);};
 return {get,document:{getElementById:get,createElement:tag=>node(tag)}};
}
test('Smart Discovery UI requires explicit import and preserves verification evidence',async()=>{
 const {document,get}=mockDOM();get('smartCountry').value='VN';get('smartLimit').value='10';
 const sources=[],channels=[],calls=[],backed=[];let saves=0;
 const state={sources,channels};
 const iptv={
  smartCountries:async()=>[{code:'VN',name:'Vietnam',flag:'🇻🇳'}],
  smartCountry:async()=>({url:'https://iptv-org.github.io/iptv/countries/vn.m3u',content:'#EXTM3U\n#EXTINF:-1,Alive\nhttps://media.example/live.m3u8\n#EXTINF:-1,Broken\nhttps://media.example/down.m3u8'}),
  smartCheck:async url=>{calls.push(url);return url.includes('live')?{status:'alive',positiveEvidence:true,reason:'verified'}:{status:'dead',confirmedDead:true,reason:'404 twice'};}
 };
 const ctx={getStore:()=>state,save(){saves++},render(){},toast(){},
  importSource(name,origin,content,type){
   const id='s'+sources.length;sources.push({id,name,origin,type});
   const urls=content.split(/\r?\n/).filter(x=>x.startsWith('https://media.example/'));
   for(const url of urls)channels.push({sourceId:id,url,name:url});
  }};
 const coreParser={parseM3U:text=>text.split(/\r?\n/).filter(x=>x.startsWith('https://media.example/')).map(url=>({url,name:url,group:'Demo'})),
  exportM3U:items=>'#EXTM3U\n'+items.map(x=>`#EXTINF:-1,${x.name}\n${x.url}`).join('\n')};
 vm.runInNewContext(discoveryScript,{window:{OpenIPTVSourceConsent:{requireSmart:async()=>true,requestSmartImport:async()=>true,isSmartAccepted:()=>true},IPTVState:ctx,StreamLeafCore:coreParser,streamleaf:iptv,IPTVProAdvanced:{canEdit:()=>true,onCheck:(c,e)=>backed.push([c.url,e])}},document,confirm:()=>true});
 await get('smartFind').callbacks.click();
 assert.equal(sources.length,0,'Discovery must not import automatically');
 assert.equal(get('smartImportAlive').disabled,true,'Import verified is blocked until playback proof');
 await get('smartVerify').callbacks.click();
 assert.equal(calls.length,2);assert.equal(get('smartImportAlive').disabled,false);
 await get('smartImportAlive').callbacks.click();
 assert.equal(sources.length,1);assert.equal(sources[0].type,'file','verified subset should not refresh to the entire source');
 assert.equal(sources[0].collectEnabled,false);
 assert.equal(channels.length,1);assert.equal(channels[0].status,'alive');assert.ok(channels[0].checkedAt);
 assert.equal(backed.length,1);assert.equal(backed[0][1].positiveEvidence,true);assert.ok(saves>=1);
});
test('Doctor 3 requires confirmation for backup proposal, with reversible change',()=>{
 const {document,get}=mockDOM();get('doctor3Limit').value='10';
 const now=new Date().toISOString();
 const a={id:'a',name:'VTV1',tvgId:'VTV1.vn',group:'Vietnam',url:'https://live.example/a',status:'uncertain'};
 const b={id:'b',name:'VTV1',tvgId:'VTV1.vn',group:'Vietnam',url:'https://live.example/b',status:'alive',checkedAt:now};
 const channels=[a,b],storage=new Map();let confirmations=0,changes=[];
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const ctx={getChannels:()=>channels,getStore:()=>({channels}),save(){},renderList(){},toast(){}};
 const window={OpenIPTVSourceConsent:{requireSmart:async()=>true,requestSmartImport:async()=>true,isSmartAccepted:()=>true},IPTVState:ctx,OpenIPTVDoctorV3:core,IPTVProAdvanced:{canEdit:()=>true,setAlternates:(id,links)=>{
  const x=JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}');x.alternates={...(x.alternates||{}),[id]:links};localStorage.setItem('open-iptv-pro-advanced-v1',JSON.stringify(x));changes.push([id,links]);
 }}};
 vm.runInNewContext(doctorScript,{window,document,localStorage,confirm:()=>{confirmations++;return true;},Blob,URL,console});
 assert.equal(changes.length,0,'no automatic source edits');
 const rows=get('doctor3Suggestions').children;assert.ok(rows.length>0);
 const proposal=rows.find(x=>x.children.some(y=>y.textContent==='Đề xuất thêm'));
 assert.ok(proposal,'expected manual backup proposal button');
 const button=proposal.children.find(y=>y.textContent==='Đề xuất thêm');button.onclick();
 assert.equal(confirmations,1);assert.equal(changes.length,1);
 assert.deepEqual([...changes[0][1]],[b.url]);
 get('doctor3Undo').onclick();
 assert.equal(confirmations,2);assert.equal(changes.length,2);assert.deepEqual([...changes[1][1]],[]);
});

test('Smart Discovery ALL scans every discovered channel (>1000) with bounded concurrency and never imports automatically',async()=>{
 const {document,get}=mockDOM();
 get('smartCatalog').value='global';get('smartLimit').value='all';get('smartWorkers').value='6';
 const count=1205;
 const channels=Array.from({length:count},(_,i)=>`https://media.example/live-${i}.m3u8`);
 const playlist='#EXTM3U\n'+channels.map((url,i)=>`#EXTINF:-1,Channel ${i}\n${url}`).join('\n');
 let checks=0,active=0,maxConcurrent=0,importCount=0;
 const ctx={getStore:()=>({sources:[],channels:[]}),save(){},render(){},toast(){},importSource(){importCount++}};
 const window={OpenIPTVSourceConsent:{requireSmart:async()=>true,requestSmartImport:async()=>true,isSmartAccepted:()=>true},IPTVState:ctx,StreamLeafCore:{parseM3U:()=>channels.map((url,i)=>({url,name:'Channel '+i,group:'World'})),exportM3U:()=>playlist},IPTVProAdvanced:{canEdit:()=>true},streamleaf:{
  smartCatalogOptions:async()=>[],smartLoad:async()=>({kind:'global',url:'https://iptv-org.github.io/iptv/index.m3u',provider:'iptv-org',content:playlist}),
  smartCheck:async url=>{checks++;active++;maxConcurrent=Math.max(active,maxConcurrent);await Promise.resolve();active--;return {status:'alive',positiveEvidence:true,reason:'HLS video segment'};}
 }};
 vm.runInNewContext(discoveryScript,{window,document,confirm:()=>true,setTimeout,console});
 await get('smartFind').callbacks.click();
 assert.equal(get('smartImportAlive').disabled,true);
 await get('smartVerify').callbacks.click();
 assert.equal(checks,count,'ALL must scan beyond the 1000 quick-mode cap');
 assert.ok(maxConcurrent<=6,`Unexpected concurrent checks: ${maxConcurrent}`);
 assert.equal(importCount,0,'Scan must not auto-import');
 assert.match(get('smartStatus').textContent,/1205|1\.205/);
 assert.equal(get('smartImportAlive').disabled,false);
});

test('Smart Discovery cancellation stops queueing new probes, retaining completed evidence',async()=>{
 const {document,get}=mockDOM();get('smartCatalog').value='global';get('smartLimit').value='all';get('smartWorkers').value='2';
 const urls=Array.from({length:100},(_,i)=>`https://media.example/c-${i}.m3u8`);
 let starts=0;
 const ctx={getStore:()=>({sources:[],channels:[]}),save(){},render(){},toast(){},importSource(){throw Error('Should not import')}};
 const w={OpenIPTVSourceConsent:{requireSmart:async()=>true,requestSmartImport:async()=>true,isSmartAccepted:()=>true},IPTVState:ctx,StreamLeafCore:{parseM3U:()=>urls.map(url=>({url,name:url})),exportM3U:()=>''},IPTVProAdvanced:{canEdit:()=>true},streamleaf:{
  smartLoad:async()=>({kind:'global',url:'https://iptv-org.github.io/iptv/index.m3u',content:'#EXTM3U\n#EXTINF:-1,Demo\nhttps://media.example/live.m3u8'}),
  smartCheck:async()=>{starts++;await new Promise(resolve=>setTimeout(resolve,2));return {status:'alive',positiveEvidence:true};}
 }};
 vm.runInNewContext(discoveryScript,{window:w,document,confirm:()=>true,setTimeout,console});
 await get('smartFind').callbacks.click();
 const pending=get('smartVerify').callbacks.click();
 await Promise.resolve(); // let the explicit consent guard resolve before cancelling running probes
 get('smartCancel').callbacks.click();
 await pending;
 assert.ok(starts<urls.length,`Cancelled scan should not start all ${urls.length} streams`);
 assert.equal(get('smartCancel').disabled,true);
 assert.match(get('smartStatus').textContent,/Đã hủy/);
});
