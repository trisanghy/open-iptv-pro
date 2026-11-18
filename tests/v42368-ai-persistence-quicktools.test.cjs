'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const preferences=require('../renderer/ai-toggle-persistence-v42368.js');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const ids=['liveCaptionToggle','liveTranslateToggle','liveTtsToggle'];
function harness(storageData){
 const values=new Map(Object.entries(storageData||{}));
 const storage={getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,value)=>values.set(key,String(value))};
 const listeners=new Map(),elements=Object.fromEntries(ids.map(id=>[id,{checked:false}]));
 const doc={
  getElementById:id=>elements[id]||null,
  addEventListener:(name,fn)=>listeners.set(name,fn),
  removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name)},
  change(id,value){elements[id].checked=value;listeners.get('change')?.({target:elements[id]});}
 };
 return {storage,values,doc,elements};
}
test('Quick Tools is a permanent section containing all three existing working buttons',()=>{
 const html=read('renderer/index.html'),css=read('renderer/styles.css');
 const start=html.indexOf('<section class="compact-tools" id="quickTools"');
 const end=html.indexOf('</section>',start);
 assert.ok(start>0&&end>start,'Permanent section must exist');
 const block=html.slice(start,end);
 assert.doesNotMatch(block,/<details\b|<summary\b/i);
 assert.match(block,/class="quick-tools-heading"/);
 for(const id of ['quickChecks','quickShots','quickExport'])
  assert.equal((block.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(css,/\.compact-tools>\.quick-tools-heading/);
 assert.doesNotMatch(css,/\.compact-tools>summary/);
});
test('AI preferences are loaded before Caption/Translate and TTS modules initialize',()=>{
 const html=read('renderer/index.html');
 const pref=html.indexOf('src="ai-toggle-persistence-v42368.js"');
 const caption=html.indexOf('src="live-captions-v42343.js"');
 const tts=html.indexOf('src="local-tts-v42344.js"');
 assert.ok(pref>=0&&pref<caption&&pref<tts);
 const ttsSource=read('renderer/local-tts-v42344.js');
 assert.match(ttsSource,/if\(toggle\.checked\)toggle\.dispatchEvent\(new Event\('change'/);
});
test('The three saved AI switches survive a fresh renderer startup',()=>{
 const ui=harness(),first=preferences.createController({doc:ui.doc,storage:ui.storage});
 assert.equal(first.restored,false);
 ui.doc.change('liveCaptionToggle',true);
 ui.doc.change('liveTranslateToggle',true);
 ui.doc.change('liveTtsToggle',true);
 assert.deepEqual(first.get(),{caption:true,translate:true,tts:true});
 first.dispose();
 for(const id of ids)ui.elements[id].checked=false;
 const second=preferences.createController({doc:ui.doc,storage:ui.storage});
 assert.equal(second.restored,true);
 assert.deepEqual(second.get(),{caption:true,translate:true,tts:true});
 second.dispose();
});
test('Disabling all AI switches persists OFF across restarts',()=>{
 const ui=harness(),first=preferences.createController({doc:ui.doc,storage:ui.storage});
 for(const id of ids)ui.doc.change(id,true);
 for(const id of ids)ui.doc.change(id,false);
 first.dispose();
 const next=preferences.createController({doc:ui.doc,storage:ui.storage});
 assert.deepEqual(next.get(),{caption:false,translate:false,tts:false});
 next.dispose();
});
test('TTS remembered as ON guarantees Translate, without forcing original Caption ON',()=>{
 const key=preferences.KEY;
 const ui=harness({[key]:JSON.stringify({caption:false,translate:false,tts:true})});
 const pref=preferences.createController({doc:ui.doc,storage:ui.storage});
 assert.deepEqual(pref.get(),{caption:false,translate:true,tts:true});
 pref.dispose();
});
test('Invalid or stale AI preferences fail safely without enabling unwanted toggles',()=>{
 for(const broken of ['{broken','{}','[]','{"caption":"true","translate":true,"tts":true}']){
  const ui=harness({[preferences.KEY]:broken});
  const pref=preferences.createController({doc:ui.doc,storage:ui.storage});
  assert.equal(pref.restored,false);
  assert.deepEqual(pref.get(),{caption:false,translate:false,tts:false});
  pref.dispose();
 }
});
test('Playback stop or pause cannot uncheck AI preferences',()=>{
 const caption=read('renderer/live-captions-v42343.js');
 const tts=read('renderer/local-tts-v42344.js');
 assert.match(caption,/The checkbox is a saved preference/);
 assert.match(tts,/The persistence module restored checked state/);
 const pref=read('renderer/ai-toggle-persistence-v42368.js');
 assert.doesNotMatch(pref,/pagehide[^;]*setItem/);
});

test('Saved three-way AI ON state rehydrates working TTS and Caption/Translate modules',()=>{
 const vm=require('node:vm');
 const values=new Map([[preferences.KEY,JSON.stringify({
  caption:true,translate:true,tts:true
 })]]);
 const storage={getItem:key=>values.get(key)||null,
  setItem:(key,value)=>values.set(key,String(value))};
 const listeners={};const enabledQueue=[];
 class ChangeEvent{
  constructor(type,options={}){this.type=type;this.bubbles=!!options.bubbles;this.target=null;}
 }
 class Element{
  constructor(id){
   this.id=id;this.checked=false;this.value='';this.style={};this.children=[];
   this.dataset={};this.listeners={};this.textContent='';
   this.paused=true;this.ended=false;this.readyState=0;this.volume=1;
  }
  addEventListener(type,handler){(this.listeners[type]??=[]).push(handler);}
  dispatchEvent(event){
   event.target=this;
   for(const callback of this.listeners[event.type]||[])callback(event);
   if(event.bubbles)for(const callback of listeners[event.type]||[])callback(event);
   return true;
  }
  setAttribute(){}
  replaceChildren(...children){this.children=children;}
  append(child){this.children.push(child);}
 }
 const elements=new Map();
 const get=id=>{
  if(!elements.has(id))elements.set(id,new Element(id));
  return elements.get(id);
 };
 get('liveTranslateTarget').value='vi';
 get('liveTtsLanguage').value='vi';
 get('liveTtsSpeed').value='1.00';
 get('liveTtsDuck').value='100';
 const doc={
  getElementById:get,createElement:tag=>new Element(tag),
  addEventListener:(event,fn)=>(listeners[event]??=[]).push(fn),
  removeEventListener(){}
 };
 const api={
  captionStatus:async()=>({available:true}),captionStop:async()=>{},
  captionStart:async()=>({id:1}),ttsStatus:async()=>({ready:true}),
  ttsStop:async()=>{},captionOnEvent(){},ttsOnEvent(){}
 };
 const win={
  document:doc,localStorage:storage,streamleaf:api,
  IPTVState:{getCurrent:()=>null},
  OpenIPTVVideoCaptions:{createVideoCaptionRenderer:()=>({
   clear(){},show(){},setOriginalVisible(){}
  })},
  OpenIPTVSubtitlePreferences:{attach:()=>null},
  OpenIPTVSpeechQueue:{createSpeechQueue:()=>({
   setEnabled:value=>enabledQueue.push(value),
   setPaused(){},reset(){},status(){return {playing:false,busy:false};}
  })},
  OpenIPTVPreviewCoordinator:{createPreviewCoordinator:()=>({
   isActive:()=>false,cancel:async()=>{},run:async()=>{}
  })},
  addEventListener(){}
 };
 const source=read('renderer/ai-toggle-persistence-v42368.js')+'\n'+
  read('renderer/live-captions-v42343.js')+'\n'+
  read('renderer/local-tts-v42344.js');
 vm.runInNewContext(source,{
  window:win,document:doc,localStorage:storage,Event:ChangeEvent,
  setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){}
 });
 assert.deepEqual(ids.map(id=>get(id).checked),[true,true,true]);
 assert.deepEqual(enabledQueue,[true],'Restored TTS must start the speech queue');
 assert.equal(win.OpenIPTVAIToggleState.restored,true);
 assert.equal(JSON.parse(values.get(preferences.KEY)).tts,true);
});
