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

test('P269 AI tối ưu lịch 24 giờ loại trùng giờ, xếp theo trọng số đã học',()=>{
 const t=now,channels=[sport,news],guide={programmes:[{id:'fixture'}]};
 const finder={find:(_g,ch)=>ch.id==='sport'?[
  {title:'Trực tiếp bóng đá A',start:t+3600000,end:t+7200000},
  {title:'Trực tiếp bóng đá B',start:t+7200000,end:t+10800000}
 ]:[
  {title:'Bản tin thời sự dài',start:t+5400000,end:t+9000000}
 ]};
 let m=C.emptyModel();
 for(let i=0;i<20;i++)m=C.learn(m,C.features(sport,{key:'sport',source:'epg'},new Date(t+3600000)),1);
 for(let i=0;i<20;i++)m=C.learn(m,C.features(news,{key:'news',source:'epg'},new Date(t+5400000)),0);
 const before=JSON.stringify(channels);
 const plan=C.planForYou(channels,guide,finder,m,{}, {clock:t,limit:3,hours:24});
 assert.deepEqual(plan.map(x=>x.programme.title),['Trực tiếp bóng đá A','Trực tiếp bóng đá B']);
 assert.ok(plan.every((x,i)=>i===0||plan[i-1].programme.end<=x.programme.start));
 assert.ok(plan.every(x=>x.probability>=0&&x.probability<=1));
 assert.equal(JSON.stringify(channels),before);
});
test('P269 lịch không bịa XMLTV, lọc tương lai và khống chế số chương trình',()=>{
 assert.deepEqual(C.planForYou([sport],null,null,C.emptyModel(),{}, {clock:now}),[]);
 const resolver={find:()=>[
  {title:'Từ hôm qua',start:now-300000,end:now-1000},
  {title:'Ngoài 24h',start:now+26*3600000,end:now+27*3600000},
  {title:'Bản tin',start:now+3600000,end:now+7200000}
 ]};
 const plan=C.planForYou([sport],epg,resolver,C.emptyModel(),{}, {clock:now});
 assert.equal(plan.length,1);
 assert.equal(plan[0].programme.title,'Bản tin');
 const src=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 assert.ok(src.includes("planMode.addEventListener('click'"));
 assert.ok(src.includes('core.planForYou(collection,guide(),win.IPTVGuide,model,profile'));
 assert.ok(src.includes('programmeTopic||metadata(channel)'));
});

test('P270 contextual bandit UCB ưu tiên chủ đề ít đánh giá và giảm sau quan sát',()=>{
 const b=C.observeBandit({sport:20,news:10,invalid:999},'sport');
 assert.equal(b.sport,21);assert.equal(b.news,10);assert.equal(b.invalid,undefined);
 assert.ok(C.banditBonus(0,31)>C.banditBonus(21,31));
 assert.deepEqual(C.sanitizedBandit({sport:-40,kids:'x',news:1.5}),{news:1});
});
test('P270 AI khám phá dựa trên phản hồi, vẫn trả chủ đề thiếu nhi mới và giữ playlist',()=>{
 const kids=mk('kids','Kênh thiếu nhi'),channels=[sport,news,kids],before=JSON.stringify(channels);
 const guide={programmes:[{id:'fixture'}]};
 const resolver={find:(_g,ch)=>[{title:ch.id==='sport'?'Trực tiếp bóng đá':ch.id==='news'?'Bản tin thời sự':'Hoạt hình thiếu nhi',
  start:now-1000,end:now+3600000}]};
 let m=C.emptyModel(),history={};
 for(let i=0;i<25;i++){m=C.learn(m,C.features(sport,{key:'sport',source:'epg'},date),1);history=C.observeBandit(history,'sport');}
 for(let i=0;i<18;i++){m=C.learn(m,C.features(news,{key:'news',source:'epg'},date),0);history=C.observeBandit(history,'news');}
 const rows=C.exploreWithBandit(channels,guide,resolver,m,{},history,{clock:now,limit:3});
 assert.equal(rows.length,3);assert.ok(rows.some(x=>x.topic.key==='kids'));
 assert.ok(rows.find(x=>x.topic.key==='kids').bonus>rows.find(x=>x.topic.key==='sport').bonus);
 assert.equal(JSON.stringify(channels),before);
});
test('P270 chế độ AI bandit phụ thuộc consent và có nút xóa bộ đếm',()=>{
 const s=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 for(const x of ["exploreMode.disabled=!enabled","exploreMode.addEventListener('click'",
  "core.exploreWithBandit(collection,guide(),win.IPTVGuide,model,profile,bandit",
  "bandit=core.observeBandit(bandit,topic.key)","model=core.emptyModel();bandit={}"])assert.ok(s.includes(x),x);
});

test('P271 Multinomial NB từ nhãn người dùng phân loại kênh cùng mẫu chưa rõ EPG',()=>{
 let m=C.emptyCategoryModel();
 m=C.teachCategory(m,{name:'Atlas Academy Alpha'},'education');
 m=C.teachCategory(m,{name:'Atlas Academy Omega'},'education');
 m=C.teachCategory(m,{name:'Business Daily Report'},'news');
 assert.equal(m.examples,3);
 const guessed=C.predictCategory(m,{name:'Atlas Academy Beta'});
 assert.ok(guessed,'must classify similar unseen title');
 assert.equal(guessed.key,'education');assert.equal(guessed.source,'ml');
 assert.ok(guessed.confidence>=.72);
 assert.equal(C.topicFor({name:'Atlas Academy Beta'},null,null,now,guessed).source,'ml');
 assert.ok(!JSON.stringify(m).includes('http'));
});
test('P271 từ chối nhãn không hợp lệ, không phỏng đoán khi thiếu dữ liệu, xóa sạch',()=>{
 const empty=C.emptyCategoryModel();
 assert.equal(C.predictCategory(empty,{name:'Atlas Academy'}),null);
 assert.equal(C.teachCategory(empty,{name:'No'},'invalid').examples,0);
 const model=C.teachCategory(empty,{name:'Atlas Academy Alpha'},'education');
 assert.equal(C.predictCategory(model,{name:'Atlas Academy Omega'}),null);
 assert.equal(C.emptyCategoryModel().examples,0);
 const s=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 for(const key of ["poAITeach-","core.teachCategory(categoryModel,ch,select.value)",
  "core.predictCategory(categoryModel,channel)","categoryModel=core.emptyCategoryModel()"])
  assert.ok(s.includes(key),key);
});


