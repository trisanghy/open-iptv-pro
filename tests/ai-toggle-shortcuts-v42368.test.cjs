'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.resolve(__dirname,'..',name),'utf8');

function createHarness(){
 const queueEnabled=[];
 class ChangeEvent{constructor(type){this.type=type;this.target=null;}}
 class Element{
  constructor(id){
   this.id=id;this.checked=false;this.value='';this.textContent='';
   this.title='';this.dataset={};this.hidden=false;this.disabled=false;
   this.children=[];this.listeners={};this.readyState=4;this.paused=false;
   this.ended=false;this.volume=.8;this.currentSrc='https://example.com/live.m3u8';
  }
  addEventListener(name,handler){(this.listeners[name]??=[]).push(handler);}
  dispatchEvent(event){
   event.target=this;
   for(const handler of this.listeners[event.type]||[])handler(event);
   return true;
  }
  setAttribute(){}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
 }
 const elements=new Map();
 const el=id=>{
  if(!elements.has(id))elements.set(id,new Element(id));
  return elements.get(id);
 };
 el('liveTranslateTarget').value='vi';
 el('liveTtsLanguage').value='vi';
 el('liveTtsSpeed').value='1.00';
 el('liveTtsDuck').value='100';
 const document={
  getElementById:el,createElement:name=>new Element(name),
  addEventListener(){}
 };
 const api={
  captionStatus:async()=>({available:true}),
  captionStart:async()=>({id:1}),captionStop:async()=>{},
  ttsStatus:async()=>({ready:true}),ttsStop:async()=>{},
  captionOnEvent(){},ttsOnEvent(){}
 };
 const queue={
  setEnabled(value){queueEnabled.push(value);},
  setPaused(){},reset(){},
  status(){return {pending:false,playing:false};}
 };
 const window={
  streamleaf:api,
  IPTVState:{getCurrent:()=>({url:'https://example.com/live.m3u8'})},
  OpenIPTVVideoCaptions:{createVideoCaptionRenderer:()=>({
   setOriginalVisible(){},clear(){},show(){}
  })},
  OpenIPTVSubtitlePreferences:{attach:()=>null},
  OpenIPTVSpeechQueue:{createSpeechQueue:()=>queue},
  OpenIPTVPreviewCoordinator:{createPreviewCoordinator:()=>({
   isActive:()=>false,cancel:async()=>{},run:async()=>{}
  })},
  addEventListener(){}
 };
 const store=new Map(),localStorage={
  getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)
 };
 const source=read('renderer/live-captions-v42343.js')+'\n'+
  read('renderer/local-tts-v42344.js');
 vm.runInNewContext(source,{
  document,window,localStorage,Event:ChangeEvent,
  setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){}
 });
 const state=()=>['liveCaptionToggle','liveTranslateToggle','liveTtsToggle']
  .map(id=>el(id).checked);
 const change=(id,value)=>{
  const input=el(id);input.checked=value;
  input.dispatchEvent(new ChangeEvent('change'));
 };
 return {state,change,queueEnabled};
}

test('Electron: enabling TTS when all AI controls are off enables all three',()=>{
 const ui=createHarness();
 assert.deepEqual(ui.state(),[false,false,false]);
 ui.change('liveTtsToggle',true);
 assert.deepEqual(ui.state(),[true,true,true]);
 assert.equal(ui.queueEnabled.at(-1),true);
});

test('Electron: turning off Caption when all three are on switches off all three',()=>{
 const ui=createHarness();
 ui.change('liveTtsToggle',true);
 ui.change('liveCaptionToggle',false);
 assert.deepEqual(ui.state(),[false,false,false]);
 assert.equal(ui.queueEnabled.at(-1),false);
});

test('Electron: turning off only TTS keeps Caption and Translate on',()=>{
 const ui=createHarness();
 ui.change('liveTtsToggle',true);
 ui.change('liveTtsToggle',false);
 assert.deepEqual(ui.state(),[true,true,false]);
});

test('Electron: Caption remains independent when TTS is off',()=>{
 const ui=createHarness();
 ui.change('liveCaptionToggle',true);
 ui.change('liveTranslateToggle',true);
 ui.change('liveCaptionToggle',false);
 assert.deepEqual(ui.state(),[false,true,false]);
});

test('Electron: disabling Translate still disables dependent TTS only',()=>{
 const ui=createHarness();
 ui.change('liveTtsToggle',true);
 ui.change('liveTranslateToggle',false);
 assert.deepEqual(ui.state(),[true,false,false]);
 assert.equal(ui.queueEnabled.at(-1),false);
});
