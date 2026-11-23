'use strict';
// Real Electron CDP; before emulates P323's 35px CSS in the current renderer.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const out=path.resolve('positron-evidence','p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  window.IPTVState.setPage('tv');
  window.PositronWatchFlow.open();
  document.getElementById('poWatchFlowPanel').scrollTop=0;
 });
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p&&!p.hidden&&p.querySelectorAll('.po-flowplus-nav button').length===5;
 },null,{timeout:15000});
 const state=()=>page.evaluate(()=>({
  ids:JSON.stringify(window.IPTVState.getChannels().map(x=>x.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 const measure=()=>page.evaluate(()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  const nav=panel.querySelector('.po-flowplus-nav'),r=nav.getBoundingClientRect();
  const buttons=[...nav.querySelectorAll('button')].map(el=>{
   const b=el.getBoundingClientRect();
   return {name:el.textContent.trim(),height:b.height,left:b.left,right:b.right,top:b.top};
  });
  return {buttons,oneRow:buttons.every(b=>Math.abs(b.top-buttons[0].top)<3),
   inside:buttons.every(b=>b.left>=r.left-2&&b.right<=r.right+2),
   overflow:nav.scrollWidth>nav.clientWidth+3||panel.scrollWidth>panel.clientWidth+3||
    document.documentElement.scrollWidth>innerWidth+3};
 });
 const original=await state();
 const override=await page.addStyleTag({content:'html[data-positron="true"] #poWatchFlowPanel.po-watchflow-panel .po-flowplus-nav button{min-height:35px!important;padding-top:7px!important;padding-bottom:7px!important}'});
 const beforeMetrics=await measure();
 const before=await page.screenshot({path:path.join(out,'positron-p51324-watchflow-tabs-before-1920x1080-real.png'),animations:'disabled'});
 await override.evaluate(el=>el.remove());
 await page.waitForTimeout(100);
 const afterMetrics=await measure();
 const after=await page.screenshot({path:path.join(out,'positron-p51324-watchflow-tabs-after-1920x1080-real.png'),animations:'disabled'});
 await page.locator('#poWatchFlowPanel .po-flowplus-nav button').first().focus();
 const focus=await page.evaluate(()=>document.activeElement===document.querySelector('#poWatchFlowPanel .po-flowplus-nav button'));
 await page.setViewportSize({width:720,height:900});
 await page.evaluate(()=>document.getElementById('poWatchFlowPanel').scrollTop=0);
 const narrow=await measure();
 const narrowPng=await page.screenshot({path:path.join(out,'positron-p51324-watchflow-tabs-after-720x900-real.png'),animations:'disabled'});
 const final=await state();
 const qa324={
  fiveButtons:afterMetrics.buttons.length===5&&narrow.buttons.length===5,
  beforeWasSmall:beforeMetrics.buttons.some(x=>x.height<43),
  desktopHeight44:afterMetrics.buttons.every(x=>x.height>=43.5),
  narrowHeight44:narrow.buttons.every(x=>x.height>=43.5),
  increased:afterMetrics.buttons.every((x,i)=>x.height>beforeMetrics.buttons[i].height+6),
  oneRow:afterMetrics.oneRow&&narrow.oneRow,
  noOverflow:afterMetrics.inside&&narrow.inside&&!afterMetrics.overflow&&!narrow.overflow,
  keyboardFocus:focus,
  playlistIntact:original.ids===final.ids,
  modelIntact:original.model===final.model,
  noAutoplay:original.current===final.current
 };
 for(const [key,value] of Object.entries(qa324))
  assert.equal(value,true,'P324 real Electron WatchFlow nav '+key+': '+JSON.stringify({qa324,beforeMetrics,afterMetrics,narrow}));
 assert.ok(!before.equals(after),'P324 before/after screenshots must visibly differ');
 for(const [png,w,h] of [[before,1920,1080],[after,1920,1080],[narrowPng,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51324-watchflow-tabs.json',JSON.stringify({
  version:'P5.1.324',electron:'4.23.409',realElectron:true,
  notes:'Local GUI geometry only, not live IPTV playback',
  before:{...beforeMetrics,sha256:sha(before)},
  after:{...afterMetrics,sha256:sha(after)},
  narrow:{...narrow,sha256:sha(narrowPng)},qa324
 },null,2));
 console.log('P324 real Electron QA',JSON.stringify(qa324));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
