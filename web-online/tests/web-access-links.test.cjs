'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const home=read('index.html');
const ui=read('web-cast-v2.js');
const css=read('web-cast-v2.css');
const nav=read('web-access-links.js');
const navCss=read('web-access-links.css');
const shortcuts={
 webShort:'https://is.gd/openiptv',
 webOriginal:'https://trisanghy.github.io/open-iptv-pro/',
 tvShort:'https://is.gd/IPTVTV',
 tvOriginal:'https://trisanghy.github.io/open-iptv-pro/tv.html'
};
test('website preserves both short and original URLs for Web and TV',()=>{
 assert.match(home,/id="oipAccessLinks"/);
 for(const [name,url] of Object.entries(shortcuts)){
  assert.ok(home.includes('href="'+url+'"'),name+' must be a clickable URL');
  assert.ok(home.includes('data-copy-url="'+url+'"'),name+' must have its own copy button');
 }
 assert.match(home,/Link gốc dự phòng/);
 assert.match(home,/web-access-links\.css\?v=dual-links-20261122a/);
 assert.match(home,/web-access-links\.js\?v=dual-links-20261122a/);
 assert.match(nav,/clipboard\.writeText\(value\)/);
 assert.match(nav,/mountMobile/);
 assert.match(nav,/oipMobileLinkAction/);
 assert.match(nav,/oipMobileLinkOverlay/);
 assert.match(nav,/clipboard\.writeText\(button\.dataset\.copyUrl\)/);
});
test('Cast TV pairing panel displays short and original TV URL simultaneously',()=>{
 assert.match(ui,/const tvUrl=\(\)=> 'https:\/\/is\.gd\/IPTVTV'/);
 assert.match(ui,/const tvOriginalUrl=\(\)=> 'https:\/\/trisanghy\.github\.io\/open-iptv-pro\/tv\.html'/);
 assert.match(ui,/id=\\"cxTvUrl\\"/);
 assert.match(ui,/id=\\"cxTvOriginalUrl\\"/);
 assert.match(ui,/id=\\"cxCopyTvOriginal\\"/);
 assert.match(ui,/\$\('cxTvOriginalUrl'\)\.href=tvOriginalUrl\(\)/);
 assert.match(ui,/clipboard\.writeText\(tvOriginalUrl\(\)\)/);
 assert.match(ui,/clipboard\.writeText\(tvUrl\(\)\)/);
 assert.match(css,/\.cx-link-row/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto/);
});
test('both access dialogs support light, dark and AMOLED and narrow screens',()=>{
 for(const mode of ['light','amoled'])assert.ok(navCss.includes('html[data-theme="'+mode+'"]'));
 assert.match(navCss,/#oipMobileLinkOverlay/);
 assert.match(navCss,/\[hidden\]\{display:none!important\}/);
 assert.match(navCss,/max-width:600px/);
 assert.match(navCss,/overflow-wrap:anywhere/);
 assert.match(navCss,/\.oip-links-row a/);
});
