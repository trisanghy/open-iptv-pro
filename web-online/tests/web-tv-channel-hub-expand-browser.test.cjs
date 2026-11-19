'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const script=fs.readFileSync(path.join(root,'web-tv-channel-hub.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-tv-channel-hub.css'),'utf8');

test('desktop Show more opens every channel in the selected group and collapses again', {skip:!process.env.CHANNEL_HUB_CHROME},()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-hub-all-'));
 try {
  const html='<!doctype html><html lang="vi" data-iptv-device="desktop"><head>'
   +'<meta name="viewport" content="width=device-width,initial-scale=1">'
   +'<style>'+css+'</style></head><body><section id="page-tv">'
   +'<details id="quickTools"><summary>Quick tools</summary></details></section>'
   +'<script>'
   +'window.requestAnimationFrame=callback=>setTimeout(callback,0);'
   +'const channels=Array.from({length:320},(_,i)=>({id:"c"+i,name:(i%2?"VTV":"HTV")+(i+1),group:i%2?"VTV":"HTV"}));'
   +'const store={favoriteKeys:[],favorites:[],recentChannelIds:[]};'
   +'window.IPTVState={getChannels:()=>channels,getStore:()=>store,getCurrent:()=>null,playChannel:()=>{},save:()=>true,render:()=>{}};'
   +'window.OpenIPTVFavorites={has:()=>false,visible:()=>[],toggle:()=>{}};'
   +'window.OpenIPTVRecentChannels={select:()=>[]};'
   +'</script><script>'+script.replace(/<\/script/gi,'<\\/script')+'</script>'
   +'<script>(function(){'
   +'const chips=[...document.querySelectorAll(".web-hub-chip")];'
   +'const vtv=chips.find(b=>b.textContent.trim()==="VTV");'
   +'if(!vtv){document.body.dataset.error="missing VTV chip";return;}'
   +'vtv.click();'
   +'const tiles=document.getElementById("webHubTiles");'
   +'document.body.dataset.before=String(tiles.querySelectorAll(".web-hub-tile").length);'
   +'const more=document.querySelector(".web-hub-more");more.click();'
   +'let retries=0;'
   +'function inspect(){'
   +'if(tiles.getAttribute("aria-busy")==="true"&&retries++<200){setTimeout(inspect,10);return;}'
   +'const cards=[...tiles.querySelectorAll(".web-hub-tile")];'
   +'document.body.dataset.after=String(cards.length);'
   +'document.body.dataset.first=cards[0]?.dataset.channelId||"";'
   +'document.body.dataset.last=cards[cards.length-1]?.dataset.channelId||"";'
   +'document.body.dataset.total=String(tiles.dataset.totalChannels);'
   +'document.body.dataset.expanded=String(tiles.classList.contains("expanded"));'
   +'document.body.dataset.layout=getComputedStyle(tiles).display;'
   +'document.body.dataset.overflow=getComputedStyle(tiles).overflowY;'
   +'document.body.dataset.collapse=more.textContent.trim();'
   +'more.click();'
   +'document.body.dataset.collapsed=String(tiles.querySelectorAll(".web-hub-tile").length);'
   +'document.body.dataset.complete="yes";'
   '}inspect();'
   '})();</script></body></html>';
  const file=path.join(dir,'all-channels.html');fs.writeFileSync(file,html,'utf8');
  const output=execFileSync(process.env.CHANNEL_HUB_CHROME,[
   '--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
   '--allow-file-access-from-files','--virtual-time-budget=8000','--window-size=1440,900',
   '--dump-dom','file://'+file
  ],{encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024,stdio:['ignore','pipe','pipe']});
  const attr=name=>output.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
  assert.equal(attr('error'),undefined,'Fixture failed: '+attr('error'));
  assert.equal(attr('complete'),'yes','DOM update did not finish');
  assert.equal(attr('before'),'48','Collapsed preview should retain 48 channels');
  assert.equal(attr('after'),'160','Click must expose all 160 VTV channels (>120)');
  assert.equal(attr('total'),'160','Selected filter count must be preserved');
  assert.equal(attr('first'),'c1');
  assert.equal(attr('last'),'c319','No tail channels can be discarded');
  assert.equal(attr('expanded'),'true');
  assert.equal(attr('layout'),'grid','Expanded channels must wrap into multiple rows');
  assert.equal(attr('overflow'),'auto','Full list must remain scrollable');
  assert.equal(attr('collapse'),'Thu gọn','Button becomes a collapse control');
  assert.equal(attr('collapsed'),'48','Collapsing must restore original preview');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
