'use strict';
/* WatchFlow topic taxonomy. Metadata only; never reads or sends playback URLs.
 * Labels may overlap: a channel/programme can belong to several virtual folders.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OpenIPTVWatchFlowTopics=api;})(typeof window==='undefined'?globalThis:window,function(){
 const LABELS=Object.freeze(['Tin tức','Thể thao','Phim truyện','Thiếu nhi','Giải trí','Khoa học','Ẩm thực','Du lịch','Văn hóa','Âm nhạc','Giáo dục','Kinh tế','Pháp luật','Địa phương','Tài liệu','Phong cách sống','Truyền hình tổng hợp']);
 const ALLOWED=new Set(LABELS);
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[_–—]+/g,' ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
 const rules=[
  ['Ẩm thực',/\b(food|cooking|culinary|cuisine|restaurant|masterchef|chef|recipe|bep|am thuc|nau an|mon ngon|dau bep|hương vi)\b/],
  ['Pháp luật',/\b(an ninh|cong an|canh sat|phap luat|security|police|law|crime|toi pham|toa an)\b/],
  ['Thể thao',/\b(sport|sports|football|soccer|bong da|tennis|basketball|the thao|the van hoi|giai dau|ngoai hang|cup|world cup|champions league|olympic|nba|f1)\b/],
  ['Tin tức',/\b(news|thoi su|tin tuc|ban tin|thong tan|current affairs|dai truyen hinh thoi su|tin nhanh)\b/],
  ['Kinh tế',/\b(kinh te|tai chinh|chung khoan|doanh nghiep|business|finance|market|stock|dau tu)\b/],
  ['Phim truyện',/\b(phim|movie|movies|cinema|series|film|drama|hbo|hollywood|dien anh|tap phim|phim truyen)\b/],
  ['Thiếu nhi',/\b(thieu nhi|tre em|hoat hinh|kids|children|cartoon|animation|disney junior|nickelodeon|baby tv|doraemon)\b/],
  ['Giải trí',/\b(giai tri|entertainment|gameshow|reality|comedy|talkshow|variety|hai kich|showbiz|le hoi|game show)\b/],
  ['Khoa học',/\b(khoa hoc|science|technology|tech|space|astronomy|vu tru|kham pha|nghien cuu|sang che)\b/],
  ['Tài liệu',/\b(documentary|tai lieu|history channel|lich su|wildlife|nature|dong vat|tu nhien|bi an)\b/],
  ['Du lịch',/\b(du lich|travel|journey|discovery travel|kham pha diem den|diem den|kham pha viet nam)\b/],
  ['Âm nhạc',/\b(am nhac|ca nhac|music|mtv|concert|ca si|giai dieu|karaoke|bolero)\b/],
  ['Văn hóa',/\b(van hoa|heritage|di san|nghe thuat|traditional|dan toc|phong tuc|le hoi van hoa)\b/],
  ['Giáo dục',/\b(giao duc|hoc tap|education|learning|day hoc|ngoai ngu|kien thuc|lop hoc)\b/],
  ['Phong cách sống',/\b(lifestyle|phong cach song|doi song|lam dep|suc khoe|wellness|fashion|thoi trang|gia dinh|home garden)\b/]
 ];
 const region=/(?:\b(?:an giang|ba ria|bac giang|bac kan|bac lieu|bac ninh|ben tre|binh dinh|binh duong|binh phuoc|binh thuan|ca mau|can tho|cao bang|da nang|dak lak|dak nong|dien bien|dong nai|dong thap|gia lai|ha giang|ha nam|ha noi|ha tinh|hai duong|hai phong|hau giang|hoa binh|hung yen|khanh hoa|kien giang|kon tum|lai chau|lam dong|lang son|lao cai|long an|nam dinh|nghe an|ninh binh|ninh thuan|phu tho|phu yen|quang binh|quang nam|quang ngai|quang ninh|quang tri|soc trang|son la|tay ninh|thai binh|thai nguyen|thanh hoa|thua thien hue|tien giang|tra vinh|tuyen quang|vinh long|vinh phuc|yen bai|ho chi minh|sai gon)\b)/;
 const localStation=s=>region.test(s)&&/\b(tv|television|truyen hinh|dai)\b/.test(s);
 function distinct(labels){return [...new Set((labels||[]).filter(v=>ALLOWED.has(v)))];}
 function fromText(text){
  const s=' '+norm(text)+' ';const found=[];
  for(const [label,pattern] of rules)if(pattern.test(s))found.push(label);
  return distinct(found);
 }
 function channelLabels(channel){
  const name=norm(channel?.name),group=norm(channel?.group||channel?.groupTitle);
  const words=fromText(name+' '+group);
  if(localStation(name)){
   words.push('Địa phương');
   if(!words.some(x=>!['Địa phương','Tin tức'].includes(x)))words.push('Truyền hình tổng hợp');
  }
  if(/\b(food network|asian food network)\b/.test(name))words.push('Ẩm thực','Phong cách sống');
  if(/\ban ninh tv\b/.test(name))words.push('Pháp luật','Tin tức');
  if(/\b(afn)\b/.test(name)&&/\bfood\b/.test(group))words.push('Ẩm thực');
  return distinct(words);
 }
 function programmeLabels(item){
  const value=String(item?.title||'')+' '+String(item?.description||'');
  return fromText(value);
 }
 function primary(labels){
  const list=distinct(labels);
  return list.find(x=>x!=='Địa phương'&&x!=='Truyền hình tổng hợp')||list[0]||'Chưa phân loại';
 }
 function mergeLabels(existing,newLabels){
  return distinct([...(Array.isArray(existing)?existing:[]),...(Array.isArray(newLabels)?newLabels:[])]);
 }
 function folders(channels,analysis){
  const groups=new Map(LABELS.map(x=>[x,[]]));groups.set('Chưa phân loại',[]);
  for(const channel of channels||[]){
   const record=analysis?.get?.(String(channel.id))||{};
   const labels=distinct(record.labels?.length?record.labels:[record.label]);
   for(const label of labels.length?labels:['Chưa phân loại'])groups.get(label)?.push(channel);
  }
  return [...groups].filter(([,list])=>list.length);
 }
 function programmes(analysis,clock=Date.now()){
  const result=[];
  for(const [channelId,item] of analysis||[]){
   for(const p of item?.programmes||[]){
    if(!(p.end>clock))continue;
    result.push({...p,channelId,labels:distinct(p.labels||[])});
   }
  }
  result.sort((a,b)=>a.start-b.start);
  return result;
 }
 return Object.freeze({LABELS,ALLOWED,norm,distinct,fromText,channelLabels,programmeLabels,primary,mergeLabels,folders,programmes});
});
