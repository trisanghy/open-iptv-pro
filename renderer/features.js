'use strict';
(() => {
 const ctx=window.IPTVState, guideLib=window.IPTVGuide;
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const today=(t)=>new Date(t).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
 const defaultSources=[
  {name:'Việt Nam • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz',enabled:true},
  {name:'Singapore • IPTV-EPG.org',url:'https://iptv-epg.org/files/epg-sg.xml',enabled:false},
  {name:'Thái Lan • IPTV-EPG.org',url:'https://iptv-epg.org/files/epg-th.xml',enabled:false},
  {name:'Anh • IPTV-EPG.org',url:'https://iptv-epg.org/files/epg-gb.xml',enabled:false}
 ];
 let config;
 try{config=JSON.parse(localStorage.getItem('open-iptv-pro-settings-v1')||'{}')}catch{config={}};
 if(!Array.isArray(config.sources))config.sources=defaultSources.map(s=>({...s}));
 if(!/^#[0-9a-fA-F]{6}$/.test(config.accent||''))config.accent='#bc7cff';
 if(typeof config.repo!=='string')config.repo='';
 const saveConfig=()=>{try{localStorage.setItem('open-iptv-pro-settings-v1',JSON.stringify(config))}catch{}};
 let guide={names:{},programmes:[]},updatedAt='',loading=false,currentVersion='4.1.0';
 try{const cached=JSON.parse(localStorage.getItem('open-iptv-pro-epg-v1')||'null');if(cached&&cached.guide&&Array.isArray(cached.guide.programmes)){guide=cached.guide;updatedAt=cached.updatedAt||'';}}catch{}
 const cacheGuide=()=>{try{localStorage.setItem('open-iptv-pro-epg-v1',JSON.stringify({guide,updatedAt}));}catch{ctx.toast('Bộ nhớ lịch EPG đã đầy; vẫn có thể xem lịch trong phiên hiện tại','warn');}};
 function applyColor(color){if(!/^#[0-9a-fA-F]{6}$/.test(color))return;config.accent=color;
   document.documentElement.style.setProperty('--accent',color);
   $('#themePicker').value=color;$('#wheelHole').style.boxShadow=`inset 0 0 0 100px ${color},0 0 0 5px #101923`;
   const rgb=[color.slice(1,3),color.slice(3,5),color.slice(5,7)].map(x=>parseInt(x,16)/255);const max=Math.max(...rgb),min=Math.min(...rgb),d=max-min;let hue=0;if(d){if(max===rgb[0])hue=(60*((rgb[1]-rgb[2])/d)+360)%360;else if(max===rgb[1])hue=60*((rgb[2]-rgb[0])/d+2);else hue=60*((rgb[0]-rgb[1])/d+4);}
   const mark=$('#wheelIndicator'),r=$('#colorWheel').clientWidth*.39,rad=(hue-90)*Math.PI/180;mark.style.left=`calc(50% + ${Math.cos(rad)*r}px)`;mark.style.top=`calc(50% + ${Math.sin(rad)*r}px)`;
   saveConfig();
 }
 function hueToHex(h){const a=1-(Math.abs((h/60)%2-1));let rgb;
   if(h<60)rgb=[1,a,0];else if(h<120)rgb=[a,1,0];else if(h<180)rgb=[0,1,a];else if(h<240)rgb=[0,a,1];else if(h<300)rgb=[a,0,1];else rgb=[1,0,a];
   return '#'+rgb.map(x=>Math.round((x*.70+.30)*255).toString(16).padStart(2,'0')).join('');}
 function colorWheel(e){const box=$('#colorWheel').getBoundingClientRect(),dx=e.clientX-(box.left+box.width/2),dy=e.clientY-(box.top+box.height/2);const angle=(Math.atan2(dy,dx)*180/Math.PI+450)%360;
   applyColor(hueToHex(angle));}
 function renderSources(){const root=$('#epgSources');root.replaceChildren();config.sources.forEach((s,i)=>{
   const row=document.createElement('div');row.className='epg-source-row';row.innerHTML=`<label><input type="checkbox" ${s.enabled?'checked':''}/> <span>${esc(s.name)}<small title="${esc(s.url)}">${esc(s.url)}</small></span></label>${i>=defaultSources.length?'<button class="del-epg" title="Xóa nguồn">✕</button>':''}`;
   row.querySelector('input').onchange=e=>{s.enabled=e.target.checked;saveConfig();};
   row.querySelector('.del-epg')?.addEventListener('click',()=>{config.sources.splice(i,1);saveConfig();renderSources();});
   root.append(row);
 });}
 function renderNow(){const target=$('#epgNowText');if(!target)return;const c=ctx.getCurrent();if(!c){target.textContent='Chọn kênh để xem chương trình hiện tại';return;}
  const {now,next}=guideLib.current(guide,c);target.textContent=now?`${today(now.start)}–${today(now.end)} · ${now.title}${next?'  |  Tiếp: '+next.title:''}`:'Chưa có EPG khớp với '+c.name;
 }
 function renderEPG(){const root=$('#epgGuide');root.replaceChildren();const channels=ctx.getChannels(),clock=Date.now();const filter=$('#epgSearch')?.value?.toLowerCase().trim()||'';
  const matched=channels.filter(c=>guideLib.find(guide,c).length>0).filter(c=>!filter||(c.name+' '+c.tvgId).toLowerCase().includes(filter)).slice(0,250);
  $('#epgSummary').innerHTML=updatedAt?`Dữ liệu cập nhật: <b>${esc(new Date(updatedAt).toLocaleString('vi-VN'))}</b> • ${guide.programmes.length} chương trình • ${matched.length} kênh khớp`:'Chưa tải EPG. Vào Cài đặt và bấm “Cập nhật EPG ngay”.';
  if(!matched.length){root.innerHTML='<div class="empty-list">Không tìm thấy lịch khớp với kênh trong playlist. Thử nguồn EPG khác hoặc thêm tvg-id vào M3U.</div>';return;}
  const frag=document.createDocumentFragment();matched.forEach(c=>{const items=guideLib.find(guide,c).filter(x=>x.end>clock).slice(0,5);
   const card=document.createElement('article');card.className='epg-row';const lines=items.map(p=>`<div class="epg-program ${p.start<=clock&&p.end>clock?'on-air':''}"><time>${today(p.start)}–${today(p.end)}</time><div><b>${esc(p.title)}</b>${p.description?`<small>${esc(p.description)}</small>`:''}</div></div>`).join('')||'<div class="epg-program">Chưa có chương trình kế tiếp</div>';
   card.innerHTML=`<header>▣ <b>${esc(c.name)}</b></header>${lines}`;frag.append(card);
  });root.append(frag);
 }
 async function fetchXML(url){if(window.streamleaf?.fetchEPG)return (await window.streamleaf.fetchEPG(url)).xml;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{const resp=await fetch(url,{signal:controller.signal});if(!resp.ok)throw Error('HTTP '+resp.status);if(url.endsWith('.gz'))throw Error('XMLTV .gz cần bản desktop để giải nén; hãy chọn nguồn .xml trong bản web');const txt=await resp.text();if(txt.length>35*1024*1024)throw Error('EPG quá lớn');return txt;}finally{clearTimeout(timer);}
 }
 async function refreshEPG(){if(loading)return;const active=config.sources.filter(s=>s.enabled);if(!active.length)return ctx.toast('Chưa bật nguồn EPG nào','warn');if(!ctx.getChannels().length)return ctx.toast('Hãy nhập playlist M3U trước để ghép EPG với kênh','warn');
  loading=true;$('#epgLoadBtn').disabled=true;$('#epgLoadBtn').textContent='Đang tải XMLTV...';let sourcesLoaded=0,errors=[],combined={names:{},programmes:[]};
  try{for(const source of active){try{ctx.textStatus('Đang tải EPG: '+source.name);const xml=await fetchXML(source.url);const parsed=guideLib.parse(xml,ctx.getChannels());
    for(const [key,id] of Object.entries(parsed.names))if(!combined.names[key])combined.names[key]=id;
    // Earlier EPG sources take priority for same id and time window.
    const old=new Set(combined.programmes.map(p=>`${p.id}|${p.start}`));for(const p of parsed.programmes){const k=`${p.id}|${p.start}`;if(!old.has(k)){combined.programmes.push(p);old.add(k);}}
    sourcesLoaded++;
   }catch(e){errors.push(source.name+': '+e.message);}}
   if(sourcesLoaded&&combined.programmes.length){guide={names:combined.names,programmes:combined.programmes.slice(0,8000)};updatedAt=new Date().toISOString();cacheGuide();ctx.toast(`Đã tải ${guide.programmes.length} lịch từ ${sourcesLoaded} nguồn`);}
   else ctx.toast('Không có chương trình khớp. Dữ liệu EPG cũ được giữ nguyên. '+errors.join(' | '),'warn');
   if(errors.length)ctx.toast('Một số nguồn EPG lỗi: '+errors.join(' | ').slice(0,350),'warn');
   renderNow();renderGuidePages();ctx.renderList();
  }finally{loading=false;$('#epgLoadBtn').disabled=false;$('#epgLoadBtn').textContent='↻ Cập nhật EPG ngay';ctx.textStatus('Đã hoàn tất kiểm tra EPG');}
 }
 function renderGuidePages(){renderNow();renderEPG();$('#epgUpdatedLabel').textContent=updatedAt?'Cập nhật lần cuối: '+new Date(updatedAt).toLocaleString('vi-VN'):'Chưa tải EPG';}
 function decorateRow(c,row){const {now}=guideLib.current(guide,c);if(!now)return;const small=row.querySelector('.channel-text small');if(small){small.title=`EPG: ${now.title}`;const s=document.createElement('div');s.className='channel-epg';s.textContent='▤ '+now.title;small.after(s);}}
 async function pictureInPicture(){const video=ctx.player;
  try{if(document.pictureInPictureElement){await document.exitPictureInPicture();return;}
   if(video.readyState<2)throw Error('Chọn và phát một kênh trước khi mở PiP');
   if(document.pictureInPictureEnabled&&video.requestPictureInPicture){await video.requestPictureInPicture();return;}
   if(typeof video.webkitSetPresentationMode==='function'){video.webkitSetPresentationMode('picture-in-picture');return;}
   throw Error('Thiết bị hoặc video hiện tại không hỗ trợ Picture-in-Picture');
  }catch(e){ctx.toast('PiP: '+e.message,'warn');}
 }
 async function updateCheck(){const repo=$('#releaseRepo').value.trim();config.repo=repo;saveConfig();$('#updateResult').textContent='Đang kiểm tra GitHub Releases...';
  try{let result;
   if(window.streamleaf?.checkUpdate)result=await window.streamleaf.checkUpdate(repo);
   else{
    if(!/^[a-z\d-]+\/[a-z\d_.-]+$/i.test(repo))throw Error('Nhập repository theo dạng tai-khoan/open-iptv-pro');
    const response=await fetch(`https://api.github.com/repos/${repo}/releases/latest`);if(!response.ok)throw Error('GitHub HTTP '+response.status);const rel=await response.json();const latest=rel.tag_name||'';
    if(!/^v?\d+\.\d+\.\d+/.test(latest))throw Error('Tag phát hành không hợp lệ');
    const parts=v=>v.replace(/^v/,'').split(/[.-]/).slice(0,3).map(Number);const a=parts(latest),b=parts(currentVersion);result={newer:a.some((n,i)=>n>b[i]&&a.slice(0,i).every((v,j)=>v===b[j])),latest,url:`https://github.com/${repo}/releases/latest`};
   }
   $('#updateResult').replaceChildren();const msg=document.createElement('span');msg.textContent=result.newer?`Có bản mới ${result.latest}!`:`Đang dùng phiên bản mới nhất (${currentVersion}); bản phát hành: ${result.latest}.`;
   $('#updateResult').append(msg);if(result.newer){const a=document.createElement('a');a.textContent='Mở trang tải bản mới';a.href=result.url;a.target='_blank';a.rel='noopener noreferrer';if(window.streamleaf?.openRelease){a.addEventListener('click',e=>{e.preventDefault();window.streamleaf.openRelease(repo);});}$('#updateResult').append(a);}
  }catch(e){$('#updateResult').textContent='Không kiểm tra được: '+e.message;}
 }
 $('#epgSources')?.addEventListener('change',()=>{});
 $('#pipBtn').addEventListener('click',pictureInPicture);
 $('#openGuideBtn').addEventListener('click',()=>ctx.setPage('epg'));
 $('#epgSettingsBtn').addEventListener('click',()=>ctx.setPage('settings'));
 $('#epgRefreshBtn').addEventListener('click',refreshEPG);
 $('#epgSearch').addEventListener('input',renderEPG);
 $('#epgLoadBtn').addEventListener('click',refreshEPG);
 $('#epgAddSourceBtn').addEventListener('click',()=>{
  const val=$('#customEPG').value.trim();try{const u=new URL(val);if(u.protocol!=='https:')throw Error('URL phải dùng HTTPS');if(config.sources.some(s=>s.url===val))throw Error('Nguồn đã tồn tại');config.sources.push({name:'EPG tùy chỉnh '+(config.sources.length-defaultSources.length+1),url:val,enabled:true});saveConfig();renderSources();$('#customEPG').value='';ctx.toast('Đã thêm nguồn EPG');}catch(e){ctx.toast('Nguồn EPG không hợp lệ: '+e.message,'warn');}
 });
 $('#themePicker').addEventListener('input',e=>applyColor(e.target.value));
 $('#colorWheel').addEventListener('click',colorWheel);
 $('#colorWheel').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();applyColor('#bc7cff');}});
 document.querySelectorAll('.color-presets button').forEach(b=>{b.style.color=b.dataset.color;b.onclick=()=>applyColor(b.dataset.color)});
 $('#resetThemeBtn').onclick=()=>applyColor('#bc7cff');
 $('#releaseRepo').value=config.repo;$('#releaseRepo').addEventListener('change',e=>{config.repo=e.target.value.trim();saveConfig();});
 $('#updateCheckBtn').addEventListener('click',updateCheck);
 applyColor(config.accent);renderSources();renderGuidePages();
 window.IPTVExtras={render:renderNow,onChannel:renderNow,onPage:p=>{if(p==='settings')renderSources();if(p==='epg')renderGuidePages();},decorateRow};
 window.setInterval(()=>{renderNow();if(document.querySelector('#page-epg').classList.contains('active-page'))renderEPG();},60000);
})();
