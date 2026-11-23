'use strict';
// P335: genuine Electron CDP: focus recommendation #1 via P334,
// then focus recommendation #2 via new Alt+Shift+K without autoplay.
// BEFORE represents the previous one-step focus state in this same binary.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.resolve('positron-evidence','p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const screenshot=(page,n)=>page.screenshot({path:path.join(out,n),animations:'disabled'});
const persistent=page=>page.evaluate(()=>({
 channels:JSON.stringify((window.__p335NativeState||window.IPTVState).getChannels().map(c=>c.id)),
 current:(window.__p335NativeState||window.IPTVState).getCurrent()?.id||'',
 model:localStorage.getItem('positron-intelligence-preferences-v1')
}));
const sample=page=>page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel'),
  buttons=[...panel.querySelectorAll('.po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length),
  focus=buttons.indexOf(document.activeElement),
  a=document.activeElement?.getBoundingClientRect(),
  r=panel.getBoundingClientRect();
 return {count:buttons.length,focus,focusText:buttons[focus]?.textContent.trim()||'',
  focusVisible:focus>=0&&!!a&&a.top>=r.top&&a.bottom<=r.bottom+2,
  focusOnly:document.activeElement?.tagName==='BUTTON',
  shortcut:document.getElementById('poAICards')?.getAttribute('aria-keyshortcuts')||'',
  aiOpen:panel.dataset.poAiActive==='true'&&!panel.hidden,
  noOverflow:panel.scrollWidth<=panel.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3};
});
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const native=window.IPTVState;native.setPage('tv');window.__p335NativeState=native;
  if(!native.getChannels().length){
   const fixture=['Thể thao','Thời sự','Giải trí'].map((label,i)=>({
    id:'p335-qa-'+i,name:'QA P335 '+label,url:'https://example.invalid/p335-'+i+'.m3u8',
    group:'QA kiểm thử',status:'alive'
   }));
   window.IPTVState=Object.freeze({...native,getChannels:()=>fixture});
  }
 });
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p&&!p.hidden&&p.dataset.poAiActive==='true';
 },null,{timeout:15000});
 await page.evaluate(()=>document.getElementById('poAIChannels').click());
 await page.waitForFunction(()=>
  document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child').length>=2,
 null,{timeout:15000});
 const original=await persistent(page);
 await page.keyboard.press('Alt+Shift+J');
 const beforeWide=await sample(page);
 const beforeWidePng=await screenshot(page,'positron-p51335-next-ai-before-1920x1080-real.png');
 await page.keyboard.press('Alt+Shift+K');
 const afterWide=await sample(page);
 const afterWidePng=await screenshot(page,'positron-p51335-next-ai-after-1920x1080-real.png');
 await page.setViewportSize({width:720,height:900});
 await page.keyboard.press('Alt+Shift+J');
 const beforeNarrow=await sample(page);
 const beforeNarrowPng=await screenshot(page,'positron-p51335-next-ai-before-720x900-real.png');
 await page.keyboard.press('Alt+Shift+K');
 const afterNarrow=await sample(page);
 const afterNarrowPng=await screenshot(page,'positron-p51335-next-ai-after-720x900-real.png');
 // The next shortcut wraps through *play* controls, not thumbs up/down.
 for(let i=1;i<afterNarrow.count;i++)await page.keyboard.press('Alt+Shift+K');
 const wrapped=await sample(page);
 const final=await persistent(page);
 const checks={
  twoOrMoreRecommendations:beforeWide.count>=2&&beforeNarrow.count>=2,
  previousJStartsFirst:beforeWide.focus===0&&beforeNarrow.focus===0,
  newKFocusesSecond:afterWide.focus===1&&afterNarrow.focus===1,
  secondWithinViewport:afterWide.focusVisible&&afterNarrow.focusVisible,
  wrapsToFirst:wrapped.focus===0,
  noFeedbackButtonsSkipped:afterWide.focusText.includes('Xem')&&afterNarrow.focusText.includes('Xem'),
  declaredShortcut:afterNarrow.shortcut==='Alt+Shift+K'&&afterWide.shortcut==='Alt+Shift+K',
  noAutoplay:original.current===final.current,
  playlistUnchanged:original.channels===final.channels,
  modelUnchanged:original.model===final.model,
  aiStillOpen:afterWide.aiOpen&&afterNarrow.aiOpen,
  noOverflow:beforeNarrow.noOverflow&&afterNarrow.noOverflow&&afterWide.noOverflow
 };
 for(const [k,ok] of Object.entries(checks))
  assert.equal(ok,true,'P335 native AI next-focus '+k+': '+JSON.stringify({checks,beforeWide,afterWide,beforeNarrow,afterNarrow,wrapped}));
 assert.ok(!beforeWidePng.equals(afterWidePng)&&!beforeNarrowPng.equals(afterNarrowPng),
 'P335 next-focus screenshots must show a real changed view');
 for(const [buf,w,h] of [[beforeWidePng,1920,1080],[afterWidePng,1920,1080],
  [beforeNarrowPng,720,900],[afterNarrowPng,720,900]])
  {assert.equal(buf.readUInt32BE(16),w);assert.equal(buf.readUInt32BE(20),h);}
 fs.writeFileSync('positron-evidence/audit-p51335-next-ai.json',JSON.stringify({
  version:'P5.1.335',app:'4.23.420',realElectron:true,
  note:'BEFORE is the preceding focus state in P335 binary, no prior executable is misrepresented.',
  beforeWide,beforeNarrow,afterWide:{...afterWide,sha256:sha(afterWidePng)},
  afterNarrow:{...afterNarrow,sha256:sha(afterNarrowPng)},wrapped,checks,
  scope:'Native Electron with local synthetic channels only when no playlist, no IPTV stream'
 },null,2));
 console.log('P335 native next AI recommendation shortcut QA',JSON.stringify(checks));
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p335NativeState;delete window.__p335NativeState;
 });
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
