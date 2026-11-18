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
 assert.ok(html.includes('web-player-icons.css?v=vectorplayer-20261118a'));
 assert.ok(html.includes('web-player-icons.js?v=vectorplayer-20261118a'));
 assert.match(workflow,/node --test web-online\/tests\/web-player-icons.test.cjs/);
});
