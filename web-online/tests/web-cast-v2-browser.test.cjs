'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const chrome=process.env.CAST_V2_CHROME||'';
const output=path.join(root,'cast-v2-artifacts');
const testSource=path.join(root,'web-cast-v2.js');
const testCss=path.join(root,'web-cast-v2.css');
function documentFixture(theme,device){
 const probe=[
  '(function(){',
  'const overlay=document.getElementById("iptvCastOverlay");',
  'const panel=document.getElementById("iptvCastPanel");',
  'document.body.dataset.castTheme=document.documentElement.dataset.theme;',
  'document.body.dataset.castBg=getComputedStyle(overlay).getPropertyValue("--cx-bg").trim();',
  'document.body.dataset.castVisible=String(!overlay.hidden&&panel.getBoundingClientRect().width>0);',
  'document.body.dataset.castTabs=String(document.querySelectorAll(".cx-tab").length);',
  'document.body.dataset.castSvgCount=String(panel.querySelectorAll("svg[data-iptv-svg-icon]").length);',
  'document.body.dataset.castTabSvgs=String(panel.querySelectorAll(".cx-tab > svg[data-iptv-svg-icon]").length);',
  'document.body.dataset.castIconOk=String(document.querySelector("#castBtn > svg[data-iptv-svg-icon=cast]")!==null);',
  'document.body.dataset.castPseudo=String(getComputedStyle(document.getElementById("castBtn"),"::before").display);',
  'document.body.dataset.castLink=String(document.getElementById("cxTvUrl").href);',
  'document.body.dataset.castOverflow=String(document.documentElement.scrollWidth>window.innerWidth+8);',
  '})();'
 ].join('');
 return [
  '<!doctype html><html lang="vi" data-theme="'+theme+'" data-iptv-device="'+device+'"><head>',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<link rel="stylesheet" href="web-player-icons.css">',
  '<link rel="stylesheet" href="web-mobile-controls-polish.css">',
  '<link rel="stylesheet" href="web-mobile-tablet-controls.css">',
  '<link rel="stylesheet" href="web-cast-v2.css">',
  '<style>html,body{margin:0;width:100%;height:100%;background:#111}</style></head>',
  '<body><div id="page-tv"><div class="player-control-card"><div class="control-layout-top"><div class="output-controls"><button id="castBtn">▣ <span class="cast-label">Cast / AirPlay</span></button></div></div></div></div>',
  '<script src="web-cast-icons.js"></script><script src="web-cast-v2.js"></script>',
  '<script>window.OpenIPTVWebCastV2.open({channel:{name:"VTV2",group:"VTV",url:"https://media.example/live.m3u8"},source:"https://media.example/live.m3u8"});</script>',
  '<script>'+probe+'</script></body></html>'
 ].join('');
}
for(const theme of ['light','dark','amoled']){
 for(const [device,width,height] of [['desktop',1600,900],['mobile',390,844]]){
  test('Cast V2 '+theme+' '+device+' renders 3 tabs, scrolls inside, with theme colors',{skip:!chrome},()=>{
   fs.mkdirSync(output,{recursive:true});
   const fixture=path.join(root,'cast-v2-check-'+theme+'-'+device+'.html');
   const shot=path.join(output,'cast-v2-'+theme+'-'+device+'.png');
   fs.writeFileSync(fixture,documentFixture(theme,device),'utf8');
   try{
    const common=['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files',
     '--hide-scrollbars','--window-size='+width+','+height,'file://'+fixture];
    const dom=execFileSync(chrome,[...common.slice(0,-1),'--dump-dom',common[common.length-1]],
     {encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:25000});
    assert.match(dom,new RegExp('data-cast-theme="'+theme+'"'));
    assert.match(dom,/data-cast-visible="true"/);
    assert.match(dom,/data-cast-tabs="3"/);
    assert.match(dom,/data-cast-svg-count="1[0-9]"|data-cast-svg-count="2[0-9]"/);
    assert.match(dom,/data-cast-tab-svgs="3"/);
    assert.match(dom,/data-cast-icon-ok="true"/);
    assert.match(dom,/data-cast-pseudo="none"/);
    assert.match(dom,/data-cast-link="https:\/\/is\.gd\/IPTVTV"/);
    assert.match(dom,/data-cast-overflow="false"/);
    const palette=dom.match(/data-cast-bg="([^"]+)"/)?.[1];
    assert.ok(palette,'No semantic palette resolved');
    if(theme==='light')assert.match(palette,/#fff|#ffffff/i);
    if(theme==='amoled')assert.match(palette,/#080808/i);
    execFileSync(chrome,[...common.slice(0,-1),'--screenshot='+shot,common[common.length-1]],
     {stdio:['ignore','pipe','pipe'],timeout:25000});
    assert.ok(fs.statSync(shot).size>4000,'Screenshot must be real and nonempty');
   }finally{fs.unlinkSync(fixture);}
  });
 }
}
