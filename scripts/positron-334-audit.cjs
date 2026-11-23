'use strict';
// P334: native Electron before/after. Before simulates P333's old tab margin
// using a temporary CSS override; after renders actual P334 + shortcut focus.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.resolve('positron-evidence','p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const shot=(page,n)=>page.screenshot({path:path.join(dir,n),animations:'disabled'});
const persistent=page=>page.evaluate(()=>({
 sourceIds:JSON.stringify((window.__p334OriginalState||window.IPTVState).getChannels().map(x=>x.id)),
 current:(window.__p334OriginalState||window.IPTVState).getCurrent()?.id||'',
 model:localStorage.getItem('positron-intelligence-preferences-v1')
}));
const check=page=>page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),
  tab=document.getElementById('poFlowPlusAI'),
  head=p.querySelector('.po-watchflow-head'),
  entry=p.querySelector('.po-ai-entry'),
  action=p.querySelector('.po-ai-card .po-ai-actions button'),
  help=document.getElementById('poAIKeyboardHelp'),
  h=head.getBoundingClientRect(),t=tab.getBoundingClientRect(),
  a=action?.getBoundingClientRect(),r=p.getBoundingClientRect();
 return {
  tabTop:t.top,headerBottom:h.bottom,
  tabGap:Math.round(t.top-h.bottom),
  firstActionVisible:!!a&&a.width>=60&&a.height>=43&&a.top>=Math.max(r.top,h.bottom)-2&&a.bottom<=r.bottom+2,
  headingClear:(()=>{
   const title=action?.closest('.po-ai-card')?.querySelector('.po-ai-card-header strong');
   const bounds=title?.getBoundingClientRect();
   return !!bounds&&bounds.top>=Math.max(r.top,h.bottom)+2&&bounds.bottom<=r.bottom-2;
  })(),
  targetFocused:document.activeElement===action,
  shortcutDeclared:p.querySelector('#poIntelligenceResults')?.getAttribute('aria-keyshortcuts')==='Alt+Shift+J',
  helpVisible:help?.textContent.includes('Alt+Shift+J')&&help.getBoundingClientRect().width>100,
  entryMargin:getComputedStyle(entry).marginTop,
  noOverflow:p.scrollWidth<=p.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
  aiOpen:p.dataset.poAiActive==='true'
 };
});
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const native=window.IPTVState;native.setPage('tv');
  window.__p334OriginalState=native;
  if(!native.getChannels().length){
   const fixture=[
    {id:'p334-qa-sport',name:'QA P334 Thể thao',url:'https://example.invalid/p334a.m3u8',group:'QA kiểm thử',status:'alive'},
    {id:'p334-qa-news',name:'QA P334 Tin tức',url:'https://example.invalid/p334b.m3u8',group:'QA kiểm thử',status:'alive'}
   ];
   window.IPTVState=Object.freeze({...native,getChannels:()=>fixture});
  }
 });
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p&&!p.hidden&&p.dataset.poAiActive==='true';
 },null,{timeout:15000});
 await page.evaluate(()=>{
  document.getElementById('poAIChannels').click();
  document.getElementById('poWatchFlowPanel').scrollTop=0;
 });
 await page.waitForFunction(()=>!!document.querySelector('.po-ai-card .po-ai-actions button'),null,{timeout:15000});
 const stateBefore=await persistent(page);
 const legacy=await page.addStyleTag({content:
  'html[data-positron="true"] body #poWatchFlowPanel[data-po-ai-active="true"] .po-ai-entry{margin:-4px 0 11px!important}'});
 await page.evaluate(()=>{
  const help=document.getElementById('poAIKeyboardHelp');
  window.__p334OriginalHelp=help.textContent;
  help.textContent=help.textContent.replace(' · Alt+Shift+J: tới nút Xem đầu','');
 });
 const beforeDesktop=await check(page);
 const beforeWidePng=await shot(page,'positron-p51334-ai-jump-before-1920x1080-real.png');
 await page.setViewportSize({width:720,height:900});
 const beforeNarrow=await check(page);
 const beforeNarrowPng=await shot(page,'positron-p51334-ai-jump-before-720x900-real.png');
 await legacy.evaluate(el=>el.remove());
 await page.evaluate(()=>{
  const help=document.getElementById('poAIKeyboardHelp');
  help.textContent=window.__p334OriginalHelp;
  delete window.__p334OriginalHelp;
  document.getElementById('poWatchFlowPanel').scrollTop=0;
 });
 await page.keyboard.press('Alt+Shift+J');
 const afterNarrow=await check(page);
 const afterNarrowPng=await shot(page,'positron-p51334-ai-jump-after-720x900-real.png');
 await page.setViewportSize({width:1920,height:1080});
 await page.keyboard.press('Alt+Shift+J');
 const afterDesktop=await check(page);
 const afterWidePng=await shot(page,'positron-p51334-ai-jump-after-1920x1080-real.png');
 const stateAfter=await persistent(page);
 const qa={
  newShortcutFocusOnly:afterNarrow.targetFocused&&afterDesktop.targetFocused,
  noAutoplay:stateBefore.current===stateAfter.current,
  noPlaylistMutation:stateBefore.sourceIds===stateAfter.sourceIds,
  noModelMutation:stateBefore.model===stateAfter.model,
  shortcutDeclared:afterNarrow.shortcutDeclared&&afterDesktop.shortcutDeclared,
  discoverableHint:afterNarrow.helpVisible&&afterDesktop.helpVisible,
  // Intentional focus-scroll now moves the old mode tab above the sticky title.
  // Test the real visible heading and original 9px CSS margin instead.
  safeStickySpacing:afterNarrow.entryMargin==='9px'&&afterDesktop.entryMargin==='9px'&&
   afterNarrow.headingClear&&afterDesktop.headingClear,
  spacingImproved:Number.parseFloat(afterNarrow.entryMargin)-
   Number.parseFloat(beforeNarrow.entryMargin)>=10,
  actionStillVisible:afterNarrow.firstActionVisible&&afterDesktop.firstActionVisible,
  noOverflow:afterNarrow.noOverflow&&afterDesktop.noOverflow,
  aiRemainsOpen:afterNarrow.aiOpen&&afterDesktop.aiOpen
 };
 for(const [key,ok] of Object.entries(qa))
  assert.equal(ok,true,'P334 native focus shortcut '+key+': '+JSON.stringify({qa,beforeNarrow,afterNarrow,afterDesktop}));
 for(const [buffer,w,h] of [[beforeWidePng,1920,1080],[beforeNarrowPng,720,900],
  [afterWidePng,1920,1080],[afterNarrowPng,720,900]]){
  assert.equal(buffer.readUInt32BE(16),w);assert.equal(buffer.readUInt32BE(20),h);
 }
 assert.ok(!beforeNarrowPng.equals(afterNarrowPng));
 fs.writeFileSync('positron-evidence/audit-p51334-ai-jump.json',JSON.stringify({
  version:'P5.1.334',app:'4.23.419',realElectron:true,
  note:'BEFORE is a P333-style CSS/text override in P334 Electron, not earlier executable.',
  beforeDesktop,beforeNarrow,afterDesktop:{...afterDesktop,sha256:sha(afterWidePng)},
  afterNarrow:{...afterNarrow,sha256:sha(afterNarrowPng)},qa,
  scope:'Local synthetic QA source only when necessary, focus-only; not IPTV playback'
 },null,2));
 console.log('P334 native AI first-Play focus QA passed:',JSON.stringify(qa));
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p334OriginalState;
  delete window.__p334OriginalState;
 });
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
