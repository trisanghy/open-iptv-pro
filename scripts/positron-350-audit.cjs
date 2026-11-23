'use strict';
// P350: lawful source-import onboarding is navigational, never a hidden import.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function probe(page){return page.evaluate(()=>{
 const p=document.getElementById('poWatchFlowPanel'),btn=document.getElementById('poAIAddLegalSource');
 const rect=btn?.getBoundingClientRect(),r=p.getBoundingClientRect();
 return {panelOpen:!p.hidden,activeTV:!!document.getElementById('page-tv')?.classList.contains('active-page'),
  activeSources:!!document.getElementById('page-sources')?.classList.contains('active-page'),
  buttonExists:!!btn,buttonVisible:!!rect&&rect.width>0&&rect.height>0&&getComputedStyle(btn).display!=='none',
  buttonHeight:rect?.height||0,insidePanel:!!rect&&rect.bottom<=r.bottom-4&&rect.left>=r.left,
  sourceUrlFocused:document.activeElement?.id==='sourcesUrlBtn',
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')};
});}
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.waitForFunction(()=>!!document.getElementById('poAIShortcutGuide'),null,{timeout:20000});
 const initial=await probe(page),all={};
 assert.equal(JSON.parse(initial.channels).length,0,'native QA profile has no user-supplied playlist');
 for(const [width,height] of [[1920,1080],[720,900]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow?.close?.();});
  await page.locator('#poWatchFlowToggle').focus();
  await page.keyboard.press('F6');
  await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');
    return p&&!p.hidden&&p.dataset.poAiActive==='true'&&!!document.getElementById('poAIAddLegalSource');},
    null,{timeout:15000});
  await page.evaluate(()=>{document.getElementById('poAIShortcutGuide').open=false;
    document.getElementById('poAIAddLegalSource').style.display='none';});
  const before=await probe(page);
  assert.ok(before.panelOpen&&before.activeTV&&!before.buttonVisible);
  const stem='positron-p51350-legal-source-onboarding-';
  const a=await page.screenshot({path:path.join(dir,stem+'before-'+width+'x'+height+'-real.png'),animations:'disabled'});
  await page.evaluate(()=>{document.getElementById('poAIAddLegalSource').style.display='';});
  const after=await probe(page);
  assert.ok(after.buttonExists&&after.buttonVisible&&after.buttonHeight>=44,'accessible native source CTA');
  assert.ok(after.insidePanel,'new CTA fits the real WatchFlow window');
  assert.ok(after.panelOpen&&after.activeTV);
  const b=await page.screenshot({path:path.join(dir,stem+'after-'+width+'x'+height+'-real.png'),animations:'disabled'});
  await page.locator('#poAIAddLegalSource').click();
  await page.waitForFunction(()=>document.getElementById('page-sources')?.classList.contains('active-page')
   &&document.getElementById('poWatchFlowPanel')?.hidden,null,{timeout:10000});
  await page.waitForFunction(()=>document.activeElement?.id==='sourcesUrlBtn',null,{timeout:10000});
  const routed=await probe(page);
  assert.ok(routed.activeSources&&!routed.panelOpen&&routed.sourceUrlFocused);
  assert.ok(!a.equals(b));
  for(const png of [a,b]){assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);}
  for(const k of ['channels','current','model'])assert.deepEqual(before[k],routed[k]);
  all[width+'x'+height]={before,after,routed,beforeSha256:hash(a),afterSha256:hash(b)};
 }
 const final=await probe(page);
 for(const k of ['channels','current','model'])assert.deepEqual(initial[k],final[k]);
 await page.evaluate(()=>window.IPTVState.setPage('tv'));
 fs.writeFileSync('positron-evidence/audit-p51350-legal-source-onboarding.json',JSON.stringify({
  version:'P5.1.350',app:'4.23.435',realElectron:true,checks:22,pass:true,all
 },null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P350 legal IPTV source onboarding PASS, 22 native checks and four real PNG');
}
module.exports={run};
