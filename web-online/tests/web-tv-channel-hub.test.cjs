'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const hub=require(path.join(root,'web-tv-channel-hub.js'));
const html=read('index.html'),builder=read('web-online/prepare-web.py'),css=read('web-tv-channel-hub.css');
const channels=[
 {id:'vtv1',name:'VTV1',group:'VTV',sourceId:'on'},
 {id:'vtv3',name:'VTV3',group:'VTV',sourceId:'on'},
 {id:'htv7',name:'HTV7',group:'HTV',sourceId:'on'},
 {id:'k1',name:'K+1',group:'Thể thao',sourceId:'on'}
];
const store={sources:[{id:'on',enabled:true},{id:'disabled',enabled:false}],
 channels, favorites:['url1'],favoriteKeys:['name:vtv3'],recentChannelIds:['htv7','vtv1','missing']};
const favorite={visible:s=>s.channels.filter(c=>c.id==='vtv3')};
const recent={select:(ids,all)=>ids.map(id=>all.find(c=>c.id===id)).filter(Boolean)};
test('channel hub uses only active IPTVState channels and real source groups',()=>{
 const chosen=hub.choose(channels,{store,favCore:favorite,recentCore:recent});
 assert.deepEqual(chosen.map(c=>c.id),['vtv1','vtv3','htv7','k1']);
 assert.deepEqual(hub.choose(channels,{search:'VTV',store}).map(c=>c.id),['vtv1','vtv3']);
 assert.deepEqual(hub.choose(channels,{chip:'HTV',store}).map(c=>c.id),['htv7']);
 assert.deepEqual(hub.choose(channels,{groupName:'Thể thao',store}).map(c=>c.id),['k1']);
 assert.equal(hub.group({name:'X',group:'Phim | Kiểm tra: 5'}),'Phim');
 assert.deepEqual(hub.choose([],{store}),[]);
});
test('favorites and recently watched use original app data, keep history order',()=>{
 assert.deepEqual(hub.choose(channels,{tab:'favorites',store,favCore:favorite}).map(c=>c.id),['vtv3']);
 assert.deepEqual(hub.choose(channels,{tab:'recent',store,recentCore:recent}).map(c=>c.id),['htv7','vtv1']);
 assert.deepEqual(hub.choose(channels,{tab:'recent',search:'VTV',store,recentCore:recent}).map(c=>c.id),['vtv1']);
 assert.deepEqual(hub.choose(channels,{sort:'az',store}).map(c=>c.id),['htv7','k1','vtv1','vtv3']);
 assert.equal(hub.LIMIT,48);
 assert.equal(hub.BATCH_SIZE,96);
 assert.equal(hub.MAX_VISIBLE,undefined);
});
test('Show more displays all channels in the currently filtered tab, beyond the old 120-channel cap',()=>{
 const large=Array.from({length:1500},(_,n)=>({
   id:'channel-'+n,name:(n%3===0?'VTV ':'HTV ')+n,group:n%3===0?'VTV':'HTV'
 }));
 assert.equal(hub.visible(large,false).length,48);
 assert.equal(hub.visible(large,true).length,1500);
 assert.equal(hub.visible(large,true)[1499],large[1499]);
 const filtered=hub.choose(large,{search:'VTV',groupName:'VTV',store});
 assert.equal(filtered.length,500);
 assert.equal(hub.visible(filtered,true).length,500);
 assert.deepEqual(hub.visible(filtered,true),filtered,'Keep exact channel order after expanding');
 const f={visible:()=>large.filter((c,i)=>i%5===0)};
 const favFiltered=hub.choose(large,{tab:'favorites',search:'VTV',store,favCore:f});
 assert.ok(favFiltered.length>48);
 assert.deepEqual(hub.visible(favFiltered,true),favFiltered,'Favorites must expand only favorites matching current search');
 const rec={select:()=>large.slice().reverse().slice(0,250)};
 const recentFiltered=hub.choose(large,{tab:'recent',groupName:'HTV',store,recentCore:rec});
 assert.ok(recentFiltered.length>48);
 assert.deepEqual(hub.visible(recentFiltered,true),recentFiltered,'Recently watched must keep history order and group filter');
});
test('channel hub labels exist for all 17 supported UI languages',()=>{
 const langs=['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 const keys=['channels','favorites','recent','search','all','group','allGroups','sort','source','az','za','viewAll','prev','next','empty','emptyFav','emptyRecent','more','collapse','grid','list','addFav','removeFav','choose'];
 for(const lang of langs)for(const key of keys){
  const value=hub.label(lang,key);
  assert.equal(typeof value,'string',lang+':'+key);
  assert.ok(value.trim(),lang+':'+key+' translation missing');
 }
});
test('Web only channel hub loads after player and survives WebView rebuild',()=>{
 assert.equal(read('web-online/web-tv-channel-hub.js'),read('web-tv-channel-hub.js'));
 assert.equal(read('web-online/web-tv-channel-hub.css'),css);
 assert.equal((html.match(/src="web-tv-channel-hub[.]js[?]v=tv-hub-unified-search-20261123a"/g)||[]).length,1);
 assert.equal((html.match(/href="web-tv-channel-hub[.]css[?]v=tv-hub-20261119c"/g)||[]).length,1);
 assert.ok(html.indexOf('web-tv-channel-hub.js?v=')>html.indexOf('app.js?v='));
 assert.ok(builder.includes("for filename in ('web-tv-channel-hub.js','web-tv-channel-hub.css')"));
 assert.ok(builder.includes("hub_js='<script src=\"web-tv-channel-hub.js?v=tv-hub-unified-search-20261123a\"></script>'"));
 assert.ok(builder.includes("hub_css='<link rel=\"stylesheet\" href=\"web-tv-channel-hub.css?v=tv-hub-20261119c\"/>'"));
 assert.match(read('web-tv-channel-hub.js'),/quick\.insertAdjacentElement\('afterend',hub\)/);
 assert.match(read('web-tv-channel-hub.js'),/api\(\)\?\.playChannel\?\.\(c\.id\)/);
 assert.match(read('web-tv-channel-hub.js'),/f\.toggle\(data,c\)/);
 assert.match(read('web-tv-channel-hub.js'),/ctx\.save\?\.\(\)===false/);
 assert.match(read('web-tv-channel-hub.js'),/getChannels\?\.\(\)/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv #webChannelHub/);
 assert.ok(css.includes('html[data-iptv-device="mobile"] body #page-tv #webChannelHub{'), 'Mobile override selector required');
 assert.ok(css.includes('display:none!important;'), 'Hub must be hidden on mobile');
 assert.ok(css.includes('#page-tv #webChannelHub{'), 'Desktop hub styling preserved');
 assert.ok(css.includes('display:grid;grid-template-columns:'), 'Desktop hub remains visible');
 assert.ok(!css.includes('order:7!important'), 'Remove obsolete mobile grid order');
 assert.ok(read('web-tv-channel-hub.js').includes("getAttribute('data-iptv-device')==='mobile'){"), 'Skip building channel tiles on mobile');
 assert.ok(read('web-tv-channel-hub.js').includes("addEventListener('resize',schedule"), 'Allow desktop view after resize');
 assert.ok(read('web-mobile-player.css').includes('#page-tv .channel-panel'), 'Keep original mobile channel list');
 assert.match(html,/class="nav active" data-page="tv"/);
 assert.match(html,/class="nav" data-page="fav"/);
 assert.ok(html.includes('id="quickTools"'));
 for(const id of ['appSidebar','channelList','page-fav','themeGuidePanel','themeChannelStrip','favCurrentBtn'])
  assert.ok(html.includes('id="'+id+'"'),'Original IPTV feature missing: '+id);
 assert.doesNotMatch(read('web-tv-channel-hub.js'),/localStorage\.setItem|sessionStorage\.setItem|new URL\(/);
 assert.match(read('web-tv-channel-hub.js'),/openiptv:local-saved/);
 assert.match(read('web-tv-channel-hub.js'),/openiptv:favorites-changed/);
 assert.match(read('web-tv-channel-hub.js'),/openiptv:languagechange/);
 assert.match(read('web-tv-channel-hub.js'),/web-hub-side-card/);
 assert.match(read('web-tv-channel-hub.js'),/web-hub-view-toggle/);
 assert.match(css,/#page-tv \.web-hub-side-card/);
 assert.match(css,/#page-tv \.web-hub-tiles\.expanded:not\(\.list-mode\)/);
 assert.match(css,/max-height:min\(72vh,720px\)/);
 assert.ok(read('web-tv-channel-hub.js').includes('renderTiles(visible(shown,expanded))'));
 assert.ok(read('web-tv-channel-hub.js').includes('expanded=!expanded;'));
 assert.ok(read('web-tv-channel-hub.js').includes('more.hidden=shown.length<=LIMIT'));
 assert.ok(!read('web-tv-channel-hub.js').includes('MAX_VISIBLE'));
 assert.match(css,/min-width:0/);
});


test('browser layout keeps desktop selector visible but hides it on mobile', {skip:!process.env.CHANNEL_HUB_CHROME},()=>{
 const os=require('node:os');
 const {execFileSync}=require('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-hub-responsive-'));
 try{
  for(const device of ['mobile','desktop']){
   const fixture='<!doctype html><html data-iptv-device="'+device+'"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'
    +css+'</style></head><body><section id="page-tv"><div class="watch-panel">'
    +'<details id="quickTools"><summary>Tools</summary></details>'
    +'<section id="webChannelHub"><div class="web-hub-main">Channel picker</div></section>'
    +'</div><div class="channel-panel" id="originalChannels">Original channels</div></section>'
    +'<script>window.addEventListener("load",()=>{document.body.dataset.hubDisplay=getComputedStyle(document.getElementById("webChannelHub")).display;document.body.dataset.listDisplay=getComputedStyle(document.getElementById("originalChannels")).display;});</script></body></html>';
   const file=path.join(dir,'test-'+device+'.html');fs.writeFileSync(file,fixture);
   const rendered=execFileSync(process.env.CHANNEL_HUB_CHROME,
    ['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files','--window-size='+(device==='mobile'?'390,840':'1440,900'),'--dump-dom','file://'+file],
    {encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']});
   const display=rendered.match(/data-hub-display="([^"]+)"/)?.[1];
   assert.equal(display,device==='mobile'?'none':'grid',device+' channel hub display');
   assert.match(rendered,/data-list-display="(?!none)[^"]+"/,device+' original channel panel remains available');
  }
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('Channel hub shares typo, diacritic and EPG search engine with sidebar and AI tabs',()=>{
 const cs=[{id:'one',name:'VTV1',group:'VTV',tvgId:'abc'},{id:'two',name:'Thời sự',group:'Tin tức',tvgId:'def'}];
 assert.deepEqual(hub.choose(cs,{search:'vvt1'}).map(c=>c.id),['one']);
 assert.deepEqual(hub.choose(cs,{search:'thoi su'}).map(c=>c.id),['two']);
 const search=require('../../web-channel-search.js');
 const guide={names:{abc:'abc'},programmes:[{id:'abc',title:'Việt Nam hôm nay',start:100,end:90000}]};
 const e={search:(channels,q,g)=>search.search(channels,q,g,{clock:200})};
 assert.deepEqual(hub.choose(cs,{search:'viet nam hom nay',guide,engine:e}).map(c=>c.id),['one']);
});
