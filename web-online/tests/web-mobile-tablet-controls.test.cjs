'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('web-mobile-tablet-controls.css'),html=read('index.html'),builder=read('web-online/prepare-web.py');
test('tablet mobile only fixes buttons without changing desktop, iPhone, fullscreen or navigation',()=>{
 assert.match(css,/@media \(min-width:761px\)/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv/);
 assert.doesNotMatch(css,/html\[data-iptv-device="desktop"\]/);
 assert.match(css,/width:52px!important;height:52px!important/);
 assert.match(css,/width:64px!important;height:64px!important/);
 assert.doesNotMatch(css,/#appSidebar|#channelList|#playerBox:fullscreen/);
});
test('four source controls remain equal-sized and not stretched across 2k screens',()=>{
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/width:min\(100%,960px\)!important/);
 assert.match(css,/#webVolumeMute\{grid-area:1\/1\/2\/2!important\}/);
 assert.match(css,/#fullscreenBtn\{grid-area:1\/4\/2\/5!important\}/);
});
test('all icons use normal flow rather than competing absolute offsets',()=>{
 const fix=css.slice(css.indexOf('Root fix: position SVG masks'));
 assert.match(fix,/display:flex!important;\s*align-items:center!important;\s*justify-content:center!important/);
 assert.match(fix,/position:static!important/);
 assert.match(fix,/transform:none!important/);
 assert.match(fix,/flex:0 0 27px!important/);
 assert.match(fix,/inset:auto!important/);
});
test('correct cache-busted asset is present in both published and generated Web',()=>{
 assert.match(html,/web-mobile-tablet-controls\.css\?v=tablet-controls-20261119b/);
 assert.match(builder,/web-mobile-tablet-controls\.css\?v=tablet-controls-20261119b/);
 assert.match(builder,/'web-mobile-tablet-controls\.css'/);
});
