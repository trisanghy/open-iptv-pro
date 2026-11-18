'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../renderer/backup-ui.js'),'utf8');
function setup(initial,apiOverrides={},confirmResult=true,throwsOnSet=()=>false){
 const memory=new Map(Object.entries(initial)),elements=Object.create(null);let reloads=0;
 const localStorage={
  get length(){return memory.size;},key:i=>[...memory.keys()][i],getItem:k=>memory.get(k)||null,
  removeItem:k=>memory.delete(k),setItem:(k,v)=>{if(throwsOnSet(k,v))throw Error('QuotaExceededError');memory.set(k,String(v));}
 };
 const element=id=>elements[id]??(elements[id]={id,disabled:false,checked:true,textContent:'',classList:{toggle(){}},
  callbacks:Object.create(null),addEventListener(type,cb){this.callbacks[type]=cb;},scrollIntoView(){}});
 const document={getElementById:element};
 const ctx={save(){},isBusy:()=>false,setPage(){},toast(){}};
 const api={backupExport:async()=>({canceled:false,sourceCount:1,channelCount:2,images:0,missingImages:0,bytes:120}),
  backupInspect:async()=>({canceled:true}),backupRestore:async()=>({}),backupFinish:async()=>true,...apiOverrides};
 const window={IPTVState:ctx,streamleaf:api,location:{reload(){reloads++;}}};
 vm.runInNewContext(script,{window,document,localStorage,confirm:()=>confirmResult,console});
 return {memory,elements,element,api,get reloads(){return reloads;},click:id=>element(id).callbacks.click()};
}
test('UI export collects owned keys, excludes unrelated localStorage, includes snapshot toggle',async()=>{
 let captured=null;
 const initial={'open-iptv-pro-4':'{}','open-iptv-pro-language':'vi','another-app-secret':'do-not-export'};
 const ui=setup(initial,{backupExport:async(storage,includeSnapshots)=>{captured={storage,includeSnapshots};return {sourceCount:0,channelCount:0,images:0,bytes:22,missingImages:0};}});
 await ui.click('backupExportBtn');
 assert.equal(captured.storage['open-iptv-pro-language'],'vi');
 assert.equal(Object.hasOwn(captured.storage,'another-app-secret'),false);
 assert.equal(captured.includeSnapshots,true);
 assert.match(ui.element('backupStatus').textContent,/Đã sao lưu/);
});
test('UI import confirms before replacing storage, then reloads',async()=>{
 const old={'open-iptv-pro-4':'OLD','open-iptv-pro-language':'vi','another-app':'untouched'};
 let finalized=null;
 const ui=setup(old,{backupInspect:async()=>({token:'preview',createdAt:'2026-11-08T00:00:00Z',appVersion:'4.22.2',sourceCount:2,channelCount:3,images:0,bytes:1024}),
  backupRestore:async token=>{assert.equal(token,'preview');return {finishToken:'done',storage:{'open-iptv-pro-4':'NEW','open-iptv-pro-language':'en'}};},
  backupFinish:async(t,ok)=>{finalized=[t,ok];return true;}});
 await ui.click('backupImportBtn');
 assert.equal(ui.memory.get('open-iptv-pro-4'),'NEW');
 assert.equal(ui.memory.get('open-iptv-pro-language'),'en');
 assert.equal(ui.memory.get('another-app'),'untouched');
 assert.deepEqual(finalized,['done',true]);
 assert.equal(ui.reloads,1);
});
test('UI restore failure rolls back stored values and discards imported images',async()=>{
 const old={'open-iptv-pro-4':'OLD','open-iptv-pro-language':'vi'};
 const finalize=[];
 let failOnce=true;
 const ui=setup(old,{backupInspect:async()=>({token:'preview',sourceCount:1,channelCount:1,images:1,bytes:300}),
  backupRestore:async()=>({finishToken:'done',storage:{'open-iptv-pro-4':'NEW','open-iptv-pro-language':'en'}}),
  backupFinish:async(token,ok)=>{finalize.push([token,ok]);return true;}},true,(k,v)=>{
   if(k==='open-iptv-pro-4'&&v==='NEW'&&failOnce){failOnce=false;return true;}return false;
  });
 await ui.click('backupImportBtn');
 assert.equal(ui.memory.get('open-iptv-pro-4'),'OLD');
 assert.equal(ui.memory.get('open-iptv-pro-language'),'vi');
 assert.deepEqual(finalize,[['done',false]]);
 assert.equal(ui.reloads,0);
 assert.match(ui.element('backupStatus').textContent,/Không thể khôi phục/);
});
