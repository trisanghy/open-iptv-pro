'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const SPEEDS=['0.60','0.75','0.85','1.00','1.10','1.25','1.50','1.75','2.00'];

test('v4.23.60: speed selector exists in TTS row with all nine allowed speeds',()=>{
 const html=read('renderer/index.html'),css=read('renderer/local-tts-row-v42344.css');
 assert.equal((html.match(/id="liveTtsSpeed"/g)||[]).length,1);
 for(const rate of SPEEDS)assert.match(html,new RegExp('value="'+rate.replace('.','\\.')+'"'));
 const row=html.indexOf('id="liveTtsSpeed"'),lang=html.indexOf('id="liveTtsLanguage"'),
       original=html.indexOf('id="liveTtsDuck"');
 assert.ok(lang<row&&row<original,'Speed must be on same third-row TTS control strip');
 assert.match(css,/#liveTtsSpeed/);
 assert.match(css,/flex-wrap:wrap/);
 assert.match(JSON.parse(read('package.json')).version,/^4\.23\.\d+$/);
});

test('v4.23.60: live playback and preview use the same pitch-preserving rate, stored across sessions',async()=>{
 const listeners={},elements={},audio=[];
 function el(id){
  if(elements[id])return elements[id];
  const e={id,value:'',checked:false,disabled:false,hidden:false,textContent:'',title:'',dataset:{},
   children:[],listeners:{},append(child){this.children.push(child);},replaceChildren(...items){this.children=items;},
   addEventListener(type,fn){this.listeners[type]=fn;},dispatchEvent(event){return this.listeners[event.type]?.(event);}};
  return (elements[id]=e);
 }
 for(const id of ['video','liveTtsToggle','liveTtsLanguage','liveTtsVoice','liveTtsSpeed',
                  'liveTtsDuck','liveTtsInstall','liveTtsStatus','volume',
                  'liveCaptionToggle','liveTranslateToggle','liveCaptionOutput','liveTtsPreview'])el(id);
 el('video').volume=0.8;el('video').currentSrc='http://example.invalid/stream';
 el('video').paused=false;el('video').ended=false;el('video').readyState=4;
 el('liveTtsLanguage').value='vi';el('liveTtsDuck').value='25';
 el('liveTtsSpeed').value='1.00';el('liveCaptionToggle').checked=true;el('liveTranslateToggle').checked=true;
 const stored={'openiptv-tts-playback-speed':'1.25'};
 const storage={getItem:k=>stored[k]??null,setItem:(k,v)=>{stored[k]=String(v);}};
 let captionCb=null;
 class FakeAudio{
  constructor(src){this.src=src;this.playbackRate=1;this.defaultPlaybackRate=1;
   this.preservesPitch=false;this.webkitPreservesPitch=false;this.listeners={};audio.push(this);}
  addEventListener(type,fn){this.listeners[type]=fn;}
  async play(){this.started=true;}
  pause(){this.paused=true;}
  load(){}
 }
 const api={
  ttsStatus:async()=>({ready:true}),
  ttsSynthesize:async()=>({audioBase64:'UklGRgAAAABXQVZF',mime:'audio/wav',translatedText:'Xin chào'}),
  ttsOnEvent:()=>{},
  captionOnEvent:fn=>{captionCb=fn;},
  ttsStop:async()=>({})
 };
 const context={document:{getElementById:el,createElement:()=>({children:[],append(c){this.children.push(c);}}),
                    addEventListener:()=>{}},
  window:{streamleaf:api,IPTVState:{getCurrent:()=>({url:'http://example.invalid/stream'})},addEventListener:()=>{}},
  localStorage:storage,Event:class{constructor(type){this.type=type;}},Audio:FakeAudio,
  setInterval:()=>0,console};
 context.window.OpenIPTVSpeechQueue=require('../renderer/tts-utterance-queue-v42359.js');
 context.window.OpenIPTVPreviewCoordinator=require('../renderer/tts-preview-coordinator-v42366.js');
 vm.runInNewContext(read('renderer/local-tts-v42344.js'),context);
 assert.equal(el('liveTtsSpeed').value,'1.25');
 el('liveTtsPreview').listeners.click();
 for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(audio.length,1);
 assert.equal(audio[0].playbackRate,1.25);
 assert.equal(audio[0].preservesPitch,true);
 el('liveTtsSpeed').value='1.50';el('liveTtsSpeed').listeners.change();
 assert.equal(audio[0].playbackRate,1.5,'Preview speed should update immediately');
 assert.equal(stored['openiptv-tts-playback-speed'],'1.50');
 audio[0].listeners.ended();
 for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));
 el('liveTtsToggle').checked=true;
 await el('liveTtsToggle').listeners.change();
 captionCb({type:'segment',translated:true,language:'vi',text:'Xin chào',utteranceKey:'xin-chao'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(audio.length,2);
 assert.equal(audio[1].playbackRate,1.5);
 assert.equal(audio[1].preservesPitch,true);
 el('liveTtsSpeed').value='0.75';el('liveTtsSpeed').listeners.change();
 assert.equal(audio[1].playbackRate,0.75,'Current TTS sentence should change speed in flight');
 assert.equal(audio[0].playbackRate,1.5,'Completed preview should not follow subsequent live speech changes');
 assert.equal(el('video').playbackRate,undefined,'IPTV playback speed must never change');
});
