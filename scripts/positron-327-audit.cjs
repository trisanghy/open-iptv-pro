'use strict';
// P327 real Electron/CDP: reproduce stale focus, then close and reopen AI.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const out=path.resolve('positron-evidence','p5-20-rounds');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sample=page=>page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),ai=document.getElementById('poFlowPlusAI');
 const a=document.activeElement,r=ai.getBoundingClientRect(),bounds=p.getBoundingClientRect();
 return {focus:a?.id||'',inside:p.contains(a),open:!p.hidden,
  aiMode:p.dataset.poAiActive==='true'&&ai.getAttribute('aria-pressed')==='true',
  aiVisible:r.width>0&&r.height>0&&r.top>=bounds.top&&r.bottom<=bounds.bottom+2,
  overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};
});
const persist=page=>page.evaluate(()=>({
 channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
 model:localStorage.getItem('positron-intelligence-preferences-v1'),
 playing:window.IPTVState.getCurrent()?.id||''
}));
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  window.IPTVState.setPage('tv');window.PositronWatchFlow.open();
  const ai=document.getElementById('poFlowPlusAI');
  if(ai.getAttribute('aria-pressed')!=='true')ai.click();
  window.PositronIntelligence.render();
  document.getElementById('poWatchFlowToggle').focus(); // P326 stale-focus baseline
 });
 const original=await persist(page),stale=await sample(page);
 const old=await page.screenshot({path:path.join(out,'positron-p51327-ai-focus-before-1920x1080-real.png'),animations:'disabled'});
 await page.evaluate(()=>{window.PositronWatchFlow.close();window.PositronWatchFlow.open();});
 await page.waitForFunction(()=>document.activeElement?.id==='poFlowPlusAI'&&
  document.getElementById('poWatchFlowPanel')?.dataset.poAiActive==='true',null,{timeout:12000});
 const fresh=await sample(page);
 const fixed=await page.screenshot({path:path.join(out,'positron-p51327-ai-focus-after-1920x1080-real.png'),animations:'disabled'});
 await page.setViewportSize({width:720,height:900});
 const compact=await sample(page);
 const compactPng=await page.screenshot({path:path.join(out,'positron-p51327-ai-focus-after-720x900-real.png'),animations:'disabled'});
 const final=await persist(page);
 const qa327={
  staleFocusBehindPanel:stale.focus==='poWatchFlowToggle'&&!stale.inside,
  desktopFocusInside: fresh.focus==='poFlowPlusAI'&&fresh.inside,
  narrowFocusInside: compact.focus==='poFlowPlusAI'&&compact.inside,
  aiPanelAccessible:fresh.open&&compact.open&&fresh.aiMode&&compact.aiMode&&fresh.aiVisible&&compact.aiVisible,
  noHorizontalOverflow:!fresh.overflow&&!compact.overflow,
  playlistSafe:original.channels===final.channels,
  modelSafe:original.model===final.model,
  noAutoplay:original.playing===final.playing
 };
 for(const [key,ok] of Object.entries(qa327))
  assert.equal(ok,true,'P327 real Electron focus QA '+key+': '+JSON.stringify({stale,fresh,compact,qa327}));
 assert.ok(!old.equals(fixed),'P327 before/after focus must visibly differ');
 for(const [png,w,h] of [[old,1920,1080],[fixed,1920,1080],[compactPng,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51327-ai-focus.json',JSON.stringify({
  version:'P5.1.327',app:'4.23.412',realElectron:true,
  before:{...stale,sha256:hash(old)},after:{...fresh,sha256:hash(fixed)},
  narrow:{...compact,sha256:hash(compactPng)},qa327,
  scope:'Focus/UI only; no licensed stream tested'
 },null,2));
 console.log('P327 native Electron focus QA',JSON.stringify(qa327));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