test('P272 tự tạo thư mục EPG đa nhãn, không đổi playlist và không đoán khi thiếu EPG',()=>{
 const t=now,channels=[
  mk('news-sport','Kênh tổng hợp A'),mk('kids-film','Kênh tổng hợp B'),mk('none','Kênh chưa rõ')
 ];
 const original=JSON.stringify(channels),guide={programmes:[{id:'qa'}]};
 const find={find:(_guide,ch)=>ch.id==='news-sport'
  ?[{title:'Bản tin thời sự và trực tiếp bóng đá',start:t-1000,end:t+100000}]
  :ch.id==='kids-film'
   ?[{title:'Phim hoạt hình thiếu nhi',start:t-1000,end:t+100000}]:[]};
 const found=C.epgFolders(channels,guide,find,{clock:t});
 const index=key=>found.groups.find(g=>g.key===key)?.items.map(r=>r.channel.id)||[];
 assert.deepEqual(index('news'),['news-sport']);
 assert.deepEqual(index('sport'),['news-sport']);
 assert.deepEqual(index('cinema'),['kids-film']);
 assert.deepEqual(index('kids'),['kids-film']);
 assert.deepEqual(found.uncategorized.map(x=>x.channel.id),['none']);
 assert.equal(found.scanned,3);
 assert.equal(JSON.stringify(channels),original);
 assert.equal(C.epgFolders(channels,null,find,{clock:t}).groups.length,0);
});
test('P272 WatchFlow hiển thị thư mục có thể mở và kênh đa nhóm, không tự phát',()=>{
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("foldersMode.textContent='Thư mục EPG'"));
 assert.ok(ui.includes("const catalog=indexed('folders',collection)"));
 assert.ok(ui.includes('indexCache.folders=core.epgFolders(collection,g,win.IPTVGuide'));
 assert.ok(ui.includes("[c?.id,c?.name,c?.group,c?.groupTitle].join(':')"),'health/status changes must not trigger a full EPG scan');
 assert.ok(ui.includes("folder.dataset.topic=key"));
 assert.ok(ui.includes("channelDisclosure.append(disclosureLabel,rows);folder.append(channelDisclosure)"),
  'P278 nested disclosure must preserve the unclassified channel list');
 assert.ok(ui.includes("}else folder.append(rows);"),'All normal EPG folders still expose their rows');
 assert.ok(ui.includes("list.append(folder);"),'All EPG folders must remain in the list');
 assert.ok(css.includes('#poAICards[data-mode="folders"]'));
 assert.ok(qa.includes('positron-p51272-epg-folders-before-1920x1080-real.png'));
 assert.ok(qa.includes('positron-p51272-epg-folders-after-1920x1080-real.png'));
});


test('P273 phân nhóm chương trình XMLTV 24h đa nhãn theo giờ thật, không bịa dữ liệu',()=>{
 const t=now,channels=[mk('a','QA A'),mk('b','QA B'),mk('c','QA C')],orig=JSON.stringify(channels);
 const guide={programmes:[{id:'qa'}]};
 const resolver={find:(_g,ch)=>ch.id==='a'?[
  {title:'Bản tin thời sự và trực tiếp bóng đá',start:t+3600000,end:t+7200000},
  {title:'Bản tin thời sự và trực tiếp bóng đá',start:t+3600000,end:t+7200000},
  {title:'Hôm qua',start:t-7200000,end:t-3600000},
  {title:'Ngoài 24h',start:t+26*3600000,end:t+27*3600000}
 ]:ch.id==='b'?[{title:'Khoa học tài liệu giáo dục',start:t+60000,end:t+3600000}]
  :[{title:'Chương trình số 123',start:t+120000,end:t+3600000}]};
 const result=C.programmeFolders(channels,guide,resolver,{clock:t});
 const pick=k=>result.groups.find(g=>g.key===k)?.items.map(v=>v.channel.id)||[];
 assert.deepEqual(pick('news'),['a']);
 assert.deepEqual(pick('sport'),['a']);
 assert.deepEqual(pick('documentary'),['b']);
 assert.deepEqual(pick('education'),['b']);
 assert.equal(result.total,3);
 assert.equal(result.uncategorized.length,1);
 assert.deepEqual(C.programmeFolders(channels,null,resolver,{clock:t}).groups,[]);
 assert.equal(JSON.stringify(channels),orig);
});
test('P273 giao diện chương trình EPG có giờ nguồn thực, nhiều thư mục và chỉ phát khi click',()=>{
 const s=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ["poAIEPGProgrammes","const catalog=indexed('programmes',collection)",
  "indexCache.programmes=core.programmeFolders(collection,g,win.IPTVGuide",
  "folder.dataset.programmeTopic=key","toLocaleString('vi-VN'",
  "programmeFolders:()=>indexed('programmes',channels())"])
  assert.ok(s.includes(token),token);
 assert.ok(qa.includes('positron-p51273-epg-programmes-before-1920x1080-real.png'));
 assert.ok(qa.includes('positron-p51273-epg-programmes-after-1920x1080-real.png'));
});

test('P274 tìm chương trình XMLTV không dấu và khử trùng đa nhãn',()=>{
 const ch=[mk('a','VTV Thể thao'),mk('b','Kênh Giáo dục')],g={programmes:[{id:'fixture'}]};
 const api={find:(_g,c)=>c.id==='a'?[{title:'Bản tin thời sự và Trực tiếp bóng đá',start:now+60000,end:now+3600000}]
 :[{title:'Khoa học và giáo dục',start:now+120000,end:now+3600000}]};
 const before=JSON.stringify(ch),catalog=C.programmeFolders(ch,g,api,{clock:now});
 assert.equal(C.searchProgrammes(catalog,'BONG DA').total,1);
 assert.equal(C.searchProgrammes(catalog,'BONG DA').items[0].channel.id,'a');
 assert.equal(C.searchProgrammes(catalog,'the thao').total,1);
 assert.equal(C.searchProgrammes(catalog,'khoa hoc giao duc').items[0].channel.id,'b');
 assert.equal(C.searchProgrammes(catalog,'khong co').total,0);
 assert.equal(C.searchProgrammes(catalog,'').total,0);
 assert.equal(JSON.stringify(ch),before);
});
test('P274 tìm kiếm EPG giữ focus và ảnh Electron',()=>{
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const t of ['poAIProgrammeSearch','core.searchProgrammes(catalog,programmeQuery','programmeQuery=search.value.slice(0,160);paint()'])assert.ok(ui.includes(t),t);
 assert.ok(qa.includes('positron-p51274-programme-search-before-1920x1080-real.png'));
 assert.ok(qa.includes('positron-p51274-programme-search-after-1920x1080-real.png'));
});

test('P275 chỉ mục EPG tái sử dụng cùng dữ liệu và có quét lại thủ công',()=>{
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['channelSignature','guideSignature','indexCache.key!==key',
  'indexCache.programmeScans++','indexCache.folderScans++','scanTools()',
  "btn.textContent='Quét lại EPG'",'previousOpen=new Map',
  'programmeFolders:()=>indexed',"scanStats:()=>({folderScans"])
  assert.ok(ui.includes(token),token);
 assert.ok(qa.includes('positron-p51275-index-before-1920x1080-real.png'));
 assert.ok(qa.includes('positron-p51275-index-after-1920x1080-real.png'));
});

