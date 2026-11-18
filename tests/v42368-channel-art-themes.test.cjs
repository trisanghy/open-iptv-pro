'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const art=require('../renderer/channel-art-v42368.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

class Node {
 constructor(doc,tag='div'){
  this.ownerDocument=doc;this.tagName=tag.toUpperCase();
  this.children=[];this.parentElement=null;this.style={};this.listeners={};
  this.textContent='';this.src='';this.classNames=new Set();
  this.classList={
   add:name=>this.classNames.add(name),
   remove:name=>this.classNames.delete(name),
   contains:name=>this.classNames.has(name),
   toggle:(name,force)=>{const on=force===undefined?!this.classNames.has(name):force;
    if(on)this.classNames.add(name);else this.classNames.delete(name);
    return on;}
  };
 }
 setAttribute(name,value){this[name]=value;}
 addEventListener(type,cb){this.listeners[type]=cb;}
 emit(type){this.listeners[type]?.({target:this,type});}
 replaceChildren(...nodes){
  this.children.forEach(n=>n.parentElement=null);this.children=nodes;
  nodes.forEach(n=>n.parentElement=this);
 }
 append(...nodes){this.children.push(...nodes);nodes.forEach(n=>n.parentElement=this);}
 replaceWith(node){
  const p=this.parentElement;
  if(!p)return;
  const i=p.children.indexOf(this);
  if(i>=0){p.children[i]=node;node.parentElement=p;this.parentElement=null;}
 }
}
function fake(){
 const doc={createElement(tag){return new Node(doc,tag)}};
 return {doc,container:doc.createElement('div')};
}
const channel={id:'id-1',url:'https://iptv.test/hbo',name:'HBO2',logo:'https://cdn.test/hbo.png'};

test('Channel artwork: snapshot file, embedded snapshot and logo fallback are prioritized',()=>{
 const list=art.candidates({
  channel,snapshots:{[channel.url]:{file:'HBO 2.jpg',data:'data:image/jpeg;base64,ABC'}},
  snapshotBase:'http://127.0.0.1:3030/snapshot?file='
 });
 assert.deepEqual(list,[
  {src:'http://127.0.0.1:3030/snapshot?file=HBO%202.jpg',kind:'snapshot'},
  {src:'data:image/jpeg;base64,ABC',kind:'snapshot'},
  {src:channel.logo,kind:'logo'}
 ]);
});

test('Channel artwork: no snapshot uses provided logo rather than generic Play glyph',()=>{
 const {doc,container}=fake();
 const img=art.mount(container,{channel,doc,snapshots:{}});
 assert.equal(img.src,channel.logo);
 assert.equal(img.loading,'lazy');
 assert.equal(img.alt,'');
 assert.equal(container.children[0],img);
});

test('Channel artwork: broken image falls back through snapshot, logo then monogram',()=>{
 const {doc,container}=fake();
 const s={[channel.url]:{file:'HBO 2.jpg',data:'data:image/png;base64,BBB'}};
 const img=art.mount(container,{
  channel,doc,snapshots:s,snapshotBase:'http://127.0.0.1/snapshot?file=',eager:true
 });
 const badge=doc.createElement('span');badge.classList.add('theme-tile-health');
 container.append(badge);
 assert.match(img.src,/HBO%202.jpg/);
 assert.equal(img.loading,'eager');
 img.emit('error');
 assert.equal(img.src,'data:image/png;base64,BBB');
 img.emit('error');
 assert.equal(img.src,channel.logo);
 img.emit('error');
 assert.equal(container.children.length,2,'Preserve status badge when art fails');
 assert.equal(container.children[1],badge);
 assert.equal(container.children[0].textContent,'HBO2');
 assert.equal(container.children[0].className,'iptv-art-placeholder');
 assert.equal(container.classList.contains('snapshot-thumb'),false);
});

