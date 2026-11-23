'use strict';
// P345 genuine Electron/Playwright keyboard-help before/after audit.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function probe(page){return page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),g=document.getElementById('poAIShortcutGuide');
 const s=g.querySelector('summary'),r=g.getBoundingClientRect(),m=p.getBoundingClientRect();
 return {open:g.open,items:[...g.querySelectorAll('li')].map(x=>x.textContent),
  title:s.textContent,focused:document.activeElement===s,
  minTouch:s.getBoundingClientRect().height,guideWidth:r.width,panelWidth:m.width,
  noOverflow:p.scrollWidth<=p.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
  playing:window.IPTVState.getCurrent()?.id||'',
  sources:JSON.stringify(window.IPTVState.getChannels().map(x=>x.id)),
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 const original=await page.evaluate(()=>({
  playing:window.IPTVState.getCurrent()?.id||'',
  sources:JSON.stringify(window.IPTVState.getChannels().map(x=>x.id)),
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 await page.evaluate(()=>window.IPTVState.setPage('tv'));
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';
 },null,{timeout:20000});
 const all={};
 for(const [w,h] of [[1920,1080],[720,900]]){
  await page.setViewportSize({width:w,height:h});
  await page.evaluate(()=>{
   document.getElementById('poAIShortcutGuide').open=false;
   document.getElementById('poWatchFlowPanel').scrollTop=0;
  });
  const before=await probe(page);
  assert.equal(before.open,false,'guide starts collapsed');
  assert.equal(before.items.length,7);
  const prefix='positron-p51345-shortcut-guide-';
  const a=await page.screenshot({path:path.join(dir,prefix+'before-'+w+'x'+h+'-real.png'),animations:'disabled'});
  await page.locator('#poAIShortcutGuide summary').focus();
  await page.keyboard.press('Enter');
  const after=await probe(page);
  assert.equal(after.open,true,'Enter opens the native details');
  assert.equal(after.focused,true,'Enter keeps keyboard focus');
  assert.ok(after.items.some(x=>x.includes('PageUp/PageDown')));
  assert.ok(after.items.some(x=>x.includes('Home/End')));
  assert.ok(after.items.some(x=>x.includes('Alt+Shift+I')));
  assert.ok(after.items.some(x=>x.includes('Chỉ Enter hoặc Space')));
  assert.ok(after.minTouch>=44,'guide summary remains >=44px');
  assert.ok(after.guideWidth>200&&after.guideWidth<=after.panelWidth);
  assert.equal(after.noOverflow,true,'no horizontal overflow');
  const b=await page.screenshot({path:path.join(dir,prefix+'after-'+w+'x'+h+'-real.png'),animations:'disabled'});
  await page.keyboard.press('Enter');
  assert.equal((await probe(page)).open,false,'second Enter closes guide');
  assert.ok(!a.equals(b));assert.equal(a.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),h);
  for(const property of ['playing','sources','model'])assert.deepEqual(after[property],before[property]);
  all[w+'x'+h]={before,after,beforeSha256:hash(a),afterSha256:hash(b)};
 }
 await page.evaluate(()=>window.PositronWatchFlow.close());
 const restored=await page.evaluate(()=>({
  playing:window.IPTVState.getCurrent()?.id||'',
  sources:JSON.stringify(window.IPTVState.getChannels().map(x=>x.id)),
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 assert.deepEqual(restored,original,'guide never changes playlists, playback or local ML');
 fs.writeFileSync('positron-evidence/audit-p51345-shortcut-guide.json',JSON.stringify({
  version:'P5.1.345',app:'4.23.430',realElectron:true,checks:18,pass:true,all
 },null,2));
 console.log('P345 real Electron remote guide PASS, 18 checks, four real PNG');
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
