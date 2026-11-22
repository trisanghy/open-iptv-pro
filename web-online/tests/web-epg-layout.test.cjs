'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('player EPG has two time/title rows without redundant labels',()=>{
 for(const kind of ['Now','Next']){
  assert.ok(html.includes('<small class="epg-row-time"><span id="epg'+kind+'Time">'));
  assert.equal(html.split('id="epg'+kind+'Name"').length,2);
 }
 assert.doesNotMatch(html,/class="epg-row-label"/);
 assert.ok(html.includes('web-only.css?v=cast-visible-20261122a'));
 const css=fs.readFileSync(path.join(root,'web-only.css'),'utf8');
 assert.equal(css,fs.readFileSync(path.join(root,'web-online/web-only.css'),'utf8'));
 assert.match(css,/grid-template-rows:max-content max-content!important/);
 assert.match(css,/align-content:start!important/);
 assert.match(css,/@container \(max-width:720px\)/);
 assert.match(css,/grid-area:1\/1\/2\/3!important/);
 const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
 assert.match(builder,/web_html\[web_html.index\(start\):web_html.index\(end/);
});
for(const [mode,width] of [['mobile',390],['desktop',390],['desktop',1440]]){
 test('rendered programme rows at '+width+'px',{skip:!process.env.EPG_LAYOUT_CHROME},()=>{
  const site=path.join(root,'_site');
  const filename=path.join(site,'test-epg-'+mode+'.html');
  const styles=html.match(/<link[^>]+rel="stylesheet"[^>]*>/g).join('\n');
  const card=html.slice(html.indexOf('<div class="epg-current-card"'),html.indexOf('<label class="view-mode"'));
  const check=`onload=()=>{
   const el=id=>document.getElementById(id),rect=x=>x.getBoundingClientRect();
   for(const kind of ['Now','Next']){
    el('epg'+kind+'Time').textContent='08:00 – 08:30';
    el('epg'+kind+'Name').textContent='Chương trình truyền hình buổi sáng';
   }
   const now=rect(el('epgNowName').parentElement),next=rect(el('epgNextName').parentElement);
   const time=rect(el('epgNowTime')),name=rect(el('epgNowName')),guide=rect(el('openGuideBtn')),epg=rect(el('epgCurrent'));
   document.body.dataset.layout=(next.top>=now.bottom && now.width>0 && Math.abs(next.left-now.left)<1 &&
     name.left>=time.right-1 && guide.left>=now.right-1 && guide.right<=innerWidth+1 && epg.height<150 && epg.height>0)?'valid':'invalid';
  }`;
  const fixture='<!doctype html><html data-iptv-device="'+mode+'"><head>'+styles+'</head><body><section id="page-tv" class="active-page"><div class="player-control-card"><div class="control-layout-bottom">'+card+'</div></div></section><script>'+check+'</script></body></html>';
  fs.writeFileSync(filename,fixture);
  try{
   const output=execFileSync(process.env.EPG_LAYOUT_CHROME,['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files','--window-size='+width+',900','--dump-dom','file://'+filename],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000});
   assert.match(output,/data-layout="valid"/);
  }finally{fs.unlinkSync(filename);}
 });
}
