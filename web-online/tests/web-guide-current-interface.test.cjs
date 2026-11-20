'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const template=fs.readFileSync(path.join(root,'web-online/huong-dan.html'),'utf8');
const publicHtml=fs.readFileSync(path.join(root,'huong-dan.html'),'utf8');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const getIds=html=>[...html.matchAll(/\\sid="([^"]+)"/g)].map(m=>m[1]);
const getAnchors=html=>[...html.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);

test('guide follows the modern Web application design, not a desktop-only guide',()=>{
 for(const html of [template,publicHtml]){
  assert.match(html,/--bg:#080e15/);
  assert.match(html,/--accent:#bc7cff/);
  assert.match(html,/assets\\/icon\\.png/);
  assert.match(html,/class="guide-layout"/);
  assert.match(html,/class="site-header"/);
  assert.match(html,/class="mobile-tabs"/);
  assert.match(html,/viewport-fit=cover/);
  assert.match(html,/safe-area-inset-bottom/);
  assert.match(html,/prefers-reduced-motion/);
  assert.match(html,/href="\\.\\/"/);
  assert.match(html,/releases\\/latest/);
  assert.doesNotMatch(html,/releases\\/tag\\/v4\\.23\\.70|Bản Desktop v4\\.23\\.70/);
 }
 assert.match(home,/-- not-used --|href="huong-dan\\.html"|rel="help"/);
});
test('every same-page navigation anchor resolves and five mobile tabs mirror app',()=>{
 for(const html of [template,publicHtml]){
  const ids=getIds(html);
  assert.equal(ids.length,new Set(ids).size,'duplicate element ids');
  for(const anchor of getAnchors(html))assert.ok(ids.includes(anchor),'missing section '+anchor);
  const tabs=html.match(/<nav class="mobile-tabs"[\\s\\S]*?<\\/nav>/)?.[0]||'';
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
  assert.doesNotMatch(html,/Web có ghi hình DVR, Timeshift[\\s\\S]*?<p>\\s*Có/i);
 }
});
test('template remains the untranslated source; published page retains 17-language runtime',()=>{
 assert.doesNotMatch(template,/id="guideLanguage"/);
 assert.match(publicHtml,/id="guideLanguage"/);
 assert.match(publicHtml,/id="guide-language-controller"/);
 assert.match(publicHtml,/src="guide-native-locales\\.js\\?v=[a-f0-9]{16}"/);
 for(const lang of ['vi','en','fr','de','es','pt-BR','zh-CN','ja','ko','th','id','ru','lo','km','it','hi','ar']){
  assert.ok(publicHtml.includes('<option value="'+lang+'">'),lang);
 }
 assert.match(publicHtml,/rel="canonical"/);
});
