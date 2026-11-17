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
 function decorate(base,{video,doc}){
  let prefs={show:true,content:'both',position:'bottom',size:'medium',font:'system',color:'#facc15',outline:true,outlineStyle:'dark',background:true,backgroundStyle:'black',opacity:50};
  let last=null,styleNode=null,originalVisible=true;
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
    styleNode.textContent=prefix+'{font-size:'+(sizes[prefs.size]||21)+'px;font-family:'+
     (fonts[prefs.font]||fonts.system)+';font-weight:650;color:'+safeColor(prefs.color)+
     ';background:'+background()+';text-shadow:'+shadow()+';}'+
     prefix+'(.source){color:#fff;}'+prefix+'(.translated){color:'+safeColor(prefs.color)+';}';
    video.classList?.add?.('openiptv-styled-video-cc');
   }
   const overlay=video.parentElement?.querySelector?.('.openiptv-video-translation-overlay');
   if(overlay?.style){
    overlay.style.color=safeColor(prefs.color);
    overlay.style.fontFamily=fonts[prefs.font]||fonts.system;
    overlay.style.fontSize=(sizes[prefs.size]||21)+'px';
    overlay.style.backgroundColor=background();
    overlay.style.textShadow=shadow();
    overlay.style.borderRadius='9px';
    overlay.style.padding='4px 12px';
    overlay.style.bottom=prefs.position==='top'?'auto':prefs.position==='middle'?'39%':'4%';
    overlay.style.top=prefs.position==='top'?'5%':'auto';
   }
  };
  const show=(text,language,{sourceText='',translated=false}={})=>{
   const translatedLine=safeText(text),original=originalVisible?safeText(sourceText):'';
   last={text:translatedLine,language,sourceText:original,translated};
   if(!prefs.show||!translatedLine){base.clear();return 'off';}
   let display=translatedLine;
   if(translated&&original){
    if(prefs.content==='original')display=original;
    else if(prefs.content==='both')display=original+'\n'+translatedLine;
   }
   applyStyle();
   const mode=base.show(display,language);
   if(mode==='native'){
    // VTTCue uses rendered video track including true video fullscreen/PiP.
    const tracks=video.textTracks;
    const track=tracks&&tracks.length?tracks[tracks.length-1]:null;
    const cue=track?.activeCues?.[0]||track?.cues?.[0];
    if(cue){
     try{
      cue.position=50;cue.snapToLines=false;
      cue.line=prefs.position==='top'?12:prefs.position==='middle'?55:88;
      if(translated&&original&&prefs.content==='both')
       cue.text='<c.source>'+escapeCue(original)+'</c>\n<c.translated>'+escapeCue(translatedLine)+'</c>';
     }catch{}
    }
   }
   if(mode==='overlay'){
    const overlay=video.parentElement?.querySelector?.('.openiptv-video-translation-overlay');
    if(overlay&&translated&&original&&prefs.content==='both'&&doc.createElement){
     overlay.textContent='';
     for(const [value,color] of [[original,'#fff'],[translatedLine,safeColor(prefs.color)]]){
      const line=doc.createElement('span');line.textContent=value;
      if(line.style){line.style.display='block';line.style.color=color;}
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
  return Object.freeze({
   show,clear:()=>{last=null;base.clear();},
   destroy:()=>{last=null;base.destroy();if(styleNode?.parentElement)styleNode.parentElement.removeChild(styleNode);},
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
 return Object.freeze({decorate,install});
});