test('Channel artwork: a channel without image displays its real name initials',()=>{
 const {doc,container}=fake();
 const item={name:'VTV1',url:'http://iptv.test/vtv1'};
 const node=art.mount(container,{channel:item,doc,snapshots:{}});
 assert.equal(node.textContent,'VTV1');
 assert.notEqual(node.textContent,'▶');
 assert.equal(container.classList.contains('art-placeholder'),true);
});

test('Channel artwork: prevent unsafe image schemes and deduplicate URLs',()=>{
 const unsafe={name:'HBO',url:'https://iptv.test/hbo',
  logo:'javascript:alert(1)'};
 const images=art.candidates({channel:unsafe,snapshots:{
  [unsafe.url]:{file:'',data:'javascript:alert(1)'}
 }});
 assert.deepEqual(images,[]);
 assert.equal(art.validImage('https://cdn.test/logo.webp'),true);
 assert.equal(art.validImage('data:image/png;base64,aaa'),true);
 assert.equal(art.validImage('javascript:alert(1)'),false);
});

test('TV rows and favorites use the same channel-art service, never depend on a folder being expanded',()=>{
 const app=read('renderer/app.js'),stage=read('renderer/theme-stage.js'),html=read('renderer/index.html');
 assert.match(app,/function mountChannelArt\(container,channel\)/);
 assert.match(app,/mountChannelArt\(row\.querySelector\('\.chan-logo'\),c\)/);
 assert.match(app,/mountChannelArt\(div\.querySelector\('\.chan-logo'\),c\)/);
 assert.match(stage,/helper\.mount\(art,\{channel:ch,snapshots,snapshotBase,doc:document,eager:true\}\)/);
 assert.doesNotMatch(stage,/rowById|original\?\.querySelector\('\.chan-logo img'\)/);
 assert.ok(html.indexOf('src="channel-art-v42368.js"')<
  html.indexOf('src="app.js"'));
});

test('All eleven UI themes are retained and shared art is not theme-specific',()=>{
 const ui=read('renderer/ui-style.js'),artwork=read('renderer/channel-art-v42368.js');
 for(const skin of ['current','minimal','material3','hig','liquid',
  'cinema','fluent','glass','broadcast','bento','swiss'])
  assert.match(ui,new RegExp('(?:^|[, {])'+skin+':','m'),skin+' is missing');
 assert.doesNotMatch(artwork,/data-ui-style|data-theme/);
});

test('Bento has no welcome banner and the strip obeys Dark and AMOLED surfaces',()=>{
 const css=read('renderer/ui-refined.css'),themes=read('renderer/ui-fullsync.css');
 assert.doesNotMatch(css,/CHÀO MỪNG ĐẾN VỚI  OPEN IPTV PRO/);
 assert.match(css,/theme-channel-strip\{grid-area:strip;[^}]*background:var\(--ui-card\)!important/);
 assert.match(css,/theme-channel-strip::before\{content:none!important;display:none!important\}/);
 assert.match(themes,/html\[data-theme="dark"\]\[data-ui-style="bento"\]\{--bg:/);
 assert.match(themes,/html\[data-theme="amoled"\]\[data-ui-style\]\{[^}]*--ui-card:#0b0b0b/s);
});

test('Cinema, Broadcast, Glass and Swiss have light/dark readability overrides',()=>{
 const css=read('renderer/ui-refined.css');
 for(const key of [
  'html[data-theme="light"][data-ui-style="cinema"]',
  'html[data-theme="light"][data-ui-style="broadcast"]',
  'html[data-theme="light"][data-ui-style="glass"]',
  'html:is([data-theme="dark"],[data-theme="amoled"])[data-ui-style="swiss"]',
  'html[data-theme="amoled"][data-ui-style="cinema"]',
  'html[data-theme="amoled"][data-ui-style="broadcast"]'
 ])assert.ok(css.includes(key),'Missing skin contrast rule: '+key);
});
