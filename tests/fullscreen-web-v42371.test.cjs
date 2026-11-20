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

test('fullscreen toolbar uses separate flex groups instead of legacy 42px text buttons',()=>{
 const script=read('renderer/fullscreen-web-v42371.js');
 const css=read('renderer/fullscreen-web-v42371.css');
 for(const key of ['fs-web-transport','fs-web-identity','fs-web-actions','fs-web-volume','fs-web-extras'])assert.ok(script.includes(key),key);
 assert.match(script,/dock\.replaceChildren\(seek,transport,identity,actions,volume,extras,pop\)/);
 assert.match(css,/\.fs-web-actions button\.fs-web-button\s*\{/);
 assert.match(css,/width:auto!important/);
 assert.match(css,/white-space:nowrap!important/);
 assert.match(css,/@media\(max-width:870px\)/);
});
test('fullscreen stream choice never places a URL inside the bottom action button',()=>{
 const script=read('renderer/fullscreen-web-v42371.js');
 assert.match(script,/links\.textContent=.*Link dự phòng.*Link chính/);
 assert.match(script,/links\.title=select\?\.selectedOptions/);
});
test('fullscreen volume slider uses existing persistent player volume control',()=>{
 const script=read('renderer/fullscreen-web-v42371.js');
 assert.match(script,/id='fsWebVolume'/);
 assert.match(script,/mainVolume\.dispatchEvent\(new Event\('input'/);
 assert.match(script,/mainVolume\?\.addEventListener\('input',syncVolume\)/);
});
