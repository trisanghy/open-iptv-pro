'use strict';
// P344: Playwright/CDP real Electron screenshots from first-to-sixth AI suggestion.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),dir='positron-evidence/p5-20-rounds';
async function snap(page){return page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel'),r=panel.getBoundingClientRect(),
  h=panel.querySelector('.po-watchflow-head').getBoundingClientRect();
 const actions=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
  .filter(e=>!e.disabled&&e.getClientRects().length);
 const index=actions.indexOf(document.activeElement),target=actions[index];
 const b=target?.getBoundingClientRect(),name=target?.closest('.po-ai-card')?.querySelector('strong')?.getBoundingClientRect();
 return {index,count:actions.length,shortcuts:document.getElementById('poAICards').getAttribute('aria-keyshortcuts'),
  actionVisible:!!b&&b.top>=h.bottom-2&&b.bottom<=r.bottom+2,
  headingVisible:!!name&&name.top>=h.bottom+2&&name.bottom<=r.bottom-2,
  noOverflow:panel.scrollWidth<=panel.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
  playing:window.IPTVState.getCurrent()?.id||'',
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 const original=await page.evaluate(()=>({
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  playing:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 await page.evaluate(()=>{
  const s=window.IPTVState;s.setPage('tv');window.__p344Original=s;
  if(s.getChannels().length<8){
   const fixture=Array.from({length:8},(_,i)=>({id:'p344-'+i,
    name:'QA P344 gợi ý '+(i+1),group:'QA',url:'https://example.invalid/'+i+'.m3u8',status:'alive'}));
   window.IPTVState=Object.freeze({...s,getChannels:()=>fixture});
  }
 });
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';},{timeout:15000});
 await page.evaluate(()=>document.getElementById('poAIChannels').click());
 await page.waitForFunction(()=>document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child').length>=7,null,{timeout:15000});
 const all={};
 for(const [w,h] of [[1920,1080],[720,900]]){
  await page.setViewportSize({width:w,height:h});
  await page.evaluate(()=>document.getElementById('poAIChannels').focus());
  await page.keyboard.press('Alt+Shift+J');
  const before=await snap(page);
  assert.equal(before.index,0);assert.ok(before.count>=7);
  assert.ok(before.shortcuts.includes('PageUp PageDown'));
  const stem='positron-p51344-page-navigation-';
  const a=await page.screenshot({path:path.join(dir,stem+'before-'+w+'x'+h+'-real.png'),animations:'disabled'});
  await page.keyboard.press('PageDown');
  const after=await snap(page);
  assert.equal(after.index,5,'PageDown advances five cards');
  assert.ok(after.actionVisible&&after.headingVisible&&after.noOverflow,'selected card visible');
  const b=await page.screenshot({path:path.join(dir,stem+'after-'+w+'x'+h+'-real.png'),animations:'disabled'});
  await page.keyboard.press('PageDown');
  assert.equal((await snap(page)).index,before.count-1,'clamp to last');
  await page.keyboard.press('PageUp');
  assert.equal((await snap(page)).index,before.count-6,'jump backwards five');
  await page.keyboard.press('Home');
  assert.equal((await snap(page)).index,0,'Home retained');
  await page.keyboard.press('PageUp');
  assert.equal((await snap(page)).index,0,'clamp to first');
  await page.evaluate(()=>document.getElementById('searchBox')?.focus());
  await page.keyboard.press('PageDown');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'searchBox','search editor untouched');
  for(const s of [before,after]){assert.equal(s.playing,before.playing);assert.equal(s.channels,before.channels);assert.equal(s.model,before.model);}
  assert.ok(!a.equals(b));assert.equal(a.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),h);
  all[w+'x'+h]={before,after,beforeSha256:crypto.createHash('sha256').update(a).digest('hex'),afterSha256:crypto.createHash('sha256').update(b).digest('hex')};
 }
 await page.evaluate(()=>{window.PositronWatchFlow.close();window.IPTVState=window.__p344Original;delete window.__p344Original});
 const final=await page.evaluate(()=>({channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),playing:window.IPTVState.getCurrent()?.id||'',model:localStorage.getItem('positron-intelligence-preferences-v1')}));
 assert.deepEqual(final,original,'preserves source/playback and ML');
 fs.writeFileSync('positron-evidence/audit-p51344-page-navigation.json',JSON.stringify({version:'P5.1.344',realElectron:true,checks:22,pass:true,all},null,2));
 console.log('P344 real Electron PageUp/PageDown PASS',JSON.stringify({screenshots:4,checks:22}));
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
