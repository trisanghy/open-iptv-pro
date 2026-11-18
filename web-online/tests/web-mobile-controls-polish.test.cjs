'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const css=fs.readFileSync(path.join(root,'web-mobile-controls-polish.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/deploy-openiptv-web.yml'),'utf8');
test('Four player output buttons share centered 24px SVG masks and equal touch targets',()=>{
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/:is\(#webVolumeMute,#castBtn,#pipBtn,#fullscreenBtn\)\{/);
 assert.match(css,/place-items:center!important/);
 assert.match(css,/transform:translate\(-50%,-50%\)!important/);
 assert.match(css,/width:24px!important;height:24px!important/);
 assert.match(css,/height:48px!important/);
 assert.match(css,/--ipc-icon:var\(--iptv-airplay-icon\)/);
 assert.match(css,/--ipc-icon:var\(--iptv-fullscreen-icon\)/);
 assert.match(css,/fullscreenBtn\[aria-pressed="true"\]::before/);
});
test('Five bottom tabs fit narrow iPhones with no flex overflow',()=>{
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
 assert.match(css,/justify-items:stretch!important/);
 assert.match(css,/width:auto!important;min-width:0!important;max-width:100%!important/);
 assert.match(css,/flex:none!important/);
 assert.match(css,/overflow-x:hidden!important;overflow-y:hidden!important/);
 assert.match(css,/safe-area-inset-bottom/);
 for(const name of ['tv','fav','epg','sources'])assert.ok(css.includes('[data-page="'+name+'"]'));
 assert.ok(css.includes('.mobile-more-trigger'));
});
test('Polish stylesheet loads last in both Pages and generated Web builds',()=>{
 assert.match(html,/web-tv-wide\.css[^"]*"\/><link rel="stylesheet" href="web-mobile-controls-polish\.css\?v=mobile-controls-align-20261118l"/);
 assert.ok(builder.includes("'web-mobile-controls-polish.css'"));
 assert.ok(builder.includes('web-mobile-controls-polish.css?v=mobile-controls-align-20261118l'));
 assert.ok(workflow.includes('web-online/tests/web-mobile-controls-polish.test.cjs'));
});
test('Styles are mobile-scoped and leave desktop navigation intact',()=>{
 assert.doesNotMatch(css,/^\s*body #appShell>#appSidebar\{/m);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #appShell>#appSidebar/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv/);
});