test('P276 WatchFlow quản lý 3 mô hình có trọng số và xóa riêng an toàn',()=>{
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const s of ['poAIModelManager','poAIModelRows','poAIModelStatus','learnedInventory',
  'Tiêu chuẩn · Gợi ý sở thích (Logistic ML)','Smart · Phân loại chủ đề (Naive Bayes)',
  'Smart · Khám phá (UCB)',"bulk.addEventListener('click'",
  "if(item.id==='category'){categoryModel=core.emptyCategoryModel();taughtIds.clear();activeStatusMessage='';lastActiveTeachUndo=null;}",
  'modelInventory:()=>learnedInventory()'])assert.ok(ui.includes(s),s);
 assert.ok(!ui.includes("win.confirm('Xóa toàn bộ trọng số"));
 assert.ok(ui.includes('modelManager.hidden=true;')&&ui.includes('area.append(title,controls,alertRow,modeBar,summary,list,privacy,modelManager)'),
  'P269 and P271 core navigation remains above optional manager');
 assert.ok(css.includes('.po-ai-model-row button:focus-visible'));
 for(const name of ['positron-p51276-model-manager-before-1920x1080-real.png',
  'positron-p51276-model-manager-after-1920x1080-real.png'])assert.ok(qa.includes(name));
});

// P277: epistemic uncertainty, NOT fabricated channel categories.
test('P277 ưu tiên học chủ động các kênh EPG chưa phân loại, giữ nguyên danh sách',()=>{
 let model=C.emptyCategoryModel();
 model=C.teachCategory(model,{name:'Atlas Academy Alpha'},'education');
 model=C.teachCategory(model,{name:'Business Daily Report'},'news');
 const items=[
  {channel:mk('academy','Atlas Academy Beta'),topic:{source:'other'}},
  {channel:mk('community','Community Local One'),topic:{source:'other'}},
  {channel:mk('business','Business Local One'),topic:{source:'other'}}
 ];
 const snapshot=JSON.stringify(items);
 const ranked=C.rankUnclassified(items,model,{limit:3});
 assert.ok(ranked.length===3,'only eligible local channels should be candidates');
 assert.ok(ranked.every(r=>r.priority>=0&&r.priority<=105&&r.channel?.id));
 assert.equal(C.rankUnclassified(items,model,{limit:1}).length,1);
 assert.ok(!C.rankUnclassified(items,model,{limit:3,excludeIds:['academy']}).some(r=>r.channel.id==='academy'));
 assert.deepEqual(C.rankUnclassified(null,model),[]);
 assert.equal(JSON.stringify(items),snapshot,'never change actual M3U or EPG data');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 for(const token of ['poAIActiveLearning','poAIActiveStatus','poAIActiveSelect',
  'rankUnclassified(items,categoryModel','taughtIds:[...taughtIds].slice(-1000)',
  'categoryModel=core.teachCategory(categoryModel,suggestion.channel,select.value)'])assert.ok(ui.includes(token),token);
 assert.ok(css.includes('.po-ai-active-row select:focus-visible'));
 for(const image of ['positron-p51277-active-teach-before-1920x1080-real.png',
  'positron-p51277-active-teach-after-1920x1080-real.png'])assert.ok(qa.includes(image),image);
});

test('P278 AI hướng dẫn từng kênh, Bỏ qua không thay đổi trọng số',()=>{
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['activeTeachIndex=0','poAIActiveProgress','poAIActiveSkip',
  'sessionSkippedIds.add(String(suggestion.channel.id)',
  'folder.append(trainer)','po-ai-folder-raw','po-ai-active-controls'])
  assert.ok(ui.includes(token),token);
 assert.ok(!ui.includes('candidates.forEach((suggestion,index)=>'),'only one suggested channel at a time');
 const start=ui.indexOf("skip.addEventListener('click'");
 const skip=ui.slice(start,start+300);
 assert.ok(start>=0&&!skip.includes('save(')&&!skip.includes('teachCategory'),'skip must not train or persist');
 assert.ok(css.includes('#poWatchFlowPanel .po-ai-folder-raw>summary'));
 for(const image of ['positron-p51278-guided-ai-before-1920x1080-real.png',
  'positron-p51278-guided-ai-after-1920x1080-real.png'])assert.ok(qa.includes(image),image);
});

test('P279 giữ trạng thái mở danh sách con sau mỗi lần render',()=>{
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ["const disclosureKey=el=>","el.classList.contains('po-ai-folder-raw')",
  "return 'raw:'+(parent?.dataset.topic||'')","details.po-ai-folder, details.po-ai-folder-raw",
  "if(previousOpen.has(key))el.open=previousOpen.get(key)"])
   assert.ok(ui.includes(token),token);
 for(const name of ['positron-p51279-folders-persist-before-1920x1080-real.png',
  'positron-p51279-folders-persist-after-1920x1080-real.png','rawOpen:raw?.open===true'])
  assert.ok(qa.includes(name),name);
});

// P280: skip uncertainty-ranked channels beyond the old five-item loop.
test('P280 hàng đợi AI qua hơn năm kênh, có hoàn tác bỏ qua trong phiên',()=>{
 const items=Array.from({length:15},(_,i)=>({
  channel:mk('queue-'+i,'Atlas Unsorted Channel '+String(i).padStart(2,'0')),
  topic:{source:'other'}
 }));
 const original=JSON.stringify(items),model=C.emptyCategoryModel(),excluded=[],seen=new Set();
 for(let i=0;i<8;i++){
  const next=C.rankUnclassified(items,model,{limit:5,excludeIds:excluded})[0];
  assert.ok(next,'next unknown channel available beyond original group of five');
  assert.ok(!seen.has(next.channel.id),'no repeated skipped channel');
  seen.add(next.channel.id);excluded.push(next.channel.id);
 }
 assert.equal(seen.size,8);
 assert.ok(C.rankUnclassified(items,model,{limit:5,excludeIds:excluded})
  .every(row=>!seen.has(row.channel.id)));
 assert.equal(JSON.stringify(items),original,'playlist unchanged');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['sessionSkippedIds=new Set()','excludeIds:[...taughtIds,...sessionSkippedIds]',
  'sessionSkippedIds.add(String(suggestion.channel.id)','sessionSkippedIds.clear()',
  'poAIActiveResetSkips','đã bỏ qua trong phiên'])assert.ok(ui.includes(token),token);
 const skip=ui.slice(ui.indexOf("skip.addEventListener('click'"),ui.indexOf("actions.append(select,teach,skip)"));
 assert.ok(!skip.includes('save(')&&!skip.includes('teachCategory('),'skip never trains or persists');
 for(const name of ['positron-p51280-active-queue-before-1920x1080-real.png',
  'positron-p51280-active-queue-after-1920x1080-real.png'])assert.ok(qa.includes(name),name);
});

