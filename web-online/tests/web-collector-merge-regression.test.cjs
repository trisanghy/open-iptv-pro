'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'collector.js'),'utf8');
const advanced=fs.readFileSync(path.join(root,'advanced.js'),'utf8');
const core=require(path.join(root,'advanced-core.js'));
const merger=require(path.join(root,'collector-core.js'));
function harness(saveOk=true,extraChannels=0){
 const channels=[
  {id:'srcA|1',sourceId:'srcA',name:'VTV1 (Nguồn 1)',tvgId:'vtv1hd',group:'VTV',url:'https://a.example.test/live.m3u8'},
  {id:'srcB|1',sourceId:'srcB',name:'VTV1 (Nguồn 3)',tvgId:'vtv1hd',group:'VTV',url:'https://b.example.test/live.m3u8'},
  {id:'srcA|2',sourceId:'srcA',name:'VTV2 (Nguồn 1)',tvgId:'vtv2hd',group:'VTV',url:'https://same.example.test/live.m3u8'},
  {id:'srcB|2',sourceId:'srcB',name:'VTV2 (Nguồn 3)',tvgId:'vtv2hd',group:'VTV',url:'https://same.example.test/live.m3u8'}
 ];
 for(let i=0;i<extraChannels;i++){
  channels.push({id:'srcA|'+(i+100),sourceId:'srcA',name:'Synthetic '+i,tvgId:'synthetic-'+i,group:'Testing',url:'https://stream.example.test/'+i+'/live.m3u8?quality=1080p',logo:'https://img.example.test/logo/'+i+'.png'});
 }
 const sources=[{id:'srcA',name:'Nguồn 1',type:'file',enabled:true},{id:'srcB',name:'Nguồn 3',type:'file',enabled:true}];
 const store={channels:[...channels],sources:[...sources],favorites:[],collectorConfig:{enabled:false}};
 const elements=new Map(),messages=[],events={};let batch=null,saves=0;
 function node(id=''){
  return {id,style:{},disabled:false,checked:false,children:[],childElementCount:0,
   textContent:'',innerHTML:'',className:'',value:'',dataset:{},
   classList:{contains:()=>false,add(){},remove(){}},
   setAttribute(){},addEventListener:(type,fn)=>{events[id+':'+type]=fn;},
   append(...c){this.children.push(...c);this.childElementCount=this.children.length},
   prepend(c){this.children.unshift(c);this.childElementCount=this.children.length},
   replaceChildren(...c){this.children=[...c];this.childElementCount=this.children.length},
   remove(){},focus(){},querySelectorAll(){return []}};
 }
 const get=id=>{if(!elements.has(id))elements.set(id,node(id));return elements.get(id)};
 const document={getElementById:get,createElement:tag=>node(tag),hidden:false,
  addEventListener(){},removeEventListener(){},
  body:{append(overlay){
   const panel=overlay.children[0],controls=panel.children.find(x=>x.className==='modal-footer');
   const accept=controls.children.find(x=>x.textContent==='Gộp và lưu');
   const handler=events[accept.id+':click'];
   if(handler)handler(); else throw Error('Confirmation handler not found');
  }}};
 // Keep listener handlers per actual element rather than the common button tag.
 document.createElement=tag=>{const el=node(tag);el.addEventListener=(type,fn)=>{el['on'+type]=fn};return el};
 document.body.append=overlay=>{
  const panel=overlay.children[0],controls=panel.children.find(x=>x.className==='modal-footer');
  const accept=controls.children.find(x=>x.textContent==='Gộp và lưu');
  accept.onclick?.();
 };
 // Calling click listeners synchronously simulates explicit user acceptance.
 document.createElement=tag=>{const el=node(tag);el.addEventListener=(type,fn)=>{if(type==='click')el.onclick=fn};return el};
 const ctx={getStore:()=>store,save:()=>{saves++;return typeof saveOk==='function'?saveOk(store):saveOk},render(){},textStatus:msg=>messages.push(msg),
   toast(){},refreshManualLinks(){},renderList(){},stopPlayer(){}};
 const window={IPTVState:ctx,OpenIPTVCollector:merger,StreamLeafCore:{},IPTVProAdvanced:{setAlternatesBatch:arr=>{batch=arr}},streamleaf:null};
 vm.runInNewContext(source,{window,document,setInterval:()=>0,Date,Math,console,URL,Blob,Promise,setTimeout}, {filename:'collector.js'});
 return {store,originalChannels:channels,originalSources:sources,messages,saves:()=>saves,collect:()=>window.IPTVCollectorUI.collect(false),restore:()=>window.IPTVCollectorUI.restore(),batch:()=>batch};
}
test('successful manual merge reports success and keeps real alternate URL',async()=>{
 const h=harness(true);await h.collect();
 const merged=h.store.channels.filter(c=>c.sourceId==='collector_merged');
 assert.equal(merged.length,2);
 assert.equal(h.store.sources.filter(s=>s.id==='collector_merged').length,1);
 assert.equal(h.store.sources.filter(s=>s.id!=='collector_merged'&&s.enabled).length,0);
 const vtv1=merged.find(c=>c.tvgId==='vtv1hd');
 assert.deepEqual(core.alternatives(vtv1,merged),[vtv1.url,vtv1.alternates[0]]);
 assert.equal(h.batch().length,2);
 assert.equal(h.saves(),1);
 assert.match(h.messages.at(-1),/Đã gộp 2 kênh, 1 dự phòng/);
 assert.ok(!h.messages.some(x=>x.includes('Thu thập thất bại')));
});
test('failed save rolls back source visibility, merged list and backup state',async()=>{
 const h=harness(false);await h.collect();
 assert.equal(h.store.channels.length,4);
 assert.equal(h.store.sources.length,2);
 assert.ok(h.store.sources.every(s=>s.enabled===true));
 assert.equal(h.store.collectorBackup,undefined);
 assert.equal(h.batch(),null);
 assert.match(h.messages.at(-1),/dữ liệu cũ được giữ lại/);
});
test('collector no longer references an undeclared applied variable',()=>{
 assert.doesNotMatch(source,/\bapplied\s*=\s*true\b/);
 assert.match(source,/let committed=false,rollback=null/);
 assert.match(advanced,/function setAlternatesBatch\(entries\)/);
 assert.match(advanced,/setAlternatesBatch,setAlternates:/);
});

