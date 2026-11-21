'use strict';
/* WatchFlow Plus. Enhancement of the existing WatchFlow dialog:
 * Continue / Similar / Daily Mix / user-triggered Smart Zap.
 * Playback always uses IPTVState.playChannel(id), never an unapproved URL.
 */
(()=>{
 const d=document,byId=id=>d.getElementById(id);
 const core=window.PositronWatchFlowPlusCore;
 const watchLater=window.PositronWatchLaterCore;
 const loadSaved=()=>{try{return watchLater?.compact(JSON.parse(window.localStorage.getItem(watchLater.STORAGE_KEY)||'[]'))||[];}catch{return [];}};
 let saved=loadSaved();
 const panel=byId('poWatchFlowPanel');
 const state=()=>window.IPTVState;
 if(!core||!panel||!window.PositronWatchFlow||!state()?.getChannels)return;
 const modes=panel.querySelector('.po-watchflow-modes');
 const subhead=panel.querySelector('.po-watchflow-subhead');
 const results=byId('poWatchFlowResults');
 const note=panel.querySelector('.po-watchflow-note');
 if(!modes||!subhead||!results||!note)return;
 const standard=[modes,subhead,results,note];
 const toolbar=d.createElement('nav');
 toolbar.className='po-flowplus-nav';toolbar.setAttribute('aria-label','Khám phá WatchFlow');
 const choices=[
  ['discover','Gợi ý','compass'],
  ['continue','Tiếp','history'],
  ['similar','Cùng gu','layers'],
  ['mix','Mix','shuffle'],
  ['zap','Zap','zap']
 ];
 const paths={
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  shuffle:'<path d="M4 7h3c5 0 5 10 10 10h3M17 14l3 3-3 3M4 17h3c2 0 3-1 4-3M14 9c1-1 2-2 3-2h3M17 4l3 3-3 3"/>',
  zap:'<path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>'
 };
 const buttons={};
 for(const [key,label,icon] of choices){
  const b=d.createElement('button');b.type='button';b.id='poFlowPlus'+key;
  b.dataset.flowplusMode=key;b.setAttribute('aria-pressed',String(key==='discover'));
  b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[icon]+'</svg><span>'+label+'</span>';
  const fullLabels={discover:'Khám phá kênh',continue:'Tiếp tục xem',similar:'Kênh cùng gu',mix:'Mix hôm nay',zap:'Smart Zap'};
  b.title=fullLabels[key];b.setAttribute('aria-label',fullLabels[key]);
  buttons[key]=b;toolbar.append(b);
 }
 modes.before(toolbar);
 const content=d.createElement('section');content.id='poFlowPlusResults';content.className='po-flowplus-results';
 content.hidden=true;content.setAttribute('aria-live','polite');note.after(content);
 const status=d.createElement('small');status.className='po-flowplus-privacy';
 status.textContent='Chỉ dùng dữ liệu kênh trên thiết bị · Không tự phát · Không tìm nguồn bên ngoài';
 content.after(status);status.hidden=true;
 // P5.1.94: a bounded desktop panel hides later Mix recommendations.
 // Offer a non-interactive scroll cue while the last card is below view.
 const scrollCue=d.createElement('div');scrollCue.id='poFlowPlusScrollHint';
 scrollCue.textContent='↓ Cuộn xuống để xem thêm kênh';
 scrollCue.hidden=true;scrollCue.setAttribute('aria-hidden','true');
 let view='discover',lastMix=[],zapSeen=[];
 const syncScrollCue=()=>{
  const last=content.querySelector('.po-flowplus-card:last-child');
  const modalRect=panel.getBoundingClientRect();
  scrollCue.hidden=!(view!=='discover'&&!panel.hidden&&last&&
   last.getBoundingClientRect().bottom>modalRect.bottom-18);
 };
 const scheduleScrollCue=()=>window.requestAnimationFrame(syncScrollCue);
 panel.addEventListener('scroll',syncScrollCue,{passive:true});
 window.addEventListener('resize',scheduleScrollCue);
 const channels=()=>state()?.getChannels?.()||[];
 const recent=()=>{
  const source=state()?.getStore?.();
  const recentApi=window.OpenIPTVRecentChannels;
  const key=window.OpenIPTVFavorites?.key;
  if(!source||!recentApi?.visible||typeof key!=='function')return [];
  return recentApi.visible(source,channels(),key);
 };
 const clear=()=>content.replaceChildren();
 const label=(txt,cls='')=>{const node=d.createElement('p');node.className=cls;node.textContent=txt;return node;};
 const heading=(txt,sub)=>{
  const head=d.createElement('div');head.className='po-flowplus-head';
  const h=d.createElement('strong');h.textContent=txt;
  head.append(h,label(sub),scrollCue);content.append(head);
 };
 const empty=txt=>{const node=d.createElement('div');node.className='po-flowplus-empty';node.textContent=txt;content.append(node);};
 const toggleSaved=channel=>{
  if(!watchLater)return null;
  const change=watchLater.toggle(saved,channel);
  if(!change.ok)return null;
  try{window.localStorage.setItem(watchLater.STORAGE_KEY,JSON.stringify(change.rows));}
  catch{state()?.toast?.('Không thể lưu trên thiết bị. Kiểm tra quyền lưu dữ liệu.','error');return null;}
  saved=change.rows;
  return change.saved;
 };

 const play=ch=>{
  if(!ch||!channels().some(c=>String(c.id)===String(ch.id)))return render();
  window.PositronWatchFlow.close();
  const app=state();app.setPage?.('tv');
  Promise.resolve().then(()=>app.playChannel(String(ch.id))).catch(()=>app.toast?.('Không thể phát kênh đã chọn','error'));
 };
 const cards=(items,reason)=>{
  if(!items.length)return empty('Chưa có kênh phù hợp từ nguồn đã nhập.');
  const list=d.createElement('div');list.className='po-flowplus-cards';
  for(const ch of items){
   const card=d.createElement('article');card.className='po-flowplus-card';
   const body=d.createElement('div');body.className='po-flowplus-card-info';
   const name=d.createElement('strong');name.textContent=ch.name;
   const info=d.createElement('small');
   const group=ch.group||ch.groupTitle||'Không phân nhóm';
   info.textContent=group+' · '+(ch.status==='alive'?'Đã có bằng chứng phát':'Chưa xác minh');
   body.append(name,info);
   const action=d.createElement('button');action.type='button';action.textContent='Xem';
   action.setAttribute('aria-label','Xem kênh '+ch.name);action.addEventListener('click',()=>play(ch));
   const buttons=d.createElement('div');buttons.className='po-flowplus-actions';
   if(watchLater?.identity(ch)){
    const save=d.createElement('button');save.type='button';save.className='po-flowplus-save';
    const drawSave=()=>{
     const isSaved=watchLater.has(saved,ch);
     save.textContent=isSaved?'Bỏ lưu':'Lưu';
     save.setAttribute('aria-label',(isSaved?'Bỏ lưu kênh ':'Lưu kênh để xem sau ')+ch.name);
     save.setAttribute('aria-pressed',String(isSaved));
     save.title=isSaved?'Bỏ khỏi Xem sau':'Lưu để xem sau trên thiết bị này';
    };
    drawSave();
    save.addEventListener('click',()=>{
     if(toggleSaved(ch)===null)return;
     drawSave();
     if(view==='continue')render();
    });
    buttons.append(save);
   }
   buttons.append(action);card.append(body,buttons);list.append(card);
  }
  content.append(list);
  if(reason)content.append(label(reason,'po-flowplus-reason'));
 };
 const render=()=>{
  const collection=channels();
  if(!collection.length){select('discover');return;}
  toolbar.hidden=false;content.hidden=view==='discover';
  if(view==='discover')return;
  clear();
  const current=state()?.getCurrent?.();
  if(view==='continue'){
   const waiting=watchLater?.visible(saved,collection,8)||[];
   if(waiting.length){
    heading('Để xem sau · '+waiting.length+' kênh','Các kênh bạn chủ động lưu trên thiết bị này.');
    cards(waiting,'Chọn Xem khi muốn phát, hoặc Bỏ lưu để xóa đánh dấu.');
   }
   heading('Tiếp tục xem','Chỉ các kênh từng lên hình thật trên thiết bị này.');
   const played=core.continueWatching(collection,recent(),5);
   if(!played.length)empty('Chưa có lịch sử phát thành công. Hãy xem một kênh, danh sách này sẽ xuất hiện sau khi có hình.');
   else cards(played,'Không khôi phục vị trí trong luồng trực tiếp; mở lại kênh bằng trình phát hiện có.');
  }else if(view==='similar'){
   const basis=current||recent()[0];
   heading('Kênh cùng gu',basis?'Gần với '+basis.name+' · Theo tên và nhóm kênh':'Chọn một kênh để tìm nội dung tương tự.');
   if(!basis)empty('Hãy xem một kênh hoặc chọn Tiếp tục xem trước.');
   else cards(core.similar(collection,basis,{limit:5}),'Ưu tiên nguồn từng phát được. Không suy đoán nội dung EPG.');
  }else if(view==='mix'){
   heading('Mix 5 kênh hôm nay','Một danh sách khám phá đa dạng từ các nhóm nguồn bạn đã nhập.');
   lastMix=core.dailyMix(collection,{limit:5,date:core.localDay()});
   cards(lastMix,'Danh sách gợi ý không tự chuyển kênh. Bạn chọn kênh muốn phát.');
  }
  scheduleScrollCue();
 };
 const select=next=>{
  view=next;
  for(const [key,b] of Object.entries(buttons))b.setAttribute('aria-pressed',String(key===next));
  for(const el of standard)el.classList.toggle('po-flowplus-hidden',next!=='discover');
  content.hidden=next==='discover';status.hidden=next==='discover';
  if(next!=='discover')render();
  else scrollCue.hidden=true;
 };
 for(const key of ['discover','continue','similar','mix'])buttons[key].addEventListener('click',()=>select(key));
 buttons.zap.addEventListener('click',()=>{
  const current=state()?.getCurrent?.();
  const recentIds=recent().slice(0,5).map(c=>c.id);
  const pick=core.smartZap(channels(),{currentId:current?.id||'',seen:zapSeen.concat(recentIds)});
  if(!pick){state()?.toast?.('Chưa có kênh khác phù hợp để chuyển','info');return;}
  zapSeen=[...zapSeen.slice(-19),String(pick.id)];
  play(pick);
 });
 const sync=()=>{
  const has=channels().length>0;
  toolbar.hidden=!has;
  if(!has&&view!=='discover')select('discover');
  if(has&&view!=='discover'&&!panel.hidden)render();
 };
 const count=byId('navCount');
 if(count)new MutationObserver(sync).observe(count,{childList:true,characterData:true,subtree:true});
 new MutationObserver(()=>{if(!panel.hidden)sync();else scrollCue.hidden=true;}).observe(panel,{attributes:true,attributeFilter:['hidden']});
 window.addEventListener('storage',event=>{
  if(event.key===watchLater?.STORAGE_KEY){saved=loadSaved();if(!panel.hidden&&view!=='discover')render();}
 });
 sync();
 window.PositronWatchFlowPlus=Object.freeze({select,refresh:sync});
})();