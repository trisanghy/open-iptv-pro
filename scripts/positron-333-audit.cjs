'use strict';
// P333: genuine Electron QA. "Before" re-enables the P332 redundant toolbar
// through a temporary CSS override on the same current Electron binary.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.resolve('positron-evidence','p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const shot=(page,name)=>page.screenshot({path:path.join(dir,name),animations:'disabled'});
const data=page=>page.evaluate(()=>({
 channels:JSON.stringify((window.__p333OriginalIPTVState||window.IPTVState).getChannels().map(x=>x.id)),
 current:(window.__p333OriginalIPTVState||window.IPTVState).getCurrent()?.id||'',
 model:localStorage.getItem('positron-intelligence-preferences-v1')
}));
const inspect=page=>page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),
 nav=p.querySelector('.po-flowplus-nav'),ai=p.querySelector('.po-ai-modes'),
 btn=p.querySelector('.po-ai-card .po-ai-actions button'),
 b=btn?.getBoundingClientRect(),r=p.getBoundingClientRect();
 return {width:innerWidth,aiActive:p.dataset.poAiActive==='true',
  navDisplay:getComputedStyle(nav).display,aiModes:ai.querySelectorAll('button').length,
  actionVisible:!!b&&b.width>40&&b.height>=43&&b.top>=r.top&&b.bottom<=r.bottom+2,
  actionTop:Math.round(b?.top||0),actionBottom:Math.round(b?.bottom||0),
  panelTop:Math.round(r.top),panelBottom:Math.round(r.bottom),
  overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3
 };
});
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const native=window.IPTVState;
  native.setPage('tv');
  window.__p333OriginalIPTVState=native;
  // QA-only read facade when the real app has no source; never import or
  // persist synthetic stream URLs to the user's real playlist.
  if(!native.getChannels().length){
   const fixture=[
    {id:'p333-qa-sport',name:'QA P333 Thể thao',url:'https://example.invalid/p333a.m3u8',group:'QA kiểm thử',status:'alive'},
    {id:'p333-qa-news',name:'QA P333 Thời sự',url:'https://example.invalid/p333b.m3u8',group:'QA kiểm thử',status:'alive'}
   ];
   window.IPTVState=Object.freeze({...native,getChannels:()=>fixture});
  }
 });
 // F6 is the working native entry point established by P332's real audit.
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p&&!p.hidden&&p.dataset.poAiActive==='true';
 },null,{timeout:15000});
 await page.evaluate(()=>{
  document.getElementById('poAIChannels').click();
  document.getElementById('poWatchFlowPanel').scrollTop=0;
 });
 await page.waitForFunction(()=>!!document.querySelector('#poAICards .po-ai-card .po-ai-actions button'),null,{timeout:15000});
 const beforeState=await data(page);
 const override=await page.addStyleTag({content:
  'html[data-positron="true"] body #poWatchFlowPanel[data-po-ai-active="true"] .po-flowplus-nav{display:grid!important}'});
 const oldDesktop=await inspect(page);
 const beforeDeskPng=await shot(page,'positron-p51333-ai-actions-before-1920x1080-real.png');
 await page.setViewportSize({width:720,height:900});
 await page.evaluate(()=>{document.getElementById('poWatchFlowPanel').scrollTop=0;});
 const oldNarrow=await inspect(page);
 const beforeSmallPng=await shot(page,'positron-p51333-ai-actions-before-720x900-real.png');
 await override.evaluate(el=>el.remove());
 await page.evaluate(()=>{document.getElementById('poWatchFlowPanel').scrollTop=0;});
 const newNarrow=await inspect(page);
 const afterSmallPng=await shot(page,'positron-p51333-ai-actions-after-720x900-real.png');
 await page.setViewportSize({width:1920,height:1080});
 const newDesktop=await inspect(page);
 const afterDeskPng=await shot(page,'positron-p51333-ai-actions-after-1920x1080-real.png');
 const afterState=await data(page);
 const qa={
  legacyToolbarReproduced:oldDesktop.navDisplay!=='none'&&oldNarrow.navDisplay!=='none',
  aiModesStillAvailable:newDesktop.aiModes===6&&newNarrow.aiModes===6,
  redundantToolbarHidden:newDesktop.navDisplay==='none'&&newNarrow.navDisplay==='none',
  narrowFirstActionReachable:newNarrow.actionVisible,
  layoutReclaimed:oldNarrow.actionBottom-newNarrow.actionBottom>=28,
  noOverflow:!newDesktop.overflow&&!newNarrow.overflow,
  playlistUnchanged:beforeState.channels===afterState.channels,
  modelUnchanged:beforeState.model===afterState.model,
  noAutoplay:beforeState.current===afterState.current
 };
 for(const [key,ok] of Object.entries(qa))
  assert.equal(ok,true,'P333 native Electron AI layout '+key+' '+JSON.stringify({oldDesktop,oldNarrow,newNarrow,newDesktop,qa}));
 for(const [buf,w,h] of [[beforeDeskPng,1920,1080],[afterDeskPng,1920,1080],[beforeSmallPng,720,900],[afterSmallPng,720,900]]) {
  assert.equal(buf.readUInt32BE(16),w);assert.equal(buf.readUInt32BE(20),h);
 }
 assert.ok(!beforeSmallPng.equals(afterSmallPng),'P333 screen should actually change');
 await page.evaluate(()=>{document.getElementById('poFlowPlusAI').click();});
 const normal=await page.evaluate(()=>({
  ai:document.getElementById('poWatchFlowPanel').dataset.poAiActive==='true',
  nav:getComputedStyle(document.querySelector('#poWatchFlowPanel .po-flowplus-nav')).display
 }));
 assert.ok(!normal.ai&&normal.nav!=='none','AI tab must return to standard five-mode WatchFlow');
 fs.writeFileSync('positron-evidence/audit-p51333-ai-actions.json',JSON.stringify({
  version:'P5.1.333',app:'4.23.418',realElectron:true,
  note:'BEFORE PNG shows P332-style CSS override in the real P333 Electron binary; not the earlier executable.',
  oldDesktop,oldNarrow,oldNarrowActionWasClipped:!oldNarrow.actionVisible,
  newDesktop:{...newDesktop,sha256:sha(afterDeskPng)},
  newNarrow:{...newNarrow,sha256:sha(afterSmallPng)},qa,
  scope:'Real Electron 1920 and 720 with local synthetic QA channels; no real streaming'
 },null,2));
 console.log('P333 native Electron duplicate-mode blocker QA',JSON.stringify(qa));
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  if(window.__p333OriginalIPTVState){window.IPTVState=window.__p333OriginalIPTVState;delete window.__p333OriginalIPTVState;}
});
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
