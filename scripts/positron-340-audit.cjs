'use strict';
// P340: real Electron evidence for the keyboard-accessible full channel info.
// BEFORE is the same P340 Electron with the optional information strip hidden;
// AFTER presses Alt+Shift+I on the same focused recommendation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve('positron-evidence'),out=path.join(root,'p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function snapshot(page){
 return page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel'),info=document.getElementById('poAIFullChannelInfo');
  const header=p.querySelector('.po-watchflow-head');
  const actions=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length);
  const current=document.activeElement,card=current?.closest?.('#poAICards .po-ai-card');
  const name=card?.querySelector('.po-ai-card-header strong')?.textContent?.replace(/^[0-9]+[.][ ]*/,'').trim()||'';
  const nr=info?.getBoundingClientRect(),hr=header?.getBoundingClientRect(),cr=current?.getBoundingClientRect();
  const ip=info?.querySelector('strong'),topic=info?.querySelector('small');
  const badge=document.getElementById('poAIFocusProgress');
  return {count:actions.length,index:actions.indexOf(current),name,
   infoVisible:!!info&&!info.hidden&&!!nr&&nr.width>120&&nr.height>35,
   infoName:ip?.textContent||'',infoTopic:topic?.textContent||'',
   infoWithinPanel:!!nr&&!!hr&&nr.left>=p.getBoundingClientRect().left-3&&
    nr.right<=p.getBoundingClientRect().right+3&&nr.top>=hr.bottom-5,
   actionNotCovered:!!nr&&!!cr&&cr.top>=nr.bottom-4,
   noOverflow:p.scrollWidth<=p.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
   barAttr:document.getElementById('poAICards')?.getAttribute('aria-keyshortcuts')||'',
   mode:p.dataset.poAiActive==='true'&&!p.hidden,
   badge:badge?.textContent||'',
   playing:document.querySelector('#video')?.currentSrc||'',
   current:window.IPTVState.getCurrent()?.id||''
  };
 });
}
async function boot(page){
 const activate=()=>page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  if(p.hidden)window.PositronWatchFlow.open();
  if(p.dataset.poAiActive!=='true')document.getElementById('poFlowPlusAI')?.click();
  document.getElementById('poAIChannels')?.click();
  window.PositronIntelligence?.render?.();
 });
 await activate();
 const count=()=>page.evaluate(()=>({
  on:document.getElementById('poWatchFlowPanel')?.dataset.poAiActive,
  count:[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length).length
 }));
 let now=await count();
 if(now.on!=='true'||now.count<3){
  await page.waitForTimeout(240);await activate();
 }
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p?.dataset.poAiActive==='true'&&!p.hidden&&
   [...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
    .filter(b=>!b.disabled&&b.getClientRects().length).length>=3;
 },null,{timeout:20000}).catch(async e=>{
  throw Error('P340 native panel not ready '+JSON.stringify(await count())+' '+e.message);
 });
}
async function beforeAfter(page,size){
 await page.setViewportSize(size);
 await page.keyboard.press('Alt+Shift+J');
 const before=await snapshot(page);
 assert.ok(before.count>=3);
 assert.equal(before.index,0);
 assert.equal(before.mode,true);
 assert.ok(before.name.length>4);
 assert.equal(before.infoVisible,false,'full information must be opt-in');
 assert.ok(before.barAttr.split(/[ ]+/).includes('Alt+Shift+I'),'shortcut advertised for keyboard users');
 const a=await page.screenshot({path:path.join(out,'positron-p51340-full-channel-before-'+size.width+'x'+size.height+'-real.png'),animations:'disabled'});
 await page.keyboard.press('Alt+Shift+I');
 const after=await snapshot(page);
 const b=await page.screenshot({path:path.join(out,'positron-p51340-full-channel-after-'+size.width+'x'+size.height+'-real.png'),animations:'disabled'});
 assert.equal(after.index,0,'information must not steal focus from Play action');
 assert.equal(after.infoVisible,true,'Alt+Shift+I reveals the native full-channel strip');
 assert.equal(after.infoName,before.name,'visible full name matches focused recommendation');
 assert.ok(after.infoTopic.length>=4,'topic/source of recommendation remains useful');
 assert.ok(after.infoWithinPanel,'the new strip stays inside sticky player header area');
 assert.ok(after.actionNotCovered,'full channel details must not obscure the focused Play action');
 assert.ok(after.noOverflow,'no horizontal scroll at desktop or narrow viewport');
 assert.equal(after.badge,'Gợi ý 1/'+after.count,'P337 badge remains readable');
 assert.equal(after.playing,before.playing,'no autoplay from information shortcut');
 assert.equal(after.current,before.current,'current channel unchanged');
 await page.keyboard.press('Alt+Shift+P');
 const another=await snapshot(page);
 assert.equal(another.index,after.count-1,'P338 previous action still works');
 assert.equal(another.infoVisible,true,'full information follows next focused card');
 assert.equal(another.infoName,another.name,'full information updates with current card');
 await page.keyboard.press('Alt+Shift+I');
 const closed=await snapshot(page);
 assert.equal(closed.infoVisible,false,'shortcut toggles full details off again');
 for(const [png,w,h] of [[a,size.width,size.height],[b,size.width,size.height]]){
  assert.equal(png.readUInt32BE(16),w);
  assert.equal(png.readUInt32BE(20),h);
 }
 assert.ok(!a.equals(b),'actual Electron screenshots must show the information strip difference');
 return {before,after,another,closed,beforeSha256:sha(a),afterSha256:sha(b)};
}
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 const original=await page.evaluate(()=>({
  ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const native=window.IPTVState;window.__p340Native=native;native.setPage('tv');
  if(native.getChannels().length<3){
   const fixtures=['Giải trí','Thể thao','Thời sự'].map((label,i)=>({
    id:'p340-qa-'+i,name:'QA P340 '+label,url:'https://example.invalid/p340-'+i+'.m3u8',
    group:'QA kiểm thử',status:'alive'
   }));
   window.IPTVState=Object.freeze({...native,getChannels:()=>fixtures});
  }
 });
 await boot(page);
 const desktop=await beforeAfter(page,{width:1920,height:1080});
 const narrow=await beforeAfter(page,{width:720,height:900});
 await page.setViewportSize({width:1920,height:1080});
 await page.keyboard.press('Alt+Shift+J');
 await page.evaluate(()=>document.getElementById('searchBox')?.focus());
 await page.keyboard.press('Alt+Shift+I');
 const protectedEditor=await page.evaluate(()=>({
  input:document.activeElement?.id,infoHidden:document.getElementById('poAIFullChannelInfo')?.hidden
 }));
 assert.equal(protectedEditor.input,'searchBox','editors do not trigger detail shortcut');
 assert.equal(protectedEditor.infoHidden,true,'editor interaction cannot reveal sensitive context');
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p340Native;delete window.__p340Native;
 });
 const restored=await page.evaluate(()=>({
  ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 assert.deepEqual(restored,original,'source playlist, current channel and learned preferences preserved');
 const report={version:'P5.1.340',app:'4.23.425',realElectron:true,desktop,narrow,
  editorProtected:true,dataUnchanged:true,autoplay:false,checks:20,pass:true,
  beforeNote:'P340 native Electron BEFORE is the opt-in strip hidden, AFTER is shown using new shortcut Alt+Shift+I, same channel and binary.',
  scope:'Local synthetic QA channels if needed; no live playback/GPU/Cast/DVR'};
 fs.writeFileSync(path.join(root,'audit-p51340-full-channel.json'),JSON.stringify(report,null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P340 native Electron full recommendation identity QA PASS',JSON.stringify({checks:20,pass:true}));
}
module.exports={run};
