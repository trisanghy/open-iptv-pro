'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',key='positron-intelligence-preferences-v1',names={
 '1920x1080':{before:'positron-p51354-setup-hint-before-1920x1080-real.png',after:'positron-p51354-setup-hint-after-1920x1080-real.png'},
 '720x900':{before:'positron-p51354-setup-hint-before-720x900-real.png',after:'positron-p51354-setup-hint-after-720x900-real.png'}
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const state=page=>page.evaluate(k=>({raw:localStorage.getItem(k),web:localStorage.getItem('positron-intelligence-web-v1'),ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),current:window.IPTVState.getCurrent()?.id||'',consent:document.getElementById('poAIMLConsent').checked,alert:document.getElementById('poAIAlerts').checked}),key);
const snap=page=>page.evaluate(()=>{const p=document.getElementById('poWatchFlowPanel'),e=p.querySelector('.po-ai-empty'),b=document.getElementById('poAIAddLegalSource'),r=e.getBoundingClientRect(),f=p.getBoundingClientRect();return {text:e.textContent,consent:document.getElementById('poAIMLConsent').checked,cta:!!b&&b.getBoundingClientRect().height>=44,inside:r.left>=f.left&&r.right<=f.right,overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};});
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.waitForSelector('#poAIMLConsent',{state:'attached',timeout:30000});
 await page.waitForSelector('#poAIAlerts',{state:'attached',timeout:30000});
 await page.evaluate(()=>{window.IPTVState.setPage('tv');window.PositronWatchFlow.close();document.getElementById('poWatchFlowToggle').focus();});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';},null,{timeout:15000});
 const initial=await state(page),all={};
 const consent=page.locator('#poAIMLConsent'),alert=page.locator('#poAIAlerts');
 await page.evaluate(()=>{const native=window.IPTVState;window.__p354Native=native;window.IPTVState=Object.freeze({...native,getChannels:()=>[],getCurrent:()=>null});});
 try{
  for(const [width,height] of [[1920,1080],[720,900]]){
   const name=names[width+'x'+height];
   await page.setViewportSize({width,height});
   await page.evaluate(()=>{window.PositronWatchFlow.close();document.getElementById('poWatchFlowToggle').focus();});
   await page.keyboard.press('F6');
   await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true'&&!!document.getElementById('poAIAddLegalSource');},null,{timeout:15000});
   await consent.uncheck();
   const disabled=await snap(page);assert.equal(disabled.consent,false);assert.match(disabled.text,/vẫn có thể xem IPTV mà không bật học sở thích/);assert.ok(disabled.cta&&disabled.inside&&!disabled.overflow);
   await consent.check();
   const active=await snap(page);assert.equal(active.consent,true);assert.match(active.text,/Bạn đã bật học sở thích/);assert.match(active.text,/AI chỉ học sau khi xem kênh đủ điều kiện/);assert.ok(active.cta&&active.inside&&!active.overflow);
   const empty=page.locator('#poWatchFlowPanel .po-ai-empty');
   await empty.evaluate(e=>{e.textContent='Chưa có nguồn IPTV. Hãy thêm playlist hợp lệ và EPG để phân loại, sau đó bật học nếu muốn.';});
   let before;
   try{before=await page.screenshot({path:path.join(dir,name.before),animations:'disabled'});}
   finally{await empty.evaluate((e,t)=>{e.textContent=t;},active.text);}
   const after=await page.screenshot({path:path.join(dir,name.after),animations:'disabled'});
   assert.ok(!before.equals(after),'new visible copy must differ');
   for(const png of [before,after]){assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);}
   all[width+'x'+height]={disabled,active,beforeSha256:hash(before),afterSha256:hash(after)};
  }
 }finally{
  await consent.setChecked(initial.consent);
  if(initial.consent)await alert.setChecked(initial.alert);
  await page.evaluate(({key,raw})=>{if(raw===null)localStorage.removeItem(key);else localStorage.setItem(key,raw);window.IPTVState=window.__p354Native;delete window.__p354Native;window.PositronWatchFlow.close();},{key,raw:initial.raw});
  await page.setViewportSize({width:1920,height:1080});
 }
 assert.deepEqual(await state(page),initial,'restore consent, alerts, storage, web cache and native playlist');
 fs.writeFileSync('positron-evidence/audit-p51354-setup-hint.json',JSON.stringify({version:'P5.1.354',app:'4.23.439',realElectron:true,pass:true,scope:'reversible no-source fixture; actual consent changes; before simulates old copy; after actual renderer',all},null,2));
}
module.exports={run};
