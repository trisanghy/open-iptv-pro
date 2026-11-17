'use strict';
/**
 * v4.23.68: extend the native video subtitle track with safe, user-configurable
 * caption appearance. The original renderer keeps native fullscreen and PiP.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.OpenIPTVVideoCaptions)api.install(root);
})(typeof window!=='undefined'?window:null,function(){
 const fonts={system:'system-ui,-apple-system,sans-serif',arial:'Arial,sans-serif',noto:'"Noto Sans","Arial Unicode MS",sans-serif',roboto:'Roboto,Arial,sans-serif',serif:'Georgia,serif',mono:'Consolas,monospace'};
 const sizes={small:16,medium:21,large:27,xlarge:34};
 const safeColor=c=>/^#[0-9a-f]{6}$/i.test(String(c))?c:'#facc15';
 const safeText=t=>String(t||'').trim().slice(0,1800);
 const escapeCue=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

 // Manually wrap long recognition results before they reach Chromium VTTCue.
 // This also splits CJK strings / unusually long words without whitespace.
 function wrapCaptionText(input,maxWidth,fontSize=21,measureText){
  const limit=Math.max(80,Number(maxWidth)||500),size=Math.max(12,Number(fontSize)||21);
  const measure=typeof measureText==='function'?measureText:text=>Array.from(text).reduce((sum,char)=>
   sum+(/[\u2e80-\u9fff\uf900-\ufaff]/u.test(char)?size:
    /[ilI1.,:;!| ']/.test(char)?size*.30:size*.58),0);
  const fits=text=>measure(text)<=limit,lines=[];
  for(const paragraph of String(input||'').replace(/\r\n?/g,'\n').split('\n')){
   const words=paragraph.trim().split(/\s+/).filter(Boolean);
   if(!words.length){lines.push('');continue;}
   let current='';
   for(const word of words){
    if(current&&fits(current+' '+word)){current+=' '+word;continue;}
    if(current){lines.push(current);current='';}
    if(fits(word)){current=word;continue;}
    for(const char of Array.from(word)){
     if(current&&!fits(current+char)){lines.push(current);current='';}
     current+=char;
    }
   }
   if(current)lines.push(current);
  }
  return lines.join('\n');
 }
 function decorate(base,{video,doc}){
  let prefs={show:true,content:'both',position:'bottom',size:'medium',font:'system',color:'#facc15',outline:true,outlineStyle:'dark',background:true,backgroundStyle:'black',opacity:50};
  let last=null,styleNode=null,originalVisible=true,effectiveFontSize=21;
  const fontPx=()=>sizes[prefs.size]||21;
  const wrapForVideo=(text,size=fontPx())=>{
   const rect=video.getBoundingClientRect?.();
   const width=rect?.width||video.clientWidth||video.parentElement?.clientWidth||640;
   let measure=null;
   try{
    const ctx=doc.createElement?.('canvas')?.getContext?.('2d');
    if(ctx){ctx.font='650 '+size+'px '+(fonts[prefs.font]||fonts.system);
     measure=value=>ctx.measureText(value).width;}
   }catch{}
   return wrapCaptionText(text,width*.86,size,measure);
  };

  const background=()=>{
   if(!prefs.background||prefs.backgroundStyle==='none')return 'transparent';
   if(prefs.backgroundStyle==='solid')return 'rgba(0,0,0,0.9)';
   const alpha=Math.max(0,Math.min(100,Number(prefs.opacity)||0))/100;
   return prefs.backgroundStyle==='light'?'rgba(255,255,255,'+alpha+')':'rgba(0,0,0,'+alpha+')';
  };
  const shadow=()=>!prefs.outline||prefs.outlineStyle==='none'?'none':
   prefs.outlineStyle==='light'?'0 1px 3px white,0 -1px 3px white':'0 1px 4px black,0 -1px 3px black';
  const applyStyle=()=>{
   if(doc.head?.appendChild&&doc.createElement){
    if(!styleNode){
     styleNode=doc.createElement('style');
     styleNode.id='openiptv-caption-cue-style';
     doc.head.appendChild(styleNode);
    }
    const prefix='video.openiptv-styled-video-cc::cue';
    styleNode.textContent=prefix+'{font-size:'+effectiveFontSize+'px;font-family:'+
     (fonts[prefs.font]||fonts.system)+';font-weight:650;color:'+safeColor(prefs.color)+
     ';background:'+background()+';text-shadow:'+shadow()+';}'+
     prefix+'(.source){color:#fff;}'+prefix+'(.translated){color:'+safeColor(prefs.color)+';}';
    video.classList?.add?.('openiptv-styled-video-cc');
   }
   const overlay=video.parentElement?.querySelector?.('.openiptv-video-translation-overlay');
   if(overlay?.style){
    overlay.style.color=safeColor(prefs.color);
    overlay.style.fontFamily=fonts[prefs.font]||fonts.system;
    overlay.style.fontSize=effectiveFontSize+'px';
    overlay.style.backgroundColor=background();
    overlay.style.textShadow=shadow();
    overlay.style.borderRadius='9px';
    overlay.style.padding='4px 12px';
    overlay.style.bottom=prefs.position==='top'?'auto':prefs.position==='middle'?'39%':'4%';
    overlay.style.top=prefs.position==='top'?'5%':'auto';
   }
  };
  const show=(text,language,{sourceText='',translated=false}={})=>{
   const translatedLine=safeText(text),rawOriginal=safeText(sourceText);
   const original=originalVisible?rawOriginal:'';
   last={text:translatedLine,language,sourceText:rawOriginal,translated};
   if(!prefs.show||!translatedLine){base.clear();return 'off';}
   // Keep every row visible even inside a small/letterboxed video: reduce
   // only the effective font size for exceptionally long subtitles.
   let size=fontPx(),wrappedTranslated='',wrappedOriginal='';
   const frame=video.getBoundingClientRect?.();
   const viewHeight=frame?.height||video.clientHeight||
    (frame?.width||video.clientWidth||640)*9/16;
   while(true){
    wrappedTranslated=wrapForVideo(translatedLine,size);
    wrappedOriginal=original?wrapForVideo(original,size):'';
    const lines=(translated&&wrappedOriginal&&prefs.content==='both'
     ?wrappedOriginal.split('\n').length+wrappedTranslated.split('\n').length
     :translated&&wrappedOriginal&&prefs.content==='original'
      ?wrappedOriginal.split('\n').length:wrappedTranslated.split('\n').length);
    if(size<=12||lines*size*1.4<=viewHeight*.72)break;
    size--;
   }
   effectiveFontSize=size;
   let display=wrappedTranslated;
   if(translated&&wrappedOriginal){
    if(prefs.content==='original')display=wrappedOriginal;
    else if(prefs.content==='both')display=wrappedOriginal+'\n'+wrappedTranslated;
   }
   applyStyle();
   const mode=base.show(display,language);
   if(mode==='native'){
    // Keep native text tracks for fullscreen and Picture-in-Picture.
    const tracks=video.textTracks;
    const track=tracks&&tracks.length?tracks[tracks.length-1]:null;
    const cue=track?.activeCues?.[0]||track?.cues?.[0];
    if(cue){
     try{
      cue.position=50;cue.snapToLines=false;cue.size=90;cue.align='center';
      // Bottom captions expand UPWARDS, even when there are multiple rows.
      cue.line=prefs.position==='top'?8:prefs.position==='middle'?50:92;
      cue.lineAlign=prefs.position==='top'?'start':prefs.position==='middle'?'center':'end';
      if(translated&&wrappedOriginal&&prefs.content==='both')
       cue.text='<c.source>'+escapeCue(wrappedOriginal)+'</c>\n<c.translated>'+escapeCue(wrappedTranslated)+'</c>';
     }catch{}
    }
   }
   if(mode==='overlay'){
    const overlay=video.parentElement?.querySelector?.('.openiptv-video-translation-overlay');
    if(overlay&&translated&&original&&prefs.content==='both'&&doc.createElement){
     overlay.textContent='';
     for(const [value,color] of [[wrappedOriginal,'#fff'],[wrappedTranslated,safeColor(prefs.color)]]){
      const line=doc.createElement('span');line.textContent=value;
      if(line.style){line.style.display='block';line.style.color=color;line.style.whiteSpace='pre-wrap';line.style.overflowWrap='anywhere';line.style.maxWidth='100%';}
      overlay.appendChild(line);
     }
    }
   }
   applyStyle();
   return mode;
  };
  const setPreferences=value=>{
   const options=windowOrDefaults(value);
   prefs={...prefs,...options};
   if(last?.text&&!video.paused&&!video.ended)show(last.text,last.language,{sourceText:last.sourceText,translated:last.translated});
   else{base.clear();applyStyle();}
  };
  const setOriginalVisible=value=>{
   originalVisible=!!value;
   if(last?.text&&!video.paused&&!video.ended)
    show(last.text,last.language,{sourceText:last.sourceText,translated:last.translated});
   else base.clear();
  };
  const windowOrDefaults=value=>{
   const v=value&&typeof value==='object'?value:{};
   const out={};
   for(const [k,list] of Object.entries({
    content:['original','translated','both'],position:['top','middle','bottom'],
    size:['small','medium','large','xlarge'],font:['system','arial','noto','roboto','serif','mono'],
    outlineStyle:['dark','light','none'],backgroundStyle:['black','light','solid','none']
   }))if(list.includes(v[k]))out[k]=v[k];
   for(const k of ['show','outline','background'])if(typeof v[k]==='boolean')out[k]=v[k];
   if(/^#[0-9a-f]{6}$/i.test(String(v.color)))out.color=v.color.toLowerCase();
   if(Number.isFinite(Number(v.opacity)))out.opacity=Math.max(0,Math.min(100,Number(v.opacity)));
   return out;
  };
  const refreshLayout=()=>{
   if(last?.text&&!video.paused&&!video.ended)
    show(last.text,last.language,{sourceText:last.sourceText,translated:last.translated});
  };
  const view=doc.defaultView||((typeof window!=='undefined')?window:null);
  view?.addEventListener?.('resize',refreshLayout);
  doc.addEventListener?.('fullscreenchange',refreshLayout);
  return Object.freeze({
   show,clear:()=>{last=null;base.clear();},
   destroy:()=>{
    last=null;
    view?.removeEventListener?.('resize',refreshLayout);
    doc.removeEventListener?.('fullscreenchange',refreshLayout);
    base.destroy();
    if(styleNode?.parentElement)styleNode.parentElement.removeChild(styleNode);
   },
   setPreferences,setOriginalVisible,getPreferences:()=>({...prefs}),
   getMode:base.getMode,getText:base.getText
  });
 }
 function install(root){
  if(!root?.OpenIPTVVideoCaptions?.createVideoCaptionRenderer)return false;
  const original=root.OpenIPTVVideoCaptions.createVideoCaptionRenderer;
  root.OpenIPTVVideoCaptions.createVideoCaptionRenderer=options=>
   decorate(original(options),options);
  return true;
 }
 return Object.freeze({decorate,install,wrapCaptionText});
});
