'use strict';
// P336 actual Electron via CDP. Before: the same current binary with its new
// progress badge temporarily hidden to reconstruct the P335 focus-only view.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.resolve('positron-evidence','p5-20-rounds');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const shot=(page,name)=>page.screenshot({path:path.join(out,name),animations:'disabled'});
const persisted=page=>page.evaluate(()=>({
 channels:JSON.stringify((window.__p336Native||window.IPTVState).getChannels().map(c=>c.id)),
 current:(window.__p336Native||window.IPTVState).getCurrent()?.id||'',
 model:localStorage.getItem('positron-intelligence-preferences-v1')
}));
const inspect=page=>page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),badge=document.getElementById('poAIFocusProgress');
 const buttons=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
 .filter(button=>!button.disabled&&button.getClientRects().length);
 const focus=buttons.indexOf(document.activeElement),pos=document.activeElement?.getBoundingClientRect(),bounds=p.getBoundingClientRect();
 return {focus,count:buttons.length,progress:badge?.textContent||'',
  badgeVisible:!badge?.hidden&&getComputedStyle(badge).visibility!=='hidden',
  role:badge?.getAttribute('role'),ariaLive:badge?.getAttribute('aria-live'),
  actionComfortable:!!pos&&pos.top>=bounds.top+45&&pos.bottom<=bounds.bottom-12,
  actionVisible:!!pos&&pos.top>=bounds.top&&pos.bottom<=bounds.bottom+3,
  aiOpen:p.dataset.poAiActive==='true'&&!p.hidden,
  overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};
});
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const native=window.IPTVState;native.setPage('tv');window.__p336Native=native;
  if(!native.getChannels().length){
   const fixture=['Thể thao','Thời sự','Giải trí'].map((label,i)=>({
    id:'p336-qa-'+i,name:'QA P336 '+label,url:'https://example.invalid/p336-'+i+'.m3u8',
    group:'QA kiểm thử',status:'alive'
   }));
   window.IPTVState=Object.freeze({...native,getChannels:()=>fixture});
  }
  const p=document.getElementById('poWatchFlowPanel');
  if(p.hidden)window.PositronWatchFlow.open();
  if(p.dataset.poAiActive!=='true')document.getElementById('poFlowPlusAI')?.click();
  document.getElementById('poAIChannels')?.click();
 });
 await page.waitForFunction(()=>
  document.getElementById('poWatchFlowPanel')?.dataset.poAiActive==='true'&&
  document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child').length>=3,
 null,{timeout:15000});
 const stateBefore=await persisted(page);
 const old=await page.addStyleTag({content:'#poWatchFlowPanel #poAIFocusProgress{visibility:hidden!important}'});
 await page.keyboard.press('Alt+Shift+J');
 const beforeWide=await inspect(page);
 const wideBeforePng=await shot(page,'positron-p51336-focus-position-before-1920x1080-real.png');
 await old.evaluate(el=>el.remove());
 await page.keyboard.press('Alt+Shift+K');
 const afterWide=await inspect(page);
 const wideAfterPng=await shot(page,'positron-p51336-focus-position-after-1920x1080-real.png');
 await page.setViewportSize({width:720,height:900});
 await page.keyboard.press('Alt+Shift+J');
 const oldNarrow=await page.addStyleTag({content:'#poWatchFlowPanel #poAIFocusProgress{visibility:hidden!important}'});
 const beforeNarrow=await inspect(page);
 const narrowBeforePng=await shot(page,'positron-p51336-focus-position-before-720x900-real.png');
 await oldNarrow.evaluate(el=>el.remove());
 await page.keyboard.press('Alt+Shift+K');
 const afterNarrow=await inspect(page);
 const narrowAfterPng=await shot(page,'positron-p51336-focus-position-after-720x900-real.png');
 for(let i=1;i<afterNarrow.count;i++)await page.keyboard.press('Alt+Shift+K');
 const wrap=await inspect(page);
 const stateAfter=await persisted(page);
 const qa={
  multipleRecommendations:afterNarrow.count>=3&&afterWide.count>=3,
  startsFirst:beforeWide.focus===0&&beforeNarrow.focus===0,
  secondAnnounced:afterWide.focus===1&&afterNarrow.focus===1&&
   afterWide.progress==='Gợi ý 2/'+afterWide.count&&afterNarrow.progress==='Gợi ý 2/'+afterNarrow.count,
  newBadgeVisible:afterWide.badgeVisible&&afterNarrow.badgeVisible&&!beforeNarrow.badgeVisible,
  screenReaderAnnounce:afterNarrow.role==='status'&&afterNarrow.ariaLive==='polite',
  wrappedAnnounced:wrap.focus===0&&wrap.progress==='Gợi ý 1/'+wrap.count,
  nextActionComfortable:afterNarrow.actionComfortable&&afterWide.actionComfortable,
  noHorizontalOverflow:!afterWide.overflow&&!afterNarrow.overflow,
  noAutoplay:stateBefore.current===stateAfter.current,
  playlistUnchanged:stateBefore.channels===stateAfter.channels,
  modelUnchanged:stateBefore.model===stateAfter.model,
  modeIntact:afterNarrow.aiOpen&&afterWide.aiOpen
 };
 for(const [name,ok] of Object.entries(qa))
  assert.equal(ok,true,'P336 native focus-position '+name+': '+JSON.stringify({qa,beforeNarrow,afterNarrow,afterWide,wrap}));
 for(const [png,w,h] of [[wideBeforePng,1920,1080],[wideAfterPng,1920,1080],[narrowBeforePng,720,900],[narrowAfterPng,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 assert.ok(!wideBeforePng.equals(wideAfterPng)&&!narrowBeforePng.equals(narrowAfterPng));
 fs.writeFileSync('positron-evidence/audit-p51336-focus-position.json',JSON.stringify({
  version:'P5.1.336',app:'4.23.421',realElectron:true,
  beforeNote:'BEFORE hides the new badge in the real current Electron, simulating P335; NOT prior binary.',
  beforeWide,beforeNarrow,
  afterWide:{...afterWide,sha256:hash(wideAfterPng)},
  afterNarrow:{...afterNarrow,sha256:hash(narrowAfterPng)},wrap,qa,
  scope:'Local synthetic QA channels only when no playlist; no streaming'
 },null,2));
 console.log('P336 genuine Electron AI position badge QA',JSON.stringify(qa));
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p336Native;
  delete window.__p336Native;
 });
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