// P281: safe one-step rollback of a supervised Naive Bayes label.
test('P281 hoàn tác một nhãn AI, giữ nguyên trọng số học trước',()=>{
 const previous=C.teachCategory(C.emptyCategoryModel(),mk('old-news','Business Daily Report'),'news');
 const before=C.sanitizedCategoryModel(previous);
 const trained=C.teachCategory(before,mk('new-education','Atlas Academy Alpha'),'education');
 assert.equal(trained.examples,before.examples+1);
 assert.deepEqual(C.sanitizedCategoryModel(before),previous,'old labels intact');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['lastActiveTeachUndo=null','previousModel=core.sanitizedCategoryModel(categoryModel)',
  'previousTaughtIds=[...taughtIds]','poAIActiveUndoLabel',
  'categoryModel=core.sanitizedCategoryModel(previous.model)',
  'taughtIds.clear();for(const id of previous.taughtIds)taughtIds.add(id)',
  'lastActiveTeachUndo={model:previousModel,taughtIds:previousTaughtIds'])
   assert.ok(ui.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel #poAIActiveUndoLabel:focus-visible'));
 for(const png of ['positron-p51281-undo-ai-before-1920x1080-real.png',
  'positron-p51281-undo-ai-after-1920x1080-real.png',
  'positron-p51281-undo-ai-restored-1920x1080-real.png'])
   assert.ok(qa.includes(png),png);
});

// P282: transparent local learned-word evidence, never implied web certainty.
test('P282 giải thích từ khóa đã học và từ chối đoán khi không có chứng cứ',()=>{
 let model=C.emptyCategoryModel();
 model=C.teachCategory(model,mk('edu-1','Atlas Academy Alpha'),'education');
 model=C.teachCategory(model,mk('edu-2','Atlas Academy Omega'),'education');
 model=C.teachCategory(model,mk('news-1','Business Daily Report'),'news');
 const before=JSON.stringify(model);
 const known=C.explainCategory(model,{name:'Atlas Academy Beta',group:'Tổng hợp',url:'https://secrets.invalid/private-token'});
 assert.equal(known.examples,3);
 assert.equal(known.kinds,2);
 assert.ok(known.matches.includes('academy'));
 assert.equal(known.prediction?.key,'education');
 assert.ok(known.prediction.confidence>=55&&known.prediction.confidence<=100);
 assert.ok(!JSON.stringify(known).includes('private-token'),'never leak stream URL');
 const unknown=C.explainCategory(model,{name:'QZX Unrelated Mystery',group:'Tổng hợp'});
 assert.deepEqual(unknown.matches,[]);
 assert.equal(unknown.prediction,null,'never infer from generic group overlap alone');
 assert.equal(C.explainCategory(C.emptyCategoryModel(),{name:'Academy'}).prediction,null);
 assert.equal(JSON.stringify(model),before,'no learning from explanation clicks');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['core.explainCategory(categoryModel,suggestion.channel)',
  'poAIActiveExplain','explanation.matches','explanation.prediction',
  'AI dựa vào đâu để gợi ý?'])assert.ok(ui.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel #poAIActiveExplain summary:focus-visible'));
 for(const name of ['positron-p51282-ai-explanation-before-1920x1080-real.png',
  'positron-p51282-ai-explanation-after-1920x1080-real.png'])
  assert.ok(qa.includes(name),name);
});

// P283: label diversity and imbalance are computed from local supervised data.
test('P283 sức khỏe dữ liệu AI nhận diện thiếu chủ đề và lệch mẫu',()=>{
 const empty=C.categoryLearningHealth(C.emptyCategoryModel());
 assert.equal(empty.examples,0);assert.equal(empty.covered,0);
 assert.equal(empty.total,9);assert.equal(empty.concentrated,0);
 assert.equal(empty.missing.length,3);assert.equal(empty.dominant,null);
 let model=C.teachCategory(C.emptyCategoryModel(),mk('a','Business Daily'),'news');
 const one=C.categoryLearningHealth(model);
 assert.equal(one.examples,1);assert.equal(one.covered,1);
 assert.equal(one.dominant,'news');assert.equal(one.concentrated,100);
 assert.ok(one.advice.includes('một chủ đề'));
 model=C.teachCategory(model,mk('b','Atlas Academy'),'education');
 const balanced=C.categoryLearningHealth(model);
 assert.equal(balanced.covered,2);assert.equal(balanced.concentrated,50);
 for(let i=0;i<3;i++)model=C.teachCategory(model,mk('news'+i,'World Business News '+i),'news');
 const before=JSON.stringify(model);
 const skewed=C.categoryLearningHealth(model);
 assert.equal(skewed.examples,5);assert.equal(skewed.covered,2);
 assert.equal(skewed.dominant,'news');assert.equal(skewed.concentrated,80);
 assert.ok(skewed.advice.includes('Mẫu học lệch'));
 assert.ok(!JSON.stringify(skewed).includes('http')&&!JSON.stringify(skewed).includes('m3u8'));
 assert.equal(JSON.stringify(model),before,'health inspection never changes learned weights');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8'),
  css=fs.readFileSync('renderer/positron-intelligence.css','utf8'),
  qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['core.categoryLearningHealth(categoryModel)','poAIActiveHealth',
  'Độ phủ dữ liệu AI','Số chủ đề đã có nhãn AI','Chủ đề chưa có ví dụ'])
  assert.ok(ui.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel #poAIActiveHealth progress::-webkit-progress-value'));
 for(const name of ['positron-p51283-ai-training-health-before-1920x1080-real.png',
  'positron-p51283-ai-training-health-after-1920x1080-real.png'])
  assert.ok(qa.includes(name),name);
});

test('P284 sao lưu các mô hình AI không bao gồm dữ liệu kênh và URL',()=>{
 const ch={id:'secret-channel-01',name:'Atlas Academy',url:'https://example.invalid/private/secret-token.m3u8'};
 const category=C.teachCategory(C.emptyCategoryModel(),ch,'education');
 const model=C.learn(C.emptyModel(),{bias:1,'topic:education':1},1);
 const bandit=C.observeBandit({},'education');
 const raw={model,categoryModel:category,bandit,taughtIds:[ch.id],playlist:[ch],history:[ch]};
 const before=JSON.stringify(raw),b=C.buildLearningBackup(raw),json=JSON.stringify(b);
 assert.equal(b.schemaVersion,1);assert.equal(b.format,'open-iptv-positron-ai-weights');
 assert.equal(b.summary.preferenceObservations,1);assert.equal(b.summary.categoryLabels,1);
 for(const priv of [ch.id,ch.url,'secret-token','playlist','history','taughtIds'])
  assert.ok(!json.includes(priv),'must exclude '+priv);
 assert.equal(before,JSON.stringify(raw));
 assert.deepEqual(C.buildLearningBackup(null).summary,
  {preferenceObservations:0,categoryLabels:0,exploredTopics:0});
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const key of ['poAIBackup','core.buildLearningBackup({model,categoryModel,bandit})',
  "a.download='positron-ai-models-'"])assert.ok(ui.includes(key),key);
 assert.ok(css.includes('#poWatchFlowPanel .po-ai-backup:focus-visible'));
 for(const shot of ['positron-p51284-ai-backup-before-1920x1080-real.png',
  'positron-p51284-ai-backup-after-1920x1080-real.png'])assert.ok(qa.includes(shot),shot);
});

