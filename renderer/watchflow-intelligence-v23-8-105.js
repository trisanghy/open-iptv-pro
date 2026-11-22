'use strict';
/* Real offline WatchFlow learning. No stream URL, credentials or subtitle text are retained. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OpenIPTVWatchFlowEngine=api;})(typeof window==='undefined'?globalThis:window,function(){
 const KEY='watchflow:local-learning-v1',labels=['Tin tức','Thể thao','Phim truyện','Thiếu nhi','Giải trí','Khoa học'];
 const training={
  'Tin tức':['thời sự tin tức bản tin thế giới hôm nay','chính trị xã hội kinh tế tài chính thời tiết','news politics current affairs breaking headline'],
  'Thể thao':['bóng đá giải đấu đội tuyển câu lạc bộ ngoại hạng anh','tennis bóng rổ thể thao golf vận động viên','football sports soccer match basketball tournament'],
  'Phim truyện':['phim truyện truyền hình tình cảm tập phim diễn viên','phim điện ảnh hài kịch hành động','movie cinema drama thriller series episode hbo'],
  'Thiếu nhi':['thiếu nhi hoạt hình trẻ em gia đình','doraemon pokemon tuổi thơ học mà chơi','kids cartoon children disney animation family'],
  'Giải trí':['giải trí chương trình ca nhạc âm nhạc ca sĩ','gameshow hài kịch chương trình biểu diễn','reality show comedy entertainment music concert'],
  'Khoa học':['khoa học khám phá công nghệ nghiên cứu','thiên nhiên động vật tài liệu môi trường vũ trụ','documentary discovery science nature technology wildlife']};
 const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
 const stop=new Set('kenh chuong trinh hinh hd fhd uhd vtv htv tu co mot hai ba the va tren trong'.split(' '));
 const tokenize=s=>(norm(s).match(/[a-z0-9]{2,}/g)||[]).filter(w=>!stop.has(w)).slice(0,130);
 const model=(()=>{const vocab=new Set(),classes={};for(const label of labels){let total=0;const words={};for(const word of training[label].flatMap(tokenize)){words[word]=(words[word]||0)+1;vocab.add(word);total++;}classes[label]={words,total};}return{vocab,classes};})();
 function predict(text){const words=tokenize(text).filter(x=>model.vocab.has(x));if(!words.length)return{label:'Chưa phân loại',confidence:0};const scores=labels.map(l=>words.reduce((n,w)=>n+Math.log(((model.classes[l].words[w]||0)+1)/(model.classes[l].total+model.vocab.size)),0));
  const max=Math.max(...scores),prob=scores.map(x=>Math.exp(x-max)),sum=prob.reduce((a,b)=>a+b,0),idx=scores.indexOf(max);return{label:labels[idx],confidence:Math.round(100*prob[idx]/sum)};}
 // Scan every valid programme for each channel, not just the first eight or next twelve hours.
 function analyzeChannel(channel,guide,guideLib,clock=Date.now()){
  if(!channel?.id)return null;
  const name=predict(String(channel.name||'')+' '+String(channel.group||channel.groupTitle||''));
  let rows=[];
  try{if(guide&&typeof guideLib?.find==='function')rows=guideLib.find(guide,channel)||[];}catch{}
  const votes=new Map();let epgCount=0,live=null,next=null,first=null;
  for(const row of Array.isArray(rows)?rows:[]){
   if(!Number.isFinite(row?.start)||!Number.isFinite(row?.end)||row.end<=row.start)continue;
   epgCount++;
   if(row.start<=clock&&row.end>clock)live=row;
   else if(row.start>clock&&(!next||row.start<next.start))next=row;
   if(!first)first=row;
   const pred=predict(String(row.title||'')+' '+String(row.description||'').slice(0,240));
   if(pred.label==='Chưa phân loại'||pred.confidence<30)continue;
   const weight=row.start<=clock&&row.end>clock?4:row.start>clock?1.5:.6;
   votes.set(pred.label,(votes.get(pred.label)||0)+weight*Math.max(.3,pred.confidence/100));
  }
  const ranked=[...votes].sort((a,b)=>b[1]-a[1]);
  const winner=ranked[0],total=ranked.reduce((sum,x)=>sum+x[1],0);
  const fromEPG=!!winner&&winner[1]>=.3&&(name.label==='Chưa phân loại'||winner[1]>=.8);
  const chosen=fromEPG?{label:winner[0],confidence:Math.max(30,Math.round(100*winner[1]/Math.max(1,total)))}:name;
  return {label:chosen.label,confidence:chosen.confidence,from:fromEPG?'EPG':'Tên/nhóm',
   programme:String((live||next||first)?.title||'').slice(0,180),
   epgCount,epgMatched:epgCount>0,topics:ranked.slice(0,4).map(([label,score])=>({label,score:Math.round(score*10)/10}))};
 }
 function analyze(channels,guide,guideLib,clock=Date.now()){
  const result=new Map();
  for(const channel of Array.isArray(channels)?channels:[]){
   const entry=analyzeChannel(channel,guide,guideLib,clock);
   if(entry)result.set(String(channel.id),entry);
  }
  return result;
 }
 const empty=()=>({version:1,updatedAt:'',seconds:{},hours:{}});
 function read(storage){let data;try{data=JSON.parse(storage?.getItem(KEY)||'null');}catch{}if(data?.version!==1||!data.seconds||typeof data.seconds!=='object')return empty();const v=empty();
  for(const label of labels)v.seconds[label]=Math.max(0,Math.min(31536000,Number(data.seconds[label])||0));
  for(const [hour,categories]of Object.entries(data.hours||{}).slice(0,24)){if(!/^\d{1,2}$/.test(hour)||+hour>23||!categories||typeof categories!=='object')continue;v.hours[hour]={};for(const l of labels)v.hours[hour][l]=Math.max(0,Math.min(31536000,Number(categories[l])||0));}
  v.updatedAt=String(data.updatedAt||'');return v;}
 function learn(data,label,seconds,hour){if(!labels.includes(label)||!Number.isFinite(seconds)||seconds<=0)return data;const s=Math.max(0,Math.min(60,seconds)),h=String(Math.max(0,Math.min(23,Math.floor(hour))));data.seconds[label]=Math.min(31536000,(data.seconds[label]||0)+s);data.hours[h]??={};data.hours[h][label]=Math.min(31536000,(data.hours[h][label]||0)+s);data.updatedAt=new Date().toISOString();return data;}
 const save=(store,data)=>{try{store?.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}};
 const clear=store=>{try{store?.removeItem(KEY);return true;}catch{return false;}};
 function rank(channels,analysis,learning,recent=[],clock=Date.now(),mode='smart'){const seen=new Map(recent.map((v,i)=>[String(v.id),i])),h=learning?.hours?.[String(new Date(clock).getHours())]||{},mx=Math.max(1,...Object.values(learning?.seconds||{}).map(Number)),hx=Math.max(1,...Object.values(h).map(Number));return channels.map((channel,index)=>{const meta=analysis.get(String(channel.id))||{},v=(Number(learning?.seconds?.[meta.label])||0)/mx,peak=(Number(h[meta.label])||0)/hx;const score=(seen.has(String(channel.id))?Math.max(0,30-3*seen.get(String(channel.id))):0)+(mode==='intelligence'?60*v+28*peak:30*v+12*peak)+(meta.epgCount?8:0)+(meta.programme?5:0);return{channel,score,meta,reason:v?'Hợp sở thích '+meta.label+(peak?' · đúng khung giờ':''):meta.programme?'EPG: '+meta.programme:'Có trong playlist',index};}).sort((a,b)=>b.score-a.score||a.index-b.index);}
 function monitor(win,getMode,topicFor){const video=win?.document?.getElementById('video');if(!video)return false;let time=0,id='';
  video.addEventListener('timeupdate',()=>{const mode=getMode();if(mode==='standard'){time=0;return;}const ch=win.IPTVState?.getCurrent?.();if(!ch?.id||video.paused||video.seeking||video.readyState<2){time=0;return;}const now=Date.now();if(ch.id!==id){id=ch.id;time=now;return;}if(!time){time=now;return;}const delta=now-time;if(delta<15000)return;time=now;if(delta>60000)return;const label=topicFor(ch)?.label;if(!labels.includes(label))return;const data=read(win.localStorage);learn(data,label,delta/1000,new Date(now).getHours());save(win.localStorage,data);});
  for(const evt of ['pause','ended','stalled','emptied'])video.addEventListener(evt,()=>{time=0;});return true;}
 async function searchInternet(raw,request=fetch){const q=String(raw||'').trim().slice(0,90);if(q.length<2)return[];const url='https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=vi&uselang=vi&limit=8&origin=*&search='+encodeURIComponent(q);
  const response=await request(url,{method:'GET',headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Wikidata HTTP '+response.status);const json=await response.json();return(Array.isArray(json.search)?json.search:[]).filter(x=>/^Q\d+$/.test(String(x.id||''))).slice(0,8).map(x=>({name:String(x.label||'').slice(0,120),description:String(x.description||'').slice(0,200),url:'https://www.wikidata.org/wiki/'+x.id}));}
 return Object.freeze({KEY,labels,predict,analyzeChannel,analyze,read,learn,save,clear,rank,monitor,searchInternet});
});
