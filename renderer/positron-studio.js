'use strict';
/* Positron Studio P3: UI-only companion to the existing Electron renderer. */
/* 11 */(()=>{const d=document,r=d.documentElement,bar=d.getElementById('positronBar');if(!bar||r.dataset.positron!=='true')return;
const area=bar.querySelector('.p-actions'),focus=d.getElementById('positronFocus');if(!area||!focus)return;
const choices=[{id:'night',name:'Nebula',a:'#1c2d48',b:'#aa99ff'},{id:'aurora',name:'Aurora',a:'#102e31',b:'#65e7cf'},{id:'graphite',name:'Graphite',a:'#232d39',b:'#e3c997'}];
const btn=d.createElement('button');btn.type='button';btn.id='positronStudioBtn';btn.textContent='◈ Chủ đề';btn.setAttribute('aria-controls','positronStudioMenu');btn.setAttribute('aria-expanded','false');btn.title='Thay đổi bộ màu riêng của Positron';
const menu=d.createElement('section');menu.id='positronStudioMenu';menu.hidden=true;menu.setAttribute('role','region');menu.setAttribute('aria-label','Bộ chủ đề Positron');
const heading=d.createElement('h3');heading.textContent='Positron Studio';const intro=d.createElement('p');intro.textContent='Ba bảng màu độc lập, giữ nguyên dữ liệu kênh và cài đặt phát.';const grid=d.createElement('div');grid.className='po-themes';
const listeners=[];
const choose=id=>{if(!choices.some(x=>x.id===id))return false;r.dataset.positronPalette=id;for(const x of grid.querySelectorAll('button[data-po-theme]'))x.setAttribute('aria-pressed',String(x.dataset.poTheme===id));listeners.forEach(fn=>fn(id));return true;};
for(const t of choices){const option=d.createElement('button');option.type='button';option.className='po-theme';option.dataset.poTheme=t.id;option.setAttribute('aria-pressed','false');const icon=d.createElement('span');icon.className='po-swatch';icon.style.setProperty('--sw1',t.a);icon.style.setProperty('--sw2',t.b);const title=d.createElement('span');title.textContent=t.name;option.append(icon,title);option.addEventListener('click',()=>choose(t.id));grid.append(option);}
const footer=d.createElement('div');footer.className='po-help';footer.textContent='Alt + P: mở màu sắc · ESC: đóng bảng';menu.append(heading,intro,grid,footer);
bar.insertBefore(menu,area.nextSibling);area.insertBefore(btn,focus);
const close=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false');};const open=()=>{menu.hidden=false;btn.setAttribute('aria-expanded','true');};const toggle=()=>menu.hidden?open():close();
btn.addEventListener('click',toggle);choose('night');
window.OpenIPTVPositronStudio={choose,open,close,toggle,menu,button:btn,choices,subscribe:fn=>{if(typeof fn==='function')listeners.push(fn);}};
})();
/* 12 */(()=>{const studio=window.OpenIPTVPositronStudio;if(!studio)return;const key='open-iptv-positron-studio-palette-v1';
try{const saved=localStorage.getItem(key);if(studio.choices.some(x=>x.id===saved))studio.choose(saved);}catch{}
studio.subscribe(id=>{try{localStorage.setItem(key,id);}catch{ /* private storage can be unavailable */ }});
})();
