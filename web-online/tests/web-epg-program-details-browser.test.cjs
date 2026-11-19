'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const chrome=process.env.EPG_DETAILS_CHROME;
const styles=(html.match(/<link[^>]+rel="stylesheet"[^>]*>/g)||[]).join('\n');
const card=html.slice(html.indexOf('<div class="epg-current-card"'),html.indexOf('<label class="view-mode"'));
assert.ok(card.includes('id="epgNowDescription"')&&card.includes('id="epgNextDescription"'));
const probe=[
 "window.addEventListener('load',()=>{",
 "const el=id=>document.getElementById(id),rect=id=>el(id).getBoundingClientRect();",
 "for(const kind of ['Now','Next']){",
 "const desc=el('epg'+kind+'Description');",
 "desc.textContent=kind==='Now'?'Vùng đất hoang dã – Tập 30':'Phim tiếp theo, tập đặc biệt và tóm tắt nội dung';",
 "desc.hidden=false;",
 "el('epg'+kind+'Name').textContent=kind==='Now'?'Phim truyện':'Chương trình tiếng Khmer';",
 "el('epg'+kind+'Time').textContent='04:45 – 05:30';",
 "}",
 "const errors=[],epg=rect('epgCurrent');",
 "for(const kind of ['Now','Next']){",
 "const title=rect('epg'+kind+'Name'),desc=rect('epg'+kind+'Description');",
 "if(desc.width<60||desc.height<10)errors.push(kind+'-missing');",
 "if(desc.top<title.bottom-2)errors.push(kind+'-overlap');",
 "if(desc.right>epg.right+1)errors.push(kind+'-overflow');",
 "if(getComputedStyle(el('epg'+kind+'Description')).display==='none')errors.push(kind+'-hidden');",
 "}",
 "const rows=Array.from(el('epgCurrent').querySelectorAll('.epg-current-item,.epg-next-item'));",
 "if(rows.length!==2||rows[1].getBoundingClientRect().top<rows[0].getBoundingClientRect().bottom-2)errors.push('row-overlap');",
 "if(epg.height>255||epg.height<60)errors.push('epg-height:'+epg.height);",
 "document.body.dataset.epgDetailLayout=errors.length?'invalid':'valid';",
 "document.body.dataset.epgDetailErrors=errors.join('|')||'none';",
 "});"
].join('');
for(const [mode,width] of [['mobile',390],['mobile',820],['desktop',1440]]){
 test('real Chromium '+mode+' '+width+'px shows movie episode under current and next titles',{skip:!chrome},()=>{
  const file=path.join(root,'_site','test-epg-details-'+mode+'-'+width+'.html');
  const view='<!doctype html><html data-iptv-device="'+mode+'" data-ui-style="current"><head><meta name="viewport" content="width=device-width,initial-scale=1"/>'+styles+'</head><body><section class="page active-page" id="page-tv"><div class="watch-panel"><div class="player-control-card"><div class="control-layout-bottom">'+card+'</div></div></div></section><script>'+probe+'</script></body></html>';
  fs.writeFileSync(file,view);
  try{
   const result=execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files','--window-size='+width+',900','--dump-dom','file://'+file],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000});
   assert.match(result,/data-epg-detail-layout="valid"/,result.match(/data-epg-detail-errors="[^"]*"/)?.[0]||'Chromium produced no diagnostics');
  }finally{fs.unlinkSync(file);}
 });
}
