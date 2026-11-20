'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),test=require('node:test');
const base=path.join(__dirname,'..','renderer');
const file=n=>fs.readFileSync(path.join(base,n),'utf8');
const html=file('index.html'),web=file('web-player-icons.css'),adapter=file('rust-web-player-icons.css');
const source=file('fullscreen-web-parity-v23-8-59.js');
const parity=file('electron-player-parity-v23-8-21.js');
const icons=require('../renderer/web-player-icons.js');
test('Web SVG masks are bundled offline and linked last in Rust Lab',()=>{
 assert.match(html,/href="web-player-icons\.css"/);
 assert.match(html,/href="rust-web-player-icons\.css"/);
 assert.match(html,/src="web-player-icons\.js"/);
 assert.match(html,/src="rust-web-player-icons\.js"/);
 assert.ok(html.indexOf('web-player-icons.css')>html.indexOf('fullscreen-web-parity-v23-8-59.css'));
 assert.ok(html.indexOf('rust-web-player-icons.js')>html.indexOf('app-entry.js'));
 for(const key of ['prev','next','play','pause','stop','volume','muted','cast','pip','expand','shrink','calendar','star','starfill','record','camera','sliders'])
  assert.ok(web.includes('--ipc-'+key+':url('),'missing vector '+key);
});
test('Transport icons have exact Web SVG masks and dynamic play state',()=>{
 for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','fsPrev','fsPlay','fsNext','openGuideBtn'])
  assert.ok(web.includes('#page-tv #'+id+'::before'),'missing '+id);
 assert.match(web,/#playBtn\[data-iptv-playing="true"\]/);
 assert.match(web,/#fsPlay\[data-iptv-playing="true"\]/);
 assert.deepEqual(icons.derive({paused:false,ended:false,muted:false,volume:0.6}),{playing:true,muted:false});
 assert.deepEqual(icons.derive({paused:true,ended:false,muted:true,volume:0}),{playing:false,muted:true});
 assert.deepEqual(icons.derive({paused:true,ended:false,muted:false,volume:0.5},{active:true,getPlaybackState:()=>({playing:true,muted:false})}),{playing:true,muted:false});
});
test('Rust adapter covers volume, fullscreen menus, favorite, PiP and EPG',()=>{
 for(const id of ['fsWebFavorite','fsWebSettings','fsWebPiP','fsWebFitButton','fsWebLinkButton','fsEPG','fsDVR','fsExit','electronParityFfmpeg'])
  assert.ok(adapter.includes('#'+id),'uncovered '+id);
 assert.match(adapter,/electron-parity-volume label\[data-iptv-muted="true"\]/);
 assert.match(adapter,/fs-web-mute\[data-iptv-muted="true"\]/);
 assert.match(source,/mute\.dataset\.iptvMuted=String/);
 assert.match(source,/favorite\.setAttribute\('aria-pressed'/);
 assert.match(parity,/guide\.textContent='';/);
 assert.match(file('rust-web-player-icons.js'),/addEventListener\('volumechange',sync/);
});
test('No legacy Unicode icon labels on fullscreen actions',()=>{
 for(const legacy of ['◖))','▣ Khung hình','♧ Link','⚙ Cài đặt','▣ Chụp ảnh'])
  assert.ok(!source.includes(legacy),'legacy full-screen glyph '+legacy);
});
