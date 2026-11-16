'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','renderer');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const html=read('index.html'),css=read('ui-refined.css'),stage=read('theme-stage.js'),features=read('features.js'),ui=read('ui-style.js');
test('11-theme switcher includes real layout stylesheet and stage engine',()=>{
 assert.match(html,/href="ui-refined\.css"/);assert.match(html,/src="theme-stage\.js"/);
 for(const id of ['themeGuidePanel','themeChannelStrip','themeStripItems','themeChannelScrim','themeAllChannels'])assert.ok(html.includes(`id="${id}"`),id);
});
test('Cinema uses theatre two-zone layout with native player and horizontal channels',()=>{
 assert.match(css,/data-ui-style="cinema"[^\n]*#page-tv \.tv-layout\{[^}]*grid-template-areas:"video guide" "strip strip"/);
 assert.match(css,/data-ui-style="cinema"[^\n]*#page-tv \.channel-panel\{position:fixed/);
 assert.match(stage,/player\.appendChild\(card\)/);
 assert.match(stage,/watch\.insertBefore\(card,timebar\)/);
});
test('Glass uses true 3-column channel-video-EPG layout and separate time controls',()=>{
 assert.match(css,/data-ui-style="glass"[^\n]*#page-tv \.tv-layout\{[^}]*grid-template-areas:"channels video guide"/);
 assert.match(css,/data-ui-style="glass"[^\n]*#page-tv \.channel-panel\{grid-area:channels/);
});
test('Channel strip reuses IPTV channels and clicks the original player without importing feeds',()=>{
 assert.match(stage,/window\.IPTVState\?\.getChannels\?\.\(\)/);
 assert.match(stage,/window\.IPTVState\?\.playChannel\?\.\(ch\.id\)/);
 assert.doesNotMatch(stage,/importSource|addSource|createPlayer|new Hls/);
});
test('User-selected accent persists independently and overrides palette in TV interfaces',()=>{
 assert.match(features,/config\.accentCustom=true/);
 assert.match(features,/document\.documentElement\.dataset\.customAccent/);
 assert.match(ui,/setProperty\('--ui-primary',color\)/);
 assert.match(css,/html\[data-custom-accent="true"\]:not\(\[data-ui-style="current"\]\) :is\(\.btn-primary/);
 assert.match(css,/#colorWheel #wheelHole\{box-shadow:0 0 0 5px/);
});
