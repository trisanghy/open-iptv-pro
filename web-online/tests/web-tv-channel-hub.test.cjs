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
 assert.equal(hub.MAX_VISIBLE,120);
});
test('channel hub labels exist for all 17 supported UI languages',()=>{
 const langs=['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 const keys=['channels','favorites','recent','search','all','group','allGroups','sort','source','az','za','viewAll','prev','next','empty','emptyFav','emptyRecent','more','grid','list','addFav','removeFav','choose'];
 for(const lang of langs)for(const key of keys){
  const value=hub.label(lang,key);
  assert.equal(typeof value,'string',lang+':'+key);
  assert.ok(value.trim(),lang+':'+key+' translation missing');
 }
});
test('Web only channel hub loads after player and survives WebView rebuild',()=>{
 assert.equal(read('web-online/web-tv-channel-hub.js'),read('web-tv-channel-hub.js'));
 assert.equal(read('web-online/web-tv-channel-hub.css'),css);
 assert.equal((html.match(/src="web-tv-channel-hub[.]js[?]v=tv-hub-20261119b"/g)||[]).length,1);
 assert.equal((html.match(/href="web-tv-channel-hub[.]css[?]v=tv-hub-20261119b"/g)||[]).length,1);
 assert.ok(html.indexOf('web-tv-channel-hub.js?v=')>html.indexOf('app.js?v='));
 assert.ok(builder.includes("for filename in ('web-tv-channel-hub.js','web-tv-channel-hub.css')"));
 assert.ok(builder.includes("hub_js='<script src=\"web-tv-channel-hub.js?v=tv-hub-20261119b\"></script>'"));
 assert.ok(builder.includes("hub_css='<link rel=\"stylesheet\" href=\"web-tv-channel-hub.css?v=tv-hub-20261119b\"/>'"));
 assert.match(read('web-tv-channel-hub.js'),/quick\.insertAdjacentElement\('afterend',hub\)/);
 assert.match(read('web-tv-channel-hub.js'),/api\(\)\?\.playChannel\?\.\(c\.id\)/);
 assert.match(read('web-tv-channel-hub.js'),/f\.toggle\(data,c\)/);
 assert.match(read('web-tv-channel-hub.js'),/ctx\.save\?\.\(\)===false/);
 assert.match(read('web-tv-channel-hub.js'),/getChannels\?\.\(\)/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv #webChannelHub/);
 assert.match(css,/html\\[data-iptv-device="mobile"\\] body #page-tv #webChannelHub\\{\\s*display:none!important/);
 assert.match(css,/#page-tv #webChannelHub\\{[\\s\\S]*?display:grid/);
 assert.doesNotMatch(css,/order:7!important/);
 assert.match(read('web-tv-channel-hub.js'),/getAttribute\\('data-iptv-device'\\)==='mobile'\\)return/);
 assert.match(read('web-tv-channel-hub.js'),/addEventListener\\('resize',schedule/);
 assert.match(read('web-mobile-player.css'),/#page-tv \\.channel-panel/);
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
