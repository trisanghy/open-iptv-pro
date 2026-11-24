'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='positron-evidence/p5-20-rounds',names={
 '1920x1080':{before:'positron-p51355-context-keys-before-1920x1080-real.png',after:'positron-p51355-context-keys-after-1920x1080-real.png'},
 '720x900':{before:'positron-p51355-context-keys-before-720x900-real.png',after:'positron-p51355-context-keys-after-720x900-real.png'}
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const snap=page=>page.evaluate(()=>{const h=document.getElementById('poAIKeyboardHelp'),p=document.getElementById('poWatchFlowPanel'),g=document.querySelector('#poAIShortcutGuide>summary'),r=h.getBoundingClientRect(),f=p.getBoundingClientRect();return {text:h.textContent,title:h.title,inside:r.left>=f.left&&r.right<=f.right,guideHeight:g.getBoundingClientRect().height,overflow:p.scrollWidth>p.clientWidth+3||document.documentElement.scrollWidth>innerWidth+3};});
async function run(page){
 fs.mkdirSync(dir,{recursive:true});
 await page.waitForSelector('#poAIKeyboardHelp',{state:'attached',timeout:30000});
 await page.evaluate(()=>{const native=window.IPTVState;native.setPage('tv');window.PositronWatchFlow.close();window.__p355Native=native;window.IPTVState=Object.freeze({...native,getChannels:()=>[],getCurrent:()=>null});});
 const result={};
 try{
  for(const [width,height] of [[1920,1080],[720,900]]){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>{window.PositronWatchFlow.close();document.getElementById('poWatchFlowToggle').focus();});
   await page.keyboard.press('F6');
   await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true'&&!!document.getElementById('poAIAddLegalSource');},null,{timeout:15000});
   const h=page.locator('#poAIKeyboardHelp'),s=await snap(page),n=names[width+'x'+height];
   assert.equal(s.text,'← → ↑ ↓: chế độ · Enter/Space: chọn');assert.doesNotMatch(s.title,/Alt\+Shift/);assert.match(s.title,/Thêm nguồn IPTV/);assert.ok(s.inside&&s.guideHeight>=43&&!s.overflow);
   await h.evaluate(e=>{e.textContent='← →: chế độ · Enter/Space: chọn · Alt+Shift+J: tới nút Xem đầu';});
   let before;
   try{before=await page.screenshot({path:path.join(dir,n.before),animations:'disabled'});}
   finally{await h.evaluate((e,t)=>{e.textContent=t;},s.text);}
   const after=await page.screenshot({path:path.join(dir,n.after),animations:'disabled'});
   assert.ok(!before.equals(after));for(const png of [before,after]){assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);}
   result[width+'x'+height]={...s,beforeSha256:hash(before),afterSha256:hash(after)};
  }
 }finally{
  await page.evaluate(()=>{window.PositronWatchFlow.close();window.IPTVState=window.__p355Native;delete window.__p355Native;});
  await page.setViewportSize({width:1920,height:1080});
 }
 fs.writeFileSync('positron-evidence/audit-p51355-context-keys.json',JSON.stringify({version:'P5.1.355',app:'4.23.440',realElectron:true,pass:true,scope:'no-source fixture only; before recreates previous copy on Electron; after actual new renderer; no playback',result},null,2));
}
module.exports={run};
