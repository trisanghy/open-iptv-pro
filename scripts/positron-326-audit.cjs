'use strict';
// P326: native Electron/CDP review of low-sample AI disclosure.
// Before screenshot hides only the newly added label in the live renderer,
// matching P325's prior visual state; after re-renders the actual P326 view.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const out=path.resolve('positron-evidence','p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const sample=page=>page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel');
 const card=panel.querySelector('.po-ai-card');
 const metric=card?.querySelector('.po-ai-card-header small');
 const actions=card?.querySelector('.po-ai-actions');
 const firstButton=actions?.querySelector('button');
 const r=panel.getBoundingClientRect(),button=firstButton?.getBoundingClientRect();
 const profile=window.PositronIntelligence.getProfile();
 return {observations:profile.observations,score:metric?.textContent||'',
  tooltip:metric?.title||'',aria:metric?.getAttribute('aria-label')||'',
  provisional:metric?.dataset.aiSample||'',
  hasCard:!!card,actionsVisible:!!button&&button.bottom<=r.bottom+3&&button.top>=r.top,
  panelVisible:!panel.hidden,panelOverflow:panel.scrollWidth>panel.clientWidth+3,
  pageOverflow:document.documentElement.scrollWidth>innerWidth+3};
});
const persistent=page=>page.evaluate(()=>({
 channels:JSON.stringify(window.IPTVState.getChannels().map(ch=>ch.id)),
 current:window.IPTVState.getCurrent()?.id||'',
 model:localStorage.getItem('positron-intelligence-preferences-v1')
}));
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.open();window.PositronIntelligence.render();});
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  const m=p?.querySelector('.po-ai-card .po-ai-card-header small');
  return p&&!p.hidden&&m&&m.textContent.includes('hợp gu')&&
   window.PositronIntelligence.getProfile().observations>=2;
 },null,{timeout:15000});
 const original=await persistent(page);
 const fullBefore=await sample(page);
 await page.evaluate(()=>{
  const metric=document.querySelector('#poWatchFlowPanel .po-ai-card .po-ai-card-header small');
  metric.textContent=metric.textContent.replace(' (sơ bộ)','');
  metric.removeAttribute('title');metric.removeAttribute('aria-label');
  delete metric.dataset.aiSample;
 });
 const legacy=await sample(page);
 const before=await page.screenshot({path:path.join(out,'positron-p51326-ai-sample-before-1920x1080-real.png'),animations:'disabled'});
 await page.evaluate(()=>window.PositronIntelligence.render());
 await page.waitForTimeout(80);
 const after=await sample(page);
 const afterPng=await page.screenshot({path:path.join(out,'positron-p51326-ai-sample-after-1920x1080-real.png'),animations:'disabled'});
 await page.setViewportSize({width:720,height:900});
 const narrow=await sample(page);
 const narrowPng=await page.screenshot({path:path.join(out,'positron-p51326-ai-sample-after-720x900-real.png'),animations:'disabled'});
 const final=await persistent(page);
 const qa326={
  smallLearningSample:after.observations>=2&&after.observations<10,
  priorScoreNotQualified:legacy.score.includes('% hợp gu')&&!legacy.score.includes('(sơ bộ)'),
  newScoreQualified:after.score.includes('% hợp gu (sơ bộ)')&&narrow.score.includes('% hợp gu (sơ bộ)'),
  probabilityUnchanged:after.score.replace(' (sơ bộ)','')===legacy.score,
  sourceHasProvisionalFlag:fullBefore.provisional==='provisional'&&after.provisional==='provisional',
  accessibleDisclosure:after.aria.includes('độ chính xác được kiểm chứng')&&
   after.tooltip.includes('phản hồi')&&narrow.aria.includes('độ chính xác được kiểm chứng'),
  cardAndActionsVisible:after.hasCard&&narrow.hasCard&&after.actionsVisible&&narrow.actionsVisible,
  responsiveNoOverflow:!after.panelOverflow&&!after.pageOverflow&&!narrow.panelOverflow&&!narrow.pageOverflow,
  playlistIntact:original.channels===final.channels,
  modelIntact:original.model===final.model,
  noAutoplay:original.current===final.current
 };
 for(const [key,ok] of Object.entries(qa326))
  assert.equal(ok,true,'P326 native Electron AI-score QA '+key+': '+JSON.stringify({qa326,legacy,after,narrow}));
 assert.ok(!before.equals(afterPng),'P326 before and after Electron UI must differ');
 for(const [png,w,h] of [[before,1920,1080],[afterPng,1920,1080],[narrowPng,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51326-ai-sample.json',JSON.stringify({
  version:'P5.1.326',app:'4.23.411',realElectron:true,scope:'local AI UI only, no authorized IPTV playback',
  legacy:{...legacy,sha256:sha(before)},after:{...after,sha256:sha(afterPng)},
  narrow:{...narrow,sha256:sha(narrowPng)},qa326
 },null,2));
 console.log('P326 small-sample AI disclosure native Electron QA:',JSON.stringify(qa326));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