test('collector persists a small undo record, not a second complete copy of every original playlist',async()=>{
 const baseline=harness(true,300);await baseline.collect();
 const compactBytes=JSON.stringify(baseline.store).length;
 const legacyDuplicateBytes=JSON.stringify(baseline.originalChannels).length;
 // A realistic quota budget between compact and old duplicated layouts.
 const quota=compactBytes+Math.floor(legacyDuplicateBytes/2);
 const h=harness(state=>JSON.stringify(state).length<=quota,300);
 await h.collect();
 assert.equal(h.store.channels.filter(ch=>ch.sourceId==='collector_merged').length,302);
 assert.equal(h.store.collectorBackup.version,2);
 assert.ok(!Object.prototype.hasOwnProperty.call(h.store.collectorBackup,'originalSources'));
 assert.equal(h.store.channels.filter(ch=>ch.sourceId==='srcA').length,302);
 assert.ok(JSON.stringify(h.store).length<=quota);
 assert.ok(JSON.stringify(h.store).length+legacyDuplicateBytes>quota);
 assert.match(h.messages.at(-1),/Đã gộp 302 kênh/);
});
test('compact merge retains original channel metadata and undo restores source visibility',async()=>{
 const h=harness(true);
 h.store.channels[0].customNote='do not delete';
 await h.collect();
 assert.equal(h.store.channels.find(ch=>ch.id==='srcA|1').customNote,'do not delete');
 assert.ok(h.store.collectorBackup);
 await h.restore();
 assert.equal(h.store.channels.length,4);
 assert.equal(h.store.channels.find(ch=>ch.id==='srcA|1').customNote,'do not delete');
 assert.ok(h.store.sources.filter(s=>s.id!=='collector_merged').every(s=>s.enabled===true));
 assert.equal(h.store.collectorBackup,undefined);
 assert.match(h.messages.at(-1),/Đã hoàn tác/);
});
test('failed undo save rolls back in-memory state rather than displaying false success',async()=>{
 let canPersist=true;
 const h=harness(()=>canPersist);
 await h.collect();
 const before=JSON.stringify(h.store);
 canPersist=false;
 await h.restore();
 assert.equal(JSON.stringify(h.store),before);
 assert.match(h.messages.at(-1),/Không thể hoàn tác/);
 assert.ok(h.store.collectorBackup,'previous undo remains available for retry');
 canPersist=true;
 await h.restore();
 assert.equal(h.store.collectorBackup,undefined);
});
