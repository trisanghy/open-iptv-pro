'use strict';
// P328: native Electron CDP verifies actual keyboard shortcuts and protected input contexts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.resolve('positron-evidence','p5-20-rounds');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const measure=page=>page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),ai=document.getElementById('poFlowPlusAI');
 const r=ai.getBoundingClientRect(),bounds=p.getBoundingClientRect();
 return {tv:document.getElementById('page-tv').classList.contains('active-page'),
  open:!p.hidden,active:p.dataset.poAiActive==='true',pressed:ai.getAttribute('aria-pressed')==='true',
  focus:document.activeElement?.id||'',shortcuts:ai.getAttribute('aria-keyshortcuts')||'',
  tabVisible:r.width>0&&r.height>0&&r.top>=bounds.top&&r.bottom<=bounds.bottom+2,
  overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};
});
const saved=page=>page.evaluate(()=>({
 ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
 model:localStorage.getItem('positron-intelligence-preferences-v1'),
 playing:window.IPTVState.getCurrent()?.id||''
}));
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.close();
  document.getElementById('poWatchFlowToggle').focus();});
 const initial=await saved(page),closed=await measure(page);
 const b=await page.screenshot({path:path.join(dir,'positron-p51328-ai-shortcut-before-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>document.activeElement?.id==='poFlowPlusAI'&&
  document.getElementById('poWatchFlowPanel')?.dataset.poAiActive==='true',null,{timeout:12000});
 const opened=await measure(page);
 const a=await page.screenshot({path:path.join(dir,'positron-p51328-ai-shortcut-after-1920x1080-real.png'),animations:'disabled'});
 await page.evaluate(()=>window.PositronWatchFlow.close());
 const inputFound=await page.evaluate(()=>{
  const input=document.querySelector('#page-tv input:not([type="checkbox"]):not([disabled])');
  if(!input)return false;input.focus();return true;
 });
 if(inputFound)await page.keyboard.press('F6');
 const typing=await measure(page);
 await page.evaluate(()=>window.IPTVState.setPage('sources'));
 await page.keyboard.press('Alt+Shift+W');
 const nonTV=await measure(page);
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.close();
  document.getElementById('poWatchFlowToggle').focus();});
 await page.setViewportSize({width:720,height:900});
 await page.keyboard.press('Alt+Shift+W');
 await page.waitForFunction(()=>document.activeElement?.id==='poFlowPlusAI'&&
  document.getElementById('poWatchFlowPanel')?.dataset.poAiActive==='true',null,{timeout:12000});
 const narrow=await measure(page);
 const n=await page.screenshot({path:path.join(dir,'positron-p51328-ai-shortcut-after-720x900-real.png'),animations:'disabled'});
 const final=await saved(page);
 const qa328={
  beforePanelClosed:closed.tv&&!closed.open,
  f6OpensAIAndFocuses:opened.open&&opened.active&&opened.pressed&&opened.focus==='poFlowPlusAI',
  bothShortcutsDeclared:opened.shortcuts.includes('F6')&&opened.shortcuts.includes('Alt+Shift+W'),
  ignoresTextInputs:!inputFound||!typing.open,
  ignoresOtherPages:!nonTV.tv&&!nonTV.open,
  altShiftWOpensNarrow:narrow.open&&narrow.active&&narrow.pressed&&narrow.focus==='poFlowPlusAI',
  buttonsVisible:opened.tabVisible&&narrow.tabVisible,
  noHorizontalOverflow:!opened.overflow&&!narrow.overflow,
  playlistUnchanged:initial.ids===final.ids,
  modelUnchanged:initial.model===final.model,
  noAutoplay:initial.playing===final.playing
 };
 for(const [k,v] of Object.entries(qa328))assert.equal(v,true,
  'P328 actual Electron keyboard QA '+k+': '+JSON.stringify({closed,opened,typing,nonTV,narrow,qa328}));
 assert.ok(!b.equals(a),'P328 before/after shortcuts should change visible dialog');
 for(const [png,w,h] of [[b,1920,1080],[a,1920,1080],[n,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51328-ai-shortcut.json',JSON.stringify({
  version:'P5.1.328',app:'4.23.413',realElectron:true,
  before:{...closed,sha256:hash(b)},after:{...opened,sha256:hash(a)},
  narrow:{...narrow,sha256:hash(n)},typing,nonTV,qa328,
  scope:'focus/keyboard UI only, no licensed stream/GPU testing'
 },null,2));
 console.log('P328 native Electron AI keyboard QA',JSON.stringify(qa328));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
