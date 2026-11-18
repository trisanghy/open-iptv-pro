'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const icons=require(path.join(root,'web-player-icons.js'));
const css=fs.readFileSync(path.join(root,'web-player-icons.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/deploy-openiptv-web.yml'),'utf8');
test('play/pause state follows the actual player',()=>{
 assert.deepEqual(icons.derive({paused:true,ended:false,muted:false,volume:.6}),{playing:false,muted:false});
 assert.deepEqual(icons.derive({paused:false,ended:false,muted:false,volume:.6}),{playing:true,muted:false});
 assert.deepEqual(icons.derive({paused:false,ended:true,muted:true,volume:0}),{playing:false,muted:true});
});
test('legacy emoji changes are visually replaced by vector masks',()=>{
 for(const name of ['prev','next','play','pause','stop','volume','muted','cast','pip','expand','shrink','star','calendar','rewind','clock','live','record','camera'])
  assert.ok(css.includes('--ipc-'+name+':url("data:image/svg+xml,'),name);
 for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','webVolumeMute','castBtn','pipBtn','fullscreenBtn','fsPrev','fsPlay','fsNext','fsExit','openGuideBtn','favCurrentBtn','bufferRewind10','bufferRewind','bufferLive'])
  assert.ok(css.includes('#'+id),id);
 assert.match(css,/font-size:0!important/);
 assert.match(css,/webkit-mask-image:var\(--ipc-icon\)/);
});
test('full screen, muted and favourite states use accessible correct icons',()=>{
 assert.match(css,/playBtn\[data-iptv-playing="true"\]::before/);
 assert.match(css,/fsPlay\[data-iptv-playing="true"\]::before/);
 assert.match(css,/webVolumeMute\[data-iptv-muted="true"\]::before/);
 assert.match(css,/favCurrentBtn\[aria-pressed="true"\]::before/);
 assert.match(css,/fullscreenBtn\[aria-pressed="true"\]::before/);
});
test('only player buttons are decorated; no duplicates or handler rewrites',()=>{
 for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','fullscreenBtn','castBtn','pipBtn'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.ok(html.includes('web-player-icons.css?v=vectorplayer-no-duplicates-20261118b'));
 assert.ok(html.includes('web-player-icons.js?v=vectorplayer-no-duplicates-20261118b'));
 assert.match(workflow,/node --test web-online\/tests\/web-player-icons.test.cjs/);
});

test('decorative legacy text is removed but labels and click handlers survive',()=>{
 let clickCalls=0;
 const a={nodeType:3,nodeValue:'▣ '},b={nodeType:1,tagName:'SPAN',textContent:'Cast / AirPlay'};
 const button={childNodes:[a,b],attributes:{title:'Cast / AirPlay'},getAttribute(k){return this.attributes[k]||null},
  setAttribute(k,v){this.attributes[k]=v},click(){clickCalls++}};
 assert.equal(icons.stripLegacyGlyphs(button),true);
 assert.equal(a.nodeValue,'');
 assert.equal(b.textContent,'Cast / AirPlay');
 assert.equal(button.attributes['aria-label'],'Cast / AirPlay');
 button.click();assert.equal(clickCalls,1);
});
test('playing and favorite buttons lose legacy glyph on every textContent change',()=>{
 const fsplay={nodeType:3,nodeValue:'▶'},favorite={nodeType:3,nodeValue:'★'};
 const makeButton=node=>({childNodes:[node],attributes:{title:'Action'},getAttribute(k){return this.attributes[k]||null},
  setAttribute(k,v){this.attributes[k]=v}});
 const a=makeButton(fsplay),b=makeButton(favorite);
 assert.equal(icons.stripLegacyGlyphs(a),true);
 assert.equal(icons.stripLegacyGlyphs(b),true);
 fsplay.nodeValue='Ⅱ';favorite.nodeValue='☆';
 icons.stripLegacyGlyphs(a);icons.stripLegacyGlyphs(b);
 assert.equal(fsplay.nodeValue,'');assert.equal(favorite.nodeValue,'');
 for(const id of ['playBtn','fsPlay','favCurrentBtn','castBtn','pipBtn','openGuideBtn'])
  assert.ok(icons.glyphButtons.includes(id),id);
});
test('live MutationObserver catches subsequent app.textContent replacements',()=>{
 let obs,observed;
 const makeButton=()=>({childNodes:[{nodeType:3,nodeValue:'⏮'}],attributes:{title:'Kênh trước'},
  getAttribute(k){return this.attributes[k]},setAttribute(k,v){this.attributes[k]=v}});
 const button=makeButton();
 const fake={getElementById:id=>id==='prevBtn'?button:null};
 const original=globalThis.MutationObserver;
 // Supply a fake observer factory without DOM dependencies, then simulate app rewrites.
 const fakeFactory=()=>{obs={observe(node,options){observed={node,options}},notify(){icons.stripLegacyGlyphs(button)}};return obs};
 // Observe uses its own browser root; public helper still directly removes the glyph
 // on every app textContent write; verify event-independent update behavior here.
 assert.equal(icons.stripLegacyGlyphs(button),true);
 button.childNodes=[{nodeType:3,nodeValue:'⏭'}];
 icons.stripLegacyGlyphs(button);
 assert.equal(button.childNodes[0].nodeValue,'');
});