test('P285 khôi phục bản sao AI v1 có xem trước và chặn JSON giả mạo',()=>{
 const channel={name:'Science Documentary HD',id:'private-id',url:'https://private.invalid/url.m3u8'};
 let category=C.teachCategory(C.emptyCategoryModel(),channel,'documentary');
 category=C.teachCategory(category,{name:'Study Academy'},'education');
 const model=C.learn(C.emptyModel(),{'bias':1,'topic:education':1},1);
 const bandit=C.observeBandit({},'education');
 const exported=C.buildLearningBackup({model,categoryModel:category,bandit});
 const jsonBefore=JSON.stringify(exported),parsed=C.parseLearningBackup(exported);
 assert.equal(parsed.ok,true);
 assert.deepEqual(parsed.model,C.sanitizedModel(model));
 assert.deepEqual(parsed.categoryModel,C.sanitizedCategoryModel(category));
 assert.deepEqual(parsed.bandit,C.sanitizedBandit(bandit));
 assert.equal(parsed.summary.categoryLabels,2);
 assert.equal(JSON.stringify(exported),jsonBefore,'validation does not change original backup');
 const invalids=[
  null,{}, {...exported,schemaVersion:99},
  {...exported,playlist:[channel]},
  {...exported,summary:{...exported.summary,categoryLabels:9999}},
  {...exported,models:{...exported.models,preference:{version:0,observations:0,weights:{}}}},
  {...exported,models:{...exported.models,category:{version:1,examples:99,docs:{news:1},tokens:{news:{news:1}}}}},
  {...exported,models:{...exported.models,explore:{not_a_topic:1}}},
  {...exported,models:{...exported.models,preference:{...exported.models.preference,weights:JSON.parse('{"__proto__":1}')}}},
  {...exported,note:'x'.repeat(512100)}
 ];
 for(const payload of invalids){
  const result=C.parseLearningBackup(payload);
  assert.equal(result.ok,false,JSON.stringify(payload).slice(0,90));
  assert.ok(result.reason.length>10);
 }
 for(const str of [channel.id,channel.url,'private.invalid','playlist'])
  assert.ok(!JSON.stringify(parsed).includes(str),'no private '+str);
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8'),
  css=fs.readFileSync('renderer/positron-intelligence.css','utf8'),
  qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['poAIImport','poAIImportFile','poAIImportConfirm','pendingLearningImport',
  'file.size>512000','core.parseLearningBackup(raw)','Xem trước:','if(!save())'])
  assert.ok(ui.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel #poAIImportConfirm[hidden]'));
 for(const name of ['positron-p51285-ai-restore-before-1920x1080-real.png',
  'positron-p51285-ai-restore-after-1920x1080-real.png'])
  assert.ok(qa.includes(name),name);
});

test('P286 xem trước chênh lệch mẫu ba thuật toán AI, không thay trọng số',()=>{
 let currentCategory=C.emptyCategoryModel();
 currentCategory=C.teachCategory(currentCategory,{name:'Science Documentary'},'documentary');
 currentCategory=C.teachCategory(currentCategory,{name:'Study Academy'},'education');
 const currentLog=C.learn(C.emptyModel(),{bias:1,'topic:education':1},1);
 const currentBandit=C.observeBandit(C.observeBandit({},'education'),'documentary');
 const current={model:currentLog,categoryModel:currentCategory,bandit:currentBandit};
 const previous=JSON.stringify(current);
 const weak=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const loss=C.compareLearningBackup(current,C.parseLearningBackup(weak));
 assert.equal(loss.ok,true);
 assert.equal(loss.rows.length,3);
 assert.deepEqual(loss.rows.map(x=>x.delta),[-1,-2,-2]);
 assert.equal(loss.lossCount,3);
 assert.ok(loss.warning.includes('ít mẫu hơn'));
 assert.ok(loss.caution.includes('không chứng minh'));
 let betterCategory=C.teachCategory(currentCategory,{name:'News Daily Channel'},'news');
 const better=C.buildLearningBackup({model:currentLog,categoryModel:betterCategory,bandit:currentBandit});
 const gain=C.compareLearningBackup(current,better);
 assert.equal(gain.ok,true);assert.equal(gain.lossCount,0);
 assert.deepEqual(gain.rows.map(x=>x.delta),[0,1,0]);
 assert.equal(gain.gainCount,1);
 assert.equal(C.compareLearningBackup(current,{}).ok,false);
 assert.equal(JSON.stringify(current),previous,'preview must be read-only');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8'),
  css=fs.readFileSync('renderer/positron-intelligence.css','utf8'),
  qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['poAIImportPreview','poAIImportWarning',
  'core.compareLearningBackup({model,categoryModel,bandit},parsed)','po-ai-compare-loss',
  "comparison.warning+' '+comparison.caution"])
  assert.ok(ui.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel #poAIImportPreview[hidden]'));
 for(const image of ['positron-p51286-ai-compare-before-1920x1080-real.png',
  'positron-p51286-ai-compare-preview-1920x1080-real.png',
  'positron-p51286-ai-compare-after-1920x1080-real.png'])
  assert.ok(qa.includes(image),image);
});


test('P287 hoàn tác an toàn lần khôi phục mô hình AI gần nhất',()=>{
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['poAIUndoImport','lastImportUndo={previous,applied:importFingerprint()}','importFingerprint()!==lastImportUndo.applied',
  'model=previous.model;categoryModel=previous.categoryModel;bandit=previous.bandit',
  'Mô hình đã thay đổi sau lần khôi phục','Đã hoàn tác khôi phục AI'])assert.ok(ui.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel #poAIUndoImport[hidden]'));
 assert.ok(qa.includes('positron-p51287-ai-undo-before-1920x1080-real.png'));
 assert.ok(qa.includes('positron-p51287-ai-undo-after-1920x1080-real.png'));
 assert.ok(qa.includes('undoRestoresPreviousLearning'));
});


