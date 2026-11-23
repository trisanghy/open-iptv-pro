'use strict';
// P329: actual Electron CDP keyboard toggle, open/close and focus restoration.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const out=path.resolve('positron-evidence','p5-20-rounds'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const screen=page=>page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel'),ai=document.getElementById('poFlowPlusAI');
 const btn=document.getElementById('poWatchFlowToggle'),r=panel.getBoundingClientRect();
 return {open:!panel.hidden,aiActive:panel.dataset.poAiActive==='true',
  focused:document.activeElement?.id||'',onTV:document.getElementById('page-tv').classList.contains('active-page'),
  playerVisible:!!document.getElementById('playerBox')?.getClientRects().length,
  toggleVisible:!!btn?.getClientRects().length,
  aiPressed:ai.getAttribute('aria-pressed')==='true',
  panelScrollHeight:panel.scrollHeight, panelClientHeight:panel.clientHeight,
  overlap:r.width>0&&r.height>0,
  overflow:panel.scrollWidth>panel.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};
});
const saved=page=>page.evaluate(()=>({
 channels:JSON.stringify(window.IPTVState.getChannels().map(ch=>ch.id)),
 learning:localStorage.getItem('positron-intelligence-preferences-v1'),
 playing:window.IPTVState.getCurrent()?.id||''
}));
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  window.IPTVState.setPage('tv');window.PositronWatchFlow.close();
  document.getElementById('poWatchFlowToggle').focus();
 });
 const initial=await saved(page);
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>document.activeElement?.id==='poFlowPlusAI'&&
  document.getElementById('poWatchFlowPanel')?.dataset.poAiActive==='true',null,{timeout:12000});
 const before=await screen(page);
 const beforePng=await page.screenshot({path:path.join(out,'positron-p51329-ai-key-toggle-before-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>document.getElementById('poWatchFlowPanel')?.hidden&&
  document.activeElement?.id==='poWatchFlowToggle',null,{timeout:12000});
 const after=await screen(page);
 const afterPng=await page.screenshot({path:path.join(out,'positron-p51329-ai-key-toggle-after-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>document.activeElement?.id==='poFlowPlusAI'&&!document.getElementById('poWatchFlowPanel').hidden);
 const reopened=await screen(page);
 await page.keyboard.press('Alt+Shift+W');
 await page.waitForFunction(()=>document.getElementById('poWatchFlowPanel')?.hidden&&document.activeElement?.id==='poWatchFlowToggle');
 const chordClosed=await screen(page);
 // At 720px the same two-way shortcut must not obscure navigation or trap focus.
 await page.setViewportSize({width:720,height:900});
 await page.keyboard.press('Alt+Shift+W');
 await page.waitForFunction(()=>document.activeElement?.id==='poFlowPlusAI'&&!document.getElementById('poWatchFlowPanel').hidden);
 const narrowOpen=await screen(page);
 const narrowBeforePng=await page.screenshot({path:path.join(out,'positron-p51329-ai-key-toggle-open-720x900-real.png'),animations:'disabled'});
 await page.keyboard.press('Alt+Shift+W');
 await page.waitForFunction(()=>document.getElementById('poWatchFlowPanel')?.hidden&&document.activeElement?.id==='poWatchFlowToggle');
 const narrowClosed=await screen(page);
 const narrowPng=await page.screenshot({path:path.join(out,'positron-p51329-ai-key-toggle-after-720x900-real.png'),animations:'disabled'});
 const final=await saved(page);
 const qa329={
  desktopInitiallyOpened:before.open&&before.aiActive&&before.focused==='poFlowPlusAI',
  f6ClosesAndReturnsFocus:!after.open&&after.focused==='poWatchFlowToggle',
  f6ReopensAI:reopened.open&&reopened.focused==='poFlowPlusAI',
  chordClosesAndReturnsFocus:!chordClosed.open&&chordClosed.focused==='poWatchFlowToggle',
  chordOpensNarrow:narrowOpen.open&&narrowOpen.focused==='poFlowPlusAI',
  chordClosesNarrow:!narrowClosed.open&&narrowClosed.focused==='poWatchFlowToggle',
  remainsOnTV:[before,after,reopened,chordClosed,narrowOpen,narrowClosed].every(s=>s.onTV),
  toolbarStillVisible:after.toggleVisible&&narrowClosed.toggleVisible,
  playerStillPresent:after.playerVisible&&narrowClosed.playerVisible,
  noHorizontalOverflow:![before,after,reopened,chordClosed,narrowOpen,narrowClosed].some(s=>s.overflow),
  playlistUnchanged:initial.channels===final.channels,
  modelUnchanged:initial.learning===final.learning,
  noAutoplay:initial.playing===final.playing
 };
 for(const [key,ok] of Object.entries(qa329))
  assert.equal(ok,true,'P329 native Electron two-way shortcut QA '+key+': '+JSON.stringify({before,after,reopened,chordClosed,narrowOpen,narrowClosed,qa329}));
 assert.ok(!beforePng.equals(afterPng),'P329 desktop dialog should really close');
 assert.ok(!narrowBeforePng.equals(narrowPng),'P329 narrow dialog should really close');
 for(const [png,w,h] of [[beforePng,1920,1080],[afterPng,1920,1080],[narrowBeforePng,720,900],[narrowPng,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51329-ai-key-toggle.json',JSON.stringify({
  version:'P5.1.329',app:'4.23.414',realElectron:true,
  desktopBefore:{...before,sha256:sha(beforePng)},desktopAfter:{...after,sha256:sha(afterPng)},
  narrowBefore:{...narrowOpen,sha256:sha(narrowBeforePng)},
  narrowAfter:{...narrowClosed,sha256:sha(narrowPng)},
  reopened,chordClosed,qa329,scope:'keyboard/UI only; no licensed IPTV or GPU'
 },null,2));
 console.log('P329 actual Electron two-way hotkey QA',JSON.stringify(qa329));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
