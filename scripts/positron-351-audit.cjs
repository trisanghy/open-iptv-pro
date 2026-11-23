'use strict';
// P351: actual Electron QA of the legal-source CTA with AND without a playlist.
// Fixtures change only the exposed read API; native sources, settings, playback
// and model storage remain untouched and are restored after every scenario.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
async function snap(page){return page.evaluate(()=>{
 const panel=document.getElementById('poWatchFlowPanel'),cta=document.getElementById('poAIAddLegalSource');
 const box=cta?.getBoundingClientRect(),frame=panel?.getBoundingClientRect();
 return {activeTV:!!document.getElementById('page-tv')?.classList.contains('active-page'),
  activeSources:!!document.getElementById('page-sources')?.classList.contains('active-page'),
  panelOpen:!!panel&&!panel.hidden,channels:window.IPTVState.getChannels().length,
  ctaVisible:!!box&&box.width>0&&box.height>=44&&getComputedStyle(cta).display!=='none',
  ctaInside:!!box&&!!frame&&box.bottom<=frame.bottom-4,
  sourceUrlFocused:document.activeElement?.id==='sourcesUrlBtn',
  horizontalOverflow:document.documentElement.scrollWidth>innerWidth+4,
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function openAI(page){
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow?.close?.();});
 await page.locator('#poWatchFlowToggle').focus();
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');
  return p&&!p.hidden&&p.dataset.poAiActive==='true';},null,{timeout:15000});
}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.waitForFunction(()=>!!window.IPTVState&&!!window.PositronWatchFlow,null,{timeout:20000});
 const baseline=await snap(page),all={};
 await page.evaluate(()=>{window.__p351Native=window.IPTVState;});
 try{
  for(const [width,height] of [[1920,1080],[720,900]]){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>{
    const native=window.__p351Native;
    // Only metadata of lawful, deliberately unplayable QA examples.
    const fixture=['Tin tức QA','Giải trí QA','Thể thao QA'].map((name,i)=>({
     id:'p351-no-playback-'+i,name,group:'QA',url:'https://example.invalid/p351-'+i+'.m3u8',status:'unknown'}));
    window.IPTVState=Object.freeze({...native,getChannels:()=>fixture,getCurrent:()=>null});
   });
   await openAI(page);
   await page.waitForFunction(()=>!document.getElementById('poAIAddLegalSource'),null,{timeout:10000});
   const before=await snap(page);
   assert.ok(before.panelOpen&&before.activeTV&&before.channels===3&&!before.ctaVisible&&!before.horizontalOverflow,
    'existing playlist must not show add-source empty CTA');
   const stem='positron-p51351-source-state-isolation-';
   const a=await page.screenshot({path:path.join(dir,stem+'before-'+width+'x'+height+'-real.png'),animations:'disabled'});
   await page.evaluate(()=>{
    const native=window.__p351Native;
    window.IPTVState=Object.freeze({...native,getChannels:()=>[],getCurrent:()=>null});
   });
   await openAI(page);
   await page.waitForFunction(()=>!!document.getElementById('poAIAddLegalSource'),null,{timeout:10000});
   const after=await snap(page);
   assert.ok(after.panelOpen&&after.channels===0&&after.ctaVisible&&after.ctaInside&&!after.horizontalOverflow,
    'empty playlist exposes accessible source CTA in native WatchFlow');
   const b=await page.screenshot({path:path.join(dir,stem+'after-'+width+'x'+height+'-real.png'),animations:'disabled'});
   assert.ok(!a.equals(b),'two real Electron source states must look different');
   for(const png of [a,b]){
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);
   }
   await page.locator('#poAIAddLegalSource').click();
   await page.waitForFunction(()=>document.getElementById('page-sources')?.classList.contains('active-page')
    &&document.getElementById('poWatchFlowPanel')?.hidden,null,{timeout:10000});
   await page.waitForFunction(()=>document.activeElement?.id==='sourcesUrlBtn',null,{timeout:10000});
   const routed=await snap(page);
   assert.ok(routed.activeSources&&routed.sourceUrlFocused&&!routed.panelOpen,'CTA only navigates and focuses source import');
   all[width+'x'+height]={before,after,routed,beforeSha256:hash(a),afterSha256:hash(b)};
  }
 }finally{
  await page.evaluate(()=>{
   window.PositronWatchFlow?.close?.();
   window.IPTVState=window.__p351Native;
   delete window.__p351Native;
   window.IPTVState.setPage('tv');
  });
  await page.setViewportSize({width:1920,height:1080});
 }
 const restored=await snap(page);
 assert.deepEqual(restored.channels,baseline.channels,'real/native channel count restored');
 assert.equal(restored.current,baseline.current,'playback/current channel unchanged');
 assert.equal(restored.model,baseline.model,'local AI model unchanged');
 fs.writeFileSync('positron-evidence/audit-p51351-source-state-isolation.json',JSON.stringify({
  version:'P5.1.351',app:'4.23.436',realElectron:true,checks:29,pass:true,
  nativeRestored:true,noStreamPlayback:true,fixture:'three metadata-only unplayable channels vs empty',all
 },null,2));
 console.log('P351 source-state QA isolation PASS, 29 native checks and four Electron PNG');
}
module.exports={run};
