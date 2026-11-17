'use strict';
// Unified native caption UI. It never starts separate recognition or audio processes.
(()=>{
 const $=id=>document.getElementById(id),frame=$('playerBox'),video=$('video');
 const overlay=$('rustTranslatedCaption'),gear=$('liveCaptionSetup'),translate=$('liveTranslateToggle'),caption=$('liveCaptionToggle');
 if(!frame||!overlay||!gear||!video)return;
 const KEY='rustlab:subtitle-display-v1';
 const defaults={enabled:true,display:'both',size:'medium',position:'bottom',font:'system',color:'#ffe65b',outline:'black',background:'dark',opacity:50};
 const allowed={font:['system','arial','tahoma','verdana','noto','serif'],display:['original','translated','both'],size:['small','medium','large','xlarge'],
 position:['top','middle','bottom'],outline:['black','white','none'],background:['dark','light','none']};
 // Use OS fonts and CJK fallback stacks. No bundled or downloaded font files.
 const fontStacks=Object.freeze({
  system:'-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif',
  arial:'Arial, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  tahoma:'Tahoma, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  verdana:'Verdana, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  noto:'"Noto Sans", "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  serif:'Georgia, "Songti SC", SimSun, "Noto Serif CJK SC", serif'
 });
 let settings={...defaults},last=null,expiry,spoken=null;
 try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
  if(saved&&typeof saved==='object'){
   if(typeof saved.enabled==='boolean')settings.enabled=saved.enabled;
   for(const key of Object.keys(allowed))if(allowed[key].includes(saved[key]))settings[key]=saved[key];
   if(typeof saved.color==='string'&&/^#[0-9a-f]{6}$/i.test(saved.color))settings.color=saved.color;
   if(Number.isFinite(saved.opacity))settings.opacity=Math.min(90,Math.max(0,Math.round(saved.opacity)));
  }
 }catch{}
 const toggle=document.createElement('button');toggle.type='button';toggle.id='rustSubtitleOptionsButton';
 toggle.textContent='CC';toggle.title='Tuỳ chỉnh hiển thị phụ đề';toggle.setAttribute('aria-controls','rustSubtitleOptionsPanel');
 toggle.setAttribute('aria-expanded','false');gear.insertAdjacentElement('afterend',toggle);
 const panel=document.createElement('section');panel.id='rustSubtitleOptionsPanel';panel.className='rust-cc-panel';
 panel.hidden=true;panel.setAttribute('aria-label','Tuỳ chỉnh phụ đề trên video');
 panel.setAttribute('role','dialog');
 panel.setAttribute('tabindex','-1');
 panel.innerHTML='<header><strong>CC · Tuỳ chỉnh phụ đề</strong><button type="button" id="rustSubtitleClose" aria-label="Đóng">×</button></header>'+
 '<label>Hiển thị trên video<input type="checkbox" id="rustSubtitleShow"></label>'+
 '<label>Nội dung<span class="rust-cc-segmented" id="rustSubtitleDisplayButtons" role="group" aria-label="Chọn nội dung phụ đề"><button type="button" data-value="original">Chỉ gốc</button><button type="button" data-value="translated">Chỉ dịch</button><button type="button" data-value="both">Cả hai</button></span><select class="rust-cc-native-select" id="rustSubtitleDisplay" tabindex="-1" aria-hidden="true"><option value="original">Chỉ phụ đề gốc</option><option value="translated">Chỉ phụ đề dịch</option><option value="both">Gốc + dịch</option></select></label>'+
 '<label>Vị trí<span class="rust-cc-segmented rust-cc-position" id="rustSubtitlePositionButtons" role="group" aria-label="Vị trí phụ đề"><button type="button" data-value="top" title="Trên video">▔</button><button type="button" data-value="middle" title="Giữa video">☷</button><button type="button" data-value="bottom" title="Dưới video">▁</button></span><select class="rust-cc-native-select" id="rustSubtitlePosition" tabindex="-1" aria-hidden="true"><option value="bottom">Dưới video</option><option value="middle">Giữa thấp</option><option value="top">Trên video</option></select></label>'+
 '<label>Cỡ chữ<span class="rust-cc-segmented rust-cc-sizes" id="rustSubtitleSizeButtons" role="group" aria-label="Kích thước phụ đề"><button type="button" data-value="small">A<small>Nhỏ</small></button><button type="button" data-value="medium">A<small>Vừa</small></button><button type="button" data-value="large">A<small>Lớn</small></button><button type="button" data-value="xlarge">A<small>Rất lớn</small></button></span><select class="rust-cc-native-select" id="rustSubtitleSize" tabindex="-1" aria-hidden="true"><option value="small">Nhỏ · 16px</option><option value="medium">Vừa · 20px</option><option value="large">Lớn · 25px</option><option value="xlarge">Rất lớn · 30px</option></select></label>'+
 '<label>Phông chữ<select id="rustSubtitleFont"><option value="system">Mặc định · dễ đọc</option><option value="arial">Arial · gọn gàng</option><option value="tahoma">Tahoma · rõ nét</option><option value="verdana">Verdana · thoáng chữ</option><option value="noto">Noto Sans · đa ngôn ngữ</option><option value="serif">Georgia · có chân</option></select></label>'+
 '<div class="rust-cc-font-preview" id="rustSubtitleFontPreview" aria-live="polite">Xin chào! Phụ đề dễ đọc · 你好世界</div>'+
 '<label>Màu chữ<span class="rust-cc-color" id="rustSubtitleColors"></span></label>'+
 '<label>Viền chữ<select id="rustSubtitleOutline"><option value="black">Đen</option><option value="white">Trắng</option><option value="none">Không viền</option></select></label>'+
 '<label>Nền chữ<select id="rustSubtitleBackground"><option value="dark">Nền đen</option><option value="light">Nền trắng</option><option value="none">Không nền</option></select></label>'+
 '<label>Độ đậm nền<span class="rust-cc-opacity"><input type="range" min="0" max="90" step="5" id="rustSubtitleOpacity"><output id="rustSubtitleOpacityValue">50%</output></span></label>'+
 '<small>Tự ghi nhớ khi mở lại ứng dụng. Không ảnh hưởng TTS và bộ dịch.</small>';
 // The player frame clips overflowing descendants. A CC popover must live in
 // the document overlay layer, not inside the video frame's overflow:hidden.
 // Fullscreen is special: only descendants of the fullscreen frame are visible.
 document.body.append(panel);
 const orig=document.createElement('div'),trans=document.createElement('div');
 orig.className='rust-cc-original';trans.className='rust-cc-translation';overlay.replaceChildren(orig,trans);
 const els={enabled:$('rustSubtitleShow'),display:$('rustSubtitleDisplay'),position:$('rustSubtitlePosition'),
 size:$('rustSubtitleSize'),font:$('rustSubtitleFont'),outline:$('rustSubtitleOutline'),background:$('rustSubtitleBackground'),
 opacity:$('rustSubtitleOpacity')};
 for(const [key,id] of [['display','rustSubtitleDisplayButtons'],['position','rustSubtitlePositionButtons'],['size','rustSubtitleSizeButtons']]){
  $(id)?.addEventListener('click',event=>{
   const button=event.target.closest('button[data-value]');
   if(button&&$(id).contains(button)&&allowed[key].includes(button.dataset.value))
    change(key,button.dataset.value);
  });
 }
 const colors=$('rustSubtitleColors'),presets=['#ffffff','#ffe65b','#49e961','#29d7ed','#2991ff','#ff86bb','#ff5555'];
 const swatches=[];
 for(const color of presets){
  const b=document.createElement('button');b.type='button';b.className='rust-cc-swatch';b.style.background=color;
  b.setAttribute('aria-label','Chọn màu '+color);b.title='Chọn màu '+color;
  b.addEventListener('click',()=>change('color',color));colors.append(b);swatches.push([color,b]);
 }
 const custom=document.createElement('input');custom.type='color';custom.id='rustSubtitleCustomColor';
 custom.setAttribute('aria-label','Màu chữ tự chọn');colors.append(custom);
 function sync(){
  for(const key of Object.keys(els))els[key][key==='enabled'?'checked':'value']=key==='enabled'?settings.enabled:String(settings[key]);
  custom.value=settings.color;$('rustSubtitleOpacityValue').textContent=settings.opacity+'%';
  for(const [key,id] of [['display','rustSubtitleDisplayButtons'],['position','rustSubtitlePositionButtons'],['size','rustSubtitleSizeButtons']]){
   for(const button of $(id)?.querySelectorAll('button[data-value]')||[])
    button.setAttribute('aria-pressed',String(button.dataset.value===settings[key]));
  }
  toggle.setAttribute('aria-pressed',String(settings.enabled));
  for(const [color,b] of swatches)b.setAttribute('aria-pressed',String(color===settings.color));
  frame.dataset.rustSubtitlePosition=settings.position;frame.dataset.rustSubtitleSize=settings.size;
  const stack=fontStacks[settings.font]||fontStacks.system;
  overlay.style.setProperty('--rust-cc-font-stack',stack);
  $('rustSubtitleFontPreview').style.fontFamily=stack;
  frame.dataset.rustSubtitleOutline=settings.outline;frame.dataset.rustSubtitleBackground=settings.background;
  overlay.style.setProperty('--rust-cc-color',settings.color);
  overlay.style.setProperty('--rust-cc-opacity',String(settings.opacity/100));
 }
 function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch(error){console.warn('CC preferences:',error);}}
 function clear(){
  ++fitEpoch;
  last=null;spoken=null;overlay.hidden=true;orig.textContent='';trans.textContent='';
  if(expiry)clearTimeout(expiry);expiry=null;
 }
 // Fit full multiline text into the *actual* player dimensions. Scaling is
 // visual only: do not mutate the user's chosen font-size preference.
 let fitEpoch=0;
 function fitSubtitle(){
  const epoch=++fitEpoch;
  if(overlay.hidden)return;
  const base={small:16,medium:20,large:25,xlarge:30}[settings.size]||20;
  overlay.style.setProperty('font-size',base+'px','important');
  const apply=()=>{
   if(epoch!==fitEpoch||overlay.hidden)return;
   const height=frame.clientHeight||0;
   if(!height)return;
   const available=Math.max(48,Math.floor(height*(settings.position==='middle'?.67:.85)));
   overlay.style.setProperty('max-height',available+'px','important');
   let size=base;
   // Long captions first wrap naturally; only reduce font if wrapped
   // lines would extend beyond the available video height.
   while(size>12&&(overlay.scrollHeight>available+1||overlay.scrollWidth>overlay.clientWidth+1)){
    size--;
    overlay.style.setProperty('font-size',size+'px','important');
   }
   const overflow=overlay.scrollHeight>available+1;
   overlay.style.setProperty('overflow-y',overflow?'auto':'visible','important');
   overlay.style.pointerEvents=overflow?'auto':'none';
   overlay.dataset.rustAutoFit=String(size<base);
  };
  window.requestAnimationFrame(apply);
 }
 function render(){
  if(!(last||spoken)||!settings.enabled||video.paused||video.ended){
   ++fitEpoch;overlay.hidden=true;return;
  }
  const active=spoken||last;
  const original=String(active.originalText||active.text||'').trim(),result=String(active.text||'').trim();
  const hasTranslation=translate?.checked&&(spoken||last.translated===true)&&result&&result!==original;
  const showBoth=settings.display==='both'&&hasTranslation;
  // An unchecked Caption switch hides only original text, never the translated
  // line or TTS. In single-original mode, show translation as a useful fallback.
  const showOriginal=!!caption?.checked&&(settings.display==='original'||showBoth||!hasTranslation);
  const showTranslated=!!hasTranslation&&(settings.display==='translated'||showBoth||!caption?.checked);
  // Never cut translated/original speech to one line or a fixed character
  // count. The CSS handles wrapping, while fitSubtitle handles long phrases.
  orig.textContent=showOriginal?original:'';
  trans.textContent=showTranslated?result:'';
  orig.hidden=!orig.textContent;trans.hidden=!trans.textContent;
  overlay.hidden=orig.hidden&&trans.hidden;
  if(!overlay.hidden)fitSubtitle();
 }
 function change(key,value){settings[key]=value;sync();save();render();}
 for(const [key,el] of Object.entries(els))
  el.addEventListener(key==='opacity'?'input':'change',()=>change(key,key==='enabled'?el.checked:key==='opacity'?Number(el.value):el.value));
 custom.addEventListener('input',()=>{if(/^#[0-9a-f]{6}$/i.test(custom.value))change('color',custom.value);});
 function placePanel(){
  if(panel.hidden)return;
  const fullscreen=document.fullscreenElement===frame;
  const parent=fullscreen?frame:document.body;
  if(panel.parentElement!==parent)parent.append(panel);
  panel.dataset.fullscreen=String(fullscreen);
  if(fullscreen){
   panel.style.left='auto';
   panel.style.top='12px';
   panel.style.right='12px';
   panel.style.maxHeight='calc(100% - 24px)';
  }else{
   const margin=12,rect=frame.getBoundingClientRect();
   const vw=Math.max(0,window.innerWidth||document.documentElement.clientWidth);
   const vh=Math.max(0,window.innerHeight||document.documentElement.clientHeight);
   const width=Math.min(455,Math.max(160,vw-2*margin));
   panel.style.width=width+'px';
   panel.style.maxHeight=Math.max(140,vh-2*margin)+'px';
   panel.style.left=Math.max(margin,Math.min(rect.right-width-8,vw-width-margin))+'px';
   panel.style.right='auto';
   // Keep the entire scroll container inside the visible app window.
   const panelHeight=panel.getBoundingClientRect().height;
   panel.style.top=Math.max(margin,Math.min(rect.top+12,vh-panelHeight-margin))+'px';
  }
 }
 function popup(open){
  panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
  if(open){placePanel();panel.scrollTop=0;panel.focus({preventScroll:true});}
 }
 toggle.addEventListener('click',()=>popup(panel.hidden));
 // Use one scroll container for all controls (also in WKWebView on macOS).
 // Stop wheel chaining to the video/page; explicit scrollTop handles WebKit
 // wheel/trackpad events even when native overflow scrolling is suppressed.
 panel.addEventListener('wheel',event=>{
  if(panel.hidden)return;
  event.stopPropagation();
  if(panel.scrollHeight<=panel.clientHeight||!event.deltaY)return;
  const factor=event.deltaMode===1?16:event.deltaMode===2?panel.clientHeight:1;
  panel.scrollTop+=event.deltaY*factor;
  if(event.cancelable)event.preventDefault();
 },{passive:false});
 panel.addEventListener('keydown',event=>{
  if(event.target!==panel)return;
  const step=event.key==='PageDown'?panel.clientHeight*.85:
   event.key==='PageUp'?-panel.clientHeight*.85:
   event.key==='ArrowDown'?48:event.key==='ArrowUp'?-48:0;
  if(step){panel.scrollTop+=step;event.preventDefault();}
  else if(event.key==='Home'){panel.scrollTop=0;event.preventDefault();}
  else if(event.key==='End'){panel.scrollTop=panel.scrollHeight;event.preventDefault();}
 });
 window.addEventListener('resize',placePanel);
 document.addEventListener('fullscreenchange',()=>{
  if(!panel.hidden)placePanel();
 });
 document.addEventListener('scroll',event=>{
  if(event.target!==panel&&!panel.hidden)placePanel();
 },true);
 $('rustSubtitleClose').addEventListener('click',()=>popup(false));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')popup(false);});
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&e.target!==toggle)popup(false);});
 document.addEventListener('rustlab:caption-segment',e=>{
  if(!e.detail||video.paused||video.ended){clear();return;}
  last=e.detail;if(!spoken)render();if(expiry)clearTimeout(expiry);
  expiry=setTimeout(()=>{if(!spoken)clear();},14500);
 });
 document.addEventListener('rustlab:tts-start',event=>{
  if(!event.detail||video.paused||video.ended)return;
  spoken={...event.detail,translated:true};render();
 });
 document.addEventListener('rustlab:tts-end',()=>{
  if(!spoken)return;
  spoken=null;render();
 });
 document.addEventListener('rustlab:caption-clear',clear);
 for(const event of ['pause','ended','emptied','seeking'])video.addEventListener(event,clear);
 translate?.addEventListener('change',clear);
 caption?.addEventListener('change',()=>{if(last)render();});
 window.addEventListener('pagehide',clear);
 window.addEventListener('resize',()=>{if(!overlay.hidden)fitSubtitle();});
 document.addEventListener('fullscreenchange',()=>{if(!overlay.hidden)fitSubtitle();});
 video.addEventListener('resize',()=>{if(!overlay.hidden)fitSubtitle();});
 sync();
 window.RustSubtitleControls=Object.freeze({clear,render,getSettings:()=>({...settings}),storageKey:KEY});
})();
