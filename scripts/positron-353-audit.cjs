'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',names={
 '1920x1080':{before:'positron-p51353-explore-consent-before-1920x1080-real.png',after:'positron-p51353-explore-consent-after-1920x1080-real.png'},
 '720x900':{before:'positron-p51353-explore-consent-before-720x900-real.png',after:'positron-p51353-explore-consent-after-720x900-real.png'}
};
const key='positron-intelligence-preferences-v1';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const state=page=>page.evaluate(k=>({raw:localStorage.getItem(k),web:localStorage.getItem('positron-intelligence-web-v1'),ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),current:window.IPTVState.getCurrent()?.id||'',consent:document.getElementById('poAIMLConsent').checked,alert:document.getElementById('poAIAlerts').checked}),key);
const snap=page=>page.evaluate(()=>{const b=document.getElementById('poAIExplore'),p=document.getElementById('poWatchFlowPanel'),r=b.getBoundingClientRect(),f=p.getBoundingClientRect();return {disabled:b.disabled,label:b.getAttribute('aria-label'),title:b.title,sub:getComputedStyle(b,'::after').content,height:r.height,inside:r.left>=f.left&&r.right<=f.right,overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};});
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.close();document.getElementById('poWatchFlowToggle').focus();});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';},null,{timeout:15000});
 const initial=await state(page),consent=page.locator('#poAIMLConsent'),alert=page.locator('#poAIAlerts'),all={};
 const check=(s,on)=>{assert.equal(s.disabled,!on);assert.ok(s.label.includes(on?'đã bật học':'cần bật học'));assert.ok(s.title.includes(on?'đã bật học':'chỉ khả dụng'));assert.ok(s.sub.includes(on?'Đã bật học':'Cần bật học'));assert.ok(s.height>=44&&s.inside&&!s.overflow);};
 try{
  for(const [width,height] of [[1920,1080],[720,900]]){
   await page.setViewportSize({width,height});
   await consent.uncheck();await consent.check();
   const active=await snap(page);check(active,true);
   const original=await page.locator('#poAIExplore').evaluate(b=>({label:b.getAttribute('aria-label'),title:b.title}));
   const old=await page.addStyleTag({content:'#poWatchFlowPanel #poAIExplore:not(:disabled)::after{content:none!important}'});
   await page.locator('#poAIExplore').evaluate(b=>{b.title='Khám phá AI chỉ khả dụng khi bật học sở thích';b.setAttribute('aria-label','Khám phá AI — cần bật học sở thích');});
   let before;
   try{before=await page.screenshot({path:path.join(dir,names[width+'x'+height].before),animations:'disabled'});}
   finally{await old.evaluate(e=>e.remove());await page.locator('#poAIExplore').evaluate((b,v)=>{b.title=v.title;b.setAttribute('aria-label',v.label);},original);}
   const afterState=await snap(page);check(afterState,true);
   const after=await page.screenshot({path:path.join(dir,names[width+'x'+height].after),animations:'disabled'});
   assert.ok(!before.equals(after));
   for(const png of [before,after]){assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);}
   await consent.uncheck();const disabled=await snap(page);check(disabled,false);
   assert.equal(await alert.isDisabled(),true);
   all[width+'x'+height]={active:afterState,disabled,beforeSha256:hash(before),afterSha256:hash(after)};
  }
 }finally{
  await consent.setChecked(initial.consent);
  if(initial.consent)await alert.setChecked(initial.alert);
  await page.evaluate(({key,raw})=>raw===null?localStorage.removeItem(key):localStorage.setItem(key,raw),{key,raw:initial.raw});
  await page.setViewportSize({width:1920,height:1080});
 }
 assert.deepEqual(await state(page),initial,'restore consent, alerts, model storage, web cache, playlist and current channel');
 fs.writeFileSync('positron-evidence/audit-p51353-explore-consent.json',JSON.stringify({version:'P5.1.353',app:'4.23.438',realElectron:true,pass:true,scope:'actual checkbox transitions; before simulates old active presentation; after uses current renderer; restores QA state',all},null,2));
 await page.evaluate(()=>window.PositronWatchFlow.close());
}
module.exports={run};
