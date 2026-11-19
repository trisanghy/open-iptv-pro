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
 assert.match(html,/web-tv-wide\.css[^"]*"\/><link rel="stylesheet" href="web-mobile-controls-polish\.css\?v=quick-icons-unified-20261119a"/);
 assert.ok(builder.includes("'web-mobile-controls-polish.css'"));
 assert.ok(builder.includes('web-mobile-controls-polish.css?v=quick-icons-unified-20261119a'));
 assert.ok(workflow.includes('web-online/tests/web-mobile-controls-polish.test.cjs'));
});
test('Styles are mobile-scoped and leave desktop navigation intact',()=>{
 assert.doesNotMatch(css,/^\s*body #appShell>#appSidebar\{/m);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #appShell>#appSidebar/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv/);
});

test('PiP stays a single 24px vector and has no legacy text overlap',()=>{
 assert.match(html,/id="pipBtn"[^>]*aria-label="PiP"/);
 assert.doesNotMatch(html,/id="pipBtn"[^>]*<span class="pip-label">PiP<\/span>/);
 assert.match(css,/--iptv-pip-clean-icon:url\("data:image\/svg\+xml,/);
 assert.match(css,/#pipBtn::before\{\s*--ipc-icon:var\(--iptv-pip-clean-icon\)/);
 assert.match(css,/#pipBtn>\.pip-label\{\s*display:none!important/);
 assert.ok(builder.includes("pip_caption='<span class=\"pip-label\">PiP</span>'"));
});
test('Bottom SVG minimum size and label are isolated to separate grid rows',()=>{
 assert.match(css,/grid-template-rows:27px 16px!important/);
 assert.match(css,/nav \.macos-nav-symbol>svg\.apple-ui-symbol\{/);
 assert.match(css,/flex:none!important;flex-basis:auto!important/);
 assert.match(css,/width:23px!important;min-width:0!important;max-width:23px!important/);
 assert.match(css,/height:23px!important;min-height:0!important;max-height:23px!important/);
 assert.match(css,/mobile-tab-caption\{[\s\S]*?grid-row:2!important/);
});
