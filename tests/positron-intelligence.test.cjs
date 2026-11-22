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
test('WatchFlow 6 chế độ trong một thanh, không chèn nhãn hay phá thứ tự bàn phím',()=>{
 const css=fs.readFileSync('renderer/positron-intelligence.css','utf8');
 const ui=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(css.includes('repeat(6,minmax(0,1fr))'));
 assert.ok(css.includes('overflow-x:auto!important'));
 assert.ok(ui.includes('toolbar.append(tab)'));
 assert.ok(!ui.includes('toolbar.after(aiSlot)'));
 assert.ok(ui.includes("tab.textContent='✦ AI'"));
 assert.ok(qa.includes('a.length===6&&a.every'));
 assert.ok(qa.includes('navNoTruncatedLabels'));
 assert.ok(qa.includes('aiModeVisible'));
});
