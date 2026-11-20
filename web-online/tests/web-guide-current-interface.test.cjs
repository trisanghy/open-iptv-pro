'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const template=fs.readFileSync(path.join(root,'web-online/huong-dan.html'),'utf8');
const publicHtml=fs.readFileSync(path.join(root,'huong-dan.html'),'utf8');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const getIds=html=>[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
const getAnchors=html=>[...html.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);

test('guide follows the modern Web application design, not a desktop-only guide',()=>{
 for(const html of [template,publicHtml]){
  assert.match(html,/--bg:#080c18/);
  assert.match(html,/--accent:#a78bfa/);
  assert.match(html,/--mint:#5de1d1/);
  assert.match(html,/radial-gradient/);
  assert.match(html,/assets\/icon\.png/);
  assert.match(html,/class="guide-layout"/);
  assert.match(html,/class="site-header"/);
  assert.match(html,/class="mobile-tabs"/);
  assert.match(html,/viewport-fit=cover/);
  assert.match(html,/safe-area-inset-bottom/);
  assert.match(html,/prefers-reduced-motion/);
  assert.match(html,/href="\.\/"/);
  assert.match(html,/releases\/latest/);
  assert.doesNotMatch(html,/releases\/tag\/v4\.23\.70|Bản Desktop v4\.23\.70/);
 }
 assert.match(home,/-- not-used --|href="huong-dan\.html"|rel="help"/);
});
test('every same-page navigation anchor resolves and five mobile tabs mirror app',()=>{
 for(const html of [template,publicHtml]){
  const ids=getIds(html);
  assert.equal(ids.length,new Set(ids).size,'duplicate element ids');
  for(const anchor of getAnchors(html))assert.ok(ids.includes(anchor),'missing section '+anchor);
  const tabs=html.match(/<nav class="mobile-tabs"[\s\S]*?<\/nav>/)?.[0]||'';
  assert.equal((tabs.match(/<a href="#/g)||[]).length,5);
  for(const label of ['TV','Yêu thích','Lịch','Nguồn','Thêm'])assert.ok(tabs.includes('<span>'+label+'</span>'),label);
 }
});
test('guide documents current working Web features with platform caveats',()=>{
 for(const html of [template,publicHtml]){
  for(const feature of ['Vừa xem','Link phát','Auto Failover','XMLTV','PiP','AirPlay','Nghe nền','MultiView','Smart IPTV Doctor','Cloud Sync','Sống','Chưa rõ']){
   assert.ok(html.includes(feature),'missing feature: '+feature);
  }
  for(const guard of ['CORS','DRM','quyền truy cập','bản quyền','không phải ứng dụng iOS native']){
   assert.ok(html.toLowerCase().includes(guard.toLowerCase()),'missing caveat: '+guard);
  }
  assert.match(html,/Web Online/);
  assert.doesNotMatch(html,/Web có ghi hình DVR, Timeshift[\s\S]*?<p>\s*Có/i);
 }
});
test('template remains the untranslated source; published page retains 17-language runtime',()=>{
 assert.doesNotMatch(template,/id="guideLanguage"/);
 assert.match(publicHtml,/id="guideLanguage"/);
 assert.match(publicHtml,/id="guide-language-controller"/);
 assert.match(publicHtml,/src="guide-native-locales\.js\?v=[a-f0-9]{16}"/);
 for(const lang of ['vi','en','fr','de','es','pt-BR','zh-CN','ja','ko','th','id','ru','lo','km','it','hi','ar']){
  assert.ok(publicHtml.includes('<option value="'+lang+'">'),lang);
 }
 assert.match(publicHtml,/rel="canonical"/);
});

test('home palette replaces old saturated green and Safari only highlights one tab',()=>{
 for(const html of [template,publicHtml]){
  const css=html.split('<style>')[1].split('</style>')[0];
  assert.doesNotMatch(css,/#214534|#8cf0bc|#224837|#8cf1be|--bg:#080e15/);
  assert.match(css,/\.mobile-tabs a\.is-current\{background:#292442/);
  assert.match(css,/@media \(hover:hover\) and \(pointer:fine\)/);
  assert.doesNotMatch(css,/\.mobile-tabs a:hover,\.mobile-tabs a.is-current/);
  assert.match(html,/scheduleActive\(\)/);
 }
});
test('scroll tracking never keeps two guide mobile tabs selected',()=>{
 const script=publicHtml.match(/<script>\s*\(function\(\)\{[\s\S]*?<\/script>/)?.[0];
 assert.ok(script,'guide nav runtime missing');
 const ids=['bat-dau','nguon','tv','kenh','epg','mobile','cong-cu','cai-dat','su-co','faq'];
 const positions=ids.map((_,i)=>i<=2?50-i*250:800+i*300);
 const sections=ids.map((id,i)=>({id,getBoundingClientRect:()=>({top:positions[i]})}));
 const clicked=['tv','kenh','epg','nguon','faq'];
 const links=clicked.map(id=>({
  href:'#'+id,active:false,attrs:{},
  getAttribute(name){return name==='href'?this.href:this.attrs[name]},
  setAttribute(name,value){this.attrs[name]=value},
  removeAttribute(name){delete this.attrs[name]},
  classList:{toggle(name,on){this.parent.active=on}}
 }));
 for(const link of links)link.classList.parent=link;
 const listeners={};
 const document={querySelectorAll(q){return q.startsWith('.side')?links:sections}};
 const window={innerHeight:800,addEventListener(type,fn){listeners[type]=fn},requestAnimationFrame(fn){fn()}};
 vm.runInNewContext(script.slice(8,-9),{document,window},{timeout:1000});
 assert.deepEqual(links.filter(x=>x.active).map(x=>x.href),['#tv']);
 positions[2]=-450;positions[3]=95;
 listeners.scroll();
 assert.deepEqual(links.filter(x=>x.active).map(x=>x.href),['#kenh']);
 assert.equal(links.filter(x=>x.attrs['aria-current']==='location').length,1);
});
