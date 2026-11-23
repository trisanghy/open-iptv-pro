'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),app=read('app.js'),builder=read('web-online/prepare-web.py');
test('Web startup does not fetch or execute two large video decoders before playback',()=>{
 assert.doesNotMatch(html,/<script src="(?:hls\.min|dash\.all\.min)\.js"/);
 assert.match(html,/<script src="web-playback-libs\.js\?v=startup-fastload-20261123a"><\/script>/);
 assert.ok(html.indexOf('web-playback-libs.js?v=')<html.indexOf('app.js?v='));
 assert.match(app,/OpenIPTVPlaybackLibs\.load\('hls'\)/);
 assert.match(app,/OpenIPTVPlaybackLibs\?\.load\?\.\('dash'\)/);
 assert.doesNotMatch(app,/cdn\.jsdelivr\.net\/npm\/hls\.js/);
});
test('Only TV page is rendered on initial boot; hidden views render on navigation',()=>{
 assert.match(app,/function render\(preserveScroll=false,startup=false\)/);
 assert.match(app,/if\(!startup\)\{renderSources\(\);renderShots\(\);renderFavorites\(\);renderFolders\(\);\}/);
 assert.match(app,/wire\(\);render\(false,true\);if\(upgradedChecker\)save\(\)/);
 const begin=app.indexOf(' function renderOnNavigation(p){'),end=app.indexOf(' function closeModal(){',begin);
 const route=app.slice(begin,end);
 for(const name of ['renderSources','renderShots','renderFavorites','renderFolders'])assert.ok(route.includes(name+'()'));
});
test('Generated Web build preserves lightweight bootstrap and offline media libraries',()=>{
 assert.match(builder,/Web startup fast path/);
 assert.match(builder,/Web fastload DASH anchor changed/);
 assert.match(builder,/Web fastload decoder script anchor changed/);
 assert.match(builder,/web-playback-libs\.js/);
 assert.match(builder,/wire\(\);render\(false,true\)/);
});