test('P288 dự báo thay đổi thứ hạng kênh theo trọng số Logistic ML khi nhập JSON',()=>{
 const channels=[
  {id:'sports',name:'Kênh Thể thao',group:'Tổng hợp',url:'https://private.invalid/secret-sport.m3u8',status:'alive'},
  {id:'news',name:'Kênh Tin tức',group:'Tổng hợp',url:'https://private.invalid/secret-news.m3u8',status:'alive'}
 ];
 const original=JSON.stringify(channels),clock=now,d=new Date(clock);
 let sports=C.emptyModel(),news=C.emptyModel();
 const sportFeature=C.features(channels[0],C.topicFor(channels[0],null,null,clock),d);
 const newsFeature=C.features(channels[1],C.topicFor(channels[1],null,null,clock),d);
 for(let i=0;i<12;i++){
  sports=C.learn(C.learn(sports,sportFeature,1),newsFeature,0);
  news=C.learn(C.learn(news,newsFeature,1),sportFeature,0);
 }
 const backup=C.buildLearningBackup({model:news,categoryModel:C.emptyCategoryModel(),bandit:{}});
 const serialized=JSON.stringify(backup),current={model:sports};
 const result=C.previewLearningImpact(current,backup,channels,null,null,{clock,limit:2});
 assert.equal(result.ok,true);
 assert.equal(result.before[0].name,'Kênh Thể thao');
 assert.equal(result.after[0].name,'Kênh Tin tức');
 assert.equal(result.changedPositions,2);
 assert.equal(result.trainedBefore,true);
 assert.equal(result.trainedAfter,true);
 assert.ok(result.caution.includes('không chứng minh độ chính xác'));
 assert.equal(JSON.stringify(channels),original,'never mutate playlist');
 assert.equal(JSON.stringify(backup),serialized,'preview must not mutate imported weights');
 assert.ok(!JSON.stringify(result).includes('secret-sport')&&!JSON.stringify(result).includes('private.invalid'));
 const cold=C.previewLearningImpact({model:C.emptyModel()},backup,channels,null,null,{clock,limit:2});
 assert.equal(cold.trainedBefore,false);
 assert.ok(cold.caution.includes('chưa đủ hai phản hồi'));
 assert.equal(C.previewLearningImpact(current,{},channels,null,null,{clock}).ok,false);
 assert.deepEqual(C.previewLearningImpact(current,backup,[],null,null,{clock}).before,[]);
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 assert.ok(ui.includes("core.previewLearningImpact({model},parsed,channels(),guide(),win.IPTVGuide"));
 assert.ok(ui.includes("forecast.id='poAIImportImpact'"));
 assert.ok(css.includes('#poWatchFlowPanel .po-ai-impact'));
 for(const name of ['positron-p51288-ai-ranking-before-1920x1080-real.png',
  'positron-p51288-ai-ranking-after-1920x1080-real.png'])assert.ok(qa.includes(name));
 assert.ok(qa.includes('bothRankingsVisible'));
});


test('P289 xem trước nhãn Naive Bayes sẽ thay đổi, không ghi dữ liệu',()=>{
 const movie={id:'movie',name:'Phim hành động mới',group:'Truyền hình',
  url:'https://private.invalid/secret-movie.m3u8',status:'alive'};
 const football={id:'sport',name:'Bóng đá thể thao',group:'Truyền hình',
  url:'https://private.invalid/secret-football.m3u8',status:'alive'};
 let before=C.emptyCategoryModel(),after=C.emptyCategoryModel();
 for(let i=0;i<8;i++){
  before=C.teachCategory(before,movie,'cinema');
  before=C.teachCategory(before,football,'sport');
  after=C.teachCategory(after,movie,'news');
  after=C.teachCategory(after,football,'sport');
 }
 const file=C.buildLearningBackup({model:C.emptyModel(),categoryModel:after,bandit:{}});
 const rows=[movie,football],snapshot=JSON.stringify(rows),backup=JSON.stringify(file);
 const report=C.previewCategoryImpact({categoryModel:before},file,rows,{limit:4});
 assert.equal(report.ok,true);
 assert.equal(report.scanned,2);
 assert.equal(report.changed,1);
 assert.equal(report.classifiedBefore,2);
 assert.equal(report.classifiedAfter,2);
 assert.deepEqual(report.differences.map(r=>[r.before,r.after]),[['Phim','Tin tức']]);
 assert.ok(report.caution.includes('không phải kết quả xem luồng'));
 assert.equal(JSON.stringify(rows),snapshot);
 assert.equal(JSON.stringify(file),backup);
 assert.ok(!JSON.stringify(report).includes('private.invalid'), 'no stream URLs in preview');
 assert.equal(C.previewCategoryImpact({categoryModel:before},{},rows).ok,false);
 assert.equal(C.previewCategoryImpact({categoryModel:before},file,[],{limit:2}).scanned,0);
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const token of ['core.previewCategoryImpact({categoryModel},parsed,channels()',
  "details.id='poAICategoryImpact'","details.className='po-ai-category-impact'"])
  assert.ok(ui.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel .po-ai-category-impact summary:focus-visible'));
 assert.ok(qa.includes('hasRealLabelChanges'));
 for(const name of ['positron-p51289-ai-category-before-1920x1080-real.png',
  'positron-p51289-ai-category-after-1920x1080-real.png'])
  assert.ok(qa.includes(name));
});

test('P290 confirmation remains visible when Naive Bayes preview expands',()=>{
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const script=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(css.includes('#poWatchFlowPanel #poAIImportConfirm:not([hidden])'));
 assert.ok(css.includes('position:sticky;bottom:8px'));
 assert.ok(css.includes('#poWatchFlowPanel #poAIImportConfirm[hidden]{display:none!important}'));
 for(const token of ['baselineClipped','confirmVisible','categoryStillOpen','playlistUntouched',
  'noAutoplay','positron-p51290-confirm-sticky-before-1920x1080-real.png',
  'positron-p51290-confirm-sticky-after-1920x1080-real.png'])assert.ok(script.includes(token),token);
});

test('P291 splits Naive Bayes topic swaps from confidence transitions',()=>{
 const movie=mk('movie-p291','Phim Điện Ảnh'),football=mk('sport-p291','Bóng Đá Trực Tiếp');
 let before=C.emptyCategoryModel(),after=C.emptyCategoryModel();
 for(let i=0;i<12;i++){
  before=C.teachCategory(before,movie,'cinema');
  before=C.teachCategory(before,football,'sport');
  after=C.teachCategory(after,movie,'news');
  after=C.teachCategory(after,football,'sport');
 }
 const channels=[movie,football],snapshot=JSON.stringify(channels);
 const afterFile=C.buildLearningBackup({model:C.emptyModel(),categoryModel:after,bandit:{}});
 const change=C.previewCategoryImpact({categoryModel:before},afterFile,channels);
 assert.equal(change.changed,1);assert.equal(change.relabeled,1);
 assert.equal(change.newlyClassified,0);assert.equal(change.becameUncertain,0);
 assert.equal(change.confidenceTransitions,0);
 const cold=C.previewCategoryImpact({categoryModel:C.emptyCategoryModel()},afterFile,channels);
 assert.equal(cold.changed,2);assert.equal(cold.relabeled,0);
 assert.equal(cold.newlyClassified,2);assert.equal(cold.becameUncertain,0);
 assert.equal(cold.confidenceTransitions,2);
 const emptyFile=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const loss=C.previewCategoryImpact({categoryModel:after},emptyFile,channels);
 assert.equal(loss.relabeled,0);assert.equal(loss.newlyClassified,0);
 assert.equal(loss.becameUncertain,2);assert.equal(loss.confidenceTransitions,2);
 for(const state of [change,cold,loss])assert.equal(state.changed,
  state.relabeled+state.newlyClassified+state.becameUncertain);
 assert.equal(JSON.stringify(channels),snapshot);
 assert.ok(!JSON.stringify(cold).includes('.m3u8'),'no URLs in preview');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("breakdown.id='poAICategoryBreakdown'"));
 assert.ok(ui.includes('categoryImpact.confidenceTransitions'));
 assert.ok(css.includes('#poWatchFlowPanel #poAICategoryBreakdown'));
 for(const x of ['qa291','positron-p51291-confidence-before-1920x1080-real.png',
  'positron-p51291-confidence-after-1920x1080-real.png'])assert.ok(qa.includes(x),x);
});

