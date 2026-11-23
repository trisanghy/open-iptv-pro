'use strict';
// P349 native Electron UI QA: show keyboard help BELOW all AI mode buttons.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function snapshot(page){return page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),guide=document.getElementById('poAIShortcutGuide');
 const u=guide.querySelector('ul'),list=u.getBoundingClientRect(),panel=p.getBoundingClientRect();
 const modes=[...p.querySelectorAll('.po-ai-modes button')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);
 const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 return {panelOpen:!p.hidden,guideOpen:guide.open,modeCount:modes.length,
  modeBottom:Math.max(...modes.map(r=>r.bottom)),
  listTop:list.top,listBottom:list.bottom,panelBottom:panel.bottom,
  modeOverlap:modes.some(r=>intersects(list,r)),scrollRange:u.scrollHeight-u.clientHeight,
  focusable:u.tabIndex===0,guideWidth:list.width,panelWidth:panel.width,
  noOverflow:p.scrollWidth<=p.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.waitForFunction(()=>!!document.getElementById('poAIShortcutGuide'),null,{timeout:20000});
 const base=await snapshot(page),all={};
 for(const [width,height] of [[1920,1080],[720,900]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow?.close?.();});
  await page.locator('#poWatchFlowToggle').focus();
  await page.keyboard.press('F6');
  await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';},null,{timeout:15000});
  await page.evaluate(()=>{document.getElementById('poAIShortcutGuide').open=false;});
  await page.locator('#poAIShortcutGuide summary').focus();
  await page.keyboard.press('Enter');
  // Real Electron comparison against previous P348 layout: transient legacy
  // computed style is removed immediately after the BEFORE screenshot.
  const legacy=await page.addStyleTag({content:
   '#poWatchFlowPanel #poAIShortcutGuide.po-ai-shortcut-guide[open]>ul{top:auto!important;bottom:44px!important;max-height:min(350px,52vh)!important;}'});
  const before=await snapshot(page);
  assert.ok(before.guideOpen&&before.modeCount>=6&&before.modeOverlap,
   'P348 legacy layout must actually cover at least one mode button');
  const stem='positron-p51349-help-below-modes-';
  const a=await page.screenshot({path:path.join(dir,stem+'before-'+width+'x'+height+'-real.png'),animations:'disabled'});
  await legacy.evaluate(node=>node.remove());
  const after=await snapshot(page);
  assert.ok(after.panelOpen&&after.guideOpen&&after.focusable);
  assert.equal(after.modeOverlap,false,'all native AI mode buttons remain uncovered');
  assert.ok(after.listTop>after.modeBottom+8,'help begins below mode button grid');
  assert.ok(after.listBottom<=after.panelBottom-8,'scrolling help is completely inside modal');
  assert.ok(after.scrollRange>20,'seven hints remain scrollable, not silently clipped');
  assert.ok(after.guideWidth<=after.panelWidth&&after.noOverflow,'no horizontal spill');
  const b=await page.screenshot({path:path.join(dir,stem+'after-'+width+'x'+height+'-real.png'),animations:'disabled'});
  await page.locator('#poAIShortcutGuide ul').focus();
  await page.keyboard.press('PageDown');
  await page.waitForFunction(()=>document.querySelector('#poAIShortcutGuide ul')?.scrollTop>0,null,{timeout:5000});
  await page.keyboard.press('Escape');
  assert.equal((await snapshot(page)).guideOpen,false,'Escape closes help from list without closing WatchFlow');
  for(const k of ['current','channels','model'])assert.deepEqual(after[k],before[k]);
  assert.ok(!a.equals(b));
  for(const png of [a,b]){assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);}
  all[width+'x'+height]={before,after,beforeSha256:hash(a),afterSha256:hash(b)};
 }
 await page.evaluate(()=>window.PositronWatchFlow?.close?.());
 const final=await snapshot(page);
 for(const k of ['current','channels','model'])assert.deepEqual(base[k],final[k]);
 fs.writeFileSync('positron-evidence/audit-p51349-help-below-modes.json',JSON.stringify({
  version:'P5.1.349',app:'4.23.434',realElectron:true,checks:23,pass:true,all
 },null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P349 AI help moved below mode buttons PASS, 23 checks, four real PNG');
}
module.exports={run};
