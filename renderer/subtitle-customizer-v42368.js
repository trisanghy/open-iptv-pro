'use strict';
/** v4.23.68 – locally persisted, validated on-video subtitle preferences. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVSubtitlePreferences=api;
})(typeof window!=='undefined'?window:null,function(){
 const KEY='openiptv:video-subtitle-settings:v1';
 const DEFAULTS=Object.freeze({
  show:true,content:'both',position:'bottom',size:'medium',
  color:'#facc15',font:'system',outline:true,outlineStyle:'dark',
  background:true,backgroundStyle:'black',opacity:50
 });
 const SETS={
  content:['original','translated','both'],position:['top','middle','bottom'],
  size:['small','medium','large','xlarge'],
  font:['system','arial','noto','roboto','serif','mono'],
  outlineStyle:['dark','light','none'],
  backgroundStyle:['black','light','solid','none']
 };
 const CSS_COLORS=new Set(['#ffffff','#facc15','#32e344','#11d9e7','#278af5','#ef7fbd','#f52e3a']);
 const colorOk=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
 function normalize(value){
  const v=value&&typeof value==='object'?value:{};
  const out={...DEFAULTS};
  for(const key of ['content','position','size','font','outlineStyle','backgroundStyle'])
   if(SETS[key].includes(v[key]))out[key]=v[key];
  for(const key of ['show','outline','background'])
   if(typeof v[key]==='boolean')out[key]=v[key];
  if(colorOk(v.color))out.color=v.color.toLowerCase();
  if(Number.isFinite(Number(v.opacity)))out.opacity=Math.max(0,Math.min(100,Math.round(Number(v.opacity))));
  return out;
 }
 function createStore({storage,callback=()=>{}}={}){
  let current={...DEFAULTS};
  try{const saved=storage?.getItem(KEY);if(saved)current=normalize(JSON.parse(saved));}catch{}
  const get=()=>({...current});
  const set=updates=>{
   current=normalize({...current,...updates});
   try{storage?.setItem(KEY,JSON.stringify(current));}catch{}
   callback(get());return get();
  };
  return Object.freeze({get,set});
 }
 function attach({doc,storage,renderer}={}){
  if(!doc?.getElementById)return null;
  const $=id=>doc.getElementById(id);
  const panel=$('subtitleOptionsPanel'),button=$('subtitleOptionsBtn');
  if(!panel||!button)return null;
  const controls={
   show:'subtitleShow',content:'subtitleContent',position:'subtitlePosition',
   size:'subtitleSize',font:'subtitleFont',color:'subtitleCustomColor',
   outline:'subtitleOutline',outlineStyle:'subtitleOutlineStyle',
   background:'subtitleBackground',backgroundStyle:'subtitleBackgroundStyle',
   opacity:'subtitleOpacity'
  };
  const store=createStore({storage,callback:settings=>renderer?.setPreferences?.(settings)});
  const apply=settings=>{
   for(const [key,id] of Object.entries(controls)){
    const node=$(id);if(!node)continue;
    if(['show','outline','background'].includes(key))node.checked=settings[key];
    else node.value=String(settings[key]);
   }
   if($('subtitleOpacityValue'))$('subtitleOpacityValue').textContent=settings.opacity+'%';
   for(const group of panel.querySelectorAll?.('[data-subtitle-group]')||[]){
    const key=group.getAttribute('data-subtitle-group');
    for(const b of group.querySelectorAll('[data-value]')){
     const on=b.getAttribute('data-value')===String(settings[key]);
     b.setAttribute('aria-pressed',String(on));
    }
   }
   for(const swatch of panel.querySelectorAll?.('[data-subtitle-color]')||[]){
    const on=swatch.getAttribute('data-subtitle-color')===settings.color;
    swatch.setAttribute('aria-pressed',String(on));
   }
  };
  const update=changes=>{const settings=store.set(changes);apply(settings);};
  button.addEventListener('click',()=>{
   panel.hidden=!panel.hidden;
   button.setAttribute('aria-expanded',String(!panel.hidden));
  });
  $('subtitleClose')?.addEventListener('click',()=>{
   panel.hidden=true;button.setAttribute('aria-expanded','false');
  });
  for(const key of ['show','outline','background']){
   $(controls[key])?.addEventListener('change',e=>update({[key]:!!e.target.checked}));
  }
  for(const key of ['font','outlineStyle','backgroundStyle']){
   $(controls[key])?.addEventListener('change',e=>update({[key]:e.target.value}));
  }
  $('subtitleOpacity')?.addEventListener('input',e=>update({opacity:Number(e.target.value)}));
  $('subtitleCustomColor')?.addEventListener('input',e=>update({color:e.target.value}));
  panel.addEventListener('click',e=>{
   const target=e.target?.closest?.('[data-value],[data-subtitle-color]');
   if(!target||!panel.contains(target))return;
   const color=target.getAttribute('data-subtitle-color');
   if(color){update({color});return;}
   const group=target.closest('[data-subtitle-group]');
   if(!group)return;
   const key=group.getAttribute('data-subtitle-group'),value=target.getAttribute('data-value');
   if(SETS[key]?.includes(value))update({[key]:value});
  });
  renderer?.setPreferences?.(store.get());
  apply(store.get());
  return Object.freeze({get:store.get,set:update});
 }
 return Object.freeze({KEY,DEFAULTS,normalize,createStore,attach,CSS_COLORS});
});
