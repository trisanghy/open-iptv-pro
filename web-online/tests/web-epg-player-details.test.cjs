'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const features=read('features.js'),html=read('index.html'),css=read('web-only.css');
const builder=read('web-online/prepare-web.py'),fullscreen=read('web-fullscreen-controls.js');
function player(current,now,next){
 const elements={};
 for(const id of ['#epgNowText','#epgNowName','#epgNowTime','#epgNextName','#epgNextTime','#epgNowDescription','#epgNextDescription'])
  elements[id]={textContent:'old',hidden:false,title:''};
 const start=features.indexOf(' function renderNow(){'),end=features.indexOf(' function renderEPG(){',start);
 assert.ok(start>=0&&end>start,'source contains renderNow');
 vm.runInNewContext(features.slice(start,end)+'\nrenderNow();',{
  guide:{},guideLib:{current:()=>({now,next})},ctx:{getCurrent:()=>current},
  $:id=>elements[id],today:ms=>new Date(ms).toISOString().slice(11,16)
 });
 return elements;
}
const start=Date.UTC(2026,10,20,1,0);
test('film episode name is displayed below generic title in live and next EPG rows',()=>{
 const e=player({name:'VTV5 Tây Nam Bộ'},
  {title:'Phim truyện',description:'Vùng đất hoang dã – Tập 30',start,end:start+2700000},
  {title:'Chương trình tiếng Khmer',description:'Phim truyền hình và văn hóa Khmer',start:start+2700000,end:start+7200000});
 assert.equal(e['#epgNowName'].textContent,'Phim truyện');
 assert.equal(e['#epgNowDescription'].textContent,'Vùng đất hoang dã – Tập 30');
 assert.equal(e['#epgNowDescription'].hidden,false);
 assert.equal(e['#epgNextDescription'].textContent,'Phim truyền hình và văn hóa Khmer');
 assert.equal(e['#epgNextDescription'].hidden,false);
 assert.match(e['#epgNowText'].textContent,/Vùng đất hoang dã – Tập 30/);
});
test('EPG parser enhanced title is not repeated twice under the player',()=>{
 const e=player({name:'VTV5 Tây Nam Bộ'},
  {title:'Phim truyện: Vùng đất hoang dã – Tập 30',description:'Vùng đất hoang dã – Tập 30',start,end:start+2700000},null);
 assert.equal(e['#epgNowName'].textContent,'Phim truyện');
 assert.equal(e['#epgNowDescription'].textContent,'Vùng đất hoang dã – Tập 30');
 assert.equal((e['#epgNowText'].textContent.match(/Vùng đất hoang dã/g)||[]).length,1);
});
test('missing, duplicated and stale EPG descriptions are hidden',()=>{
 const e=player({name:'VTV5'},{title:'Thời sự',description:' THỜI SỰ ',start,end:start+1000},null);
 assert.equal(e['#epgNowDescription'].hidden,true);
 assert.equal(e['#epgNextDescription'].hidden,true);
 const cleared=player(null,null,null);
 assert.equal(cleared['#epgNowDescription'].hidden,true);
 assert.equal(cleared['#epgNextDescription'].hidden,true);
 assert.equal(cleared['#epgNowName'].textContent,'Chưa chọn kênh');
});
test('source EPG values always use textContent, never executable HTML',()=>{
 const input='<img src=x onerror=alert(1)>';
 const e=player({name:'VTV5'},{title:'Phim truyện',description:input,start,end:start+1000},null);
 assert.equal(e['#epgNowDescription'].textContent,input);
 assert.doesNotMatch(features.slice(features.indexOf(' function renderNow(){'),features.indexOf(' function renderEPG(){')),/innerHTML|insertAdjacentHTML/);
});
test('fullscreen EPG uses the same real programme description',()=>{
 const api=require('../../web-fullscreen-controls.js'),ch={id:'vtv5'},guide={};
 const items=api.epgItems(guide,ch,start+10000,{find:()=>[{start,end:start+2700000,title:'Phim truyện',description:'Vùng đất hoang dã – Tập 30'}]});
 assert.equal(items[0].description,'Vùng đất hoang dã – Tập 30');
 assert.match(fullscreen,/detail\.textContent=x\.description/);
 assert.match(fullscreen,/row\.append\(time,copy\)/);
 assert.match(read('web-fullscreen-controls.css'),/\.fs-epg-description/);
});
test('Web builder retains player description, two rows and versioned CSS/JS after regeneration',()=>{
 for(const type of ['Now','Next']){
  assert.equal(html.split('id="epg'+type+'Description"').length,2);
  assert.equal(html.split('id="epg'+type+'Name"').length,2);
 }
 assert.match(css,/\.epg-program-description\[hidden\]\s*\{display:none!important\}/);
 assert.match(css,/-webkit-line-clamp:2/);
 assert.match(builder,/epg_now_start=' function renderNow\(\)\{'/);
 assert.match(builder,/web_features\[web_features\.index\(epg_now_start\):web_features\.index\(epg_now_end\)\]/);
 for(const asset of ['features.js','web-only.css','web-fullscreen-controls.js','web-fullscreen-controls.css']){
  const url=asset+'?v=epg-player-details-20261120a';
  assert.ok(html.includes(url),url);
  assert.ok(builder.includes(url),url+' in build');
 }
 assert.match(read('epg.js'),/const description=firstText\(p,'desc'\)/);
});
