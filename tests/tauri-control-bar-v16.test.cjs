'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'../renderer');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const js=fs.readFileSync(path.join(base,'control-bar-v16.js'),'utf8');
const css=fs.readFileSync(path.join(base,'control-bar-v16.css'),'utf8');
const project=JSON.parse(fs.readFileSync(path.join(__dirname,'../package.json'),'utf8'));
test('v16 loads compact CSS and DOM reorganization before renderer event initialization',()=>{
 assert(html.includes('href="control-bar-v16.css"'));
 assert(html.includes('src="control-bar-v16.js"'));
 assert(html.indexOf('src="control-bar-v16.js"')<html.indexOf('src="app-entry.js"'));
 assert(project.scripts['test:quick'].includes('tauri-control-bar-v16.test.cjs'));
});
test('original player controls are preserved with unique IDs and remain accessible after relocation',()=>{
 for(const id of ['playBtn','prevBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn','videoFit','favCurrentBtn','manualLinkSelect','shotBtn','volume']){
  assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,`Duplicate or missing ${id}`);
  assert(js.includes('top.append(info,controls,cast)')&&js.includes('bottom.append(epg,options)'), 'Original DOM control groups are not reused');
 }
 assert(js.includes('top.append(info,controls,cast)'));
 assert(js.includes('bottom.append(epg,options)'));
});
test('EPG summary reads real now/next programmes, includes time, opens full guide and has safe fallbacks',()=>{
 assert(js.includes('root.IPTVExtras?.getGuide?.()'));
 assert(js.includes('root.IPTVGuide.current(guide,channel)'));
 assert(js.includes('current.title.textContent=now?.title'));
 assert(js.includes('next.title.textContent=later?.title'));
 assert(js.includes("el('openGuideBtn')?.click()"));
 assert(!js.includes('Thời sự 19h')&&!js.includes('Kế hoạch CM12'));
 assert(js.includes('observe(\'epgNowText\')'));
 assert(js.includes('setInterval(update,60000)'));
});
test('layout has two rows, restored fit selector, compact source, and no duplicate visible volume column',()=>{
 for(const name of ['v16-toolbar-top','v16-toolbar-bottom','v16-epg-summary','v16-stream-options','v16-cast-controls'])assert(css.includes(name));
 assert(js.includes("const fit=controls.querySelector('.view-mode')"));
 assert(js.includes("const manual=el('manualLinkControl'),favorite=el('favCurrentBtn')"));
 assert(js.includes("quick.insertBefore(extra,quick.querySelector('.quick-grid'))"));
 assert(css.includes('.v16-stream-options .manual-link-select'));
 assert(css.includes('.v16-volume-label'));
});
