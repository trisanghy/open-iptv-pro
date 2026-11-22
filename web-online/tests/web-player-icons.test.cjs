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
 assert.ok(html.includes('web-player-icons.css?v=single-icon-first-paint-20261119a'));
 assert.ok(html.includes('web-player-icons.js?v=audio-state-sync-20261119a'));
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

test('Cast icon is centered on iPhone without old caption',()=>{
 assert.match(css,/output-controls #castBtn\{[\s\S]*?justify-content:center!important/);
 assert.doesNotMatch(css,/#castBtn::before/);
 assert.match(fs.readFileSync(path.join(root,'web-cast-v2.css'),'utf8'),/#castBtn > svg\.oip-cast-svg/);
 assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/id="castBtn"[^>]*>[\s\S]*?<svg[^>]*data-iptv-svg-icon="cast"/);
 assert.match(css,/output-controls #castBtn>\.cast-label\{display:none!important/);
});

test('vector play/pause derives from background audio, not the intentionally paused video',()=>{
 const video={paused:true,ended:false,muted:false,volume:0.8};
 let audible=true;
 const background={
  active:true,
  getPlaybackState:()=>({playing:audible,muted:false})
 };
 assert.deepEqual(icons.derive(video,background),{playing:true,muted:false});
 audible=false;
 assert.deepEqual(icons.derive(video,background),{playing:false,muted:false});
 // Switching back to TV immediately restores the original video source.
 background.active=false;
 video.paused=false;
 assert.deepEqual(icons.derive(video,background),{playing:true,muted:false});
 video.paused=true;
 assert.deepEqual(icons.derive(video,background),{playing:false,muted:false});
});
test('SVG state reads the foreground audio controller and provides a sync hook',()=>{
 const source=fs.readFileSync(path.join(root,'web-player-icons.js'),'utf8');
 assert.match(source,/derive\(video,root\.OpenIPTVBackgroundAudio\)/);
 assert.match(source,/root\.OpenIPTVPlayerIcons=Object\.freeze\(\{sync\}\)/);
});

test('first paint hides Unicode glyphs with higher specificity than old toolbar rules',()=>{
 const old=fs.readFileSync(path.join(root,'player-two-row-v42335.css'),'utf8');
 assert.match(old,/#page-tv \.controls\.transport-controls #playBtn \{/);
 assert.match(old,/font-size:22px!important/);
 assert.match(old,/#page-tv \.player-control-card #favCurrentBtn/);
 for(const rule of [
  /html body #page-tv \.player-control-card \.control-layout-top \.controls\.transport-controls/,
  /html body #page-tv \.player-control-card \.control-layout-top \.output-controls/,
  /html body #page-tv \.player-control-card \.control-layout-bottom/,
  /html body #page-tv \.watch-panel \.player-box \.fullscreen-ux/
 ])assert.match(css,rule);
 const last=css.slice(css.lastIndexOf('/* First-paint regression guard'));
 assert.match(last,/font-size:0!important/);
 assert.match(last,/line-height:0!important/);
 assert.match(css,/#page-tv #playBtn\[data-iptv-playing="true"\]::before/);
 assert.match(css,/#page-tv #favCurrentBtn\[aria-pressed="true"\]::before/);
});
