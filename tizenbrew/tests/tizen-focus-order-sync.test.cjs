'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function snippet(from,to){
 const a=html.indexOf(from),b=html.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'missing '+from);
 return html.slice(a,b);
}
const managerCode=snippet('function managerGroups(source){','function managerSnapshot(opts){');
const allCode=snippet('function all(){',"var focusStorageKey=");
const snapCode=snippet('function managerSnapshot(opts){','function managerMutation(change){');
const mutationCode=snippet('function managerMutation(change){','function findManagerSource(id){');
const focusCode=snippet("var focusStorageKey=",'function select(c){');
function source(){
 return {
  id:'src1',name:'Kênh Việt',groupOrder:['Thể thao','Tin tức'],
  channels:[
   {id:'a',name:'VTV1',group:'Tin tức',url:'https://example.com/a.m3u8'},
   {id:'b',name:'VTV3',group:'Thể thao',url:'https://example.com/b.m3u8'},
   {id:'c',name:'VTV2',group:'Tin tức',url:'https://example.com/c.m3u8'}
  ]
 };
}
function api(state,other={}){
 const ctx={state,managerRevision:1,managerIds(){},save(){return true;},draw(){},selected:null,playing:null,...other};
 const extracted=managerCode+allCode+snapCode+mutationCode+
 '\n({managerGroups,orderedManagerEntries,all,managerSnapshot,managerMutation,current:()=>({managerRevision,selected})});';
 return {api:vm.runInNewContext(extracted,ctx),ctx};
}
test('Phone folder order is honored in TV channel list and remote fullscreen picker source',()=>{
 const state={sources:[source()],favorites:{},recent:[]};
 const out=api(state);
 assert.deepEqual(Array.from(out.api.all(),c=>c.id),['b','a','c']);
 assert.deepEqual(Array.from(out.api.managerGroups(state.sources[0]),g=>g.name),['Thể thao','Tin tức']);
});
test('Phone snapshot shows sorted channels but keeps original channel indexes for drag requests',()=>{
 const out=api({sources:[source()],favorites:{},recent:[]});
 const snap=out.api.managerSnapshot({sourceId:'src1'});
 assert.deepEqual(Array.from(snap.channels,c=>c.id),['b','a','c']);
 assert.deepEqual(Array.from(snap.channels,c=>c.index),[1,0,2]);
 assert.deepEqual(Array.from(snap.groups,g=>g.name),['Thể thao','Tin tức']);
});
test('Phone reorder persisted on TV refreshes visible order without deleting current selection',()=>{
 const state={sources:[source()],favorites:{},recent:[]};
 let drawn=0,saved=0;
 const selected=state.sources[0].channels[1];
 const out=api(state,{selected,draw:()=>drawn++,save:()=>{saved++;return true;}});
 const res=out.api.managerMutation(()=>{state.sources[0].groupOrder=['Tin tức','Thể thao'];});
 assert.equal(res.ok,true);
 assert.equal(drawn,1);
 assert.equal(saved,1);
 assert.equal(out.api.current().selected.id,'b','keep channel selection while reordering');
 assert.equal(out.api.current().managerRevision,2);
 assert.deepEqual(Array.from(out.api.all(),c=>c.id),['a','c','b']);
});
function makeButton(key,doc){
 const split=key.indexOf(':'),kind=key.slice(0,split),val=key.slice(split+1);
 const node={dataset:{},id:'',disabled:false,focus(){doc.activeElement=this;},scrollIntoView(){this.scrolled=true;},getClientRects(){return [{}];}};
 if(kind==='channel')node.dataset.channelId=val;
 else if(kind==='group')node.dataset.groupName=val;
 else if(kind==='nav')node.dataset.nav=val;
 else node.id=val;
 return node;
}
function focusHarness(stored={}){
 const storage={...stored};
 let buttons=[],doc={
  activeElement:null,
  querySelectorAll(){return buttons;}
 };
 const modal={hidden:true},player={hidden:true};
 const context={
  localStorage:{getItem:key=>storage[key]||null,setItem:(key,val)=>{storage[key]=val;}},
  document:doc,byId:id=>({modal,player})[id],
  section:'all',selected:null
 };
 const fn=vm.runInNewContext(focusCode+'\n({rememberHomeFocus,restoreHomeFocus,focusIdentity,current:()=>lastHomeFocus,picker:()=>lastPickerPosition});',context);
 return {fn,storage,doc,modal,player,setButtons(value){buttons=value;}};
}
test('TV focus tracks the channel ID rather than its row index after a redraw',()=>{
 const s=focusHarness(),initial=makeButton('channel:c3',s.doc);
 s.setButtons([makeButton('nav:all',s.doc),makeButton('channel:c1',s.doc),initial]);
 s.fn.rememberHomeFocus(initial);
 assert.equal(s.fn.current(),'channel:c3');
 assert.equal(s.storage['open-iptv-tizen-focus-v1'],'channel:c3');
 const replacement=makeButton('channel:c3',s.doc);
 s.setButtons([makeButton('nav:all',s.doc),replacement,makeButton('channel:c2',s.doc)]);
 s.doc.activeElement=null;
 assert.equal(s.fn.restoreHomeFocus(),true);
 assert.equal(s.doc.activeElement,replacement);
 assert.equal(replacement.scrolled,true);
});
test('TV focus resumes from localStorage after application reload, not first nav button',()=>{
 const s=focusHarness({'open-iptv-tizen-focus-v1':'group:Thể thao'});
 const saved=makeButton('group:Thể thao',s.doc);
 s.setButtons([makeButton('nav:all',s.doc),saved]);
 assert.equal(s.fn.restoreHomeFocus(),true);
 assert.equal(s.doc.activeElement,saved);
});
test('TV focus restoration never steals input focus from open modal or fullscreen video',()=>{
 const s=focusHarness({'open-iptv-tizen-focus-v1':'channel:c2'});
 s.setButtons([makeButton('channel:c2',s.doc)]);
 s.modal.hidden=false;
 assert.equal(s.fn.restoreHomeFocus(),false);
 s.modal.hidden=true;s.player.hidden=false;
 assert.equal(s.fn.restoreHomeFocus(),false);
 assert.equal(s.doc.activeElement,null);
});
test('TV main draw and modal close restore focus after replacing buttons',()=>{
 assert.match(html,/\.dataset\.groupName=g/);
 assert.match(html,/b\.dataset\.channelId=c\.id/);
 assert.match(html,/restoreHomeFocus\(\);\}/);
 assert.match(html,/closeDialog\(\)\{stopPair\(\);byId\('modal'\)\.hidden=true;if\(!restoreHomeFocus\(\)\)/);
 assert.doesNotMatch(html,/if\(resumeLastChannel\(\)\)byId\('player'\)\.focus\(\);else document\.querySelector\('\[data-nav=all\]'\)\.focus\(\)/);
});
