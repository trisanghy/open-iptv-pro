'use strict';
// P331: independent native Electron CDP verifies focus-only navigation in six AI modes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.resolve('positron-evidence','p5-20-rounds');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const collect=page=>page.evaluate(()=>{
 const ids=['poAIChannels','poAIUpcoming','poAIPlan','poAIExplore','poAIEPGFolders','poAIEPGProgrammes'];
 const bar=document.querySelector('#poWatchFlowPanel .po-ai-modes');
 const panel=document.getElementById('poWatchFlowPanel'),r=bar.getBoundingClientRect();
 return {focus:document.activeElement?.id||'',
  selected:ids.filter(id=>document.getElementById(id)?.getAttribute('aria-pressed')==='true'),
  disabled:ids.filter(id=>document.getElementById(id)?.disabled),
  shortcuts:bar.getAttribute('aria-keyshortcuts'),
  ai:panel.dataset.poAiActive==='true',open:!panel.hidden,
  barVisible:r.width>120&&r.height>80,
  overflow:document.documentElement.scrollWidth>innerWidth+3||panel.scrollWidth>panel.clientWidth+3
 };
});
const userState=page=>page.evaluate(()=>({
 ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
 model:localStorage.getItem('positron-intelligence-preferences-v1'),
 current:window.IPTVState.getCurrent()?.id||''
}));
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.close();
  document.getElementById('poWatchFlowToggle').focus();});
 const start=await userState(page);
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>!document.getElementById('poWatchFlowPanel').hidden&&document.getElementById('poWatchFlowPanel').dataset.poAiActive==='true',null,{timeout:12000});
 await page.evaluate(()=>document.getElementById('poAIChannels').focus());
 const before=await collect(page);
 const b=await page.screenshot({path:path.join(dir,'positron-p51331-mode-focus-before-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('ArrowRight');
 const right=await collect(page);
 const a=await page.screenshot({path:path.join(dir,'positron-p51331-mode-focus-after-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('ArrowDown');const down=await collect(page);
 await page.keyboard.press('ArrowUp');const up=await collect(page);
 await page.keyboard.press('Home');const home=await collect(page);
 // P331 QA repair: the AI Explore button is enabled with a learned model.
 // Exercise both states explicitly rather than assuming it is disabled.
 const originalExploreDisabled=await page.evaluate(()=>{
  const button=document.getElementById('poAIExplore');const was=button.disabled;
  button.disabled=false;return was;
 });
 await page.keyboard.press('ArrowDown');const enabledExplore=await collect(page);
 await page.evaluate(()=>{
  document.getElementById('poAIExplore').disabled=true;
  document.getElementById('poAIChannels').focus();
 });
 await page.keyboard.press('ArrowDown');const skipDisabled=await collect(page);
 await page.evaluate(previous=>{document.getElementById('poAIExplore').disabled=previous;},originalExploreDisabled);
 await page.keyboard.press('End');const end=await collect(page);
 await page.keyboard.press('ArrowRight');const wrap=await collect(page);
 await page.keyboard.press('ArrowLeft');const wrapBack=await collect(page);
 await page.setViewportSize({width:720,height:900});
 const narrowExploreDisabled=await page.evaluate(()=>{
  const button=document.getElementById('poAIExplore');const was=button.disabled;
  button.disabled=true;document.getElementById('poAIChannels').focus();return was;
 });
 await page.keyboard.press('ArrowDown');const narrow=await collect(page);
 const n=await page.screenshot({path:path.join(dir,'positron-p51331-mode-focus-after-720x900-real.png'),animations:'disabled'});
 await page.evaluate(previous=>{document.getElementById('poAIExplore').disabled=previous;},narrowExploreDisabled);
 const finish=await userState(page);
 const sameSelected=x=>JSON.stringify(x.selected)===JSON.stringify(before.selected);
 const qa={
  sixModeGridVisible:before.barVisible&&before.open&&before.ai,
  shortcutsDeclared:before.shortcuts.includes('ArrowDown')&&before.shortcuts.includes('Home'),
  rightFocusOnly:right.focus==='poAIUpcoming'&&sameSelected(right),
  downSameColumn:down.focus==='poAIEPGFolders'&&sameSelected(down),
  upSameColumn:up.focus==='poAIUpcoming'&&sameSelected(up),
  homeFirst:home.focus==='poAIChannels'&&sameSelected(home),
  enabledExploreReachable:enabledExplore.focus==='poAIExplore'&&sameSelected(enabledExplore),
  skipDisabledExplore:skipDisabled.focus==='poAIEPGFolders'&&skipDisabled.disabled.includes('poAIExplore')&&sameSelected(skipDisabled),
  endLast:end.focus==='poAIEPGProgrammes'&&sameSelected(end),
  wrapToFirst:wrap.focus==='poAIChannels'&&sameSelected(wrap),
  wrapToLast:wrapBack.focus==='poAIEPGProgrammes'&&sameSelected(wrapBack),
  narrowKeyboard:narrow.focus==='poAIEPGFolders'&&sameSelected(narrow),
  noHorizontalOverflow:!before.overflow&&!right.overflow&&!narrow.overflow,
  playlistUnchanged:start.ids===finish.ids,modelUnchanged:start.model===finish.model,
  noAutoplay:start.current===finish.current
 };
 for(const [name,ok] of Object.entries(qa))assert.equal(ok,true,'P331 real Electron AI mode '+name+': '+JSON.stringify({before,right,down,up,home,enabledExplore,skipDisabled,end,wrap,wrapBack,narrow,qa}));
 assert.ok(!b.equals(a),'P331 keyboard focus before/after must visibly change');
 for(const [png,w,h] of [[b,1920,1080],[a,1920,1080],[n,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51331-ai-mode-focus.json',JSON.stringify({
  version:'P5.1.331',app:'4.23.416',realElectron:true,
  before:{...before,sha256:digest(b)},after:{...right,sha256:digest(a)},
  down,up,home,enabledExplore,skipDisabled,end,wrap,wrapBack,
  narrow:{...narrow,sha256:digest(n)},qa,
  scope:'Native Electron AI mode keyboard focus; QA temporarily disables/enables Explore to verify both states, no channel playback/GPU/stream testing'
 },null,2));
 console.log('P331 real Electron AI mode focus QA',JSON.stringify(qa));
 await page.evaluate(()=>window.PositronWatchFlow.close());
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
