'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path');
const {createVideoCaptionRenderer}=require('../renderer/video-only-translated-caption-v42358.js');
const {decorate}=require('../renderer/styled-video-captions-v42368.js');
const {createController}=require('../renderer/auto-pip-v42363.js');
const compositor=require('../renderer/cc-pip-compositor-v42368.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('CC stays in fullscreen playerBox and returns to native track after leaving fullscreen',()=>{
 const prior=globalThis.VTTCue;
 class Cue{constructor(start,end,text){this.text=text;this.startTime=start;this.endTime=end;}}
 globalThis.VTTCue=Cue;
 const handlers={};
 const tracks=[],head={appendChild(){}};
 let overlay=null;
 const doc={
  fullscreenElement:null,head,
  defaultView:{addEventListener(){}},
  addEventListener:(name,fn)=>handlers[name]=fn,
  createElement:tag=>({tagName:tag,style:{},setAttribute(){},
   classList:{add(){}},children:[],appendChild(child){this.children.push(child);this.textContent+=child.textContent||'';},
   textContent:'',getContext:()=>null})
 };
 const box={clientWidth:800,clientHeight:450,contains:child=>child===video,
  classList:{add(){}},
  appendChild(element){element.parentElement=this;overlay=element;},
  querySelector:selector=>selector==='.openiptv-video-translation-overlay'?overlay:null};
 const video={
  currentTime:8,paused:false,ended:false,ownerDocument:doc,
  parentElement:box,clientWidth:800,clientHeight:450,
  classList:{add(){}},getBoundingClientRect:()=>({width:800,height:450}),
  textTracks:tracks,addTextTrack(kind,label,language){
   const track={kind,label,language,mode:'disabled',cues:[],
    addCue(c){this.cues.push(c)},removeCue(c){this.cues=this.cues.filter(x=>x!==c)}};
   tracks.push(track);return track;
  }
 };
 try{
  const captions=decorate(createVideoCaptionRenderer({video,doc}),{video,doc});
  captions.show('Phụ đề tiếng Việt đang hiển thị','vi',{translated:true,sourceText:'Original subtitle'});
  assert.equal(captions.getMode(),'native');
  assert.equal(tracks.at(-1).mode,'showing');
  doc.fullscreenElement=box;handlers.fullscreenchange();
  assert.equal(captions.getMode(),'overlay');
  assert.ok(overlay&&!overlay.hidden);
  assert.equal(tracks.at(-1).mode,'disabled');
  assert.match(overlay.textContent,/Original subtitle|Phụ đề tiếng Việt/);
  doc.fullscreenElement=null;handlers.fullscreenchange();
  assert.equal(captions.getMode(),'native');
  assert.equal(tracks.at(-1).mode,'showing');
  assert.equal(overlay.hidden,true);
  // A native fullscreen <video> has no room for a sibling DOM overlay;
  // keep native VTT instead of forcing an invisible fallback.
  doc.fullscreenElement=video;handlers.fullscreenchange();
  assert.equal(captions.getMode(),'native');
  assert.equal(tracks.at(-1).mode,'showing');
 }finally{globalThis.VTTCue=prior;}
});

function makeMock({caption=true,corsBlocked=false,mirrorRejected=false}={}){
 let doc,original=null;
 const listeners=(element,name,callback)=>((element.listeners[name]??=[]).push(callback));
 function node(tag){
  const item={
   tagName:tag.toUpperCase(),ownerDocument:doc,parentNode:null,children:[],listeners:{},
   style:{},readyState:0,paused:false,ended:false,muted:false,
   addEventListener(name,fn){listeners(this,name,fn)},
   removeEventListener(name,fn){this.listeners[name]=(this.listeners[name]||[]).filter(v=>v!==fn)},
   emit(name){for(const fn of this.listeners[name]||[])fn({type:name})},
   appendChild(child){child.parentNode=this;child.ownerDocument=doc;this.children.push(child);return child},
   setAttribute(){},removeAttribute(){},
   remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this)},
   play(){this.paused=false;this.readyState=4;this.emit('playing');this.emit('play');return Promise.resolve()},
   pause(){this.paused=true;this.emit('pause')},
   load(){},
   requestPictureInPicture(){
    if(mirrorRejected&&this!==original)return Promise.reject(Error('Canvas PiP unavailable'));
    doc.pictureInPictureElement=this;this.emit('enterpictureinpicture');
    return Promise.resolve(this);
   }
  };
  if(tag==='canvas'){
   const ctx={fillRect(){},drawImage(){},fillText(){},strokeText(){},
    measureText:value=>({width:String(value).length*9}),
    getImageData(){if(corsBlocked)throw Error('Tainted');return new Uint8Array(4)}};
   item.getContext=()=>ctx;
   item.captureStream=()=>({getTracks:()=>[{stop(){}}]});
  }
  return item;
 }
 const switches={
  liveCaptionToggle:{checked:caption,addEventListener(){}},
  liveTranslateToggle:{checked:caption,addEventListener(){}},
  subtitleShow:{checked:true,addEventListener(){}}
 };
 const win={
  OpenIPTVCCPiPCompositor:compositor,
  OpenIPTVCaptionSurface:{getPiPState:()=>({
   visible:true,text:'Bản dịch tiếng Việt dài để thử phụ đề trong cửa sổ PiP',
   sourceText:'Original text for PiP',translated:true,
   settings:{show:true,content:'both',color:'#facc15',size:'medium'}
  })}
 };
 doc={defaultView:win,createElement:node,getElementById:id=>switches[id]||null,
  pictureInPictureEnabled:true,pictureInPictureElement:null,
  body:null,documentElement:null,
  exitPictureInPicture(){
   const old=this.pictureInPictureElement;this.pictureInPictureElement=null;
   old?.emit('leavepictureinpicture');return Promise.resolve();
  }};
 doc.body=node('body');doc.documentElement=doc.body;
 original=node('video');
 original.readyState=4;original.paused=false;original.videoWidth=1280;original.videoHeight=720;
 original.clientWidth=1000;original.clientHeight=562;doc.body.appendChild(original);
 const ctrl=createController({video:original,doc,storage:{getItem:()=>null,setItem(){}},
  getPage:()=>'other'});
 return {ctrl,doc,original,switches};
}

