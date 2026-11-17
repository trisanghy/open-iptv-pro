'use strict';
/* Caption-capable VIDEO PiP for Electron: draw the existing decoded video and
   the current offline CC into a low-resolution canvas, then PiP that stream.
   No second IPTV URL, HLS decoder, translator or audio source is created. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVCCPiPCompositor=api;
})(typeof window!=='undefined'?window:null,function(){
 const FONTS={system:'system-ui,sans-serif',arial:'Arial,sans-serif',
  noto:'"Noto Sans",Arial,sans-serif',roboto:'Roboto,Arial,sans-serif',
  serif:'Georgia,serif',mono:'monospace'};
 const SIZES={small:18,medium:24,large:30,xlarge:38};
 const safeColor=color=>/^#[0-9a-f]{6}$/i.test(String(color))?String(color):'#facc15';
 function wrapLines(ctx,input,width){
  const result=[];
  for(const paragraph of String(input||'').replace(/\r\n?/g,'\n').split('\n')){
   let row='';
   for(const word of paragraph.split(/\s+/).filter(Boolean)){
    const joined=row?row+' '+word:word;
    if(ctx.measureText(joined).width<=width){row=joined;continue;}
    if(row){result.push(row);row='';}
    if(ctx.measureText(word).width<=width){row=word;continue;}
    for(const char of Array.from(word)){
     if(row&&ctx.measureText(row+char).width>width){result.push(row);row='';}
     row+=char;
    }
   }
   if(row)result.push(row);
  }
  return result;
 }
 function renderFrame({ctx,canvas,video,state}){
  const w=canvas.width,h=canvas.height;
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  const sourceWidth=video.videoWidth||w,sourceHeight=video.videoHeight||h;
  const factor=Math.min(w/sourceWidth,h/sourceHeight);
  const frame={x:(w-sourceWidth*factor)/2,y:(h-sourceHeight*factor)/2,
   width:sourceWidth*factor,height:sourceHeight*factor};
  ctx.drawImage(video,frame.x,frame.y,frame.width,frame.height);
  if(!state?.visible||video.paused||video.ended||!state.text)return frame;
  const prefs=state.settings||{};
  const source=String(state.sourceText||'').trim();
  const translation=String(state.text||'').trim();
  const entries=state.translated&&source&&prefs.content==='original'
   ?[{text:source,color:'#ffffff'}]
   :state.translated&&source&&prefs.content==='both'
    ?[{text:source,color:'#ffffff'},{text:translation,color:safeColor(prefs.color)}]
    :[{text:translation,color:safeColor(prefs.color)}];
  const fontFamily=FONTS[prefs.font]||FONTS.system;
  const maxWidth=Math.max(75,frame.width*.90);
  let fontSize=SIZES[prefs.size]||24,lines=[],step=0;
  while(true){
   ctx.font='650 '+fontSize+'px '+fontFamily;
   lines=entries.flatMap(item=>wrapLines(ctx,item.text,maxWidth).map(text=>({
    text,color:item.color
   })));
   step=fontSize*1.30;
   if(fontSize<=12||lines.length*step<frame.height*.68)break;
   fontSize-=1;
  }
  if(!lines.length)return frame;
  const height=lines.length*step;
  const position=prefs.position||'bottom';
  let start=position==='top'?frame.y+12:
   position==='middle'?frame.y+(frame.height-height)/2:
   frame.y+frame.height-height-12;
  start=Math.max(frame.y+5,Math.min(start,frame.y+frame.height-height-5));
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<lines.length;i++){
   const row=lines[i],x=w/2,y=start+(i+.5)*step;
   if(prefs.background!==false&&prefs.backgroundStyle!=='none'){
    const alpha=prefs.backgroundStyle==='solid'?.88:
     Math.max(0,Math.min(100,Number(prefs.opacity??50)))/100;
    ctx.fillStyle=prefs.backgroundStyle==='light'
     ?'rgba(255,255,255,'+alpha+')':'rgba(0,0,0,'+alpha+')';
    const rowWidth=Math.min(maxWidth,ctx.measureText(row.text).width+22);
    ctx.fillRect(x-rowWidth/2,y-step*.52,rowWidth,step*1.04);
   }
   if(prefs.outline!==false&&prefs.outlineStyle!=='none'){
    ctx.lineWidth=4;ctx.strokeStyle=prefs.outlineStyle==='light'?'#ffffff':'#000000';
    ctx.strokeText(row.text,x,y,maxWidth);
   }
   ctx.fillStyle=row.color;ctx.fillText(row.text,x,y,maxWidth);
  }
  return frame;
 }
 function createController({video,doc,getState=()=>null,onPiPEvent=()=>{}}){
  let canvas=null,ctx=null,mirror=null,stream=null,timer=null,failed=false;
  const supported=()=>!!(doc?.createElement&&typeof doc.createElement('canvas')?.captureStream==='function');
  const ready=()=>!!mirror&&mirror.readyState>=2;
  function paint(){
   if(!canvas||!ctx||video.readyState<2)return false;
   try{renderFrame({ctx,canvas,video,state:getState()});return true;}
   catch{failed=true;return false;}
  }
  function stop(){
   if(timer!==null){clearInterval(timer);timer=null;}
   if(mirror){
    try{mirror.pause();mirror.removeAttribute('src');mirror.srcObject=null;mirror.load();}catch{}
    try{mirror.remove();}catch{}
   }
   for(const track of stream?.getTracks?.()||[])try{track.stop();}catch{}
   mirror=null;stream=null;canvas=null;ctx=null;failed=false;
  }
  function prepare(){
   if(failed||video.readyState<2)return false;
   if(mirror)return !failed;
   try{
    canvas=doc.createElement('canvas');
    if(!canvas||typeof canvas.captureStream!=='function')return false;
    const ratio=Number(video.videoWidth)/Number(video.videoHeight);
    const wide=Number.isFinite(ratio)&&ratio>.5&&ratio<3?ratio:16/9;
    canvas.width=640;canvas.height=Math.round(640/wide);
    ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx||!paint())throw Error('Video cannot be drawn');
    // Detect CORS/DRM-protected streams before requesting a mirrored PiP.
    ctx.getImageData(0,0,1,1);
    stream=canvas.captureStream(12);
    mirror=doc.createElement('video');
    mirror.muted=true;mirror.autoplay=true;mirror.playsInline=true;
    mirror.srcObject=stream;
    mirror.style.position='fixed';mirror.style.left='0';
    mirror.style.bottom='0';mirror.style.width='2px';mirror.style.height='2px';
    mirror.style.opacity='0';mirror.style.pointerEvents='none';
    mirror.setAttribute('aria-hidden','true');
    mirror.addEventListener?.('enterpictureinpicture',()=>onPiPEvent('enter'));
    mirror.addEventListener?.('leavepictureinpicture',()=>onPiPEvent('leave'));
    // Native PiP playback buttons should control the real IPTV video, not
    // just the muted canvas mirror; this also stops CC/TTS on pause.
    mirror.addEventListener?.('pause',()=>{
     if(doc.pictureInPictureElement===mirror&&!video.paused)video.pause();
    });
    mirror.addEventListener?.('play',()=>{
     if(doc.pictureInPictureElement===mirror&&video.paused)
      Promise.resolve(video.play()).catch(()=>{});
    });
    video.addEventListener?.('pause',()=>{
     if(doc.pictureInPictureElement===mirror&&!mirror.paused)mirror.pause();
    });
    video.addEventListener?.('playing',()=>{
     if(doc.pictureInPictureElement===mirror&&mirror.paused)
      Promise.resolve(mirror.play()).catch(()=>{});
    });
    (doc.body||doc.documentElement).appendChild(mirror);
    // Original IPTV video keeps its own audio. PiP video is video-only.
    Promise.resolve(mirror.play()).catch(()=>{});
    timer=setInterval(()=>{
     if(!paint()&&failed)stop();
    },90);
    return true;
   }catch{stop();failed=true;return false;}
  }
  const getVideo=()=>ready()&&!failed?mirror:null;
  return Object.freeze({prepare,getVideo,ready,supported,
   stop,getError:()=>failed?'Video bị giới hạn CORS/DRM nên không thể ghép CC vào PiP':''});
 }
 return Object.freeze({wrapLines,renderFrame,createController});
});
