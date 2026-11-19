'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('web-mobile-tablet-controls.css'),html=read('index.html'),builder=read('web-online/prepare-web.py');
test('mobile tablet toolbar is based on explicit mobile state, not coarse pointer or narrow viewport',()=>{
 assert.match(css,/@media \(min-width:761px\)/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv/);
 assert.doesNotMatch(css,/pointer:coarse|html\[data-iptv-device="desktop"\]/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) max-content!important/);
 assert.match(css,/grid-template-rows:minmax\(68px,auto\) 58px!important/);
});
test('touch transport is legible and never shrinks on expanded mobile windows',()=>{
 assert.match(css,/width:52px!important;height:52px!important/);
 assert.match(css,/min-width:52px!important;min-height:52px!important/);
 assert.match(css,/flex:0 0 52px!important/);
 assert.match(css,/width:64px!important;height:64px!important/);
 assert.match(css,/flex:0 0 64px!important/);
 assert.match(css,/width:29px!important;height:29px!important/);
});
test('four separate output controls remain equal width with genuine masked SVG icons',()=>{
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/#webVolumeMute\{grid-area:1\/1\/2\/2!important\}/);
 assert.match(css,/#castBtn\{grid-area:1\/2\/2\/3!important\}/);
 assert.match(css,/#pipBtn\{grid-area:1\/3\/2\/4!important\}/);
 assert.match(css,/#fullscreenBtn\{grid-area:1\/4\/2\/5!important\}/);
 assert.match(css,/width:27px!important;height:27px!important/);
 assert.match(css,/-webkit-mask-image:var\(--ipc-icon\)!important/);
});
test('Web pages and builder carry the responsive stylesheet without changing mobile tabs or desktop',()=>{
 assert.match(html,/web-mobile-tablet-controls\.css\?v=tablet-controls-20261119a/);
 assert.match(builder,/'web-mobile-tablet-controls\.css'/);
 assert.match(builder,/web-mobile-tablet-controls\.css\?v=tablet-controls-20261119a/);
 assert.doesNotMatch(css,/#appSidebar|#channelList|#playerBox:fullscreen/);
 assert.match(html,/web-mobile-controls-polish\.css\?v=quick-icons-unified-20261119b/);
});
