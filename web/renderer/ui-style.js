'use strict';
// UI-only style switching. Does not touch playback state or settings belonging to features.js.
(() => {
 const KEY='open-iptv-pro-ui-style-v1';
 const STYLES=Object.freeze({current:'Hiện tại',minimal:'Minimalism',material3:'Material Design 3',hig:'Apple HIG',liquid:'Liquid Glass',cinema:'Cinema TV',fluent:'Fluent 2',glass:'Glassmorphism',broadcast:'Broadcast Studio',bento:'Bento Dashboard',swiss:'Swiss Editorial'});
 const root=document.documentElement;
 // Keep hand-picked custom accent usable across every visual preset; with the stock
 // default color, each preset retains its own distinctive brand accent.
 function syncAccent(explicit,force=false){
  let color=explicit,custom=force;
  if(!color){try{const cfg=JSON.parse(localStorage.getItem('open-iptv-pro-settings-v1')||'{}');color=cfg.accent;custom=cfg.accentCustom===true || (!('accentCustom' in cfg) && /^#[0-9a-f]{6}$/i.test(color||'') && color.toLowerCase()!=='#bc7cff');}catch{}}
  const chosen=/^#[0-9a-f]{6}$/i.test(color||'') && custom;
  root.dataset.customAccent=chosen?'true':'false';
  if(chosen){root.style.setProperty('--ui-primary',color);root.style.setProperty('--accent',color);
   const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
   const luminance=rgb.reduce((acc,c,i)=>acc+([.2126,.7152,.0722][i])*(c<=.04045?c/12.92:((c+.055)/1.055)**2.4),0);
   root.style.setProperty('--ui-on-primary',luminance>.35?'#111827':'#ffffff');
  }else{root.style.removeProperty('--ui-primary');root.style.removeProperty('--ui-on-primary');}
 }

 const prefix={vi:'Đang dùng',en:'Active',es:'Activo','pt-BR':'Ativo','zh-CN':'当前使用',th:'กำลังใช้',lo:'ກຳລັງໃຊ້',km:'កំពុងប្រើ'};
 const original={vi:'Hiện tại',en:'Current',es:'Actual','pt-BR':'Atual','zh-CN':'当前',th:'ปัจจุบัน',lo:'ປັດຈຸບັນ',km:'បច្ចុប្បន្ន'};
 const errorText={vi:'Không lưu được cài đặt',en:'Could not save preference',es:'No se pudo guardar','pt-BR':'Não foi possível salvar','zh-CN':'无法保存设置',th:'บันทึกการตั้งค่าไม่ได้',lo:'ບໍ່ສາມາດບັນທຶກ',km:'មិនអាចរក្សាទុក'};
 let saveFailed=false;
 const language=()=>window.OpenIPTVI18n?.getLanguage?.()||'vi';
 const displayName=style=>style==='current'?(original[language()]||original.vi):STYLES[style];
 function updateStatus(){const lang=language();status.textContent=(prefix[lang]||prefix.vi)+': '+displayName(current)+(saveFailed?' · '+(errorText[lang]||errorText.vi):'');}
 const group=document.getElementById('uiStyleChoices');
 const DENSITY_KEY='open-iptv-pro-ui-density-v1';
 const densities=Object.freeze({compact:'Compact',comfort:'Comfort'});
 const densityGroup=document.getElementById('uiDensityChoices');
 const densityStatus=document.getElementById('uiDensityStatus');
 const status=document.getElementById('uiStyleStatus');
 const reset=document.getElementById('uiStyleReset');
 if(!group||!status)return;
 let current='current';
 let density='comfort';
 try { const saved=localStorage.getItem(DENSITY_KEY); if(Object.hasOwn(densities,saved))density=saved; } catch {}
 function applyDensity(value,store=true){
  if(!Object.hasOwn(densities,value))return false;
  density=value; root.dataset.uiDensity=value;
  for(const input of densityGroup?.querySelectorAll('input[name="uiDensity"]')||[]) input.checked=input.value===value;
  if(densityStatus)densityStatus.textContent=value==='compact'?'Compact · Hiển thị nhiều nội dung':'Comfort · Khoảng cách dễ nhìn';
  if(store){try{localStorage.setItem(DENSITY_KEY,value);}catch{if(densityStatus)densityStatus.textContent+=' · Không lưu được';}}
  return true;
 }
 densityGroup?.addEventListener('change',e=>{if(e.target.matches('input[name="uiDensity"]')&&e.target.checked)applyDensity(e.target.value);});
 applyDensity(density,false);
 try{const saved=localStorage.getItem(KEY);if(Object.hasOwn(STYLES,saved))current=saved;}catch{}
 function apply(style,store=true){
  if(!Object.hasOwn(STYLES,style))return false;
  current=style;
  root.dataset.uiStyle=style;
  document.dispatchEvent(new CustomEvent('openiptv:stylechange',{detail:{style}}));
  for(const input of group.querySelectorAll('input[name="uiStyle"]'))input.checked=input.value===style;
  saveFailed=false;
  if(store){try{localStorage.setItem(KEY,style);}catch{saveFailed=true;}}
  updateStatus();
  return true;
 }
 group.addEventListener('change',e=>{
  if(e.target.matches('input[name="uiStyle"]')&&e.target.checked)apply(e.target.value);
 });
 reset?.addEventListener('click',()=>apply('current'));
 apply(current,false);
 syncAccent();
 document.addEventListener('openiptv:accentchange',e=>syncAccent(e.detail?.color));
 document.addEventListener('openiptv:languagechange',updateStatus);
 window.OpenIPTVUIStyle=Object.freeze({get:()=>current,set:apply,names:STYLES,getDensity:()=>density,setDensity:applyDensity,syncAccent});
})();
