'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Light appearance palette is linked after all legacy, AI, video and channel CSS',()=>{
 const html=read('renderer/index.html');
 const link='theme-light-coherence-v42378.css';
 assert.equal((html.match(/theme-light-coherence-v42378\.css/g)||[]).length,1);
 assert.ok(html.indexOf(link)>html.indexOf('player-web-svg-v42377.css'));
 assert.ok(html.indexOf(link)>html.indexOf('unified-ai-inline-v1.css'));
 assert.ok(html.indexOf(link)>html.indexOf('video-enhancement-electron-v42375.css'));
});
test('Light overrides do not touch persisted settings or other appearance modes',()=>{
 const css=read('renderer/theme-light-coherence-v42378.css');
 assert.ok(css.includes('html[data-theme="light"]'));
 assert.ok(css.includes('html[data-theme="light"][data-ui-style="current"]'));
 assert.doesNotMatch(css,/localStorage|data-theme="dark"|data-theme="amoled"/);
 assert.ok(css.includes('var(--accent)'));
});
test('Legacy dark sections in screenshots get Light palette coverage',()=>{
 const css=read('renderer/theme-light-coherence-v42378.css');
 for(const name of ['.dvr-panel','.epg-summary','.health-table','.doctor-v3-panel',
 '.collector-progress','.source-hub','.settings-card','.web-chooser-main',
 '.unified-ai-toggle','.video-enhance-toggle','.veh-card','#page-tv .web-channel-chooser']){
  assert.ok(css.includes(name),'missing palette rule: '+name);
 }
 assert.match(css,/\.player-box video/);
});
