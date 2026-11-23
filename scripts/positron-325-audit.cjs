'use strict';
// P325 real-Electron CDP keyboard QA. No stream playback or external URLs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const out=path.resolve('positron-evidence','p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const snapshot=page=>page.evaluate(()=>{
 const nav=document.querySelector('#poWatchFlowPanel .po-flowplus-nav');
 const buttons=[...nav.querySelectorAll('button[data-flowplus-mode]')];
 const r=nav.getBoundingClientRect();
 return {focus:document.activeElement?.id||'',
  focusVisible:document.activeElement?.matches?.(':focus-visible')||false,
  pressed:buttons.map(x=>({name:x.dataset.flowplusMode,pressed:x.getAttribute('aria-pressed')})),
  navigationCount:buttons.length,
  minimumHeight:Math.min(...buttons.map(x=>x.getBoundingClientRect().height)),
  keyboardHelp:nav.getAttribute('aria-keyshortcuts'),
  oneRow:buttons.every(x=>Math.abs(x.getBoundingClientRect().top-buttons[0].getBoundingClientRect().top)<3),
  overflow:buttons.some(x=>{const b=x.getBoundingClientRect();return b.left<r.left-2||b.right>r.right+2;})||
   nav.scrollWidth>nav.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3
 };
});
const savedState=page=>page.evaluate(()=>({
 ids:JSON.stringify(window.IPTVState.getChannels().map(x=>x.id)),
 current:window.IPTVState.getCurrent()?.id||'',
 model:localStorage.getItem('positron-intelligence-preferences-v1')
}));
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.open();});
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p&&!p.hidden&&p.querySelectorAll('.po-flowplus-nav button[data-flowplus-mode]').length===5;
 },null,{timeout:15000});
 const stateBefore=await savedState();
 await page.locator('#poFlowPlusdiscover').focus();
 await page.keyboard.press('Home');
 const first=await snapshot(page);
 const before=await page.screenshot({path:path.join(out,'positron-p51325-keyboard-modes-before-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('ArrowRight');
 const second=await snapshot(page);
 const after=await page.screenshot({path:path.join(out,'positron-p51325-keyboard-modes-after-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('ArrowLeft');
 const left=await snapshot(page);
 await page.keyboard.press('End');
 const end=await snapshot(page);
 await page.keyboard.press('ArrowRight');
 const wrap=await snapshot(page);
 await page.keyboard.press('ArrowLeft');
 const backToZap=await snapshot(page);
 await page.keyboard.press('Home');
 await page.setViewportSize({width:720,height:900});
 await page.locator('#poFlowPlusdiscover').focus();
 await page.keyboard.press('ArrowRight');
 const narrow=await snapshot(page);
 const narrowPng=await page.screenshot({path:path.join(out,'positron-p51325-keyboard-modes-after-720x900-real.png'),animations:'disabled'});
 const stateAfter=await savedState();
 const qa325={
  fiveButtons:first.navigationCount===5&&second.navigationCount===5&&narrow.navigationCount===5,
  homeToFirst:first.focus==='poFlowPlusdiscover',
  rightToSecond:second.focus==='poFlowPluscontinue',
  leftToFirst:left.focus==='poFlowPlusdiscover',
  endToZap:end.focus==='poFlowPluszap',
  wrapsToFirst:wrap.focus==='poFlowPlusdiscover',
  wrapsBackToZap:backToZap.focus==='poFlowPluszap',
  narrowRightToSecond:narrow.focus==='poFlowPluscontinue',
  focusedByKeyboard:second.focusVisible&&narrow.focusVisible,
  focusOnly:first.pressed.every((x,i)=>x.pressed===second.pressed[i].pressed),
  noOverflow:!first.overflow&&!second.overflow&&!narrow.overflow,
  oneRow:first.oneRow&&second.oneRow&&narrow.oneRow,
  height44:first.minimumHeight>=43.5&&narrow.minimumHeight>=43.5,
  shortcutsDeclared:second.keyboardHelp==='ArrowLeft ArrowRight Home End',
  playlistIntact:stateAfter.ids===stateBefore.ids,
  modelIntact:stateAfter.model===stateBefore.model,
  noAutoplay:stateAfter.current===stateBefore.current
 };
 for(const [key,value] of Object.entries(qa325))
  assert.equal(value,true,'P325 Electron keyboard '+key+': '+JSON.stringify({qa325,first,second,narrow,left,end,wrap}));
 assert.ok(!before.equals(after),'P325 keyboard focus screenshots must differ');
 for(const [png,w,h] of [[before,1920,1080],[after,1920,1080],[narrowPng,720,900]]){
  assert.equal(png.readUInt32BE(16),w);
  assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync(path.resolve('positron-evidence','audit-p51325-keyboard-modes.json'),JSON.stringify({
  version:'P5.1.325',electron:'4.23.410',realElectron:true,
  source:'local QA channels; no live IPTV playback',
  first:{...first,sha256:sha(before)},
  second:{...second,sha256:sha(after)},
  narrow:{...narrow,sha256:sha(narrowPng)},
  left,end,wrap,backToZap,qa325
 },null,2));
 console.log('P325 WatchFlow keyboard Electron QA:',JSON.stringify(qa325));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
