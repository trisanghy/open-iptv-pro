'use strict';
// P341: real Electron CDP screenshots for remote ArrowUp/ArrowDown focus travel.
// BEFORE/AFTER refer to two focus states on the SAME P341 Electron binary.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve('positron-evidence'),out=path.join(root,'p5-20-rounds');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function snap(page){
 return page.evaluate(()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  const actions=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length);
  const current=document.activeElement,rect=current?.getBoundingClientRect(),box=panel.getBoundingClientRect();
  const bar=document.getElementById('poAIFullChannelInfo'),card=current?.closest?.('#poAICards .po-ai-card');
  const name=card?.querySelector('.po-ai-card-header strong')?.textContent?.replace(/^[0-9]+[.][ ]*/,'').trim()||'';
  return {count:actions.length,index:actions.indexOf(current),name,
   badge:document.getElementById('poAIFocusProgress')?.textContent||'',
   fullInfoVisible:!!bar&&!bar.hidden,fullName:bar?.querySelector('strong')?.textContent||'',
   shortcuts:document.getElementById('poAICards')?.getAttribute('aria-keyshortcuts')||'',
   focusedRectVisible:!!rect&&rect.top>=box.top-3&&rect.bottom<=box.bottom+3,
   noOverflow:panel.scrollWidth<=panel.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
   currentChannel:window.IPTVState.getCurrent()?.id||'',
   stream:document.querySelector('#video')?.currentSrc||'',
   active:panel.dataset.poAiActive==='true'&&!panel.hidden};
 });
}
async function boot(page){
 const set=()=>page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  if(p.hidden)window.PositronWatchFlow.open();
  if(p.dataset.poAiActive!=='true')document.getElementById('poFlowPlusAI')?.click();
  document.getElementById('poAIChannels')?.click();
  window.PositronIntelligence?.render?.();
 });
 await set();
 let ok=await page.evaluate(()=>document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child').length>=3);
 if(!ok){await page.waitForTimeout(240);await set();}
 await page.waitForFunction(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  return p?.dataset.poAiActive==='true'&&!p.hidden&&
   [...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
    .filter(b=>!b.disabled&&b.getClientRects().length).length>=3;
 },null,{timeout:20000});
}
async function beforeAfter(page,size){
 await page.setViewportSize(size);
 await page.keyboard.press('Alt+Shift+J');
 await page.keyboard.press('Alt+Shift+I');
 const before=await snap(page),n=before.count;
 assert.ok(n>=3);assert.equal(before.index,0);assert.equal(before.active,true);
 assert.equal(before.fullInfoVisible,true);assert.equal(before.fullName,before.name);
 assert.ok(before.shortcuts.includes('ArrowUp ArrowDown'));
 const prefix='positron-p51341-remote-ai-';
 const a=await page.screenshot({path:path.join(out,prefix+'before-'+size.width+'x'+size.height+'-real.png'),animations:'disabled'});
 await page.keyboard.press('ArrowDown');
 const second=await snap(page);
 const b=await page.screenshot({path:path.join(out,prefix+'after-'+size.width+'x'+size.height+'-real.png'),animations:'disabled'});
 assert.equal(second.index,1,'remote Down moves to next Xem button without autoplay');
 assert.equal(second.badge,'Gợi ý 2/'+n);
 assert.equal(second.fullName,second.name,'P340 full details follow ArrowDown focus');
 assert.ok(second.focusedRectVisible&&second.noOverflow);
 assert.equal(second.stream,before.stream);
 assert.equal(second.currentChannel,before.currentChannel);
 await page.keyboard.press('ArrowUp');
 const back=await snap(page);
 assert.equal(back.index,0,'remote Up selects previous');
 await page.keyboard.press('ArrowUp');
 const wrapped=await snap(page);
 assert.equal(wrapped.index,n-1,'remote Up wraps first to last recommendation');
 assert.equal(wrapped.badge,'Gợi ý '+n+'/'+n);
 await page.keyboard.press('ArrowDown');
 const around=await snap(page);
 assert.equal(around.index,0,'remote Down wraps back to first');
 const textEditor=await page.evaluate(()=>{
  document.getElementById('searchBox')?.focus();
  return document.activeElement?.id;
 });
 assert.equal(textEditor,'searchBox');
 await page.keyboard.press('ArrowDown');
 const editorAfter=await page.evaluate(()=>document.activeElement?.id);
 assert.equal(editorAfter,'searchBox','remote arrows must not hijack typing fields');
 for(const [png,width,height] of [[a,size.width,size.height],[b,size.width,size.height]]){
  assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);
 }
 assert.ok(!a.equals(b),'two real Electron screenshots differ');
 return {before,second,back,wrapped,around,editorAfter,beforeSha256:hash(a),afterSha256:hash(b)};
}
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 const original=await page.evaluate(()=>({channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',model:localStorage.getItem('positron-intelligence-preferences-v1')}));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const native=window.IPTVState;window.__p341Native=native;native.setPage('tv');
  if(native.getChannels().length<3){
   const channels=['Giải trí','Thể thao','Thời sự'].map((label,i)=>({
    id:'p341-qa-'+i,name:'QA P341 '+label,url:'https://example.invalid/p341-'+i+'.m3u8',
    group:'QA kiểm thử',status:'alive'
   }));
   window.IPTVState=Object.freeze({...native,getChannels:()=>channels});
  }
 });
 await boot(page);
 const desktop=await beforeAfter(page,{width:1920,height:1080});
 // Focus is outside cards after editor guard; J is required to prime narrow state.
 const narrow=await beforeAfter(page,{width:720,height:900});
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p341Native;delete window.__p341Native;
 });
 const restored=await page.evaluate(()=>({channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',model:localStorage.getItem('positron-intelligence-preferences-v1')}));
 assert.deepEqual(restored,original,'playlist/current/model state cannot change');
 const report={version:'P5.1.341',app:'4.23.426',realElectron:true,desktop,narrow,checks:18,
  dataUnchanged:true,autoplay:false,pass:true,
  beforeNote:'BEFORE and AFTER are P341 native Electron with focus on first vs second recommendation; no prior binary is misrepresented.',
  scope:'Three synthetic QA channel fixtures only if needed; no IPTV stream, GPU or Cast testing'};
 fs.writeFileSync(path.join(root,'audit-p51341-remote-ai.json'),JSON.stringify(report,null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P341 real Electron remote AI navigation PASS',JSON.stringify({checks:18,pass:true}));
}
module.exports={run};
