'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const browse=require('../renderer/rust-channel-browser-v23-8-60.js');
const channels=Array.from({length:12},(_,i)=>({id:'c'+i,sourceId:'s1',name:'VTV'+String(i+1),group:i%2?'Tin tức':'Thể thao',logo:''}));
test('browser filters source-owned channels, favorites, recent history and user groups without mutation',()=>{
 const all=structuredClone(channels),favorites=[channels[2],channels[7]],recent=[channels[8],channels[3],channels[0]];
 assert.equal(browse.selectChannels(all,favorites,recent,{tab:'all',group:'Thể thao'}).length,6);
 assert.deepEqual(browse.selectChannels(all,favorites,recent,{tab:'favorite',group:'all'}).map(c=>c.id),['c2','c7']);
 assert.deepEqual(browse.selectChannels(all,favorites,recent,{tab:'recent',sort:'recent'}).map(c=>c.id),['c8','c3','c0']);
 assert.deepEqual(browse.selectChannels(all,favorites,recent,{tab:'all',query:'VTV12'}).map(c=>c.id),['c11']);
 assert.equal(browse.selectChannels(all,favorites,recent,{tab:'all',query:'Thể thao'}).length,6);
 assert.equal(browse.normalizeGroup({group:'VTV | Kiểm tra: Sống'}),'VTV');
 assert.deepEqual(channels,all);
});
test('pagination is deterministic and bounded for 1,000+ channels',()=>{
 const all=Array.from({length:1184},(_,i)=>({id:'c'+i}));
 assert.equal(browse.PAGE_SIZE,10);
 assert.equal(browse.paginate(all,0).items.length,10);
 assert.equal(browse.paginate(all,999).page,118);
 assert.equal(browse.paginate(all,999).items.length,4);
 assert.equal(browse.paginate([],10).page,0);
});
class FakeNode{
 constructor(){this.children=[];this.dataset={};this.attrs={};this.listeners={};this.value='';this.disabled=false;this.textContent='';this.className='';this.cl=new Set();this.classList={add:x=>this.cl.add(x),remove:x=>this.cl.delete(x),contains:x=>this.cl.has(x),toggle:(x,on)=>on?this.cl.add(x):this.cl.delete(x)};}
 append(...xs){this.children.push(...xs);}replaceChildren(...xs){this.children=xs;}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k];}
 addEventListener(k,fn){(this.listeners[k]||(this.listeners[k]=[])).push(fn);}
 click(){for(const fn of this.listeners.click||[])fn({target:this});}
 emit(k){for(const fn of this.listeners[k]||[])fn({target:this});}
}
function fixture(){
 const ids=['rustChannelBrowser','rustBrowserTabs','rustBrowserChips','rustBrowserCards','rustBrowserGroup','rustBrowserSort','rustBrowserSearch',
 'rustBrowserStatus','rustBrowserPrev','rustBrowserNext','rustBrowserFavoriteRows','rustBrowserRecentRows','rustBrowserFavoriteCount',
 'rustBrowserRecentCount','rustBrowserGrid','rustBrowserList','rustBrowserAllFavorites','rustBrowserAllRecent','page-tv'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new FakeNode()]));
 nodes['page-tv'].classList.add('active-page');
 const doc={getElementById:id=>nodes[id]||null,createElement:()=>new FakeNode(),listeners:{},addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn);},emit(type){for(const fn of this.listeners[type]||[])fn({type});}};
 const saved=new Map,played=[],store={sources:[{id:'s1',enabled:true}],channels};
 let active=null;
 const win={document:doc,console:{warn(){}},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},listeners:{},
  addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn);},
  requestAnimationFrame:fn=>fn(),setInterval:()=>1,
  OpenIPTVFavorites:{visible:()=>[channels[2],channels[7]],key:c=>c.id},
  OpenIPTVRecentChannels:{visible:()=>[channels[8],channels[3],channels[0]]},
  IPTVState:{getStore:()=>store,getChannels:()=>channels,getCurrent:()=>active,playChannel:id=>{played.push(id);active=channels.find(c=>c.id===id);return Promise.resolve();}}
 };
 return {win,doc,nodes,played,store,saved};
}
test('real browser interactions delegate playing to the existing state and retain independent browsing filters',()=>{
 const f=fixture();assert.equal(browse.mount(f.doc,f.win),true);
 assert.equal(browse.mount(f.doc,f.win),false,'must not register twice');
 assert.equal(f.nodes.rustBrowserCards.children.length,10);
 assert.equal(f.nodes.rustBrowserNext.disabled,false);
 f.nodes.rustBrowserNext.click();
 assert.equal(f.nodes.rustBrowserCards.children.length,2);
 f.nodes.rustBrowserCards.children[0].click();
 assert.equal(f.played.length,1);
 assert.ok(f.played[0].startsWith('c'));
 f.nodes.rustBrowserAllFavorites.click();
 assert.equal(f.win.IPTVRustChannelBrowser.getTab(),'favorite');
 assert.equal(f.nodes.rustBrowserCards.children.length,2);
 assert.equal(f.nodes.rustBrowserFavoriteCount.textContent,'2');
 f.nodes.rustBrowserAllRecent.click();
 assert.deepEqual(f.nodes.rustBrowserCards.children.map(x=>x.dataset.channelId),['c8','c3','c0']);
 f.nodes.rustBrowserList.click();
 assert.equal(f.win.IPTVRustChannelBrowser.getMode(),'list');
 assert.equal(JSON.parse(f.saved.get('openiptv:rustlab:channel-browser-ui')).mode,'list');
 f.nodes.rustBrowserSearch.value='VTV9';f.nodes.rustBrowserSearch.emit('input');
 assert.equal(f.nodes.rustBrowserCards.children.length,1);
 assert.equal(f.nodes.rustBrowserCards.children[0].dataset.channelId,'c8');
});
test('channel names, source URLs and group names are never interpolated into HTML',()=>{
 const js=read('renderer/rust-channel-browser-v23-8-60.js');
 assert.doesNotMatch(js,/innerHTML\s*=/);
 assert.match(js,/setAttribute\('data-i18n-ignore','true'\)/);
 assert.match(js,/state\.playChannel\?\.\(c\.id\)/);
 assert.doesNotMatch(js,/\bfetch\s*\(/);
 assert.doesNotMatch(js,/\.url\s*=/);
});
test('Quick Tools placement, offline locale pack and responsive layout are present',()=>{
 const html=read('renderer/index.html'),css=read('renderer/rust-channel-browser-v23-8-60.css'),entry=read('renderer/app-entry.js');
 const quick=html.indexOf('id="quickTools"'),picker=html.indexOf('id="rustChannelBrowser"'),end=html.indexOf('id="themeGuidePanel"');
 assert.ok(quick>=0&&picker>quick&&picker<end);
 assert.ok(html.includes('href="rust-channel-browser-v23-8-60.css"'));
 assert.ok(entry.includes("'rust-channel-browser-v23-8-60.js'"));
 assert.match(css,/@container rustBrowser/);
 const pack=read('renderer/locales/rustlab-channel-browser-v23-8-60.js'),win={};
 vm.runInNewContext(pack,{window:win},{timeout:10000});
 for(const lang of ['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']){
  assert.notEqual(win.OPEN_IPTV_TRANSLATIONS[lang]['▣ Chọn kênh'],'▣ Chọn kênh',lang);
  assert.ok(win.OPEN_IPTV_TRANSLATIONS[lang]['Chưa có kênh vừa xem.'],lang);
 }
});
