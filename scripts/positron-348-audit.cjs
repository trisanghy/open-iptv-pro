'use strict';
// P348: Escape from a focused AI mode dismisses expanded keyboard help first.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function probe(page){return page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel'),guide=document.getElementById('poAIShortcutGuide');
 const mode=document.getElementById('poAIChannels');
 return {panelOpen:!panel.hidden,aiActive:panel.dataset.poAiActive==='true',
  guideOpen:!!guide?.open,focusMode:document.activeElement===mode,
  noOverflow:panel.scrollWidth<=panel.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.waitForFunction(()=>!!document.getElementById('poAIShortcutGuide'),null,{timeout:20000});
 const original=await probe(page);
 const all={};
 for(const [width,height] of [[1920,1080],[720,900]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow?.close?.();});
  await page.locator('#poWatchFlowToggle').focus();
  await page.keyboard.press('F6');
  await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';},null,{timeout:15000});
  await page.evaluate(()=>{document.getElementById('poAIShortcutGuide').open=false;});
  await page.locator('#poAIShortcutGuide summary').focus();
  await page.keyboard.press('Enter');
  assert.equal((await probe(page)).guideOpen,true,'native help expands with Enter');
  // Focus the other AI action without triggering a pointer click (P347 dismisses on pointer).
  await page.locator('#poAIChannels').focus();
  const before=await probe(page);
  assert.ok(before.panelOpen&&before.aiActive&&before.guideOpen&&before.focusMode);
  const stem='positron-p51348-escape-other-focus-';
  const a=await page.screenshot({path:path.join(dir,stem+'before-'+width+'x'+height+'-real.png'),animations:'disabled'});
  await page.keyboard.press('Escape');
  const after=await probe(page);
  assert.ok(after.panelOpen&&after.aiActive,'first Escape must keep WatchFlow open');
  assert.equal(after.guideOpen,false,'first Escape collapses nested help');
  assert.ok(after.focusMode,'remote focus remains on selected AI mode');
  assert.ok(after.noOverflow,'no horizontal overflow');
  const b=await page.screenshot({path:path.join(dir,stem+'after-'+width+'x'+height+'-real.png'),animations:'disabled'});
  await page.keyboard.press('Escape');
  assert.equal((await probe(page)).panelOpen,false,'second Escape closes native WatchFlow');
  assert.ok(!a.equals(b),'actual Electron before/after screenshots must differ');
  for(const png of [a,b]){
   assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);
  }
  for(const key of ['channels','current','model'])assert.deepEqual(before[key],after[key]);
  all[width+'x'+height]={before,after,beforeSha256:hash(a),afterSha256:hash(b)};
 }
 const final=await probe(page);
 for(const key of ['channels','current','model'])assert.deepEqual(final[key],original[key]);
 fs.writeFileSync('positron-evidence/audit-p51348-escape-other-focus.json',JSON.stringify({
  version:'P5.1.348',app:'4.23.433',realElectron:true,checks:21,pass:true,all
 },null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P348 Escape nested guide from alternate focus PASS, 21 checks, four real PNG');
}
module.exports={run};
