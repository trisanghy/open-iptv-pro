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
/* 13 */(()=>{const studio=window.OpenIPTVPositronStudio;if(!studio)return;
document.addEventListener('pointerdown',e=>{if(!studio.menu.hidden&&!studio.menu.contains(e.target)&&e.target!==studio.button)studio.close();});
document.addEventListener('keydown',e=>{if(studio.menu.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();studio.close();studio.button.focus();return;}
if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const current=[...studio.menu.querySelectorAll('[data-po-theme]')];if(!current.includes(document.activeElement))return;e.preventDefault();const idx=current.indexOf(document.activeElement);current[(idx+(e.key==='ArrowRight'?1:-1)+current.length)%current.length].focus();}});
})();
/* 14 */(()=>{const bar=document.getElementById('positronBar'),nav=document.getElementById('appSidebar');if(!bar||!nav)return;
const title=bar.querySelector('.p-heading strong'),subtitle=bar.querySelector('.p-heading small');if(!title||!subtitle)return;
const names={tv:'Xem truyền hình',fav:'Kênh yêu thích',epg:'Lịch phát sóng',multiview:'MultiView',shots:'Ảnh chụp kênh',folders:'Thư mục kênh',sources:'Nguồn IPTV',health:'Sức khỏe kênh',doctor:'Smart Doctor',profiles:'Hồ sơ',settings:'Cài đặt'};
let prev='';const sync=()=>{const active=nav.querySelector('.nav.active[data-page]');const page=active?.dataset.page||'tv';if(page===prev)return;prev=page;title.textContent=names[page]||'Trung tâm phát sóng';subtitle.textContent='POSITRON STUDIO · '+page.toUpperCase();bar.dataset.positronPage=page;};
for(const el of nav.querySelectorAll('.nav[data-page]'))new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']});
sync();})();
/* 15 */(()=>{const shortcuts={'1':'tv','2':'fav','3':'epg','4':'sources','5':'settings'};
document.addEventListener('keydown',event=>{if(!event.altKey||event.shiftKey||event.metaKey||event.ctrlKey)return;const page=shortcuts[event.key];if(!page)return;
if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
if(document.getElementById('positronPalette')?.hidden===false)return;
if(window.OpenIPTVPositronStudio?.menu.hidden===false)return;
if(!window.IPTVState?.setPage)return;
event.preventDefault();window.IPTVState.setPage(page);});
})();
/* 16 */(()=>{const overlay=document.getElementById('positronPalette'),open=document.getElementById('positronOpen');if(!overlay||!open)return;
open.setAttribute('aria-controls',overlay.id);open.setAttribute('aria-expanded','false');
new MutationObserver(()=>open.setAttribute('aria-expanded',String(!overlay.hidden))).observe(overlay,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('keydown',e=>{if(overlay.hidden||e.key!=='Tab')return;
const list=[...overlay.querySelectorAll('input:not([disabled]),button:not([disabled])')].filter(el=>el.getClientRects().length>0);
if(!list.length)return;const first=list[0],last=list[list.length-1];
if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
},true);
})();
/* 17 */(()=>{const query=document.getElementById('positronQuery'),results=document.getElementById('positronResults');if(!query||!results)return;
query.setAttribute('role','combobox');query.setAttribute('aria-autocomplete','list');query.setAttribute('aria-controls','positronResults');
const sync=()=>{const options=[...results.querySelectorAll('[role=option]')];options.forEach((opt,i)=>{if(!opt.id)opt.id='positron-option-'+i;});
const selected=options.find(x=>x.getAttribute('aria-selected')==='true');if(selected)query.setAttribute('aria-activedescendant',selected.id);else query.removeAttribute('aria-activedescendant');
query.setAttribute('aria-expanded',String(document.getElementById('positronPalette')?.hidden===false));};
new MutationObserver(sync).observe(results,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-selected']});
new MutationObserver(sync).observe(document.getElementById('positronPalette'),{attributes:true,attributeFilter:['hidden']});sync();
})();
/* 18 */(()=>{const bar=document.getElementById('positronBar');if(!bar)return;
const area=bar.querySelector('.p-actions'),stream=bar.querySelector('.p-live');if(!area||!stream)return;
const status=document.createElement('span');status.id='positronCounts';status.className='po-counts';status.setAttribute('aria-label','Tổng số kênh và nguồn đã nhập');
area.insertBefore(status,stream);
const sources=document.getElementById('sourceCount'),channels=document.getElementById('navCount');
let cache='',scheduled=false;
const update=()=>{scheduled=false;const ch=channels?.textContent?.trim()||'0',src=sources?.textContent?.trim()||'0';const next=ch+' kênh · '+src+' nguồn';if(next!==cache){cache=next;status.textContent=next;}};
const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(update);};
for(const x of [channels,sources])if(x)new MutationObserver(schedule).observe(x,{subtree:true,childList:true,characterData:true});
update();
})();
/* 19 */(()=>{const studio=window.OpenIPTVPositronStudio;if(!studio)return;
const help=studio.menu.querySelector('.po-help');if(help)help.textContent='Alt + P: mở chủ đề · Alt + Shift + T: đổi màu · Esc: đóng';
const reset=document.createElement('button');reset.type='button';reset.id='positronResetTheme';reset.textContent='↺ Về màu Nebula';reset.className='po-reset';reset.addEventListener('click',()=>studio.choose('night'));studio.menu.append(reset);
document.addEventListener('keydown',e=>{
if(!e.altKey||e.metaKey||e.ctrlKey||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
if(document.getElementById('positronPalette')?.hidden===false)return;
if(e.key.toLowerCase()==='p'&&!e.shiftKey){e.preventDefault();studio.toggle();}
if(e.key.toLowerCase()==='t'&&e.shiftKey){e.preventDefault();const list=studio.choices.map(x=>x.id),idx=list.indexOf(document.documentElement.dataset.positronPalette);studio.choose(list[(idx+1)%list.length]);}
});
})();
