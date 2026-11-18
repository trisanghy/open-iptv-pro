'use strict';
/* Offline, deterministic image signatures and reversible Doctor proposals.
 * No images leave the machine. A single matching TV frame is NEVER proof that
 * two services are identical; results are suggestions for human review.
 */
(function(root){
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/\b(?:hd|fhd|sd|uhd|4k|1080p|720p)\b/g,'').replace(/[^a-z0-9]/g,'');
 function features(rgba,w,h){
  if(!rgba||w<9||h<8||rgba.length<w*h*4)throw Error('Dữ liệu ảnh không hợp lệ');
  const gray=new Array(w*h),red=[],green=[],blue=[];let sum=0,sumSq=0,min=255,max=0;
  for(let i=0;i<w*h;i++){
   const r=rgba[4*i],g=rgba[4*i+1],b=rgba[4*i+2];const y=(77*r+150*g+29*b)>>8;
   gray[i]=y;sum+=y;sumSq+=y*y;min=Math.min(min,y);max=Math.max(max,y);
   red.push(r);green.push(g);blue.push(b);
  }
  const n=w*h,mean=sum/n,variance=Math.max(0,sumSq/n-mean*mean);
  let bits='';for(let y=0;y<8;y++)for(let x=0;x<8;x++){
   const yy=Math.min(h-1,Math.floor((y+.5)*h/8));
   const xx=Math.min(w-1,Math.floor((x+.5)*w/9));
   const nx=Math.min(w-1,Math.floor((x+1.5)*w/9));
   bits+=gray[yy*w+xx]>gray[yy*w+nx]?'1':'0';
  }
  const sample=arr=>Math.round(arr.reduce((s,x)=>s+x,0)/n);
  return {hash:bits,mean:Math.round(mean),variance:Math.round(variance),range:max-min,rgb:[sample(red),sample(green),sample(blue)],useful:variance>=85 && (max-min)>=38};
 }
 function distance(a,b){if(!a||!b||a.length!==b.length)return 999;let n=0;for(let i=0;i<a.length;i++)n+=a[i]!==b[i]?1:0;return n;}
 function colorDistance(a,b){if(!a?.rgb||!b?.rgb)return 999;return Math.sqrt(a.rgb.reduce((s,v,i)=>s+(v-b.rgb[i])**2,0));}
 function candidate(a,b){
  if(!a?.feature?.useful||!b?.feature?.useful||a.channel.url===b.channel.url)return null;
  const visual=distance(a.feature.hash,b.feature.hash),colors=colorDistance(a.feature,b.feature);
  if(visual>7||colors>48)return null;
  const c=a.channel,d=b.channel,sameId=norm(c.tvgId)&&norm(c.tvgId)===norm(d.tvgId),sameName=norm(c.name)&&norm(c.name)===norm(d.name);
  const sameLogo=!!(c.logo&&d.logo&&c.logo===d.logo);
  const score=Math.min(97,Math.round(49 + Math.max(0,7-visual)*3 + Math.max(0,48-colors)/10 +(sameId?20:0)+(sameName?15:0)+(sameLogo?9:0)));
  return {a:c.id,b:d.id,aName:c.name,bName:d.name,score,visualDistance:visual,colorDistance:Math.round(colors),metadataMatch:!!(sameId||sameName||sameLogo),reason:(sameId?'Trùng tvg-id; ':sameName?'Trùng tên; ':sameLogo?'Trùng logo; ':'Chỉ giống hình; ')+'một ảnh giống nhau chưa đủ để kết luận kênh trùng',reviewOnly:true};
 }
 function visualMatches(items=[],max=150){
  const results=[];for(let i=0;i<items.length;i++){if(!items[i]?.feature?.useful)continue;
   for(let j=i+1;j<items.length;j++){const found=candidate(items[i],items[j]);if(found)results.push(found);}}
  return results.sort((a,b)=>b.score-a.score||a.aName.localeCompare(b.aName)).slice(0,max);
 }
 function recommendations(channels=[],health={},visual=[]){
  const issues=[];for(const c of channels){
   const events=health[c.url]||[],recent=events.slice(-12);
   const live=recent.some(x=>x.type==='playback'&&Date.now()-Date.parse(x.date)<86400000);
   const freezes=recent.filter(x=>x.type==='freeze'&&Date.now()-Date.parse(x.date)<86400000);
   if(c.status==='dead'&&live)issues.push({type:'false-dead',channelId:c.id,name:c.name,score:97,action:'Kiểm tra lại thay vì xóa',reason:'Đã phát được gần đây mặc dù trạng thái là Die'});
   if(freezes.length)issues.push({type:'freeze',channelId:c.id,name:c.name,score:Math.min(95,55+freezes.length*8),action:'Đề xuất kiểm tra link dự phòng',reason:`${freezes.length} lần nghi đứng hình trong nhật ký; chưa kết luận link Die`});
   if(!c.tvgId)issues.push({type:'missing-id',channelId:c.id,name:c.name,score:45,action:'Bổ sung tvg-id',reason:'Thiếu mã liên kết EPG'});
   if(!c.logo)issues.push({type:'missing-logo',channelId:c.id,name:c.name,score:35,action:'Bổ sung logo',reason:'Thiếu hình đại diện kênh'});
  }
  for(const c of visual){issues.push({type:'visual',channelId:c.a,otherId:c.b,name:c.aName+' ↔ '+c.bName,score:c.score,action:'Xem lại cặp kênh; không gộp tự động',reason:c.reason});}
  return issues.sort((a,b)=>b.score-a.score);
 }
 function createFreezeDetector({durationMs=12000,blackMs=9000,minSamples=4}={}){
  let samples=[],lastState='idle';
  function reset(){samples=[];lastState='idle';}
  function feed(s){if(s.paused||s.ready===false||!s.frame){reset();return {state:'idle'};}
   const t=Number(s.now),time=Number(s.mediaTime),decoded=Number.isFinite(s.decodedFrames)?s.decodedFrames:null;
   if(!Number.isFinite(t)||!Number.isFinite(time)){reset();return {state:'unknown'};}
   if(samples.length&&t<=samples.at(-1).now)return {state:lastState};
   samples.push({now:t,mediaTime:time,decodedFrames:decoded,frame:s.frame});
   samples=samples.filter(x=>x.now>=t-Math.max(durationMs,blackMs)*1.8).slice(-12);
   if(samples.length<minSamples)return {state:'observing',samples:samples.length};
   const start=samples[0],elapsed=t-start.now;
   const recent=samples.filter(x=>x.now>=t-durationMs);
   const first=recent[0]||start;
   const unchanged=recent.every(x=>distance(x.frame.hash,first.frame.hash)<=1 && colorDistance(x.frame,first.frame)<=12);
   const black=samples.every(x=>x.frame.mean<14&&x.frame.variance<65);
   const timeStalled=time-first.mediaTime<1.2;
   const decodedStalled=decoded!==null&&first.decodedFrames!==null&&decoded-first.decodedFrames<2;
   let state='observing',reason='';
   if(black&&elapsed>=blackMs){state='black-warning';reason='Màn hình tối liên tục; có thể là cảnh tối hoặc nguồn mất hình';}
   else if(elapsed>=durationMs&&unchanged&&timeStalled&&decodedStalled){state='freeze-confirmed';reason='Khung hình, thời gian phát và số frame giải mã đều không tiến triển';}
   else if(elapsed>=durationMs&&unchanged){state='freeze-suspected';reason='Khung hình ít thay đổi; có thể là cảnh tĩnh, chưa xác nhận lỗi';}
   else if(elapsed>=durationMs)state='healthy';
   lastState=state;return {state,reason,samples:samples.length,elapsedMs:elapsed};
  }
  return {feed,reset};
 }
 const api={norm,features,distance,colorDistance,candidate,visualMatches,recommendations,createFreezeDetector};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.OpenIPTVDoctorV2=api;
})(typeof window!=='undefined'?window:globalThis);
