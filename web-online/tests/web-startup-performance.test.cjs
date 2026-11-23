'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),app=read('app.js'),builder=read('web-online/prepare-web.py');
test('Web preloads both same-origin HLS and DASH decoders',()=>{
 assert.match(html,/<script src="hls\.min\.js"><\/script><script src="dash\.all\.min\.js"><\/script>/);
 assert.ok(html.indexOf('hls.min.js')<html.indexOf('app.js?v='));
 assert.ok(html.indexOf('dash.all.min.js')<html.indexOf('app.js?v='));
 assert.match(html,/web-playback-libs\.js\?v=startup-fastload-20261123a/);
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
 assert.match(builder,/Web eager decoder script anchor changed/);
 assert.match(builder,/web-playback-libs\.js/);
 assert.match(builder,/wire\(\);render\(false,true\)/);
});
