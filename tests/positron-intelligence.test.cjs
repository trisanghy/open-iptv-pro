'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../renderer/positron-intelligence-core.js');
const date=new Date('2026-11-22T15:00:00Z'),now=date.getTime();
const mk=(id,name)=>({id,name,group:'Tổng hợp',url:'https://example.invalid/'+id+'.m3u8',status:'alive'});
const sport=mk('sport','Kênh A'),news=mk('news','Kênh B');
const epg={programmes:[]};
const resolver={find:(_g,ch)=>[{title:ch.id==='sport'?'Trực tiếp bóng đá V-League':'Bản tin thời sự',start:now-50000,end:now+100000}]};
test('EPG phân loại thật và không làm thay đổi playlist',()=>{
 const before=JSON.stringify([sport,news]);
 assert.equal(C.topicFor(sport,epg,resolver,now).key,'sport');
 assert.equal(C.topicFor(news,epg,resolver,now).key,'news');
 assert.equal(C.topicFor(sport,epg,resolver,now).source,'epg');
 assert.equal(JSON.stringify([sport,news]),before);
});
test('thiếu EPG không bịa tên chương trình',()=>{
 const t=C.topicFor(mk('x','Tin tức 24'),null,null,now);
 assert.equal(t.source,'metadata');assert.equal(t.nowTitle,'');
 assert.equal(C.topicFor(sport,epg,{find:()=>[]},now).source,'metadata');
});
test('mô hình logistic online đổi xác suất và thứ hạng sau học hành vi',()=>{
 let model=C.emptyModel();
 const f1=C.features(sport,C.topicFor(sport,epg,resolver,now),date);
 const f2=C.features(news,C.topicFor(news,epg,resolver,now),date);
 const p0=C.predict(model,f1);
 for(let i=0;i<10;i++)model=C.learn(model,f1,1);
 for(let i=0;i<6;i++)model=C.learn(model,f2,0);
 assert.ok(C.predict(model,f1)>p0);
 assert.ok(C.predict(model,f1)>C.predict(model,f2));
 assert.deepEqual(C.recommend([news,sport],epg,resolver,model,{}, {clock:now,limit:2}).map(r=>r.channel.id),['sport','news']);
});
test('học máy giới hạn kích thước và dữ liệu sai',()=>{
 let m=C.emptyModel();
 for(let i=0;i<400;i++)m=C.learn(m,{['topic:'+i]:1},1);
 assert.ok(Object.keys(m.weights).length<=120);
 assert.equal(C.learn(m,{},99).observations,m.observations);
});
test('Wikipedia chỉ chấp nhận tên khớp chính xác',()=>{
 const found=C.readWikiSearch('VTV1',{query:{search:[{pageid:123,title:'VTV1',snippet:'thời sự tin tức'}]}});
 assert.equal(found.key,'news');assert.ok(found.articleUrl.endsWith('123'));
 assert.equal(C.readWikiSearch('VTV1',{query:{search:[{pageid:12,title:'VTV5'}]}}),null);
 assert.equal(C.cleanQuery('http://token.private/file'),'');
});
test('UI chỉ học khi đồng ý và chỉ fetch chủ đề theo click',()=>{
 const s=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const html=fs.readFileSync('renderer/index.html','utf8');
 for(const p of ['positron-intelligence-core.js','positron-intelligence.js','positron-intelligence.css'])assert.ok(html.includes(p));
 assert.ok(s.includes("lookup.addEventListener('click',async()=>"));
 assert.ok(s.includes('active.seconds>=35'));
 assert.ok(s.includes("credentials:'omit'"));
 assert.ok(!s.includes('supabase'));
});
test('WatchFlow 5 chế độ dễ đọc và AI tab riêng không thu hẹp tên cũ',()=>{
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(css.includes('.po-ai-entry #poFlowPlusAI'));
 assert.ok(qa.includes('a.length===5&&a.every'));
});