test('CC native PiP uses composited mirror, preserves original video and exits cleanly',async()=>{
 const app=makeMock();
 try{
  assert.equal(await app.ctrl.manual(),true);
  assert.equal(app.ctrl.inPiP(),true);
  const mirror=app.doc.pictureInPictureElement;
  assert.ok(mirror);
  assert.notEqual(mirror,app.original);
  assert.equal(app.original.paused,false);
  assert.equal(mirror.muted,true);
  assert.ok(mirror.srcObject?.getTracks);
  assert.equal(await app.ctrl.manual(),true);
  assert.equal(app.ctrl.inPiP(),false);
  assert.equal(app.doc.pictureInPictureElement,null);
 }finally{await app.ctrl.dispose();}
});

test('Without CC enabled, original native PiP remains unchanged',async()=>{
 const app=makeMock({caption:false});
 try{
  assert.equal(await app.ctrl.manual(),true);
  assert.equal(app.doc.pictureInPictureElement,app.original);
 }finally{await app.ctrl.dispose();}
});

test('CORS-protected video retains original native PiP fallback',async()=>{
 const app=makeMock({corsBlocked:true});
 try{
  assert.equal(await app.ctrl.manual(),true);
  assert.equal(app.doc.pictureInPictureElement,app.original);
 }finally{await app.ctrl.dispose();}
});


test('If mirrored PiP request rejects, working native video PiP remains available',async()=>{
 const app=makeMock({mirrorRejected:true});
 try{
  assert.equal(await app.ctrl.manual(),true);
  assert.equal(app.doc.pictureInPictureElement,app.original);
  assert.equal(app.ctrl.inPiP(),true);
 }finally{await app.ctrl.dispose();}
});

test('Hard Stop from player closes mirrored PiP and releases capture without pausing the source',async()=>{
 const app=makeMock();
 try{
  assert.equal(await app.ctrl.manual(),true);
  const mirrored=app.doc.pictureInPictureElement;
  assert.ok(mirrored&&mirrored!==app.original);
  assert.ok(mirrored.srcObject);
  assert.equal(await app.ctrl.stopPlayback(),true);
  assert.equal(app.ctrl.inPiP(),false);
  assert.equal(app.doc.pictureInPictureElement,null);
  assert.equal(mirrored.srcObject,null);
  assert.equal(mirrored.paused,true);
  assert.equal(app.original.paused,false);
 }finally{await app.ctrl.dispose();}
});

test('Automatic navigation PiP with CC exits when returning to TV',async()=>{
 const app=makeMock();
 try{
  app.ctrl.onPageChange('other','tv');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(app.ctrl.inPiP(),true);
  assert.notEqual(app.doc.pictureInPictureElement,app.original);
  app.ctrl.onPageChange('tv','other');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(app.ctrl.inPiP(),false);
  assert.equal(app.doc.pictureInPictureElement,null);
 }finally{await app.ctrl.dispose();}
});

test('Pausing mirrored PiP also pauses original IPTV and resume remains possible',async()=>{
 const app=makeMock();
 try{
  await app.ctrl.manual();
  const pip=app.doc.pictureInPictureElement;
  assert.ok(pip&&pip!==app.original);
  pip.pause();
  assert.equal(app.original.paused,true);
  await pip.play();
  assert.equal(app.original.paused,false);
 }finally{await app.ctrl.dispose();}
});

test('Build wires compositor before PiP, disables background throttling and preserves fullscreen CC',()=>{
 const html=read('renderer/index.html'),main=read('src/main.cjs');
 const pip=read('renderer/auto-pip-v42363.js');
 const css=read('renderer/video-only-translated-caption-v42358.css');
 assert.ok(html.indexOf('src="cc-pip-compositor-v42368.js"')<
  html.indexOf('src="auto-pip-v42363.js"'));
 assert.match(main,/backgroundThrottling:false/);
 assert.match(pip,/OpenIPTVCCPiPCompositor/);
 assert.doesNotMatch(pip,/documentPictureInPicture/);
 assert.match(css,/#playerBox:fullscreen/);
 assert.match(css,/cc-position="bottom"/);
});
