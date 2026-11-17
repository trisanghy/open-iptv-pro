'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function app(){
 const nodes={};
 const events=[];
 const names=['liveCaptionToggle','liveTranslateToggle','liveTtsToggle'];
 for(const name of names){
  nodes[name]={id:name,checked:false,listeners:new Map(),
   addEventListener(type,fn){const a=this.listeners.get(type)||[];a.push(fn);this.listeners.set(type,a);},
   dispatchEvent(ev){ev.target=this;for(const handler of this.listeners.get(ev.type)||[])handler(ev);events.push({id:this.id,checked:this.checked});}
  };
 }
 const status={textContent:'',title:'',dataset:{}};
 const video={paused:false,ended:false,currentSrc:'https://example.org/channel.m3u8',currentTime:0,
  listeners:new Map(),addEventListener(type,fn){this.listeners.set(type,fn);}};
 const target={options:[{value:'vi',textContent:'Tiếng Việt'}],selectedOptions:[{textContent:'Tiếng Việt'}],value:'vi',
  addEventListener(){}};
 const box={hidden:true,textContent:''};
 const map={liveCaptionStatus:status,liveCaptionOutput:box,video,liveTranslateTarget:target};
 const callbacks={captionStart:[],captionStop:[]};
 const native={
  captionStart:async args=>{callbacks.captionStart.push(args);return {id:callbacks.captionStart.length};},
  captionStop:async()=>{callbacks.captionStop.push(true);},
  captionStatus:async()=>({available:true,modelName:'Whisper'}),
  captionOnEvent(){},captionTranslationStatus:async()=>({}),captionAutoInstall:async()=>({installed:true})
 };
 const local=new Map(),document={
  getElementById:id=>nodes[id]||map[id]||null,
  pictureInPictureElement:null,
  addEventListener(){},
  dispatchEvent(){}
 };
 const win={streamleaf:native,IPTVState:{getCurrent:()=>({url:'https://example.org/channel.m3u8'})},
  addEventListener(){}};
 class Event{constructor(type,opts){this.type=type;this.bubbles=!!opts?.bubbles;}}
 class CustomEvent extends Event{constructor(type,opts){super(type,opts);this.detail=opts?.detail;}}
 vm.runInNewContext(read('renderer/live-captions-v42343.js'),{
  document,window:win,localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},
  setInterval:()=>0,Event,CustomEvent,console
 });
 const change=(id,checked)=>{nodes[id].checked=checked;nodes[id].dispatchEvent(new Event('change',{bubbles:true}));};
 return {nodes,video,change,events,callbacks,win};
}
const settle=async()=>{for(let i=0;i<14;i++)await Promise.resolve();};
test('From all OFF, enabling TTS enables Caption, Translate and TTS in one click',async()=>{
 const a=app();
 assert.equal(a.nodes.liveCaptionToggle.checked,false);
 assert.equal(a.nodes.liveTranslateToggle.checked,false);
 assert.equal(a.nodes.liveTtsToggle.checked,false);
 a.change('liveTtsToggle',true);
 await settle();
 assert.equal(a.nodes.liveCaptionToggle.checked,true);
 assert.equal(a.nodes.liveTranslateToggle.checked,true);
 assert.equal(a.nodes.liveTtsToggle.checked,true);
 assert.ok(a.events.some(e=>e.id==='liveCaptionToggle'&&e.checked));
 assert.ok(a.events.some(e=>e.id==='liveTranslateToggle'&&e.checked));
});
test('From all ON, disabling Caption turns off all three and stops recognition',async()=>{
 const a=app();
 a.change('liveTtsToggle',true);
 await settle();
 const before=a.callbacks.captionStop.length;
 a.change('liveCaptionToggle',false);
 await settle();
 assert.equal(a.nodes.liveCaptionToggle.checked,false);
 assert.equal(a.nodes.liveTranslateToggle.checked,false);
 assert.equal(a.nodes.liveTtsToggle.checked,false);
 assert.ok(a.events.some(e=>e.id==='liveTtsToggle'&&!e.checked));
 assert.ok(a.events.some(e=>e.id==='liveTranslateToggle'&&!e.checked));
 assert.ok(a.callbacks.captionStop.length>before,'Whisper must stop after disabling the entire pipeline');
});
test('Turning Translate off stops TTS but retains Caption',async()=>{
 const a=app();a.change('liveTtsToggle',true);
 a.change('liveTranslateToggle',false);
 await settle();
 assert.equal(a.nodes.liveCaptionToggle.checked,true);
 assert.equal(a.nodes.liveTranslateToggle.checked,false);
 assert.equal(a.nodes.liveTtsToggle.checked,false);
});
test('Turning TTS off alone does not alter Caption or Translate',()=>{
 const a=app();a.change('liveTtsToggle',true);
 a.change('liveTtsToggle',false);
 assert.equal(a.nodes.liveCaptionToggle.checked,true);
 assert.equal(a.nodes.liveTranslateToggle.checked,true);
 assert.equal(a.nodes.liveTtsToggle.checked,false);
});
test('Re-enabling TTS recovers the full pipeline after partial configurations',()=>{
 const a=app();a.change('liveCaptionToggle',true);
 a.change('liveTtsToggle',true);
 assert.equal(a.nodes.liveCaptionToggle.checked,true);
 assert.equal(a.nodes.liveTranslateToggle.checked,true);
 assert.equal(a.nodes.liveTtsToggle.checked,true);
});
test('Caption/TTS source code and persisted startup settings match requested cascades',()=>{
 const cap=read('renderer/live-captions-v42343.js');
 const speech=read('renderer/local-tts-v42344.js');
 const prefs=read('renderer/rust-ai-preferences-v23-8-4.js');
 assert.match(cap,/if\(event\?\.target===caption&&!caption\.checked\)/);
 assert.match(cap,/if\(!tts\.checked\)return/);
 assert.match(cap,/caption\.checked=true;translate\.checked=true/);
 assert.match(speech,/function ensureTranslate\(/);
 assert.match(prefs,/if\(tts\?\.checked\)/);
 assert.match(prefs,/if\(caption\)caption\.checked=true/);
});
test('Current release tag is immutable and matches the single-app Mac builder',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const release=pkg.version.split('-tauri.')[1];
 const build=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.ok(build.includes('TAG="rust-lab/v'+release+'"'));
 assert.ok(build.includes('npm run build -- --bundles app'));
});