test('P292 warns only when a meaningful Naive Bayes coverage collapse is predicted locally',()=>{
 const movie={id:'p292-film',name:'Phim hành động mới',group:'Truyền hình'};
 const football={id:'p292-sport',name:'Bóng đá thể thao',group:'Truyền hình'};
 let learned=C.emptyCategoryModel();
 for(let i=0;i<10;i++){
  learned=C.teachCategory(learned,movie,'cinema');
  learned=C.teachCategory(learned,football,'sport');
 }
 const sample=Array.from({length:12},(_,i)=>({
  id:'sample-p292-'+i,name:i%2?football.name:movie.name,group:'Truyền hình'
 }));
 const emptyFile=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const modelFile=C.buildLearningBackup({model:C.emptyModel(),categoryModel:learned,bandit:{}});
 const before=JSON.stringify(sample);
 const drop=C.previewCategoryImpact({categoryModel:learned},emptyFile,sample);
 assert.equal(drop.ok,true);assert.equal(drop.coverageRisk,'high');
 assert.ok(drop.coverageBefore>=90);assert.equal(drop.coverageAfter,0);
 assert.ok(drop.coverageDropPoints>=90);
 assert.equal(drop.becameUncertain,12);
 const stable=C.previewCategoryImpact({categoryModel:learned},modelFile,sample);
 assert.equal(stable.coverageRisk,'normal');assert.equal(stable.coverageDropPoints,0);
 const gain=C.previewCategoryImpact({categoryModel:C.emptyCategoryModel()},modelFile,sample);
 assert.equal(gain.coverageRisk,'normal');assert.equal(gain.coverageDropPoints,0);
 assert.equal(JSON.stringify(sample),before);
 assert.ok(!JSON.stringify(drop).includes('.m3u8'));
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("risk.id='poAICategoryCoverageRisk'"));
 assert.ok(ui.includes("risk.setAttribute('role','alert')"));
 assert.ok(css.includes('#poWatchFlowPanel #poAICategoryCoverageRisk'));
 for(const x of ['qa292','positron-p51292-ai-risk-before-1920x1080-real.png',
  'positron-p51292-ai-risk-after-1920x1080-real.png'])assert.ok(qa.includes(x),x);
});

test('P293 stratified Naive Bayes import forecast covers groups beyond first 180',()=>{
 const sport={id:'p293-sport',name:'Bóng đá thể thao',group:'Thể thao'};
 const film={id:'p293-film',name:'Phim hành động',group:'Phim'};
 let learned=C.emptyCategoryModel();
 for(let i=0;i<12;i++){learned=C.teachCategory(learned,sport,'sport');learned=C.teachCategory(learned,film,'cinema');}
 const channels=[
  ...Array.from({length:220},(_,i)=>({id:'p293-news-'+i,name:'Bản tin '+i,group:'Tin tức'})),
  ...Array.from({length:20},(_,i)=>({...sport,id:'p293-sport-'+i})),
  ...Array.from({length:20},(_,i)=>({...film,id:'p293-film-'+i}))
 ];
 const saved=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const original=JSON.stringify(channels),model=JSON.stringify(learned);
 const first=C.previewCategoryImpact({categoryModel:learned},saved,channels);
 const broad=C.previewCategoryImpact({categoryModel:learned},saved,channels,{strategy:'balanced'});
 assert.equal(first.ok,true);assert.equal(broad.ok,true);
 assert.equal(first.scanned,180);assert.equal(broad.scanned,180);
 assert.equal(first.sampledGroups,1);assert.equal(broad.sampledGroups,3);
 assert.equal(broad.totalGroups,3);assert.equal(broad.sampling,'balanced');
 assert.equal(first.sampling,'head');
 assert.ok(broad.classifiedBefore>first.classifiedBefore,'later groups included in stratified sample');
 assert.equal(JSON.stringify(channels),original);assert.equal(JSON.stringify(learned),model);
 assert.ok(!JSON.stringify(broad).includes('.m3u8'));
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("diversity.id='poAICategoryBalancedSample'"));
 for(const token of ['qa293','positron-p51293-balanced-before-1920x1080-real.png',
  'positron-p51293-balanced-after-1920x1080-real.png'])assert.ok(qa.includes(token),token);
});

test('P294 flags disagreement between first 180 and group-balanced AI restore previews',()=>{
 const sport={id:'p294-sport',name:'Bóng đá thể thao',group:'Thể thao'};
 const film={id:'p294-film',name:'Phim hành động',group:'Phim'};
 let learned=C.emptyCategoryModel();
 for(let i=0;i<12;i++){learned=C.teachCategory(learned,sport,'sport');learned=C.teachCategory(learned,film,'cinema');}
 const channels=[
  ...Array.from({length:220},(_,i)=>({id:'news-'+i,name:'Bản tin '+i,group:'Tin tức'})),
  ...Array.from({length:20},(_,i)=>({...sport,id:'sport-'+i})),
  ...Array.from({length:20},(_,i)=>({...film,id:'film-'+i}))
 ];
 const saved=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const before=JSON.stringify(channels),weights=JSON.stringify(learned);
 const first=C.previewCategoryImpact({categoryModel:learned},saved,channels);
 const broad=C.previewCategoryImpact({categoryModel:learned},saved,channels,{strategy:'balanced'});
 const result=C.compareCategorySamples(first,broad);
 assert.equal(result.ok,true);assert.equal(result.divergent,true);
 assert.ok(result.beforeGap>=20);assert.ok(result.dropGap>=20);
 assert.equal(C.compareCategorySamples(broad,broad).divergent,false);
 assert.equal(C.compareCategorySamples(null,broad).ok,false);
 assert.equal(JSON.stringify(channels),before);assert.equal(JSON.stringify(learned),weights);
 assert.ok(!JSON.stringify(result).includes('https://'));
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const audit=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("cross.id='poAICategorySampleDisagreement'"));
 for(const q of ['qa294','positron-p51294-disagreement-before-1920x1080-real.png',
 'positron-p51294-disagreement-after-1920x1080-real.png'])assert.ok(audit.includes(q),q);
});

