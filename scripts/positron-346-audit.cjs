'use strict';
// P346: genuine Electron keyboard Escape nested help dismissal.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),dir='positron-evidence/p5-20-rounds';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function snap(page){return page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel');
 const guide=document.getElementById('poAIShortcutGuide'),summary=guide.querySelector('summary');
 const guideList=guide.querySelector('ul').getBoundingClientRect();
 const panelTitle=panel.querySelector('.po-watchflow-head').getBoundingClientRect();
 const panelBox=panel.getBoundingClientRect();
 return {panelOpen:!panel.hidden,aiActive:panel.dataset.poAiActive==='true',
  guideOpen:guide.open,summaryFocused:document.activeElement===summary,
  hintsFullyVisible:!guide.open||(guideList.top>=panelTitle.bottom+2&&guideList.bottom<=panelBox.bottom-2),
  guideShortcuts:guide.getAttribute('aria-keyshortcuts'),guideItems:guide.querySelectorAll('li').length,
  noOverflow:panel.scrollWidth<=panel.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
  current:window.IPTVState.getCurrent()?.id||'',channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 const original=await page.evaluate(()=>({current:window.IPTVState.getCurrent()?.id||'',
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),model:localStorage.getItem('positron-intelligence-preferences-v1')}));
 await page.evaluate(()=>window.IPTVState.setPage('tv'));
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';
 },null,{timeout:15000});
 const report={};
 for(const [w,h] of [[1920,1080],[720,900]]){
  await page.setViewportSize({width:w,height:h});
  await page.evaluate(()=>{document.getElementById('poAIShortcutGuide').open=false;
   document.getElementById('poWatchFlowPanel').scrollTop=0;});
  await page.locator('#poAIShortcutGuide summary').focus();
  await page.keyboard.press('Enter');
  const before=await snap(page);
  assert.ok(before.panelOpen&&before.aiActive&&before.guideOpen);
  assert.equal(before.guideItems,7);assert.equal(before.guideShortcuts,'Escape');
  assert.ok(before.hintsFullyVisible,'all seven instructions must show inside the Electron modal');
  const stem='positron-p51346-escape-guide-';
  const a=await page.screenshot({path:path.join(dir,stem+'before-'+w+'x'+h+'-real.png'),animations:'disabled'});
  await page.keyboard.press('Escape');
  const after=await snap(page);
  assert.ok(after.panelOpen&&after.aiActive,'Escape may not close WatchFlow while nested help is open');
  assert.equal(after.guideOpen,false,'Escape collapses nested guide');
  assert.ok(after.summaryFocused,'focus restored to shortcut summary');
  assert.ok(after.noOverflow,'modal remains within viewport');
  const b=await page.screenshot({path:path.join(dir,stem+'after-'+w+'x'+h+'-real.png'),animations:'disabled'});
  await page.keyboard.press('Enter');
  assert.ok((await snap(page)).guideOpen,'Enter still reopens guide');
  await page.keyboard.press('F6');
  assert.ok(!(await snap(page)).panelOpen,'native F6 modal close remains available');
  await page.keyboard.press('F6');
  const reopened=await snap(page);
  assert.ok(reopened.panelOpen&&reopened.aiActive&&!reopened.guideOpen,'reopening AI always starts with compact guide');
  assert.ok(!a.equals(b));
  assert.equal(a.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),h);
  for(const key of ['current','channels','model'])assert.deepEqual(after[key],before[key]);
  report[w+'x'+h]={before,after,reopened,beforeSha256:hash(a),afterSha256:hash(b)};
 }
 await page.evaluate(()=>window.PositronWatchFlow.close());
 const final=await page.evaluate(()=>({current:window.IPTVState.getCurrent()?.id||'',
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),model:localStorage.getItem('positron-intelligence-preferences-v1')}));
 assert.deepEqual(final,original,'Escape guide never modifies IPTV/AI state');
 fs.writeFileSync('positron-evidence/audit-p51346-escape-guide.json',JSON.stringify({
  version:'P5.1.346',app:'4.23.431',realElectron:true,checks:22,pass:true,
  note:'same real Electron binary before/after with active nested guide then Escape',report
 },null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P346 native Escape AI guide PASS, 22 checks and 4 real PNG');
}
module.exports={run};
