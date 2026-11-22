'use strict';
/* WatchFlow Intelligence: explicit, local ML opt-in; Wikipedia lookup only on click.
 * Uses existing IPTVState and XMLTV resolver. No automatic channel playback.
 */
(()=>{
 const d=document,win=window,core=win.PositronIntelligenceCore,byId=id=>d.getElementById(id);
 const panel=byId('poWatchFlowPanel'),toolbar=panel?.querySelector('.po-flowplus-nav');
 if(!core||!panel||!toolbar||!win.IPTVState?.getChannels)return;
 const KEY='positron-intelligence-preferences-v1',WEB_KEY='positron-intelligence-web-v1';
 const state=()=>win.IPTVState,channels=()=>state()?.getChannels?.()||[];
 const guide=()=>{try{return win.IPTVExtras?.getGuide?.()||null;}catch{return null;}};
 const load=(key)=>{try{return JSON.parse(win.localStorage.getItem(key)||'null');}catch{return null;}};
 let record=load(KEY);
 let enabled=record?.enabled===true,model=core.sanitizedModel(record?.model),active=null,aiOpen=false;
 let web=load(WEB_KEY);if(!web||typeof web!=='object'||Array.isArray(web))web={};
 const webValid=()=>{
  const live={};const now=Date.now();
  for(const [name,item] of Object.entries(web).slice(-90)){
   if(item&&item.at&&now-item.at<30*86400000&&item.data?.articleUrl&&item.data?.title)
    live[name]=item.data;
  }
  return live;
 };
 const save=()=>{try{win.localStorage.setItem(KEY,JSON.stringify({enabled,model}));return true;}catch{return false;}};
 const saveWeb=()=>{try{
  const entries=Object.entries(web).sort((a,b)=>(b[1]?.at||0)-(a[1]?.at||0)).slice(0,60);
  web=Object.fromEntries(entries);win.localStorage.setItem(WEB_KEY,JSON.stringify(web));return true;
 }catch{return false;}};
 const tab=d.createElement('button');
 tab.type='button';tab.id='poFlowPlusAI';tab.className='po-ai-tab';
 tab.textContent='✦ AI hợp gu';tab.title='Học sở thích xem và phân loại theo EPG';
 tab.setAttribute('aria-label','WatchFlow Intelligence: học máy sở thích và chủ đề theo EPG');
 tab.setAttribute('aria-pressed','false');
 const aiSlot=d.createElement('div');aiSlot.id='poAIEntry';aiSlot.className='po-ai-entry';
 aiSlot.append(tab);toolbar.after(aiSlot);
 const area=d.createElement('section');area.id='poIntelligenceResults';area.className='po-ai-panel';
 area.hidden=true;area.setAttribute('aria-live','polite');
 panel.querySelector('#poFlowPlusResults')?.after(area);
 const title=d.createElement('div');title.className='po-ai-heading';
 const name=d.createElement('h3');name.textContent='WatchFlow Intelligence';
 const desc=d.createElement('p');desc.textContent='AI học trực tuyến trên thiết bị · Phân loại chương trình từ EPG thật · Tra cứu Wikipedia khi bạn yêu cầu';
 title.append(name,desc);
 const controls=d.createElement('div');controls.className='po-ai-controls';
 const checkLabel=d.createElement('label');checkLabel.className='po-ai-check';
 const check=d.createElement('input');check.type='checkbox';check.id='poAIMLConsent';check.checked=enabled;
 const checkText=d.createElement('span');checkText.textContent='Bật học sở thích từ thời lượng xem và phản hồi';
 checkLabel.append(check,checkText);
 const clear=d.createElement('button');clear.type='button';clear.id='poAIReset';
 clear.textContent='Xóa dữ liệu học';clear.title='Xóa các trọng số học máy lưu ở thiết bị này';
 controls.append(checkLabel,clear);
 const modeBar=d.createElement('div');modeBar.className='po-ai-modes';
 const channelsMode=d.createElement('button');channelsMode.type='button';channelsMode.id='poAIChannels';
 channelsMode.textContent='Kênh hợp gu';channelsMode.setAttribute('aria-pressed','true');
 const upcomingMode=d.createElement('button');upcomingMode.type='button';upcomingMode.id='poAIUpcoming';
 upcomingMode.textContent='Lịch EPG hợp gu';upcomingMode.setAttribute('aria-pressed','false');
 modeBar.append(channelsMode,upcomingMode);
 let upcomingOpen=false;
 channelsMode.addEventListener('click',()=>{upcomingOpen=false;render();});
 upcomingMode.addEventListener('click',()=>{upcomingOpen=true;render();});
 const summary=d.createElement('p');summary.className='po-ai-summary';summary.id='poAISummary';
 const list=d.createElement('div');list.id='poAICards';list.className='po-ai-cards';
 const privacy=d.createElement('p');privacy.className='po-ai-privacy';
 privacy.textContent='Mặc định KHÔNG học. Khi bật: chỉ lưu trọng số sở thích trong máy; học sau ≥35 giây phát có hình/tiếng, không tải stream hay lịch sử lên mạng. Tra cứu web chỉ gửi tên kênh, không gửi playlist/URL/hành vi. Bạn có thể xóa mô hình.';
 area.append(title,controls,modeBar,summary,list,privacy);
 const extras=[panel.querySelector('.po-watchflow-modes'),panel.querySelector('.po-watchflow-subhead'),
  byId('poWatchFlowResults'),panel.querySelector('.po-watchflow-note')].filter(Boolean);
 const originals=[byId('poFlowPlusResults'),byId('poWatchLaterSearchRow'),panel.querySelector('.po-flowplus-privacy')].filter(Boolean);
 function showAI(){
  aiOpen=true;area.hidden=false;tab.setAttribute('aria-pressed','true');
  for(const button of toolbar.querySelectorAll('button[data-flowplus-mode]'))button.setAttribute('aria-pressed','false');
  for(const el of extras)el.classList.add('po-flowplus-hidden');
  for(const el of originals)el.hidden=true;
  render();
 }
 function hideAI(){
  aiOpen=false;area.hidden=true;tab.setAttribute('aria-pressed','false');
 }
 tab.addEventListener('click',()=>{if(aiOpen){toolbar.querySelector('[data-flowplus-mode="discover"]')?.click();return;}showAI();});
 toolbar.addEventListener('click',event=>{if(event.target.closest('[data-flowplus-mode]'))hideAI();},true);
 const metadata=(channel)=>core.topicFor(channel,guide(),win.IPTVGuide,Date.now(),webValid()[String(channel.name)]);
 function feedback(channel,label){
  if(!enabled){state()?.toast?.('Bật học sở thích trước khi đánh giá kênh','info');return;}
  const topic=metadata(channel),vector=core.features(channel,topic,new Date());
  model=core.learn(model,vector,label);if(!save())state()?.toast?.('Không lưu được sở thích trên thiết bị','warn');
  render();
 }
 function render(){
  if(!aiOpen)return;
  const collection=channels();const profile=webValid();
  channelsMode.setAttribute('aria-pressed',String(!upcomingOpen));
  upcomingMode.setAttribute('aria-pressed',String(upcomingOpen));
  summary.textContent=(enabled?'● Đang học':'○ Chưa bật học')+' · '+model.observations+
   ' phản hồi hợp lệ · '+collection.length+' kênh khả dụng · Web chỉ tra khi nhấn nút';
  list.replaceChildren();
  if(!collection.length){
   const empty=d.createElement('p');empty.className='po-ai-empty';
   empty.textContent='Chưa có nguồn IPTV. Hãy thêm playlist hợp lệ và EPG để phân loại, sau đó bật học nếu muốn.';
   list.append(empty);return;
  }
  const ranked=upcomingOpen
   ?core.upcomingForYou(collection,guide(),win.IPTVGuide,model,profile,{limit:8,clock:Date.now(),hours:8})
   :core.recommend(collection,guide(),win.IPTVGuide,model,profile,
    {limit:8,clock:Date.now(),excludeId:''});
  if(upcomingOpen&&!ranked.length){
   const empty=d.createElement('p');empty.className='po-ai-empty';
   empty.textContent='Chưa có chương trình sắp phát trong 8 giờ tới từ EPG đã nhập. Hãy tải XMLTV hợp lệ; AI không tự đoán lịch.';
   list.append(empty);return;
  }
  for(const [index,item] of ranked.entries()){
   const ch=item.channel,topic=item.topic;
   const card=d.createElement('article');card.className='po-ai-card';
   const header=d.createElement('div');header.className='po-ai-card-header';
   const chName=d.createElement('strong');chName.textContent=(index+1)+'. '+ch.name;
   const metric=d.createElement('small');
   metric.textContent=topic.label+' · '+(topic.source==='epg'?'EPG':topic.source==='web'?'Wikipedia':
    topic.key==='other'?'Chưa rõ chủ đề':'Tên/nhóm')+(model.observations>=2?' · '+Math.round(item.probability*100)+'% hợp gu':'');
   header.append(chName,metric);card.append(header);
   if(upcomingOpen&&item.programme){
    const schedule=d.createElement('p');schedule.className='po-ai-programme';
    const time=new Date(item.programme.start).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    schedule.textContent=time+' · '+item.programme.title;
    schedule.title='Lịch XMLTV, không xác nhận chương trình đang phát: '+item.programme.title;
    card.append(schedule);
   }
   if(topic.nowTitle||topic.nextTitle){
    const onAir=d.createElement('p');onAir.className='po-ai-epg';
    onAir.textContent=topic.nowTitle?'EPG đang chiếu: '+topic.nowTitle:'EPG sắp tới: '+topic.nextTitle;
    card.append(onAir);
   }
   const why=d.createElement('p');why.className='po-ai-why';why.textContent=item.reason;card.append(why);
   const citation=profile[String(ch.name)];
   if(citation?.articleUrl){
    const link=d.createElement('a');link.href=citation.articleUrl;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Nguồn Wikipedia: '+citation.title;link.className='po-ai-link';card.append(link);
   }
   const actions=d.createElement('div');actions.className='po-ai-actions';
   const play=d.createElement('button');play.type='button';play.textContent='▶ Xem';
   if(upcomingOpen)play.textContent='▶ Xem kênh';
   play.addEventListener('click',()=>{
    if(!channels().some(c=>String(c.id)===String(ch.id)))return render();
    win.PositronWatchFlow?.close?.();state()?.setPage?.('tv');
    Promise.resolve(state()?.playChannel?.(ch.id)).catch(()=>state()?.toast?.('Không thể phát kênh','error'));
   });
   const like=d.createElement('button');like.type='button';like.textContent='👍 Hợp gu';
   like.title='Dạy mô hình tăng hạng những nội dung tương tự';like.disabled=!enabled;
   like.addEventListener('click',()=>feedback(ch,1));
   const dislike=d.createElement('button');dislike.type='button';dislike.textContent='Không hợp';
   dislike.title='Dạy mô hình giảm hạng những nội dung tương tự';dislike.disabled=!enabled;
   dislike.addEventListener('click',()=>feedback(ch,0));
   const lookup=d.createElement('button');lookup.type='button';lookup.textContent='Tra cứu web';
   lookup.title='Chỉ gửi tên kênh lên Wikipedia khi bạn nhấn';
   lookup.addEventListener('click',async()=>{
    const query=core.cleanQuery(ch.name);
    if(!query){state()?.toast?.('Tên kênh không phù hợp để tra cứu','warn');return;}
    lookup.disabled=true;lookup.textContent='Đang tra cứu…';
    const url=new URL('https://vi.wikipedia.org/w/api.php');
    const args={action:'query',list:'search',srsearch:query,srlimit:'3',srprop:'snippet',format:'json',origin:'*'};
    for(const [key,value] of Object.entries(args))url.searchParams.set(key,value);
    try{
     const response=await fetch(url.toString(),{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',
      signal:AbortSignal.timeout(8000)});
     if(!response.ok)throw Error('HTTP '+response.status);
     const result=core.readWikiSearch(query,await response.json(),'vi');
     if(!result){state()?.toast?.('Chưa xác minh được chủ đề của kênh này trên Wikipedia','info');}
     else{web[String(ch.name)]={at:Date.now(),data:result};saveWeb();state()?.toast?.('Đã tìm được trang Wikipedia trùng tên kênh','info');}
    }catch(e){state()?.toast?.('Không tra cứu được Wikipedia: '+String(e.message||e).slice(0,90),'warn');}
    finally{lookup.disabled=false;lookup.textContent='Tra cứu web';if(aiOpen)render();}
   });
   actions.append(play,like,dislike,lookup);card.append(actions);list.append(card);
  }
 }
 check.addEventListener('change',()=>{enabled=check.checked;active=null;
  if(!save())state()?.toast?.('Không lưu được quyền học trên máy','warn');render();});
 clear.addEventListener('click',()=>{
  if(!win.confirm('Xóa toàn bộ trọng số học sở thích trên thiết bị này?'))return;
  model=core.emptyModel();active=null;save();render();
  state()?.toast?.('Đã xóa mô hình sở thích cục bộ','info');
 });
 // Only a real decoded/playable frame triggers tracking. Switching, pausing
 // or a stalled player does not count as a long viewing session.
 const player=byId('video');
 function tick(){
  if(!enabled||!player||player.paused||player.readyState<2||!player.currentSrc){
   active=null;return;
  }
  const ch=state()?.getCurrent?.(),now=Date.now();
  if(!ch?.id)return;
  if(!active||active.id!==String(ch.id)){
   active={id:String(ch.id),seconds:0,last:now,first:false,second:false};return;
  }
  const elapsed=Math.max(0,Math.min(5,(now-active.last)/1000));active.last=now;active.seconds+=elapsed;
  if((active.seconds>=35&&!active.first)||(active.seconds>=180&&!active.second)){
   const isSecond=active.seconds>=180;
   if(isSecond)active.second=true;else active.first=true;
   const topic=metadata(ch),vector=core.features(ch,topic,new Date(now));
   model=core.learn(model,vector,1,{rate:isSecond?0.18:0.42});
   save();if(aiOpen)render();
  }
 }
 if(player){
  player.addEventListener('playing',tick);
  player.addEventListener('pause',()=>{active=null;});
  player.addEventListener('ended',()=>{active=null;});
  player.addEventListener('error',()=>{active=null;});
  win.setInterval(tick,4000);
 }
 const count=byId('navCount');
 if(count)new MutationObserver(()=>{if(aiOpen&&!panel.hidden)render();}).observe(count,{childList:true,characterData:true,subtree:true});
 new MutationObserver(()=>{if(aiOpen&&!panel.hidden)render();}).observe(panel,{attributes:true,attributeFilter:['hidden']});
 win.PositronIntelligence=Object.freeze({render,getProfile:()=>({enabled,observations:model.observations}),
  recommend:()=>core.recommend(channels(),guide(),win.IPTVGuide,model,webValid()),
  upcoming:()=>core.upcomingForYou(channels(),guide(),win.IPTVGuide,model,webValid()),
  getTopic:metadata});
})();