test('P295 previews top Naive Bayes group risk before restore without exposing URLs',()=>{
 const film={id:'f',name:'Phim hành động',group:'Phim',url:'https://private.invalid/secret.m3u8'};
 const sport={id:'s',name:'Bóng đá thể thao',group:'Thể thao',url:'https://private.invalid/secret.m3u8'};
 let model=C.emptyCategoryModel();
 for(let i=0;i<12;i++){model=C.teachCategory(model,film,'cinema');model=C.teachCategory(model,sport,'sport');}
 const channels=[...Array.from({length:12},(_,i)=>({...film,id:'film'+i})),
  ...Array.from({length:8},(_,i)=>({...sport,id:'sport'+i})),
  ...Array.from({length:5},(_,i)=>({id:'news'+i,name:'Bản tin',group:'Tin tức'}))];
 const file=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const before=JSON.stringify(channels),weights=JSON.stringify(model);
 const r=C.previewCategoryGroupRisks({categoryModel:model},file,channels,{limit:2});
 assert.equal(r.ok,true);assert.equal(r.scanned,25);assert.equal(r.totalGroups,3);
 assert.equal(r.groups.length,2);assert.equal(r.groups[0].label,'Phim');
 assert.ok(r.groups[0].lost>=10);assert.ok(r.groups[1].lost>=6);
 assert.ok(r.lostTotal>=18);
 assert.ok(!JSON.stringify(r).includes('https://')&&!JSON.stringify(r).includes('.m3u8'));
 assert.equal(JSON.stringify(channels),before);assert.equal(JSON.stringify(model),weights);
 assert.equal(C.previewCategoryGroupRisks({},null,channels).ok,false);
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("riskDetails.id='poAICategoryGroupRisks'"));
 for(const x of ['qa295','positron-p51295-group-risk-before-1920x1080-real.png',
  'positron-p51295-group-risk-after-1920x1080-real.png'])assert.ok(qa.includes(x),x);
});

test('P296 nested Naive Bayes disclosure avoids ambiguous selector and supports Enter',()=>{
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 assert.ok(qa.includes("page.locator('#poAICategoryImpact > summary').click"));
 assert.ok(!qa.includes("page.locator('#poAICategoryImpact summary').click"));
 assert.ok(qa.includes("page.locator('#poAICategoryGroupRisks > summary')"));
 assert.ok(qa.includes("await riskToggle296.press('Enter'"));
 for(const name of ['qa296','positron-p51296-risk-keyboard-before-1920x1080-real.png',
  'positron-p51296-risk-keyboard-after-1920x1080-real.png'])assert.ok(qa.includes(name));
 assert.ok(css.includes('#poWatchFlowPanel #poAICategoryGroupRisks > summary:focus-visible'));
});

test('P297 compares relative local Naive Bayes classification losses across groups',()=>{
 const film={id:'f',name:'Phim hành động',group:'Phim',url:'https://private.invalid/secret.m3u8'};
 const sport={id:'s',name:'Bóng đá thể thao',group:'Thể thao',url:'https://private.invalid/secret.m3u8'};
 let model=C.emptyCategoryModel();
 for(let i=0;i<12;i++){model=C.teachCategory(model,film,'cinema');model=C.teachCategory(model,sport,'sport');}
 const channels=[...Array.from({length:12},(_,i)=>({...film,id:'film'+i})),
  ...Array.from({length:8},(_,i)=>({...sport,id:'sport'+i})),
  ...Array.from({length:5},(_,i)=>({id:'news'+i,name:'Bản tin',group:'Tin tức'}))];
 const backup=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const original=JSON.stringify(channels),weights=JSON.stringify(model);
 const absolute=C.previewCategoryGroupRisks({categoryModel:model},backup,channels,{limit:5});
 const relative=C.previewCategoryGroupRisks({categoryModel:model},backup,channels,{limit:5,sortBy:'rate'});
 assert.equal(absolute.ok,true);assert.equal(relative.sortBy,'rate');assert.equal(absolute.sortBy,'count');
 assert.ok(absolute.groups.every(g=>g.lossRate===Math.round(g.lost*1000/g.count)/10));
 assert.ok(relative.groups.every((g,i,arr)=>i===0||arr[i-1].lossRate>=g.lossRate));
 assert.equal(relative.groups.length,3);
 assert.equal(JSON.stringify(channels),original);assert.equal(JSON.stringify(model),weights);
 assert.ok(!JSON.stringify(relative).includes('https://'));
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8'),qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("riskSort.id='poAICategoryRiskSort'"));
 assert.ok(ui.includes("sortBy:rateMode?'rate':'count'"));
 assert.ok(ui.includes("minGroupSize:hideSmall?5:1"));
 assert.ok(ui.includes("riskSort.addEventListener('click'"));
 for(const term of ['qa297','positron-p51297-group-rate-before-1920x1080-real.png',
 'positron-p51297-group-rate-after-1920x1080-real.png'])assert.ok(qa.includes(term));
});

test('P298 flags and filters small AI group samples without mutating model',()=>{
 const film={id:'f',name:'Phim hành động',group:'Phim',url:'https://private.invalid/secret.m3u8'};
 const sport={id:'s',name:'Bóng đá thể thao',group:'Thể thao',url:'https://private.invalid/secret.m3u8'};
 let model=C.emptyCategoryModel();
 for(let i=0;i<12;i++){model=C.teachCategory(model,film,'cinema');model=C.teachCategory(model,sport,'sport');}
 const channels=[...Array.from({length:12},(_,i)=>({...film,id:'film'+i})),
 ...Array.from({length:8},(_,i)=>({...sport,id:'sport'+i})),
 ...Array.from({length:5},(_,i)=>({id:'news'+i,name:'Bản tin',group:'Tin tức'}))];
 const json=C.buildLearningBackup({model:C.emptyModel(),categoryModel:C.emptyCategoryModel(),bandit:{}});
 const oldChannels=JSON.stringify(channels),oldModel=JSON.stringify(model);
 const full=C.previewCategoryGroupRisks({categoryModel:model},json,channels,{limit:5,sortBy:'rate'});
 const filtered=C.previewCategoryGroupRisks({categoryModel:model},json,channels,{limit:5,sortBy:'rate',minGroupSize:6});
 assert.equal(full.totalGroups,3);assert.equal(full.groups.length,3);
 assert.equal(filtered.groups.length,2);assert.equal(filtered.excludedSmallGroups,1);
 assert.equal(filtered.eligibleGroups,2);assert.equal(filtered.minGroupSize,6);
 assert.ok(filtered.groups.every(g=>g.count>=6));
 assert.equal(JSON.stringify(channels),oldChannels);assert.equal(JSON.stringify(model),oldModel);
 assert.ok(!JSON.stringify(filtered).includes('https://'));
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8'),qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 for(const x of ["riskSmall.id='poAICategorySampleFilter'","riskSmall.addEventListener('click'",
 "minGroupSize:hideSmall?5:1"])assert.ok(ui.includes(x),x);
 for(const x of ['qa298','positron-p51298-small-samples-before-1920x1080-real.png',
 'positron-p51298-small-samples-after-1920x1080-real.png'])assert.ok(qa.includes(x),x);
});