test('P267 AI xếp lịch XMLTV cá nhân hóa từ phản hồi học máy, không sửa playlist',()=>{
 const guide={programmes:[{id:'qa'}]},t=now,before=JSON.stringify([sport,news]);
 const finder={find:(_g,ch)=>[
  {title:ch.id==='sport'?'Trực tiếp bóng đá':'Bản tin thời sự',start:t+3600000,end:t+7200000},
  {title:'Đã kết thúc',start:t-7200000,end:t-3600000}]};
 let m=C.emptyModel();
 const sf=C.features(sport,{key:'sport',source:'epg'},new Date(t+3600000));
 const nf=C.features(news,{key:'news',source:'epg'},new Date(t+3600000));
 for(let i=0;i<12;i++)m=C.learn(m,sf,1);
 for(let i=0;i<9;i++)m=C.learn(m,nf,0);
 const rows=C.upcomingForYou([news,sport],guide,finder,m,{}, {clock:t});
 assert.equal(rows.length,2);
 assert.equal(rows[0].channel.id,'sport');
 assert.equal(rows[0].topic.source,'epg');
 assert.ok(rows[0].probability>rows[1].probability);
 assert.equal(JSON.stringify([sport,news]),before);
});
test('P267 không bịa lịch nếu thiếu EPG, bỏ trùng và các giờ vô hiệu',()=>{
 assert.deepEqual(C.upcomingForYou([sport],null,resolver,C.emptyModel()),[]);
 const guide={programmes:[]};
 const invalid={find:()=>[
  {title:'Cũ',start:now-7200000,end:now-3600000},
  {title:'Quá xa',start:now+90000000,end:now+94000000},
  {title:'Invalid',start:NaN,end:now+3600000}]};
 assert.deepEqual(C.upcomingForYou([sport],guide,invalid,C.emptyModel(),{}, {clock:now}),[]);
 const valid={find:()=>[
  {title:'Chương trình A',start:now+3600000,end:now+7200000},
  {title:'Chương trình A',start:now+3600000,end:now+7200000}]};
 const rows=C.upcomingForYou([sport],guide,valid,C.emptyModel(),{}, {clock:now});
 assert.equal(rows.length,1);
 assert.notEqual(rows[0].topic.source,'epg');
});
test('P267 UI có chế độ lịch sắp chiếu, không tự tải EPG hay tự phát',()=>{
 const s=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const c=fs.readFileSync('renderer/positron-intelligence-core.js','utf8');
 assert.ok(s.includes("upcomingMode.addEventListener('click'"));
 assert.ok(s.includes('core.upcomingForYou(collection,guide(),win.IPTVGuide,model,profile'));
 assert.ok(s.includes('Lịch EPG hợp gu'));
 assert.ok(s.includes('AI không tự đoán lịch'));
 assert.ok(c.includes('api.find(guide,ch)'));
});
test('HEAD: chỉ AI hoặc đột phá có bằng chứng được tăng bản tính năng',()=>{
 const h=fs.readFileSync('POSITRON_HEAD_20_VONG_TINH_NANG_MOI.md','utf8');
 const c=fs.readFileSync('POSITRON_P5_CHANGELOG.md','utf8').split(/^## /m)[1];
 assert.match(h,/Mỗi phiên bản NEW phải là AI thực/);
 assert.match(h,/Feature class: AI\|BREAKTHROUGH/);
 assert.match(c,/Feature class: (?:AI|BREAKTHROUGH)/);
 assert.match(c,/Evidence:/);
});

test('P267 lịch nhiều ngày không mất các chương trình tương lai sau 200 mục đã hết',()=>{
 const stale=Array.from({length:205},(_,i)=>({
  title:'Đã phát '+i,start:now-(i+1)*600000,end:now-i*600000
 }));
 const future={title:'Trực tiếp bóng đá',start:now+3600000,end:now+7200000};
 const rows=C.upcomingForYou([sport],epg,{find:()=>[...stale,future]},
  C.emptyModel(),{}, {clock:now});
 assert.equal(rows.length,1);
 assert.equal(rows[0].programme.title,'Trực tiếp bóng đá');
});

test('P267 screenshot review reopens already active AI without toggling it off',()=>{
 const script=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(script.includes("if(ai.getAttribute('aria-pressed')!=='true')ai.click()"));
 assert.ok(script.includes("document.getElementById('poAIChannels').click()"));
});

test('P268 AI cảnh báo lịch sắp chiếu cần mô hình đã học và EPG thực, không autoplay',()=>{
 const t=now,guide={programmes:[{id:'fixture'}]};
 const find={find:(_g,ch)=>[{title:ch.id==='sport'?'Trực tiếp bóng đá':'Bản tin thời sự',
  start:t+60000,end:t+3660000}]};
 const model=C.emptyModel();
 assert.deepEqual(C.startingForYou([sport],guide,find,model,{}, {clock:t}),[]);
 let learned=model;
 for(let i=0;i<20;i++)learned=C.learn(learned,
  C.features(sport,{key:'sport',source:'epg'},new Date(t+60000)),1);
 for(let i=0;i<20;i++)learned=C.learn(learned,
  C.features(news,{key:'news',source:'epg'},new Date(t+60000)),0);
 const original=JSON.stringify([sport,news]);
 const found=C.startingForYou([news,sport],guide,find,learned,{}, {clock:t,threshold:0.62});
 assert.ok(found.some(row=>row.channel.id==='sport'));
 assert.ok(found.every(row=>row.probability>=0.62));
 assert.ok(found.every(row=>row.programme.start>t));
 assert.equal(JSON.stringify([sport,news]),original);
 assert.deepEqual(C.startingForYou([sport],null,find,learned,{}, {clock:t}),[]);
});
test('P268 không nhắc chương trình ngoài khung giờ, đã hết hoặc sai timestamp',()=>{
 let m=C.emptyModel();
 for(let i=0;i<15;i++)m=C.learn(m,C.features(sport,{key:'sport',source:'epg'},date),1);
 const bad={find:()=>[
  {title:'Đã hết',start:now-900000,end:now-1000},
  {title:'Quá xa',start:now+600000,end:now+3600000},
  {title:'Dữ liệu lỗi',start:NaN,end:now+600000}
 ]};
 assert.deepEqual(C.startingForYou([sport],epg,bad,m,{}, {clock:now}),[]);
});
test('P268 AI panel hiển thị độc quyền và cảnh báo cần opt-in riêng',()=>{
 const js=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(js.includes("panel.dataset.poAiActive='true'"));
 assert.ok(js.includes('syncAIView();render()'));
 assert.ok(js.includes("delete panel.dataset.poAiActive"));
 assert.ok(css.includes('#poWatchFlowPanel[data-po-ai-active="true"]'));
 assert.ok(js.includes("alertCheck.addEventListener('change'"));
 assert.ok(js.includes('win.setInterval(checkAlerts,60000)'));
 assert.ok(js.includes('if(!enabled||!alertEnabled||model.observations<3)return'));
 assert.ok(qa.includes('getBoundingClientRect().top'));
 assert.ok(qa.includes('aiCardsActuallyHidden'));
});
