'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const chrome=process.env.CAST_V2_CHROME||'';
const output=path.join(root,'cast-v2-artifacts');
const testSource=path.join(root,'web-cast-v2.js');
const testCss=path.join(root,'web-cast-v2.css');
function documentFixture(theme){
 const probe=[
  '(function(){',
  'const overlay=document.getElementById("iptvCastOverlay");',
  'const panel=document.getElementById("iptvCastPanel");',
  'document.body.dataset.castTheme=document.documentElement.dataset.theme;',
  'document.body.dataset.castBg=getComputedStyle(overlay).getPropertyValue("--cx-bg").trim();',
  'document.body.dataset.castVisible=String(!overlay.hidden&&panel.getBoundingClientRect().width>0);',
  'document.body.dataset.castTabs=String(document.querySelectorAll(".cx-tab").length);',
  'document.body.dataset.castOverflow=String(document.documentElement.scrollWidth>window.innerWidth+8);',
  '})();'
 ].join('');
 return [
  '<!doctype html><html lang="vi" data-theme="'+theme+'"><head>',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<link rel="stylesheet" href="web-cast-v2.css">',
  '<style>html,body{margin:0;width:100%;height:100%;background:#111}</style></head>',
  '<body><script src="web-cast-v2.js"></script>',
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
   fs.writeFileSync(fixture,documentFixture(theme),'utf8');
   try{
    const common=['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files',
     '--hide-scrollbars','--window-size='+width+','+height,'file://'+fixture];
    const dom=execFileSync(chrome,[...common.slice(0,-1),'--dump-dom',common[common.length-1]],
     {encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:25000});
    assert.match(dom,new RegExp('data-cast-theme="'+theme+'"'));
    assert.match(dom,/data-cast-visible="true"/);
    assert.match(dom,/data-cast-tabs="3"/);
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
