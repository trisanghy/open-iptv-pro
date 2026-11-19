'use strict';
// Electron-only Web-style channel chooser below Quick Tools.
// Reads the existing enabled playlist, favorite identities and verified recent history.
(()=>{
 const state=window.IPTVState,favorites=window.OpenIPTVFavorites,recent=window.OpenIPTVRecentChannels;
 const root=document.getElementById('webChannelChooser');
 if(!state||!favorites||!recent||!root)return;
 const $=id=>document.getElementById(id);
 const grid=$('webChooserGrid'),groups=$('webChooserGroups'),search=$('webChooserSearch'),group=$('webChooserGroup'),sort=$('webChooserSort'),status=$('webChooserStatus');
 const prev=$('webChooserPrev'),next=$('webChooserNext'),pageLabel=$('webChooserPage'),favGrid=$('webChooserFavorites'),recentGrid=$('webChooserRecent');
 let tab='all',page=0,layout='grid',queued=false;
 const store=()=>state.getStore?.()||{};
 const channels=()=>state.getChannels?.()||[];
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
 const filterGroups=[['all','Tất cả'],['VTV','VTV'],['VTC','VTC'],['HTV','HTV'],['K+','K+'],['TH','TH địa phương'],['Quốc tế','Quốc tế'],['Phim','Phim'],['Thiếu nhi','Thiếu nhi'],['Thể thao','Thể thao'],['Tin tức','Tin tức']];
 function favoritesList(){return favorites.visible(store());}
 function recentList(){return recent.visible(store(),channels(),favorites.key);}
 function candidates(){
  let result=tab==='fav'?favoritesList():tab==='recent'?recentList():channels();
  const q=normalize(search.value.trim()),g=group.value;
  if(q)result=result.filter(c=>normalize(c.name+' '+(c.group||'')).includes(q));
  if(g)result=result.filter(c=>normalize(c.group||'').includes(normalize(g))||normalize(c.name).startsWith(normalize(g)));
  if(tab!=='recent'){const dir=sort.value==='desc'?-1:1;result=[...result].sort((a,b)=>dir*String(a.name||'').localeCompare(String(b.name||''),'vi',{numeric:true,sensitivity:'base'}));}
  return result;
 }
 function channelCard(ch,compact=false){
  const card=document.createElement('button');card.type='button';card.className='web-chooser-card'+(compact?' compact':'');
  card.dataset.channelId=ch.id;card.title='Xem '+(ch.name||'Kênh');
  const active=state.getCurrent?.()?.id===ch.id;card.classList.toggle('active',active);
  const face=document.createElement('span');face.className='web-chooser-art';
  if(ch.logo){const img=document.createElement('img');img.src=ch.logo;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.remove();face.textContent='TV';},{once:true});face.append(img);}else face.textContent='TV';
  const name=document.createElement('span');name.className='web-chooser-name';name.textContent=ch.name||'Không tên';
  card.append(face,name);
  if(active){const flag=document.createElement('span');flag.className='web-chooser-playing';flag.textContent='▶';card.append(flag);}
  card.addEventListener('click',()=>{void state.playChannel(ch.id);render();});
  return card;
 }
 function empty(target,message){const p=document.createElement('p');p.className='web-chooser-empty';p.textContent=message;target.append(p);}
 function renderGroups(){
  const available=new Set(channels().map(c=>normalize(c.group+' '+c.name)));
  const existing=group.value;
  const groupNames=[...new Set(channels().map(c=>String(c.group||'Khác').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi'));
  group.replaceChildren(new Option('Tất cả nhóm',''));
  for(const name of groupNames)group.append(new Option(name,name));
  group.value=groupNames.includes(existing)?existing:'';
  groups.replaceChildren();
  for(const [value,label] of filterGroups){if(value!=='all'&&!available.size)continue;const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.className='web-chooser-chip'+(group.value===value||value==='all'&&!group.value?' active':'');
   btn.addEventListener('click',()=>{group.value=value==='all'?'':groupNames.find(name=>normalize(name).includes(normalize(value)))||'';page=0;render();});groups.append(btn);}
 }
 function renderSide(target,list,label){target.replaceChildren();if(!list.length){empty(target,'Chưa có kênh '+label);return;}list.slice(0,6).forEach(c=>target.append(channelCard(c,true)));}
 function render(){
  const all=channels();renderGroups();
  const data=candidates(),pages=Math.max(1,Math.ceil(data.length/18));page=Math.min(page,pages-1);
  grid.classList.toggle('list',layout==='list');grid.replaceChildren();
  if(!all.length)empty(grid,'Chưa có nguồn kênh. Hãy nhập playlist M3U để bắt đầu.');
  else if(!data.length)empty(grid,'Không tìm thấy kênh phù hợp.');
  else data.slice(page*18,page*18+18).forEach(c=>grid.append(channelCard(c)));
  pageLabel.textContent=(page+1)+' / '+pages;prev.disabled=page<=0;next.disabled=page>=pages-1;
  status.textContent=data.length+' kênh';
  renderSide(favGrid,favoritesList(),'yêu thích');renderSide(recentGrid,recentList(),'xem gần đây');
  root.querySelectorAll('[data-chooser-tab]').forEach(b=>{const active=b.dataset.chooserTab===tab;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
  root.querySelectorAll('[data-chooser-layout]').forEach(b=>b.classList.toggle('active',b.dataset.chooserLayout===layout));
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
 root.querySelectorAll('[data-chooser-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.chooserTab;page=0;render();}));
 root.querySelectorAll('[data-chooser-layout]').forEach(b=>b.addEventListener('click',()=>{layout=b.dataset.chooserLayout;render();}));
 search.addEventListener('input',()=>{page=0;schedule();});
 group.addEventListener('change',()=>{page=0;render();});sort.addEventListener('change',()=>{page=0;render();});
 prev.addEventListener('click',()=>{page=Math.max(0,page-1);render();});
 next.addEventListener('click',()=>{page++;render();});
 root.querySelectorAll('[data-chooser-see]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.chooserSee;page=0;render();root.scrollIntoView({behavior:'smooth',block:'nearest'});}));
 const channelList=$('channelList');if(channelList)new MutationObserver(schedule).observe(channelList,{childList:true});
 const title=$('playingTitle');if(title)new MutationObserver(schedule).observe(title,{childList:true,subtree:true});
 document.getElementById('video')?.addEventListener('playing',schedule);
 window.addEventListener('openiptv:favorites-changed',schedule);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
 render();
})();
