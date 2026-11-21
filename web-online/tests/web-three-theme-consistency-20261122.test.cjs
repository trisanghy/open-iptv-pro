'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..','..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Web production index loads theme parity after every legacy desktop/mobile module',()=>{
 const html=read('index.html'),file='web-three-theme-consistency-20261122.css';
 assert.equal(html.split(file).length-1,1);
 for(const before of ['web-light-consistency-20261122.css','web-mobile-player.css','web-tv-channel-hub.css','web-source-repair-layout.css','web-fullscreen-controls.css']){
  assert.ok(html.indexOf(file)>html.indexOf(before),before+' loaded too late');
 }
});
test('All three themes preserve data, user accent and player fullscreen',()=>{
 const css=read('web-three-theme-consistency-20261122.css');
 for(const mode of ['light','dark','amoled'])assert.ok(css.includes('data-theme="'+mode+'"'),mode);
 for(const el of ['.web-hub-chip.active','.web-hub-tile.current','.web-hub-main',
  '.mobile-more-panel','.mobile-more-action','.mobile-more-backdrop',
  '#appSidebar','.player-control-card','#webMobileVolumePanel',
  '.epg-row','.source-hub-section','#cloudSyncCard']){
  assert.ok(css.includes(el),'missing '+el);
 }
 assert.match(css,/--web-coherent-selected:color-mix\(in srgb,var\(--accent\)/);
 assert.doesNotMatch(css,/localStorage|sessionStorage|\.innerHTML|playChannel|\.fetch\(|\.removeItem\(/);
});
test('AMOLED background is black, cards grayscale; Dark respects alternate styles',()=>{
 const css=read('web-three-theme-consistency-20261122.css');
 assert.match(css,/--web-coherent-card:#080808/);
 assert.match(css,/--web-coherent-control:#151515/);
 assert.match(css,/background:#000!important/);
 assert.match(css,/data-ui-style="current"/);
 assert.match(css,/:not\(\[data-ui-style\]\)/);
});
test('Mobile More sheet has three separate color schemes including Light white',()=>{
 const css=read('web-three-theme-consistency-20261122.css');
 assert.match(css,/data-theme="light"\] \.mobile-more-panel/);
 assert.match(css,/rgba\(255,255,255,\.96\)/);
 assert.match(css,/data-theme="amoled"\] \.mobile-more-panel/);
 assert.match(css,/background:#080808!important/);
 assert.match(css,/#webMobileVolumePanel/);
});
test('Web Light regression and legal consent remain present',()=>{
 const html=read('index.html');
 assert.ok(html.includes('web-light-consistency-20261122.css'));
 assert.ok(html.includes('source-use-consent-v1.js'));
 assert.ok(read('.github/workflows/deploy-openiptv-web.yml').includes('find . -maxdepth 1 -type f'));
});
