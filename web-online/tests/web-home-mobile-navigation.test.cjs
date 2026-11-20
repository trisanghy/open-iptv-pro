'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const home=fs.readFileSync(path.resolve(__dirname,'../project-home.html'),'utf8');
const tabs=['tinh-nang','anh','tai-ve','huong-dan','ma-nguon'];
const nativeText=['Tính năng','Ảnh giao diện','Tải về','Hướng dẫn','Mã nguồn'];
const source=home.match(/<script id="home-mobile-navigation">([\s\S]*?)<\/script>/)?.[1];

test('mobile homepage retains original content, SEO and 17-language system',()=>{
 assert.ok(source,'mobile scrolling controller missing');
 assert.match(home,/rel="canonical" href="https:\/\/trisanghy.github.io\/"/);
 assert.match(home,/id="homeLanguage"/);
 assert.match(home,/id="homepage-language-controller"/);
 assert.match(home,/id="home-native-locales-data"/);
 assert.ok(home.indexOf('class="home-mobile-tabs"')<home.indexOf('id="homepage-language-controller"'),
  'mobile tab labels must exist when offline translator scans DOM');
 for(const id of tabs)assert.match(home,new RegExp('id="'+id+'"'));
 assert.doesNotMatch(home,/translate\.googleapis\.com/);
});

test('five native accessible SVG icons and mobile-only fixed layout match guide',()=>{
 const nav=home.match(/<nav class="home-mobile-tabs"[\s\S]*?<\/nav>/)?.[0];
 assert.ok(nav);
 assert.deepEqual([...nav.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]),tabs);
 assert.deepEqual([...nav.matchAll(/<span>([^<]+)<\/span>/g)].map(m=>m[1]),nativeText);
 assert.equal((nav.match(/class="home-tab-icon"/g)||[]).length,5);
 assert.equal((nav.match(/aria-hidden="true"/g)||[]).length,5);
 assert.equal((nav.match(/focusable="false"/g)||[]).length,5);
 assert.equal((nav.match(/viewBox="0 0 24 24"/g)||[]).length,5);
 const ids=[...home.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'no duplicate IDs');
 assert.match(home,/@media\(max-width:700px\)\{[\s\S]*?\.home-mobile-tabs\{[\s\S]*?position:fixed/);
 assert.match(home,/\.head>\.nav\{display:none!important\}/);
 assert.match(home,/env\(safe-area-inset-bottom,0px\)/);
 assert.match(home,/\.home-mobile-tabs a\.is-current\{/);
 assert.match(home,/@media\(hover:none\)/);
 assert.match(home,/viewport-fit=cover/);
 assert.match(home,/\.nav\{display:flex/,'desktop header navigation retained');
});

test('mobile script is syntactically valid and uses one bounded animation controller',()=>{
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.match(source,/duration=Math\.min\(480,Math\.max\(290/);
 assert.match(source,/Math\.log2\(1\+distance\/250\)/);
 assert.match(source,/const eased=progress\*progress\*\(3-2\*progress\)/);
 assert.match(source,/window\.cancelAnimationFrame/);
 assert.match(source,/document\.addEventListener\('touchmove'/);
 assert.match(source,/matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)/);
});

function harness(reduced=false){
 const sectionIds=['tinh-nang','anh','huong-dan','tai-ve','ma-nguon'];
 const tops=[420,1450,2800,4300,6150];
 const sections=sectionIds.map((id,i)=>({id,getBoundingClientRect(){return {top:tops[i]-window.scrollY}}}));
 const listeners={}, docListeners={}, frames=new Map(), calls=[];
 let sequence=0,time=0;
 const root={scrollTop:0,scrollHeight:15000,style:{scrollBehavior:''}};
 const header={getBoundingClientRect(){return {height:64}}};
 function link(id){
  const obj={
   id,attrs:{},handlers:{},active:false,
   getAttribute(k){return k==='href'?'#'+this.id:this.attrs[k]},
   setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},
   addEventListener(k,fn){this.handlers[k]=fn},
   classList:{toggle(_cls,enabled){obj.active=enabled}}
  };
  return obj;
 }
 const nav=tabs.map(link);
 const document={
  documentElement:root,
  querySelectorAll(selector){
   if(selector.startsWith('.home-mobile-tabs'))return nav;
   if(selector.startsWith('main .section'))return sections;
   return [];
  },
  querySelector(selector){return selector==='header'?header:null},
  addEventListener(k,fn){docListeners[k]=fn}
 };
 const window={
  innerHeight:800,scrollY:0,location:{pathname:'/',search:'?lang=vi'},
  history:{state:null,replaceState(_state,_title,url){this.last=url}},
  matchMedia(){return {matches:reduced}},
  requestAnimationFrame(fn){const id=++sequence;frames.set(id,fn);return id},
  cancelAnimationFrame(id){frames.delete(id)},
  scrollTo(option){calls.push({...option,time});this.scrollY=option.top;root.scrollTop=option.top},
  addEventListener(k,fn){listeners[k]=fn}
 };
 vm.runInNewContext(source,{document,window},{timeout:2000});
 function flush(limit=100){
  let n=0;
  while(frames.size&&n++<limit){
   const [id,fn]=frames.entries().next().value;
   frames.delete(id);time+=16;fn(time);
  }
 }
 function click(id){
  const item=nav.find(x=>x.id===id);
  let prevented=false;
  item.handlers.click({currentTarget:item,preventDefault(){prevented=true}});
  assert.ok(prevented,'native hash jump prevented');
  assert.equal(nav.filter(x=>x.active).length,1);
  assert.equal(nav.find(x=>x.active).id,id);
  assert.ok(window.history.last.endsWith('#'+id));
 }
 return {nav,sections,tops,calls,frames,document,window,root,listeners,docListeners,flush,click};
}

test('all five mobile tabs scroll smoothly even between distant sections',()=>{
 const h=harness();
 h.flush();
 for(const id of tabs){
  const start=h.window.scrollY;
  const end=h.tops[['tinh-nang','anh','huong-dan','tai-ve','ma-nguon'].indexOf(id)]-76;
  h.click(id);
  const before=h.calls.length;
  h.flush(10);
  const prefix=h.calls.slice(before).map(x=>x.top);
  if(Math.abs(end-start)>2)assert.ok(prefix.some(y=>Math.abs(y-end)>1&&Math.abs(y-start)>0),'intermediate scroll '+id);
  h.flush();
  assert.ok(Math.abs(h.window.scrollY-end)<1,'landed on '+id);
  assert.equal(h.nav.find(x=>x.active).id,id);
  assert.equal(h.root.style.scrollBehavior,'');
 }
 assert.ok(h.calls.every(x=>x.behavior==='instant'),'rAF owns smooth transition');
});
test('rapid retaps, manual touch interruption and reduced motion are safe',()=>{
 const h=harness();
 h.flush();h.click('ma-nguon');h.flush(4);
 const partial=h.window.scrollY;assert.ok(partial>0&&partial<6000);
 h.click('anh');h.flush();
 assert.ok(Math.abs(h.window.scrollY-1374)<1);
 assert.equal(h.frames.size,0);
 h.click('huong-dan');h.flush(3);h.docListeners.touchmove();h.flush();
 assert.equal(h.frames.size,0);
 assert.equal(h.root.style.scrollBehavior,'');
 const reduced=harness(true);
 reduced.flush();reduced.click('ma-nguon');
 assert.ok(Math.abs(reduced.window.scrollY-6074)<1);
 assert.equal(reduced.frames.size,0);
});
