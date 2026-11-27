'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ai=require('../renderer/desktop-channel-intelligence.js'),search=require('../renderer/web-channel-search.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Web Bayes classifies channels and recommends from real favorites/history',()=>{
 const channels=[{id:'1',name:'HBO',group:'Phim'},{id:'2',name:'VTV1',group:'Tin tức'},{id:'3',name:'K+ Sport',group:'Thể thao'}];
 const result=ai.analyse(channels,{favorites:[channels[0]],recentIds:['1']});
 assert.equal(result.byId.get('1').category,'Phim');assert.equal(result.byId.get('2').category,'Tin tức');assert.equal(result.byId.get('3').category,'Thể thao');
 assert.equal(result.recommended[0].channel.id,'1');
 assert.deepEqual(ai.filterRows(result.classified,{selected:'Phim'}).rows.map(r=>r.channel.id),['1']);
 assert.equal(ai.analyse(channels).coldStart,true);
 assert.equal(ai.filterRows(result.classified,{query:'tin tuc',engine:search}).rows[0].channel.id,'2');
});
test('desktop mounts native AI tabs and sidebar shortcuts, no nested result scroller',()=>{
 const html=read('renderer/index.html'),source=read('renderer/desktop-channel-intelligence.js'),css=read('renderer/desktop-channel-intelligence.css');
 assert.match(html,/desktop-channel-intelligence\.js/);assert.match(html,/desktop-channel-intelligence\.css/);
 assert.match(source,/Phân loại kênh/);assert.match(source,/Kênh gợi ý/);assert.match(source,/desktopAiShortcut/);
 assert.match(source,/renderSerial/);assert.match(source,/OpenIPTVRecentChannels/);
 assert.doesNotMatch(css,/\.web-ai-grid\s*\{[^}]*overflow-y:auto/);
 assert.doesNotMatch(html,/video-(?:enhancement|gpu-manager)[^"]+\.(?:js|css)/);
});
test('EPG subtitle retained and detail line safely written as text',()=>{
 const html=read('renderer/index.html'),epg=read('renderer/epg.js'),f=read('renderer/features.js');
 assert.match(epg,/title,description,subtitle/);assert.match(html,/id="epgNowDescription"/);assert.match(html,/id="epgNextDescription"/);
 assert.match(f,/desc\.textContent=data\.detail/);assert.match(f,/desc\.hidden=!data\.detail/);assert.match(f,/renderLiveProgress\(now,clock\)/);
});
