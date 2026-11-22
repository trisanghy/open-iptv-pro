'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const chrome=process.env.TABLET_LAYOUT_CHROME;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const links=(html.match(/<link rel="stylesheet" href="[^"]+"\/>/g)||[]).join('\n');
const castMarkup=html.match(/<button class="control-sm" id="castBtn"[^>]*>[\s\S]*?<\/button>/)?.[0];
function probe(){
 const el=id=>document.getElementById(id);
 const rect=id=>el(id).getBoundingClientRect();
 const style=id=>getComputedStyle(el(id));
 const errors=[],mobile=document.documentElement.dataset.iptvDevice==='mobile',wide=innerWidth>=761;
 const ids=['webVolumeMute','castBtn','pipBtn','fullscreenBtn'];
 const boxes=ids.map(rect);
 if(mobile&&wide){
  for(const id of ['prevBtn','stopBtn','nextBtn']){
   const r=rect(id);
   if(Math.abs(r.width-52)>2||Math.abs(r.height-52)>2)errors.push(id+':'+r.width+'x'+r.height);
  }
  const play=rect('playBtn');
  if(Math.abs(play.width-64)>2||Math.abs(play.height-64)>2)errors.push('play:'+play.width+'x'+play.height);
  const row=rect('outputControls');
  if(row.width>962)errors.push('row-too-wide:'+row.width);
  for(let i=0;i<ids.length;i++){
   const id=ids[i],r=boxes[i],cs=style(id),ps=getComputedStyle(el(id),'::before');
   if(r.height<57||r.height>59)errors.push(id+'-height:'+r.height);
   if(Math.abs(r.width-boxes[0].width)>2)errors.push(id+'-unequal-width:'+r.width);
   if(r.left<row.left-2||r.right>row.right+2)errors.push(id+'-outside');
   if(i>0&&r.left<=boxes[i-1].right)errors.push(id+'-overlapping');
   if(cs.display!=='flex'||cs.alignItems!=='center'||cs.justifyContent!=='center')errors.push(id+'-flex:'+cs.display+'/'+cs.alignItems+'/'+cs.justifyContent);
   if(id==='castBtn'){
    const svg=el(id).querySelector('svg[data-iptv-svg-icon="cast"]');
    const sr=svg?.getBoundingClientRect();
    if(!svg||sr.width<20||Math.abs((sr.left+sr.width/2)-(r.left+r.width/2))>3||ps.display!=='none')errors.push(id+'-svg-center');
   }else{
    if(ps.position!=='static'||ps.transform!=='none'||Math.abs(parseFloat(ps.width)-27)>1)errors.push(id+'-icon:'+ps.position+'/'+ps.transform+'/'+ps.width);
    if(!ps.webkitMaskImage||ps.webkitMaskImage==='none')errors.push(id+'-mask');
   }
  }
 }else if(!mobile&&wide){
  if(style('outputControls').display==='grid'&&Math.abs(rect('castBtn').height-58)<1)errors.push('desktop-overwritten');
 }
 document.body.dataset.tabletLayout=errors.length?'invalid':'valid';
 document.body.dataset.errors=errors.join('|')||'none';
}
function fixture(device){
 return [
 '<!doctype html><html data-iptv-device="'+device+'" data-ui-style="current">',
 '<head><meta name="viewport" content="width=device-width,initial-scale=1"/>',links,'</head>',
 '<body><section id="page-tv"><div class="tv-layout"><div class="watch-panel"><div class="player-box"></div>',
 '<div class="player-control-card"><div class="control-layout-top">',
 '<div class="playing-info"><span class="small-lcd">VT</span><div class="playing-channel-text"><b>VTV1</b><small>LIVE</small></div></div>',
 '<div class="controls transport-controls"><button class="control-sm" id="prevBtn">⏮</button>',
 '<button class="control-main" id="playBtn">▶</button><button class="control-sm" id="stopBtn">■</button>',
 '<button class="control-sm" id="nextBtn">⏭</button></div>',
 '<div class="output-controls" id="outputControls"><div class="web-volume-control">',
 '<button id="webVolumeMute">🔊</button><input type="range" id="volume" value="80"/></div>',
 castMarkup,'<button class="control-sm" id="pipBtn">▣</button>',
 '<button class="control-sm" id="fullscreenBtn">⛶</button></div></div></div></div></div></section>',
 '<script>window.addEventListener("load",(',probe.toString(),'));</script></body></html>'
 ].join('');
}
for(const [device,width] of [['mobile',820],['mobile',1024],['mobile',1280],['mobile',1920],['mobile',390],['desktop',1280]]){
 test('Chrome '+device+' '+width+'px keeps correctly centered controls',{skip:!chrome},()=>{
  const dest=path.join(root,'_site','tablet-toolbar-check-'+device+'-'+width+'.html');
  fs.writeFileSync(dest,fixture(device));
  try{
   const output=execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files',
    '--window-size='+width+',1000','--dump-dom','file://'+dest],
    {encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000});
   assert.match(output,/data-tablet-layout="valid"/,output.match(/data-errors="[^"]*"/)?.[0]||'browser output unavailable');
  }finally{fs.unlinkSync(dest)}
 });
}
