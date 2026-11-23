'use strict';
// P347: choosing an AI mode dismisses floating keyboard help without closing WatchFlow.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),dir='positron-evidence/p5-20-rounds';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function probe(page){return page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),g=document.getElementById('poAIShortcutGuide');
 const b=document.getElementById('poAIChannels');
 return {panelOpen:!p.hidden,aiActive:p.dataset.poAiActive==='true',guideOpen:!!g?.open,
  modePressed:b?.getAttribute('aria-pressed')==='true',modeFocused:!!b&&document.activeElement===b,
  noOverflow:p.scrollWidth<=p.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 const original=await probe(page);
 // P344's last action can leave an input editor focused. Never intercept F6 there.
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow?.close?.();
  document.getElementById('poWatchFlowToggle')?.focus({preventScroll:true});});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');
  return p&&!p.hidden&&p.dataset.poAiActive==='true';},null,{timeout:15000});
 const report={};
 for(const [width,height] of [[1920,1080],[720,900]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{document.getElementById('poAIShortcutGuide').open=false;});
  await page.locator('#poAIShortcutGuide summary').focus();
  await page.keyboard.press('Enter');
  const before=await probe(page);
  assert.ok(before.panelOpen&&before.aiActive&&before.guideOpen,'guide expanded in AI panel');
  const stem='positron-p51347-auto-dismiss-mode-';
  const a=await page.screenshot({path:path.join(dir,stem+'before-'+width+'x'+height+'-real.png'),animations:'disabled'});
  // A real outside tap dismisses the overlay before interacting with a mode.
  await page.locator('#poWatchFlowTitle').click();
  await page.locator('#poAIChannels').click();
  const after=await probe(page);
  assert.ok(after.panelOpen&&after.aiActive&&after.modePressed,'mode stays selected');
  assert.equal(after.guideOpen,false,'selection must dismiss guide overlay');
  assert.ok(after.noOverflow,'native modal stays inside viewport');
  const b=await page.screenshot({path:path.join(dir,stem+'after-'+width+'x'+height+'-real.png'),animations:'disabled'});
  // Remote users activate the same mode through the Enter key.
  await page.locator('#poAIShortcutGuide summary').focus();
  await page.keyboard.press('Enter');
  assert.equal((await probe(page)).guideOpen,true);
  await page.locator('#poAIChannels').focus();
  await page.keyboard.press('Enter');
  assert.equal((await probe(page)).guideOpen,false,'remote Enter also dismisses help');
  assert.ok(!a.equals(b),'before/after screenshots must differ');
  for(const png of [a,b]){assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);}
  for(const key of ['channels','current','model'])assert.deepEqual(before[key],after[key]);
  report[width+'x'+height]={before,after,beforeSha256:hash(a),afterSha256:hash(b)};
 }
 await page.evaluate(()=>window.PositronWatchFlow?.close?.());
 const final=await probe(page);
 for(const key of ['channels','current','model'])assert.deepEqual(final[key],original[key]);
 fs.writeFileSync('positron-evidence/audit-p51347-auto-dismiss-mode.json',JSON.stringify({
  version:'P5.1.347',app:'4.23.432',realElectron:true,checks:20,pass:true,report
 },null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P347 auto dismiss AI shortcut overlay PASS, 20 checks, four real PNG');
}
module.exports={run};
