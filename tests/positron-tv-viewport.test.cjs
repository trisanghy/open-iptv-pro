'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('P5.1.225 bounds desktop TV stage height but preserves actual video object fit and fullscreen',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 assert.ok(css.includes('P5.1.225 — Desktop TV'));
 assert.ok(css.includes('(min-width:1180px) and (min-height:901px) and (max-height:1150px)'));
 assert.ok(css.includes('#page-tv #playerBox:not(:fullscreen)'));
 assert.ok(css.includes('max-height:calc(100dvh - 340px)!important'));
 const aspect=read('renderer/video-source-aspect-v42338.css');
 assert.ok(aspect.includes('object-fit: contain'));
 assert.ok(aspect.includes('#page-tv #playerBox:not(:fullscreen)'));
 assert.ok(read('scripts/positron-50-audit.cjs').includes('P5.1.225 native Electron TV viewport control audit PASS'));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=310,'P225 desktop TV regression must remain enabled in later Positron patches');
});
