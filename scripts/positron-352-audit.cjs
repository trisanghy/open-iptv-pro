'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',stem='positron-p51352-explore-prerequisite-';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const state=page=>page.evaluate(()=>({model:localStorage.getItem('positron-intelligence-preferences-v1'),ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),current:window.IPTVState.getCurrent()?.id||'',consent:document.getElementById('poAIMLConsent').checked}));
const snap=page=>page.evaluate(()=>{const b=document.getElementById('poAIExplore'),p=document.getElementById('poWatchFlowPanel'),r=b.getBoundingClientRect(),frame=p.getBoundingClientRect();return {disabled:b.disabled,label:b.getAttribute('aria-label'),title:b.title,sub:getComputedStyle(b,'::after').content,width:r.width,height:r.height,inside:r.left>=frame.left&&r.right<=frame.right,overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};});
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.close();document.getElementById('poWatchFlowToggle').focus();});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';},null,{timeout:15000});
 const initial=await state(page),original=await page.locator('#poAIExplore').evaluate(b=>b.disabled),all={};
 assert.equal(original,!initial.consent,'production disabled state follows actual consent');
 try{
  await page.locator('#poAIExplore').evaluate(b=>b.disabled=true);
  for(const [width,height] of [[1920,1080],[720,900]]){
   await page.setViewportSize({width,height});
   const old=await page.addStyleTag({content:'#poWatchFlowPanel #poAIExplore:disabled{opacity:.48!important;color:#ccece5!important}#poWatchFlowPanel #poAIExplore:disabled::after{content:none!important}'});
   const before=await page.screenshot({path:path.join(dir,stem+'before-'+width+'x'+height+'-real.png'),animations:'disabled'});
   await old.evaluate(el=>el.remove());
   const visible=await snap(page),after=await page.screenshot({path:path.join(dir,stem+'after-'+width+'x'+height+'-real.png'),animations:'disabled'});
   assert.ok(visible.disabled&&visible.sub.includes('Cần bật học')&&visible.label.includes('cần bật học')&&visible.title.includes('bật học sở thích'));
   assert.ok(visible.width>70&&visible.height>=44&&visible.inside&&!visible.overflow);
   assert.ok(!before.equals(after));
   for(const png of [before,after]){assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);}
   await page.locator('#poAIExplore').evaluate(b=>b.disabled=false);
   const active=await snap(page);assert.ok(!active.disabled&&!active.sub.includes('Cần bật học'));
   await page.locator('#poAIExplore').evaluate(b=>b.disabled=true);
   all[width+'x'+height]={visible,active,beforeSha256:hash(before),afterSha256:hash(after)};
  }
 }finally{await page.locator('#poAIExplore').evaluate((b,v)=>b.disabled=v,original);await page.setViewportSize({width:1920,height:1080});}
 assert.deepEqual(await state(page),initial,'model, consent, channels, playback untouched');
 fs.writeFileSync('positron-evidence/audit-p51352-explore-prerequisite.json',JSON.stringify({version:'P5.1.352',app:'4.23.437',realElectron:true,pass:true,scope:'native DOM visual compare; before uses temporary prior style, no consent mutation',all},null,2));
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
