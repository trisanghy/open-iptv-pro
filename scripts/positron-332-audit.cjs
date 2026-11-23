'use strict';
// P332: genuine Electron UI validation of AI onboarding width and 44px targets.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.resolve('positron-evidence','p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const user=page=>page.evaluate(()=>({
 ids:JSON.stringify(window.IPTVState.getChannels().map(x=>x.id)),
 current:window.IPTVState.getCurrent()?.id||'',
 model:localStorage.getItem('positron-intelligence-preferences-v1')
}));
const measure=page=>page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel');
 const modes=panel.querySelector('.po-ai-modes');
 const hint=document.getElementById('poAIKeyboardHelp');
 const box=panel.getBoundingClientRect(),buttons=[...modes.querySelectorAll('button')];
 return {open:!panel.hidden,ai:panel.dataset.poAiActive==='true',
  width:Math.round(box.width),left:Math.round(box.left),right:Math.round(box.right),
  emptyPlaylist:panel.dataset.emptyPlaylist==='true',
  windowWidth:innerWidth,focus:document.activeElement?.id||'',
  pressed:buttons.filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.id),
  buttons:buttons.map(b=>({id:b.id,height:+b.getBoundingClientRect().height.toFixed(1),
    width:+b.getBoundingClientRect().width.toFixed(1),disabled:b.disabled})),
  hintPresent:!!hint&&hint.getClientRects().length>0&&hint.textContent.includes('Enter/Space'),
  hintAssociated:modes.getAttribute('aria-describedby')==='poAIKeyboardHelp',
  overflow:document.documentElement.scrollWidth>innerWidth+3||panel.scrollWidth>panel.clientWidth+3
 };
});
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  window.IPTVState.setPage('tv');window.PositronWatchFlow.close();
  document.getElementById('poWatchFlowToggle').focus();
 });
 const start=await user(page);
 const before=await page.screenshot({path:path.join(dir,'positron-p51332-ai-onboard-before-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>!document.getElementById('poWatchFlowPanel').hidden&&document.getElementById('poWatchFlowPanel').dataset.poAiActive==='true',null,{timeout:12000});
 const desktop=await measure(page);
 const after=await page.screenshot({path:path.join(dir,'positron-p51332-ai-onboard-after-1920x1080-real.png'),animations:'disabled'});
 await page.evaluate(()=>document.getElementById('poAIChannels').focus());
 await page.keyboard.press('ArrowRight');const keyboard=await measure(page);
 await page.setViewportSize({width:720,height:900});
 await page.evaluate(()=>document.getElementById('poAIChannels').focus());
 await page.keyboard.press('ArrowRight');const narrow=await measure(page);
 const narrowPng=await page.screenshot({path:path.join(dir,'positron-p51332-ai-onboard-after-720x900-real.png'),animations:'disabled'});
 const finish=await user(page);
 const qa={
  nativeBeforeClosed:!before.equals(after),
  desktopReadingWidth:desktop.width>=500&&desktop.width<=548,
  desktopPanelWithinViewport:desktop.left>=0&&desktop.right<=desktop.windowWidth,
  allSixModes:desktop.buttons.length===6,
  targets44px:desktop.buttons.every(b=>b.height>=43.5&&b.width>=90),
  helpVisibleAndLinked:desktop.hintPresent&&desktop.hintAssociated,
  modeFocusOnly:keyboard.focus==='poAIUpcoming'&&JSON.stringify(keyboard.pressed)===JSON.stringify(desktop.pressed),
  narrowWidth:narrow.width>=480&&narrow.right<=narrow.windowWidth+2,
  narrowTargets44px:narrow.buttons.length===6&&narrow.buttons.every(b=>b.height>=43.5),
  narrowKeyboard:narrow.focus==='poAIUpcoming'&&narrow.hintPresent,
  noHorizontalOverflow:!desktop.overflow&&!keyboard.overflow&&!narrow.overflow,
  playlistUnchanged:start.ids===finish.ids,modelUnchanged:start.model===finish.model,
  noAutoplay:start.current===finish.current
 };
 for(const [key,ok] of Object.entries(qa))assert.equal(ok,true,
  'P332 real Electron source-free AI UX '+key+': '+JSON.stringify({desktop,keyboard,narrow,qa}));
 for(const [png,w,h] of [[before,1920,1080],[after,1920,1080],[narrowPng,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51332-ai-onboard.json',JSON.stringify({
  version:'P5.1.332',app:'4.23.417',realElectron:true,
  note:'Before PNG is AI panel closed in current version; compare with real P331 open AI screenshot for previous narrow layout.',
  beforeSha256:sha(before),after:{...desktop,sha256:sha(after)},
  keyboard,narrow:{...narrow,sha256:sha(narrowPng)},qa,
  scope:'Actual Electron on desktop and 720px; both empty playlist and synthetic QA channel contexts, no real IPTV playback'
 },null,2));
 console.log('P332 native Electron AI onboarding QA',JSON.stringify(qa));
 await page.evaluate(()=>window.PositronWatchFlow.close());
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
