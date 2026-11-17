'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {normalize,createStore,DEFAULTS}=require('../renderer/subtitle-customizer-v42368.js');
const {decorate}=require('../renderer/styled-video-captions-v42368.js');
const {createVideoCaptionRenderer}=require('../renderer/video-only-translated-caption-v42358.js');
const {split}=require('../renderer/tts-fast-chunks-v42368.js');

test('Electron v4.23.68: CC preferences are validated, persisted and restored',()=>{
 const memory=new Map();
 const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 const x=createStore({storage});
 x.set({content:'both',position:'top',size:'xlarge',color:'#facc15',
  backgroundStyle:'light',opacity:62,font:'noto',show:false});
 const later=createStore({storage}).get();
 assert.equal(later.content,'both');
 assert.equal(later.position,'top');
 assert.equal(later.size,'xlarge');
 assert.equal(later.color,'#facc15');
 assert.equal(later.opacity,62);
 assert.equal(later.font,'noto');
 assert.equal(later.show,false);
 assert.equal(normalize({color:'url(javascript:evil)',opacity:5000,font:'http://evil'}).color,DEFAULTS.color);
 assert.equal(normalize({opacity:5000}).opacity,100);
 assert.equal(normalize({size:'mega'}).size,'medium');
});
test('Electron v4.23.68: native subtitles support dual lines, CC OFF, custom color, size and location',()=>{
 const previous=globalThis.VTTCue;
 class Cue{constructor(start,end,text){this.startTime=start;this.endTime=end;this.text=text;}}
 globalThis.VTTCue=Cue;
 const tracks=[],head={appendChild(el){el.parentElement=this;},removeChild(el){el.parentElement=null;}};
 const video={currentTime:16,textTracks:tracks,classList:{add:()=>{}},addTextTrack(kind,label,lang){
  const t={kind,label,lang,mode:'disabled',cues:[],addCue(c){this.cues.push(c);},removeCue(c){this.cues=this.cues.filter(x=>x!==c);}};
  tracks.push(t);return t;
 }};
 const doc={head,createElement:name=>({tagName:name,textContent:'',parentElement:null})};
 try{
  const c=decorate(createVideoCaptionRenderer({video,doc}),{video,doc});
  c.setPreferences({content:'both',position:'bottom',size:'large',color:'#32e344',opacity:35});
  assert.equal(c.show('Chúng ta đi thôi.','vi',{translated:true,sourceText:"Let's go."}),'native');
  assert.match(tracks[0].cues[0].text,/c\.source/);
  assert.match(tracks[0].cues[0].text,/Chúng ta đi thôi/);
  assert.equal(tracks[0].cues[0].line,88);
  assert.equal(c.getPreferences().color,'#32e344');
  c.setPreferences({position:'top',content:'original'});
  assert.equal(tracks[0].cues[0].text,"Let's go.");
  assert.equal(tracks[0].cues[0].line,12);
  c.setPreferences({show:false});
  assert.equal(c.getMode(),'off');
  assert.equal(tracks[0].cues.length,0);
  c.setPreferences({show:true,content:'translated'});
  assert.equal(tracks[0].cues[0].text,'Chúng ta đi thôi.');
  c.clear();
  assert.equal(c.getText(),'');
 }finally{globalThis.VTTCue=previous;}
});
test('Electron v4.23.68: TTS chunker starts on short phrase and keeps all text',()=>{
 const text='Chúng ta sẽ tìm cách thoát khỏi nơi này. Nhưng phải tiếp tục tiến về phía trước. Không được bỏ cuộc lúc này.';
 const parts=split(text);
 assert.ok(parts.length>1);
 assert.ok(parts[0].length<=58);
 assert.equal(parts.join(' '),text);
 assert.ok(parts.every(x=>x.length>0));
 assert.deepEqual(split('Xin chào.'),['Xin chào.']);
});
test('Electron v4.23.68: Live Caption toggle no longer forces translation or captions ON',()=>{
 const source=read('renderer/live-captions-v42343.js');
 const match=source.match(/const changed=event=>\{([\s\S]*?)\n \};/);
 assert.ok(match,'Change handler found');
 const translate={checked:true},caption={checked:false};
 let reconciles=0;
 const fn=vm.runInNewContext('(event)=>{'+match[1]+'}',{caption,translate,message:()=>{},reconcile:()=>{reconciles++;},clearOutput:()=>{}});
 fn({target:caption});
 assert.equal(caption.checked,false);
 assert.equal(translate.checked,true);
 assert.equal(reconciles,0,'Source visibility must not restart Whisper while translation stays active');
 assert.doesNotMatch(match[1],/translate\.checked\)caption\.checked=true/);
});
test('Electron v4.23.68: pause/seek/ended/stall halt captions & all speech, source text emitted',()=>{
 const cap=read('renderer/live-captions-v42343.js');
 const tts=read('renderer/local-tts-v42344.js');
 const backend=read('src/live-caption-service.cjs');
 const ui=read('renderer/index.html');
 assert.match(cap,/if\(!mediaActive\(\)\)\{clearOutput\(\);return;\}/);
 assert.match(cap,/\['pause','ended','emptied','seeking'\]/);
 assert.match(cap,/\['waiting','stalled'\]/);
 assert.match(tts,/\['pause','ended','emptied','seeking'\]/);
 assert.match(tts,/speechQueue\.setPaused\(true\)/);
 assert.match(tts,/cancelSpeechAudio/);
 assert.match(tts,/void previewCoordinator\.cancel\(\)/);
 assert.match(tts,/alreadyTranslated:true/);
 assert.match(tts,/const chunks=window\.OpenIPTVTTSChunks\?\.split/);
 assert.match(tts,/prefetch=Promise\.resolve\(\)\.then/);
 assert.doesNotMatch(tts,/englishIntermediate\|\|e\.text/);
 assert.match(backend,/sourceText:words,englishText:/);
 for(const id of ['subtitleOptionsBtn','subtitleOptionsPanel','subtitleShow','subtitleContent','subtitlePosition','subtitleSize','subtitleFont','subtitleCustomColor','subtitleOpacity'])
  assert.match(ui,new RegExp('id="'+id+'"'));
 const first=ui.indexOf('src="styled-video-captions-v42368.js"'),second=ui.indexOf('src="live-captions-v42343.js"');
 assert.ok(first>=0&&second>first);
 assert.ok(ui.indexOf('src="tts-fast-chunks-v42368.js"')<ui.indexOf('src="local-tts-v42344.js"'));
});
