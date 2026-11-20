'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('fullscreen Web dock scripts are loaded after IPTVState and player UX',()=>{
 const html=read('renderer/index.html');
 assert.match(html,/fullscreen-web-v42371\.css/);
 assert.match(html,/fullscreen-web-v42371\.js/);
 assert.ok(html.indexOf('player-ux.js')<html.indexOf('fullscreen-web-v42371.js'));
 assert.ok(html.indexOf('app.js')<html.indexOf('fullscreen-web-v42371.js'));
});
test('fullscreen control extension parses and uses native player selectors',()=>{
 const code=read('renderer/fullscreen-web-v42371.js');
 assert.doesNotThrow(()=>new Function(code));
 for(const id of ['playerBox','fullscreenUX','video','manualStreamSelect','videoFit','favCurrentBtn','openGuideBtn','pipBtn'])assert.ok(code.includes(id),id);
 assert.match(code,/fullscreenchange/);
 assert.match(code,/dispatchEvent\(new Event\('change'/);
});
test('fullscreen fit settings and visibility are scoped to fullscreen',()=>{
 const css=read('renderer/fullscreen-web-v42371.css');
 for(const fit of ['contain','cover','fill','none'])assert.ok(css.includes('video.fit-'+fit),fit);
 assert.match(css,/\.player-box:not\(:fullscreen\) \.fs-web-button/);
});
