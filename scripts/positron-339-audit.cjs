'use strict';
// P339: genuine Electron screenshots of the sticky current-channel context.
// BEFORE temporarily hides only the new label in this P339 binary to recreate
// P338 visibility; AFTER shows the live name for the exact same focused card.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve('positron-evidence'),out=path.join(root,'p5-20-rounds');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function state(page){
 return page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  const items=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length);
  const label=document.getElementById('poAIFocusedChannel');
  const title=document.getElementById('poWatchFlowTitle');
  const badge=document.getElementById('poAIFocusProgress');
  const card=document.activeElement?.closest?.('#poAICards .po-ai-card');
  const completeName=card?.querySelector('.po-ai-card-header strong')?.textContent?.replace(/^\d+\.\s*/,'').trim()||'';
  const labelRect=label?.getBoundingClientRect();
  const header=p.querySelector('.po-watchflow-head')?.getBoundingClientRect();
  const backEl=document.getElementById('poAIBackTop');
  const back=backEl&&!backEl.hidden&&backEl.getClientRects().length?
   backEl.getBoundingClientRect():null;
  const bounds=p.getBoundingClientRect();
  return {count:items.length,index:items.indexOf(document.activeElement),name:completeName,
   labelText:label?.textContent||'',labelTooltip:label?.title||'',labelAria:label?.getAttribute('aria-hidden'),
   labelVisible:!!label&&!label.hidden&&labelRect.width>20&&labelRect.height>6,
   badge:badge?.textContent||'',badgeVisible:!!badge&&!badge.hidden,
   staysInHeader:!!labelRect&&!!header&&labelRect.left>=header.left-4&&
    labelRect.top>=header.top-4&&labelRect.bottom<=header.bottom+4&&
    labelRect.right<=header.right+4&&(!back||labelRect.right<=back.left-2),
   noOverflow:p.scrollWidth<=p.clientWidth+3&&
    document.documentElement.scrollWidth<=innerWidth+3,
   aiOpen:p.dataset.poAiActive==='true'&&!p.hidden,
   panelInside:bounds.left>=-3&&bounds.right<=innerWidth+3,
   playing:document.querySelector('#video')?.currentSrc||'',
   current:window.IPTVState.getCurrent()?.id||''
  };
 });
}
async function boot(page){
 await page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  if(p.hidden)window.PositronWatchFlow.open();
  if(p.dataset.poAiActive!=='true')document.getElementById('poFlowPlusAI')?.click();
  document.getElementById('poAIChannels')?.click();
  window.PositronIntelligence?.render?.();
 });
 const get=()=>page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return {active:p?.dataset.poAiActive,hidden:p?.hidden,items:
   [...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
    .filter(b=>!b.disabled&&b.getClientRects().length).length};
 });
 let s=await get();
 if(s.hidden||s.active!=='true'||s.items<3){
  await page.waitForTimeout(220);
  await page.evaluate(()=>{
   const p=document.getElementById('poWatchFlowPanel');
   if(p.hidden)window.PositronWatchFlow.open();
   if(p.dataset.poAiActive!=='true')document.getElementById('poFlowPlusAI')?.click();
   document.getElementById('poAIChannels')?.click();
   window.PositronIntelligence?.render?.();
  });
 }
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p?.dataset.poAiActive==='true'&&!p.hidden&&
   [...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
    .filter(b=>!b.disabled&&b.getClientRects().length).length>=3;
 },null,{timeout:20000}).catch(async e=>{
  throw Error('P339 cannot show native AI cards '+JSON.stringify(await get())+' '+e.message);
 });
}
async function beforeAfter(page,size){
 await page.setViewportSize(size);
 await page.keyboard.press('Alt+Shift+J');
 const initial=await state(page);
 const n=initial.count;
 assert.ok(n>=3,'at least three real DOM recommendations required');
 assert.equal(initial.index,0);
 assert.equal(initial.badge,'Gợi ý 1/'+n);
 assert.equal(initial.labelText,initial.name,'live sticky context equals actual focused channel');
 assert.ok(initial.name.length>3);
 await page.evaluate(()=>document.getElementById('poAIFocusedChannel').hidden=true);
 const before=await state(page);
 const name='positron-p51339-channel-context-';
 const a=await page.screenshot({path:path.join(out,name+'before-'+size.width+'x'+size.height+'-real.png'),animations:'disabled'});
 assert.equal(before.labelVisible,false,'P338 legacy context simulated with label hidden');
 await page.keyboard.press('Alt+Shift+P');
 const previous=await state(page);
 assert.equal(previous.index,n-1,'P338 reverse shortcut still works');
 assert.equal(previous.labelText,previous.name,'context updates on reverse traversal');
 await page.keyboard.press('Alt+Shift+J');
 const after=await state(page);
 const b=await page.screenshot({path:path.join(out,name+'after-'+size.width+'x'+size.height+'-real.png'),animations:'disabled'});
 assert.equal(after.index,0);
 assert.equal(after.name,initial.name,'same channel selected before and after');
 assert.equal(after.labelText,initial.name,'selected channel must be in sticky header');
 assert.equal(after.labelTooltip,'Kênh đang chọn: '+initial.name,'full name available on hover');
 assert.equal(after.labelAria,'true','decorative chip must not double-announce');
 assert.equal(after.badge,'Gợi ý 1/'+n,'position badge remains unchanged');
 assert.ok(after.labelVisible&&after.staysInHeader,'visible channel title must not collide with sticky controls');
 assert.ok(after.noOverflow&&after.panelInside,'no desktop or narrow overflow');
 assert.equal(after.playing,initial.playing,'context must not auto-play');
 assert.equal(after.current,initial.current,'context must not change selected channel');
 assert.equal(a.readUInt32BE(16),size.width);assert.equal(b.readUInt32BE(20),size.height);
 assert.ok(!a.equals(b),'real Electron before/after should differ by visible context');
 return {before,after,previous,beforeSha256:hash(a),afterSha256:hash(b)};
}
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 const originals=await page.evaluate(()=>({
  ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const native=window.IPTVState;window.__p339State=native;native.setPage('tv');
  if(native.getChannels().length<3){
   const fixture=['Giải trí','Thể thao','Thời sự'].map((s,i)=>({
    id:'p339-qa-'+i,name:'QA P339 '+s,group:'QA kiểm thử',
    url:'https://example.invalid/p339-'+i+'.m3u8',status:'alive'}));
   window.IPTVState=Object.freeze({...native,getChannels:()=>fixture});
  }
 });
 await boot(page);
 const desktop=await beforeAfter(page,{width:1920,height:1080});
 const narrow=await beforeAfter(page,{width:720,height:900});
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>document.getElementById('searchBox')?.focus());
 const clear=await state(page);
 assert.equal(clear.labelVisible,false,'context clears when keyboard focus leaves recommendations');
 assert.equal(clear.badge,'','position badge clears outside');
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p339State;delete window.__p339State;
 });
 const restored=await page.evaluate(()=>({
  ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 assert.deepEqual(restored,originals,'playlist/current/model must remain unchanged');
 const report={version:'P5.1.339',app:'4.23.424',realElectron:true,desktop,narrow,
  editorClearsContext:true,dataUnchanged:true,noAutoplay:true,checks:18,pass:true,
  beforeNote:'P339 Electron BEFORE temporarily hides only new channel chip to reproduce P338 header; AFTER displays name on same focused card.',
  scope:'Local QA channels used only if fewer than three; no live playback, GPU, DVR, Cast'};
 fs.writeFileSync(path.join(root,'audit-p51339-channel-context.json'),JSON.stringify(report,null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P339 native Electron sticky selected-channel context PASS',JSON.stringify({pass:true,checks:18}));
}
module.exports={run};
