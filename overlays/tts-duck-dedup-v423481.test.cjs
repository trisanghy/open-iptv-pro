'use strict';
// v4.23.48.1: exercised in a fake player to catch repeated audio and temporary ducking.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.resolve(__dirname,'../renderer/local-tts-v42344.js'),'utf8');
function boot(){
 class Element{
  constructor(value=''){this.value=value;this.checked=false;this.listeners={};this.options=[];this.selectedOptions=[];this.textContent='';this.disabled=false;this.hidden=false;}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
  fire(name){for(const cb of this.listeners[name]||[])cb({type:name});}
  dispatchEvent(e){this.fire(e.type);}
  replaceChildren(...children){this.options=children;this.selectedOptions=children.slice(0,1);this.value=children[0]?.value||'';}
 }
 const names=['video','liveTtsToggle','liveTtsLanguage','liveTtsVoice','liveTtsDuck','liveTtsInstall','liveTtsStatus','liveCaptionToggle','liveTranslateToggle','liveCaptionOutput','volume'];
 const el=Object.fromEntries(names.map(n=>[n,new Element()]));
 el.volume.value='80';el.liveTtsDuck.value='25';el.liveTtsLanguage.value='en';
 let actual=.8;
 Object.defineProperty(el.video,'volume',{get(){return actual;},set(v){actual=v;el.video.fire('volumechange');}});
 el.video.currentSrc='video';
 const audio=[];
 class FakeAudio{
  constructor(){this.listeners={};audio.push(this);}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
  play(){return Promise.resolve();}
  pause(){}load(){}
  fire(name){for(const fn of this.listeners[name]||[])fn();}
 }
 let cb,source='test-iptv-a',synth=0;
 const api={
  captionOnEvent(fn){cb=fn;},ttsOnEvent(){},
  ttsStatus:async()=>({ready:true}),
  ttsSynthesize:async()=>{synth++;return {mime:'audio/wav',audioBase64:'UklGRg==' };},
  ttsStop:async()=>({}),
 };
 const window={streamleaf:api,IPTVState:{getCurrent:()=>({url:source})},addEventListener(){}};
 const document={getElementById:n=>el[n]||null,createElement:()=>new Element(),addEventListener(){}};
 const timer=[];
 vm.runInNewContext(src,{window,document,setInterval:fn=>timer.push(fn),Audio:FakeAudio,
  Event:class{constructor(type){this.type=type;}},localStorage:{getItem:()=>null,setItem(){}},
  console,Date,Promise});
 return {el,cb,audio,timer,setSource:s=>{source=s;},get synth(){return synth;}};
}
test('TTS keeps the selected percentage before/during/after each sentence, including channel change',async()=>{
 const h=boot();
 h.el.liveTtsToggle.checked=true;h.el.liveTtsToggle.fire('change');
 assert.equal(h.el.video.volume,.2);
 h.cb({type:'segment',translated:true,text:'What are you doing?',englishText:'What are you doing?'});
 h.cb({type:'segment',translated:true,text:'What are you doing!',englishText:'What are you doing!'});
 await new Promise(setImmediate);
 assert.equal(h.synth,1,'A repeated caption must not create another synthesis');
 assert.equal(h.audio.length,1);
 h.audio[0].fire('ended');
 assert.equal(h.el.video.volume,.2,'TTS has ended but is still enabled');
 h.el.volume.value='60';h.el.volume.fire('input');
 assert.equal(h.el.video.volume,.15);
 h.el.liveTtsDuck.value='50';h.el.liveTtsDuck.fire('change');
 assert.equal(h.el.video.volume,.3);
 h.el.video.volume=.8;
 assert.equal(h.el.video.volume,.3,'Playback volume resets must be corrected');
 h.setSource('test-iptv-b');h.timer[0]();
 assert.equal(h.el.video.volume,.3,'Channel changes must not restore original volume');
 h.el.video.fire('pause');
 assert.equal(h.el.video.volume,.3,'Pauses must not restore volume');
 h.el.liveTtsToggle.checked=false;h.el.liveTtsToggle.fire('change');
 assert.equal(h.el.video.volume,.6,'Only TTS disable should restore master volume');
});
