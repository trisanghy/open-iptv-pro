'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {createVideoCaptionRenderer}=require('../renderer/video-only-translated-caption-v42358.js');

test('v4.23.60: 1 translated native video cue replaces previous and clears on stop',()=>{
 class FakeCue{constructor(start,end,text){this.startTime=start;this.endTime=end;this.text=text;}}
 const previous=globalThis.VTTCue;
 globalThis.VTTCue=FakeCue;
 const tracks=[];
 const video={currentTime:120,addTextTrack:(kind,label,lang)=>{
  const t={kind,label,lang,mode:'disabled',cues:[],
   addCue(c){this.cues.push(c);},removeCue(c){this.cues=this.cues.filter(x=>x!==c);}};
  tracks.push(t);return t;
 }};
 try{
  const renderer=createVideoCaptionRenderer({video,doc:{}});
  assert.equal(renderer.show('Xin chào','vi'),'native');
  assert.equal(tracks.length,1);
  assert.equal(tracks[0].mode,'showing');
  assert.equal(tracks[0].lang,'vi');
  assert.equal(tracks[0].cues[0].text,'Xin chào');
  renderer.show('Tạm biệt','vi');
  assert.equal(tracks.length,1,'One track per language, not one per sentence');
  assert.deepEqual(tracks[0].cues.map(x=>x.text),['Tạm biệt']);
  renderer.show('Bonjour','fr');
  assert.equal(tracks[0].mode,'disabled');
  assert.equal(tracks.length,2);
  assert.equal(tracks[1].cues[0].text,'Bonjour');
  renderer.clear();
  assert.equal(tracks[1].mode,'disabled');
  assert.equal(tracks[1].cues.length,0);
  assert.equal(renderer.getText(),'');
 }finally{globalThis.VTTCue=previous;}
});
test('v4.23.60: fallback is one overlay over VIDEO, never a transcript below controls',()=>{
 const previous=globalThis.VTTCue;
 globalThis.VTTCue=undefined;
 const children=[];
 const parent={
  classList:{add:x=>{parent.captionClass=x;}},
  appendChild(node){children.push(node);node.parentElement=this;},
  removeChild(node){const i=children.indexOf(node);if(i>=0)children.splice(i,1);node.parentElement=null;}
 };
 const doc={createElement:()=>({
  className:'',textContent:'',hidden:true,attributes:{},
  setAttribute(k,v){this.attributes[k]=v;}
 })};
 const renderer=createVideoCaptionRenderer({video:{currentTime:NaN,parentElement:parent},doc});
 try{
  assert.equal(renderer.show('Chào buổi sáng','vi'),'overlay');
  assert.equal(children.length,1);
  assert.equal(children[0].textContent,'Chào buổi sáng');
  assert.equal(children[0].hidden,false);
  assert.equal(parent.captionClass,'openiptv-video-translation-anchor');
  renderer.show('Chúc một ngày tốt lành','vi');
  assert.equal(children.length,1,'No duplicate video subtitle nodes');
  assert.equal(children[0].textContent,'Chúc một ngày tốt lành');
  renderer.destroy();
  assert.equal(children.length,0);
 }finally{globalThis.VTTCue=previous;}
});
test('v4.23.60: event listener hides source/interim, shows ONLY chosen target, blocks stale results',()=>{
 const src=read('renderer/live-captions-v42343.js');
 const start=src.indexOf("  if(ev.type==='segment'){");
 const end=src.indexOf("  if(ev.type==='status'",start);
 assert.ok(start>0&&end>start);
 const handled=src.slice(start,end);
 const updates=[];let clears=0,lastShownSequence=0;
 const setup={translate:{checked:true},lang:{value:'vi'},
  LANGUAGE_NAMES:{vi:'Tiếng Việt'},lastShownSequence,
  outputWords:(...args)=>updates.push(args),
  clearOutput:()=>{clears++;},
  message:()=>{}};
 const run=vm.runInNewContext('((ev)=>{'+handled+';return lastShownSequence;})',setup);
 // raw text recognized first; no source text should ever be visible
 run({type:'segment',sequence:1,text:'Hello',language:'en',translated:false});
 assert.equal(setup.lastShownSequence,1);
 assert.equal(updates.length,0);assert.equal(clears,1);
 run({type:'segment',sequence:1,text:'Xin chào',language:'vi',translated:true});
 assert.deepEqual(Array.from(updates[0]),['Xin chào','vi',true,'']);
 run({type:'segment',sequence:2,text:'Goodbye',language:'en',translated:false});
 assert.equal(updates.length,1);assert.equal(clears,2);
 run({type:'segment',sequence:1,text:'Phụ đề cũ',language:'vi',translated:true});
 assert.equal(updates.length,1,'Older translated subtitles must never overwrite newer recognition');
 run({type:'segment',sequence:2,text:'Tạm biệt',language:'vi',translated:true});
 assert.equal(updates.length,2);
 assert.equal(updates[1][0],'Tạm biệt');
 run({type:'segment',sequence:3,text:'Non-target language',language:'en',translated:true});
 assert.equal(updates.length,2,'Even translated=true must match selected target language');
 setup.translate.checked=false;
 run({type:'segment',sequence:4,text:'English captions',language:'en',translated:false});
 assert.deepEqual(Array.from(updates[2]),['English captions','en',false]);
});
test('v4.23.60: no bottom transcript, and correct video script load ordering',()=>{
 const html=read('renderer/index.html'),css=read('renderer/video-only-translated-caption-v42358.css');
 const ui=read('renderer/live-captions-v42343.js');
 const videoScript=html.indexOf('src="video-only-translated-caption-v42358.js"');
 const captionScript=html.indexOf('src="live-captions-v42343.js"');
 assert.ok(videoScript>0&&captionScript>videoScript);
 assert.match(css,/#liveCaptionOutput/);
 assert.match(css,/display:none!important/);
 assert.doesNotMatch(ui,/out\.hidden=false/);
 assert.match(ui,/videoCaptions\.show/);
 assert.match(ui,/videoCaptions\?\.clear/);
 assert.match(ui,/if\(!ev\.translated\|\|ev\.language!==target\)/);
 assert.match(ui,/if\(ev\.type==='translation-error'\)\{\s*clearOutput\(\)/);
});
test('v4.23.60: retains continuous recognition and warm TTS; Mac DMG-only',()=>{
 const service=read('src/live-caption-service.cjs'),tts=read('src/local-tts-service.cjs');
 assert.match(service,/runContinuous\(s,getFFmpeg\(\),bin\(\),model\(\)\)/);
 assert.match(tts,/task\.session=getPremiumSession\(\)/);
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.version,/^4\.23\.\d+$/);
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
});
