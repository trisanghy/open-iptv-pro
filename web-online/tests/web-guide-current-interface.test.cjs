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
// Browser-like test harness: dynamic viewport positions, deterministic rAF
// clock and actual click events. It tests the same inline script that ships.
function guideHarness({reducedMotion=false}={}){
 const script=publicHtml.match(/<script>\s*\(function\(\)\{[\s\S]*?<\/script>/)?.[0];
 assert.ok(script,'guide navigation controller missing');
 const ids=['bat-dau','nguon','tv','kenh','epg','mobile','cong-cu','cai-dat','su-co','faq'];
 const positions=ids.map((_,i)=>i*700);
 const tabs=['tv','kenh','epg','nguon','faq'].map(id=>makeLink(id));
 const sidebar=['bat-dau',...ids.slice(1)].map(id=>makeLink(id));
 const listeners={},calls=[],frames=new Map();
 let frameSeq=0,clock=0;
 const root={scrollHeight:18000,scrollTop:0,style:{scrollBehavior:''}};
 const window={
  innerHeight:800,scrollY:0,
  location:{pathname:'/open-iptv-pro/huong-dan.html',search:'?v=test'},
  history:{state:null,replaceState(_s,_title,url){this.url=url}},
  scrollTo(options){
   calls.push({top:options.top,behavior:options.behavior,time:clock});
   this.scrollY=options.top;
   root.scrollTop=options.top;
  },
  addEventListener(name,fn){listeners[name]=fn},
  cancelAnimationFrame(id){frames.delete(id)},
  requestAnimationFrame(fn){const id=++frameSeq;frames.set(id,fn);return id},
  matchMedia(){return {matches:reducedMotion}}
 };
 const sections=ids.map((id,i)=>({id,getBoundingClientRect:()=>({top:positions[i]-window.scrollY})}));
 const docListeners={};
 const document={
  documentElement:root,
  querySelectorAll(q){return q.startsWith('.side')?sidebar:q.startsWith('.mobile-tabs')?tabs:sections},
  addEventListener(name,fn){docListeners[name]=fn}
 };
 vm.runInNewContext(script.slice(8,-9),{document,window},{timeout:1000});
 function makeLink(id){
  const link={
   href:'#'+id,attrs:{},handlers:{},active:false,
   getAttribute(name){return name==='href'?this.href:this.attrs[name]},
   setAttribute(name,v){this.attrs[name]=v},
   removeAttribute(name){delete this.attrs[name]},
   addEventListener(name,fn){this.handlers[name]=fn},
   classList:{toggle(name,on){link.active=on}}
  };
  return link;
 }
 function flush(count=100){
  let n=0;
  while(frames.size&&n++<count){
   const [id,fn]=frames.entries().next().value;
   frames.delete(id);clock+=16;fn(clock);
  }
  return n;
 }
 function click(id){
  const tab=tabs.find(x=>x.href==='#'+id);
  assert.ok(tab);
  let prevented=false;
  tab.handlers.click({currentTarget:tab,preventDefault(){prevented=true}});
  assert.ok(prevented,'native hash scrolling prevented');
  assert.equal(tabs.filter(x=>x.active).length,1,'one active tab');
  assert.equal(tabs.find(x=>x.active).href,'#'+id);
  assert.equal(tabs.filter(x=>x.attrs['aria-current']==='location').length,1);
  assert.ok(window.history.url.endsWith('#'+id));
  return tab;
 }
 return {window,document,root,tabs,sidebar,sections,ids,positions,calls,frames,listeners,docListeners,click,flush};
}
test('manual guide scrolling never highlights two mobile tabs',()=>{
 const h=guideHarness();
 h.flush(2);
 assert.equal(h.tabs.find(t=>t.active).href,'#tv');
 h.window.scrollY=h.positions[h.ids.indexOf('kenh')]-88;
 h.listeners.scroll();
 h.flush(2);
 assert.equal(h.tabs.find(t=>t.active).href,'#kenh');
 assert.equal(h.tabs.filter(t=>t.active).length,1);
 h.window.scrollY=h.positions[h.ids.indexOf('mobile')]-80;
 h.listeners.scroll();h.flush(2);
 assert.equal(h.tabs.find(t=>t.active).href,'#faq','subsections map to the More tab');
});
test('all five guide tabs scroll smoothly over short and long distances',()=>{
 const h=guideHarness();
 h.flush(2);
 for(const id of ['tv','kenh','epg','nguon','faq']){
  const before=h.window.scrollY;
  const target=Math.max(0,h.positions[h.ids.indexOf(id)]-72);
  h.click(id);
  const start=h.calls.length;
  h.flush(10);
  const moved=h.calls.slice(start).map(x=>x.top);
  if(Math.abs(target-before)>2){
   assert.ok(moved.some(y=>Math.abs(y-before)>0&&Math.abs(y-target)>1),
      'intermediate animated position required for '+id);
  }
  h.flush(100);
  assert.ok(Math.abs(h.window.scrollY-target)<1,'reached target '+id);
  assert.equal(h.root.style.scrollBehavior,'','restored CSS behavior');
  assert.equal(h.tabs.find(t=>t.active).href,'#'+id);
  assert.ok(h.calls.every(c=>c.behavior==='instant'),
    'rAF owns the animation; no competing native smooth scroll');
 }
 const long=h.calls.filter(c=>c.top>3000);
 assert.ok(long.length>2,'long-distance tab traverses intermediate frames');
});
test('rapid repeated taps cancel previous animation and preserve final tab',()=>{
 const h=guideHarness();
 h.flush(2);
 h.click('faq');
 h.flush(5);
 const partial=h.window.scrollY;
 assert.ok(partial>0&&partial<h.positions[h.ids.indexOf('faq')]-72);
 h.click('nguon');
 h.flush(100);
 assert.ok(Math.abs(h.window.scrollY-(h.positions[h.ids.indexOf('nguon')]-72))<1);
 assert.equal(h.tabs.find(t=>t.active).href,'#nguon');
 assert.equal(h.frames.size,0,'no orphan animation frames after retargeting');
 h.click('epg');
 h.flush(4);
 h.docListeners.touchmove();
 h.flush(3);
 assert.equal(h.frames.size,0,'manual finger swipe cancels the animation');
 assert.equal(h.root.style.scrollBehavior,'','style is restored on interruption');
});
test('reduced-motion preference jumps directly without animating',()=>{
 const h=guideHarness({reducedMotion:true});
 h.flush(2);
 h.click('faq');
 assert.ok(Math.abs(h.window.scrollY-(h.positions[h.ids.indexOf('faq')]-72))<1);
 assert.equal(h.frames.size,0);
 assert.equal(h.root.style.scrollBehavior,'');
});
test('new guide mobile icon set is a consistent five-item SVG system',()=>{
 for(const html of [template,publicHtml]){
  const nav=html.match(/<nav class="mobile-tabs"[\s\S]*?<\/nav>/)?.[0]||'';
  const expected=['tv','favorites','epg','sources','more'];
  const names=[...nav.matchAll(/data-guide-tab="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(names,expected,'five distinct nav icons in the correct order');
  assert.equal((nav.match(/class="guide-tab-icon"/g)||[]).length,5);
  assert.equal((nav.match(/viewBox="0 0 24 24"/g)||[]).length,5);
  assert.equal((nav.match(/aria-hidden="true"/g)||[]).length,5);
  assert.equal((nav.match(/focusable="false"/g)||[]).length,5);
  assert.doesNotMatch(nav,/&#|<img|\bemoji\b/i);
  const css=html.split('<style>')[1].split('</style>')[0];
  assert.match(css,/\.mobile-tabs \.guide-tab-icon\{/);
  assert.match(css,/stroke-width:1\.8/);
  assert.match(css,/@media\(hover:none\)/);
  assert.match(css,/\.mobile-tabs a\.is-current\{/);
  for(const name of ['TV','Yêu thích','Lịch','Nguồn','Thêm'])assert.ok(nav.includes('<span>'+name+'</span>'),name);
 }
});
