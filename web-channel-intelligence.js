'use strict';
/* Browser-local Naive Bayes channel categories and watch-based recommendations.
 * Uses the Web application's existing playlist/EPG/favorites/recents only. */
(function(root,build){
 const api=build();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document){root.OpenIPTVChannelIntelligence=api;api.mount(root);}
})(typeof window!=='undefined'?window:null,function(){
 const themes=['Tin tức','Thể thao','Phim','Giải trí','Thiếu nhi','Âm nhạc','Khoa học','Du lịch','Tổng hợp'];
 const sharedSearch=typeof require==='function'?require('./web-channel-search.js'):null;
 const examples={
  'Tin tức':['tin tuc thoi su ban tin','news world breaking headlines','kinh te tai chinh chung khoan','chinh tri xa hoi quoc hoi'],
  'Thể thao':['the thao bong da tennis','sports football champions league','nba bong ro dua xe','fifa world cup giai dau'],
  'Phim':['phim truyen dien anh','movie cinema drama','film action romance series','phim bo tap tinh cam'],
  'Giải trí':['giai tri gameshow showbiz','entertainment reality show','talkshow hai kich comedy','truyen hinh thuc te variety'],
  'Thiếu nhi':['thieu nhi hoat hinh tre em','kids cartoon disney','animation children nickelodeon','anime cho be'],
  'Âm nhạc':['am nhac ca nhac karaoke','music concert pop rock','mtv vpop kpop','bolero nhac tre'],
  'Khoa học':['khoa hoc cong nghe','science discovery documentary','giao duc vu tru thien nhien','education technology history'],
  'Du lịch':['du lich kham pha','travel destination tourism','am thuc van hoa dia phuong','journey travel world'],
  'Tổng hợp':['truyen hinh tong hop','general local television','vtv htv vtc channel','chuong trinh tong hop']
 };
 const skip=new Set(['kenh','channel','tv','hd','fhd','uhd','truyen','hinh','nguon','source','live']);
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
 const tokens=v=>(normalize(v).match(/[a-z0-9]+/g)||[]).filter(w=>w.length>1&&!skip.has(w)).slice(0,45);
 const model=(()=>{
  const vocab=new Set(),classes=new Map();
  for(const theme of themes){
   const frequencies=new Map();let count=0;
   for(const phrase of examples[theme])for(const word of tokens(phrase)){
    frequencies.set(word,(frequencies.get(word)||0)+1);vocab.add(word);count++;
   }
   classes.set(theme,{frequencies,count});
  }
  return {classes,size:vocab.size};
 })();
 function predict(text){
  const words=tokens(text);if(!words.length)return {category:'Tổng hợp',confidence:0};
  const scored=themes.map(category=>{
   const data=model.classes.get(category);let score=0;
   for(const word of words)score+=Math.log(((data.frequencies.get(word)||0)+1)/(data.count+model.size));
   return {category,score};
  }).sort((a,b)=>b.score-a.score);
  const peak=scored[0].score,total=scored.reduce((n,row)=>n+Math.exp(row.score-peak),0);
  return {category:scored[0].category,confidence:1/total};
 }
 function explicit(group){
  const text=normalize(group);
  const rules=[
   ['Tin tức',/\b(tin tuc|thoi su|news)\b/],['Thể thao',/\b(the thao|sport|sports|bong da|football)\b/],
   ['Phim',/\b(phim|movie|cinema)\b/],['Giải trí',/\b(giai tri|gameshow|entertainment)\b/],
   ['Thiếu nhi',/\b(thieu nhi|kids|cartoon)\b/],['Âm nhạc',/\b(am nhac|music|karaoke)\b/],
   ['Khoa học',/\b(khoa hoc|science|discovery|giao duc)\b/],['Du lịch',/\b(du lich|travel)\b/]
  ];
  return rules.find(([,re])=>re.test(text))?.[0]||'';
 }
 function analyse(channels,{guide=null,favorites=[],recentIds=[],clock=Date.now()}={}){
  const list=Array.isArray(channels)?channels:[];
  const current=new Map();
  if(Array.isArray(guide?.programmes))for(const p of guide.programmes){
   if(!p||typeof p.id!=='string'||!(p.start<=clock+3600000&&p.end>clock))continue;
   const previous=current.get(p.id);
   if(!previous||(p.start<=clock&&p.end>clock&&!(previous.start<=clock&&previous.end>clock)))current.set(p.id,p);
  }
  const tidy=v=>normalize(v).replace(/[^a-z0-9]/g,'').replace(/(hd|fhd)$/,'');
  const rows=list.map((channel,index)=>{
   const id=guide?.manualMappings?.[channel.id]||guide?.names?.[tidy(channel.tvgId)]||guide?.names?.[tidy(channel.name)]||channel.tvgId;
   const p=current.get(id),description=p?String(p.title||'')+' '+String(p.description||'').slice(0,80):'';
   const category=explicit(channel.group)||predict(String(channel.name||'')+' '+String(channel.name||'')+' '+String(channel.group||'')+' '+description).category;
   return {channel,index,category,hasEPG:!!p};
  });
  const byId=new Map(rows.map(r=>[String(r.channel.id),r]));
  const favIds=new Set(favorites.map(c=>String(typeof c==='string'?c:c?.id))),recent=new Map(recentIds.map((id,i)=>[String(id),i]));
  const interest=new Map();let signals=0;
  function preference(id,weight){
   const row=byId.get(String(id));if(!row)return;
   interest.set(row.category,(interest.get(row.category)||0)+weight);signals++;
  }
  for(const id of favIds)preference(id,3);
  recentIds.forEach((id,i)=>preference(id,2/(1+i*.2)));
  const recommended=rows.map(row=>{
   const id=String(row.channel.id),recentIndex=recent.get(id);
   const score=(interest.get(row.category)||0)*2+(favIds.has(id)?1.5:0)+(recentIndex===undefined?0:1/(1+recentIndex*.2))+(row.hasEPG?.25:0);
   return {...row,score};
  }).sort((a,b)=>b.score-a.score||a.index-b.index);
  return {classified:rows.slice().sort((a,b)=>themes.indexOf(a.category)-themes.indexOf(b.category)||a.index-b.index),
   recommended,byId,coldStart:signals===0};
 }
 
 // All Web channel search surfaces share the same typo, accent and EPG engine.
 // Scope by category, then retain personalized recommendation ordering.
 function filterRows(rows,{query='',selected='Tất cả',guide=null,engine=null,clock=Date.now()}={}){
  const scoped=(Array.isArray(rows)?rows:[]).filter(row=>selected==='Tất cả'||row.category===selected);
  const term=String(query||'').trim();
  if(!term)return {rows:scoped,matches:new Map(),approximate:false,usedEPG:false};
  const searchEngine=engine||(typeof window!=='undefined'?window?.OpenIPTVChannelSearch:null)||sharedSearch;
  if(!searchEngine?.search)return {rows:[],matches:new Map(),approximate:false,usedEPG:false};
  const byId=new Map(scoped.map(row=>[String(row.channel.id),row]));
  const found=searchEngine.search(scoped.map(row=>row.channel),term,guide,{
   clock,categoryFor:channel=>byId.get(String(channel.id))?.category||''
  });
  const matching=new Set(found.channels.map(channel=>String(channel.id)));
  return {rows:scoped.filter(row=>matching.has(String(row.channel.id))),
   matches:found.matches,approximate:found.approximate,usedEPG:found.usedEPG};
 }
 function mount(root){
  const doc=root.document,hub=doc.getElementById('webChannelHub'),nav=hub?.querySelector('.web-hub-tabs');
  const main=hub?.querySelector('.web-hub-main');
  if(!hub||!nav||!main||doc.getElementById('webChannelIntelligence'))return;
  const button=(value,cls)=>{const el=doc.createElement('button');el.type='button';el.className=cls;el.textContent=value;return el;};
  const tabs={classification:button('Phân loại kênh','web-hub-tab'),recommended:button('Kênh gợi ý','web-hub-tab')};
  for(const [key,b] of Object.entries(tabs)){b.dataset.aiTab=key;b.setAttribute('role','tab');b.setAttribute('aria-selected','false');nav.append(b);}
  const panel=doc.createElement('section');panel.id='webChannelIntelligence';panel.className='web-ai-panel';panel.hidden=true;
  const hint=doc.createElement('p');hint.className='web-ai-hint';
  const bar=doc.createElement('div');bar.className='web-ai-bar';
  const search=doc.createElement('input');search.type='search';search.placeholder='Tìm kênh / chương trình EPG…';search.setAttribute('aria-label','Tìm kênh không dấu, sửa lỗi gõ và tìm chương trình EPG');search.setAttribute('aria-describedby','webAiSearchFeedback');search.autocomplete='off';
  bar.append(search);
  const feedback=doc.createElement('small');feedback.id='webAiSearchFeedback';feedback.className='web-ai-search-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  const chips=doc.createElement('div');chips.className='web-ai-chips';
  const grid=doc.createElement('div');grid.className='web-ai-grid';
  const more=button('Hiển thị thêm','web-hub-more');
  panel.append(hint,bar,feedback,chips,grid,more);main.append(panel);
  const state=()=>root.IPTVState,store=()=>state()?.getStore?.()||{};
  const favorites=()=>root.OpenIPTVFavorites?.visible?.(store())||[];
  let active='',selected='Tất cả',limit=48,analysis=null,timer=null,version='',renderSerial=0,inputTimer=null;
  const locale=()=>root.OpenIPTVI18n?.getLanguage?.()||doc.documentElement.lang||'vi';
  function tabText(key){return locale()==='vi'?(key==='classification'?'Phân loại kênh':'Kênh gợi ý'):(key==='classification'?'AI categories':'Recommended');}
  function syncTabState(){
   hub.classList.toggle('web-ai-active',!!active);panel.hidden=!active;
   for(const [key,b]of Object.entries(tabs)){b.textContent=tabText(key);b.classList.toggle('active',active===key);b.setAttribute('aria-selected',String(active===key));}
   if(active)for(const b of nav.querySelectorAll('.web-hub-tab[data-tab]')){b.classList.remove('active');b.setAttribute('aria-selected','false');}
  }
  function activate(next){
   active=next;selected='Tất cả';search.value='';limit=48;version='';
   syncTabState();if(active)render();
  }
  nav.addEventListener('click',event=>{
   const selectedAI=event.target.closest('[data-ai-tab]'),normal=event.target.closest('[data-tab]');
   if(selectedAI)activate(selectedAI.dataset.aiTab);
   else if(normal&&active)activate('');
  });
  function schedule(){
   if(!active||timer)return;
   timer=root.setTimeout(()=>{timer=null;render();},100);
  }
  function card(row,match=null){
   const c=row.channel,tile=doc.createElement('div');tile.className='web-hub-tile web-ai-tile';
   const play=button('','web-hub-play');play.setAttribute('aria-label','Phát '+c.name);
   const art=doc.createElement('span');art.className='web-hub-art';art.textContent=String(c.name||'TV').slice(0,3).toUpperCase();
   if(typeof c.logo==='string'&&/^https?:\/\//i.test(c.logo)){
    const img=doc.createElement('img');img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
    img.onerror=()=>{if(img.parentNode===art)art.textContent=String(c.name||'TV').slice(0,3).toUpperCase();};
    art.replaceChildren(img);img.src=c.logo;
   }
   const name=doc.createElement('span');name.className='web-hub-name';name.textContent=c.name;
   const category=doc.createElement('small');category.className='web-ai-category';category.textContent=row.category;
   play.append(art,name,category);
   if(match?.programme){const epg=doc.createElement('small');epg.className='web-ai-programme';epg.textContent='EPG: '+match.programme+(match.type==='near-epg'?' · gần đúng':'');epg.title=epg.textContent;play.append(epg);}
   play.addEventListener('click',()=>{void state()?.playChannel?.(c.id);});
   tile.append(play);
   const isFav=()=>root.OpenIPTVFavorites?.has?.(store(),c);
   const star=button(isFav()?'★':'☆','web-hub-favorite'+(isFav()?' marked':''));
   star.setAttribute('aria-label','Yêu thích '+c.name);star.addEventListener('click',()=>{
    const f=root.OpenIPTVFavorites,s=store(),beforeKeys=[...(s.favoriteKeys||[])],beforeURLs=[...(s.favorites||[])];
    if(!f?.toggle||!Array.isArray(s.favoriteKeys))return;
    f.toggle(s,c);
    if(state()?.save?.()===false){s.favoriteKeys=beforeKeys;s.favorites=beforeURLs;return;}
    state()?.render?.(true);schedule();
   });
   tile.append(star);return tile;
  }
  function render(){
   if(!active)return;
   syncTabState();
   const channels=state()?.getChannels?.()||[],s=store(),guide=root.IPTVExtras?.getGuide?.()||null,history=s.recentChannelIds||[];
   const fav=favorites(),programmes=guide?.programmes||[];
   const key=JSON.stringify([active,channels.map(c=>[c.id,c.name,c.group,c.tvgId]),fav.map(c=>c.id),history,
    programmes.length,programmes[0]?.title,programmes[programmes.length-1]?.title,Math.floor(Date.now()/1800000)]);
   if(version!==key){
    version=key;analysis=analyse(channels,{guide,favorites:fav,recentIds:history});
   }
   hint.textContent=active==='classification'?'Naive Bayes phân loại theo tên kênh, nhóm M3U và chương trình EPG.':
    analysis.coldStart?'Gợi ý khám phá · Chưa đủ lịch sử xem và yêu thích để cá nhân hóa.':'Kênh đề xuất dựa trên yêu thích, lịch sử xem và chủ đề tương tự.';
   const rows=active==='classification'?analysis.classified:analysis.recommended;
   chips.replaceChildren();
   for(const item of ['Tất cả',...themes.filter(t=>rows.some(r=>r.category===t))]){
    const chip=button(item,'web-hub-chip'+(item===selected?' active':''));
    chip.setAttribute('aria-pressed',String(item===selected));chip.addEventListener('click',()=>{selected=item;limit=48;render();});
    chips.append(chip);
   }
   const matches=filterRows(rows,{query:search.value,selected,guide,engine:root.OpenIPTVChannelSearch});
   const filtered=matches.rows;
   feedback.textContent=search.value.trim()?(matches.approximate?'Đã sửa lỗi gõ · Kết quả gần đúng.':matches.usedEPG?'Tìm thấy chương trình trong EPG.':filtered.length?'':(programmes.length?'Không có kết quả phù hợp.':'Chưa có EPG khớp; chỉ tìm được theo tên kênh và nhóm.')):'';
   grid.replaceChildren();
   if(!filtered.length){
    const empty=doc.createElement('p');empty.className='web-hub-empty';
    empty.textContent=channels.length?'Không có kênh phù hợp.':'Chưa có kênh. Hãy nhập danh sách M3U để bắt đầu.';grid.append(empty);
   }
   const token=++renderSerial;let index=0,end=Math.min(limit,filtered.length);
   function batch(){
    if(token!==renderSerial)return;
    const fragment=doc.createDocumentFragment(),stop=Math.min(index+80,end);
    for(;index<stop;index++)fragment.append(card(filtered[index],matches.matches.get(String(filtered[index].channel.id))));
    grid.append(fragment);
    if(index<end)root.requestAnimationFrame?root.requestAnimationFrame(batch):root.setTimeout(batch,0);
   }
   batch();
   more.hidden=filtered.length<=limit;more.textContent='Hiển thị thêm ('+Math.min(48,filtered.length-limit)+')';
  }
  search.addEventListener('input',()=>{limit=48;if(inputTimer)root.clearTimeout(inputTimer);inputTimer=root.setTimeout(()=>{inputTimer=null;render();},110);});
  more.addEventListener('click',()=>{limit+=48;render();});
  doc.addEventListener('openiptv:local-saved',schedule);
  root.addEventListener('openiptv:favorites-changed',schedule);
  doc.addEventListener('openiptv:languagechange',()=>{syncTabState();schedule();});
  root.setInterval(()=>{if(active&&doc.visibilityState!=='hidden')schedule();},60000);
 }
 return Object.freeze({themes,normalize,tokens,predict,explicit,analyse,filterRows,mount});
});
