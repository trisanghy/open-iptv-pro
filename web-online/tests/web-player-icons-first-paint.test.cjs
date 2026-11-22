'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'web-player-icons.css'),'utf8');
test('initial paint suppresses glyphs with CSS, preserving SVG masks',()=>{
 assert.match(html,/web-player-icons\.css\?v=single-icon-first-paint-20261119a/);
 assert.match(css,/First-paint regression guard/);
 assert.match(css,/\.controls\.transport-controls[\s\S]*?#playBtn/);
 assert.match(css,/font-size:0!important/);
 assert.match(css,/\.control-layout-bottom[\s\S]*?#favCurrentBtn/);
 assert.match(css,/::before\{--ipc-icon:var\(--ipc-pause\)/);
});
const chrome=process.env.ICON_FIRST_PAINT_CHROME;
const styles=(html.match(/<link rel="stylesheet" href="[^"]+"\/>/g)||[]).join('\n');
const castMarkup=html.match(/<button class="control-sm" id="castBtn"[^>]*>[\s\S]*?<\/button>/)?.[0];
assert.ok(castMarkup&&castMarkup.includes('data-iptv-svg-icon="cast"'),'HTML must render Cast SVG without JavaScript');
for(const [device,width,style] of [['desktop',1440,'current'],['mobile',390,'current'],['desktop',1440,'material3']]){
 test('Chrome first paint has one icon on '+device+' '+style,{skip:!chrome},()=>{
  const dest=path.join(root,'_site','test-first-paint-'+device+'-'+style+'.html');
  const fixture=[
   '<!doctype html><html data-iptv-device="'+device+'" data-ui-style="'+style+'"><head>',styles,'</head><body>',
   '<section id="page-tv"><div class="watch-panel"><div class="player-box"><div class="fullscreen-ux">',
   '<button id="fsPrev">⏮</button><button id="fsPlay">▶</button><button id="fsNext">⏭</button><button id="fsExit">⛶</button>',
   '</div></div><div class="player-control-card"><div class="control-layout-top"><div class="controls transport-controls">',
   '<button class="control-sm" id="prevBtn">⏮</button><button class="control-main" id="playBtn">▶</button>',
   '<button class="control-sm" id="stopBtn">■</button><button class="control-sm" id="nextBtn">⏭</button>',
   '</div><div class="output-controls">',castMarkup,
   '<button class="control-sm" id="pipBtn">▣</button><button class="control-sm" id="fullscreenBtn">⛶</button>',
   '</div></div><div class="control-layout-bottom"><button id="openGuideBtn">▤</button>',
   '<button id="favCurrentBtn">☆</button></div></div></div></section>',
   "<script>onload=()=>{const ids=['prevBtn','playBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn','openGuideBtn','favCurrentBtn','fsPrev','fsPlay','fsNext','fsExit'];",
   "const bad=[];for(const id of ids){const el=document.getElementById(id);const font=getComputedStyle(el).fontSize;",
   "const glyph=getComputedStyle(el,'::before');const mask=glyph.webkitMaskImage||glyph.maskImage;",
   "if(id==='castBtn'){const svg=el.querySelector('svg[data-iptv-svg-icon=cast]');if(!svg||svg.getBoundingClientRect().width<18||glyph.display!=='none')bad.push(id+':bad-inline-svg');continue;}",
   "if(font!=='0px'||glyph.display==='none'||parseFloat(glyph.width)<15||!mask||mask==='none')bad.push(id+':'+font+':'+glyph.width);}",
   "document.body.dataset.firstPaint=bad.length?'invalid':'valid';document.body.dataset.problems=bad.join(',');};</script>",
   '</body></html>'
  ].join('');
  fs.writeFileSync(dest,fixture);
  try {
   const output=execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files','--window-size='+width+',900','--dump-dom','file://'+dest],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000});
   assert.match(output,/data-first-paint="valid"/,output.match(/data-problems="[^"]*"/)?.[0]||'unknown');
  }finally{fs.unlinkSync(dest);}
 });
}
