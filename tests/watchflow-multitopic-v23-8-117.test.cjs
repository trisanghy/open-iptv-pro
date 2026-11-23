'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const topics=require('../renderer/watchflow-topic-catalog-v23-8-117.js');
const engine=require('../renderer/watchflow-intelligence-v23-8-105.js');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const qwen=require('../renderer/watchflow-qwen-native-v23-8-111.js');
const sample=[
 {id:'s1',name:'An Ninh TV HD (1080p)'},
 {id:'s2',name:'Asian Food Network Vietnam (1080p)'},
 {id:'s3',name:'Binh Thuan TV (1080p) [Geo-blocked]'},
 {id:'s4',name:'Ca Mau TV (720p) [Geo-blocked]'},
 {id:'s5',name:'Can Tho TV 2 (1080p)'},
 {id:'s6',name:'Cao Bang TV (720p)'}
];
test('Named real channels map to grounded MULTIPLE folders; Food Network not kids',()=>{
 assert.deepEqual(topics.channelLabels(sample[0]),['Pháp luật','Tin tức']);
 assert.deepEqual(topics.channelLabels(sample[1]),['Ẩm thực','Phong cách sống']);
 for(const channel of sample.slice(2))assert.ok(topics.channelLabels(channel).includes('Địa phương'));
 const map=engine.analyze(sample,null,null);
 const food=map.get('s2');
 assert.equal(food.label,'Ẩm thực');assert.ok(food.labels.includes('Ẩm thực'));
 assert.ok(!food.labels.includes('Thiếu nhi'),'False positive children classification rejected');
 const groups=new Map(topics.folders(sample,map));
 assert.equal(groups.get('Địa phương').length,4);
 assert.ok(groups.get('Ẩm thực').some(c=>c.id==='s2'));
 assert.ok(groups.get('Phong cách sống').some(c=>c.id==='s2'));
 assert.ok(groups.get('Tin tức').some(c=>c.id==='s1'));
});
test('EPG individual programmes get their own multi-label category and channel can join several folders',()=>{
 const clock=Date.UTC(2026,10,23,8,0,0),channels=[{id:'c',name:'Can Tho TV'}];
 const rows=[
  {start:clock-10000,end:clock+500000,title:'Tin tức kinh tế và tài chính'},
  {start:clock+500000,end:clock+1000000,title:'Chương trình ẩm thực du lịch miền Tây'},
  {start:clock+1000000,end:clock+1500000,title:'Học ngoại ngữ cho trẻ em'}
 ];
 const analysis=engine.analyze(channels,{programmes:rows},{find:()=>rows},clock);
 const channel=analysis.get('c');
 assert.equal(channel.epgCount,3);assert.equal(channel.programmes.length,3);
 assert.ok(channel.labels.includes('Địa phương'));
 assert.ok(channel.labels.includes('Tin tức'));assert.ok(channel.labels.includes('Ẩm thực'));
 assert.deepEqual(channel.programmes[0].labels,['Tin tức','Kinh tế']);
 assert.ok(channel.programmes[1].labels.includes('Ẩm thực'));
 assert.ok(channel.programmes[2].labels.includes('Giáo dục'));
 const results=topics.programmes(analysis,clock);
 assert.equal(results.length,3);assert.ok(results.every(p=>p.channelId==='c'));
});
test('Online lookup prioritizes unresolved names, removes geo/resolution, never includes stream URL',async()=>{
 const channels=[{id:'a',name:'Unknown Channel (1080p) [Geo-blocked]',url:'https://private.test/master.m3u8'},
  {id:'b',name:'Asian Food Network (1080p)'}],calls=[];
 const mem=new Map(),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
 const classified=new Map([['a',{label:'Chưa phân loại',labels:[]}],['b',{label:'Ẩm thực',labels:['Ẩm thực']}]]);
 await auto.scan({storage,channels,analysis:classified,engine,lookup:async name=>{
  calls.push(name);return[];},clock:()=>Date.UTC(2026,10,23),budget:2});
 assert.equal(auto.publicName(channels[0].name),'Unknown Channel');
 assert.equal(calls[0],'unknown channel');
 assert.ok(!calls.join(' ').includes('private.test'));
});
test('Verified Wikidata adds category without replacing EPG or dropping other labels',()=>{
 const mem=new Map(),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
 const data=auto.read(storage),now=Date.now();
 data.queries['can tho tv']={at:now,items:[{name:'Can Tho TV',description:'Vietnamese news television channel',url:'https://www.wikidata.org/wiki/Q100'}]};
 storage.setItem(auto.KEY,JSON.stringify(data));
 const channel={id:'c',name:'Can Tho TV'};
 const prior=new Map([['c',{label:'Địa phương',labels:['Địa phương','Truyền hình tổng hợp'],confidence:85,from:'Tên/nhóm'}]]);
 const enriched=auto.enrich(prior,[channel],storage,engine).get('c');
 assert.ok(enriched.labels.includes('Tin tức'));assert.ok(enriched.labels.includes('Địa phương'));
 const epg=new Map([['c',{label:'Phim truyện',labels:['Phim truyện'],confidence:85,from:'EPG'}]]);
 assert.equal(auto.enrich(epg,[channel],storage,engine).get('c').label,'Phim truyện');
});
test('Qwen auto-classification has no 8 channel ceiling, understands multi-label result and never sends URLs',()=>{
 assert.deepEqual(qwen.labelsFrom({label:'Ẩm thực',labels:['Ẩm thực','Phong cách sống']}),['Ẩm thực','Phong cách sống']);
 assert.equal(qwen.select('auto',{qwen17:{installed:true,runtimeReady:true}}),'qwen17');
 const s=fs.readFileSync('renderer/watchflow-qwen-native-v23-8-111.js','utf8');
 assert.doesNotMatch(s,/slice\(0,8\)/);
 assert.match(s,/const ordered=\[\.\.\.all\]/);
 assert.match(s,/mode\(\)!=='intelligence'/);
 assert.doesNotMatch(qwen.metadata({name:'Secret IPTV',url:'https://private.test/hls.m3u8'},null,null),/private\.test/);
});
test('Native MLX accepts structured multiple Vietnamese categories; original translation retained',()=>{
 const py=fs.readFileSync('src-tauri/resources/hymt_bridge.py','utf8');
 const rs=fs.readFileSync('src-tauri/src/local_ai/mlx_ai.rs','utf8');
 const wrap=fs.readFileSync('src-tauri/src/local_ai.rs','utf8');
 assert.match(py,/JSON ARRAY/);assert.match(py,/if req\.get\("task"\) == "watchflow-classify"/);
 assert.match(rs,/Vec<String>/);assert.match(wrap,/"labels":labels/);
 assert.match(py,/source, target = req\.get/);
});
test('UI exposes multi-channel virtual topic folders and programme directory, no source edits',()=>{
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 const html=fs.readFileSync('renderer/index.html','utf8');
 assert.match(ui,/data-wf-tab="folders"/);assert.match(ui,/data-wf-tab="programmes"/);
 assert.match(ui,/topicCatalog\?\.folders\(d\.channels,analysis\)/);
 assert.match(ui,/topicCatalog\?\.programmes\(analysis\)/);
 assert.match(ui,/wf-topic-folder/);
 assert.ok(html.indexOf('watchflow-topic-catalog-v23-8-117.js')<html.indexOf('watchflow-intelligence-v23-8-105.js'));
});
