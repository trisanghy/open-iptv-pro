'use strict';
/* Web Mobile volume popover. Reuse the existing persisted #volume input:
   no second storage, video decoder, or playlist state. */
(function(root){
 if(!root?.document||root.streamleaf)return;
 const doc=root.document;
 const isMobile=()=>doc.documentElement?.getAttribute?.('data-iptv-device')==='mobile';
 function init(){
  if(doc.getElementById('webMobileVolumePanel'))return;
  const video=doc.getElementById('video'),old=doc.getElementById('volume');
  const speaker=doc.getElementById('webVolumeMute');
  const top=doc.querySelector?.('#page-tv .player-control-card .control-layout-top');
  if(!video||!old||!speaker||!top)return;
  const panel=doc.createElement('div'),mute=doc.createElement('button');
  const slider=doc.createElement('input'),value=doc.createElement('output');
  const hint=doc.createElement('small');
  let timer=null,dragging=false,lastAudible=Math.max(.15,Number(video.volume)||.8);
  panel.id='webMobileVolumePanel';
  panel.className='web-mobile-volume-panel';
  panel.hidden=true;panel.setAttribute('role','group');
  panel.setAttribute('aria-label','Điều chỉnh âm lượng');
  mute.type='button';mute.className='web-mobile-volume-mute';
  mute.setAttribute('aria-label','Tắt tiếng');
  slider.type='range';slider.id='webMobileVolumeSlider';
  slider.min='0';slider.max='100';slider.step='1';
  slider.setAttribute('aria-label','Mức âm lượng');
  value.className='web-mobile-volume-percent';
  value.setAttribute('for','webMobileVolumeSlider');
  hint.className='web-mobile-volume-ios-hint';
  hint.textContent='Trên iPhone, có thể cần dùng phím âm lượng của máy.';
  panel.append(mute,slider,value,hint);
  top.append(panel);
  speaker.setAttribute('aria-controls',panel.id);
  speaker.setAttribute('aria-expanded','false');
  function sync(){
   const level=Math.max(0,Math.min(100,Math.round(Number(video.volume)*100)||0));
   if(level>0)lastAudible=level/100;
   slider.value=String(level);
   value.textContent=level+'%';
   const muted=!!video.muted||level===0;
   mute.setAttribute('aria-pressed',String(muted));
   mute.setAttribute('aria-label',muted?'Bật tiếng':'Tắt tiếng');
   if(isMobile()){
    speaker.setAttribute('aria-label','Điều chỉnh âm lượng');
    speaker.title='Điều chỉnh âm lượng';
   }
  }
  function close(){
   if(timer!==null){root.clearTimeout(timer);timer=null;}
   panel.hidden=true;speaker.setAttribute('aria-expanded','false');
  }
  function schedule(){
   if(timer!==null)root.clearTimeout(timer);
   timer=root.setTimeout(()=>{timer=null;if(!dragging)close();},6000);
  }
  function toggle(){
   if(!panel.hidden){close();return;}
   panel.hidden=false;speaker.setAttribute('aria-expanded','true');sync();schedule();
  }
  // Capture-phase interception keeps the desktop's existing mute handler,
  // while the mobile speaker opens the approved popover instead of muting.
  speaker.addEventListener('click',event=>{
   if(!isMobile())return;
   event.stopImmediatePropagation?.();
   event.preventDefault?.();
   toggle();
  },true);
  mute.addEventListener('click',()=>{
   if(video.muted||Number(video.volume)===0){
    if(Number(video.volume)===0){
     old.value=String(Math.round(lastAudible*100));
     old.dispatchEvent(new Event('input',{bubbles:true}));
    }
    video.muted=false;
   }else video.muted=true;
   sync();schedule();
  });
  slider.addEventListener('input',()=>{
   old.value=slider.value;
   // Dispatching to the original control preserves app.js persistence,
   // cloud sync callbacks, and the desktop/native player volume behavior.
   old.dispatchEvent(new Event('input',{bubbles:true}));
   video.muted=Number(slider.value)===0;
   sync();
   if(!dragging)schedule();
  });
  slider.addEventListener('pointerdown',()=>{
   dragging=true;
   if(timer!==null){root.clearTimeout(timer);timer=null;}
  });
  for(const name of ['pointerup','pointercancel','change'])
   slider.addEventListener(name,()=>{dragging=false;schedule();});
  video.addEventListener('volumechange',sync);
  doc.addEventListener('pointerdown',event=>{
   if(panel.hidden)return;
   if(panel.contains(event.target)||speaker.contains(event.target))return;
   close();
  });
  doc.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  root.addEventListener?.('resize',()=>{if(!isMobile())close();});
  sync();
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window==='undefined'?null:window);
