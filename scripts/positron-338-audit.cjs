'use strict';
// P338 native Electron CDP audit. Before is P338 with first-card focus from
// P337 (not a claimed older binary); after presses the new reverse shortcut.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve('positron-evidence'),out=path.join(root,'p5-20-rounds');
const digest=png=>crypto.createHash('sha256').update(png).digest('hex');
async function snapshot(page){
 return page.evaluate(()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  const controls=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length);
  const status=document.getElementById('poAIFocusProgress'),focused=document.activeElement;
  const active=focused?.getBoundingClientRect(),bounds=panel.getBoundingClientRect();
  const nav=document.getElementById('poAICards'),help=document.getElementById('poAIKeyboardHelp');
  return {count:controls.length,index:controls.indexOf(focused),status:status?.textContent||'',
   indexBadgeVisible:!!status&&!status.hidden&&status.getClientRects().length>0,
   noHorizontalOverflow:panel.scrollWidth<=panel.clientWidth+3&&
    document.documentElement.scrollWidth<=innerWidth+3,
   actionVisible:!!active&&active.top>=bounds.top-3&&active.bottom<=bounds.bottom+3,
   aiOpen:panel.dataset.poAiActive==='true'&&!panel.hidden,
   keyboardDeclared:nav?.getAttribute('aria-keyshortcuts')?.includes('Alt+Shift+P')&&
    help?.title?.includes('P lùi lại'),
   current:window.IPTVState.getCurrent()?.id||'',
   videoUrl:document.querySelector('#video')?.currentSrc||'',
   htmlVersion:document.title
  };
 });
}
async function ready(page){
 const get=()=>page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  const items=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length);
  return {count:items.length,mode:p?.dataset.poAiActive,hidden:p?.hidden};
 });
 const reset=()=>page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  if(p.hidden)window.PositronWatchFlow.open();
  if(p.dataset.poAiActive!=='true')document.getElementById('poFlowPlusAI')?.click();
  document.getElementById('poAIChannels')?.click();
  window.PositronIntelligence?.render?.();
 });
 await reset();
 let s=await get();
 if(s.count<3||s.hidden||s.mode!=='true'){
  await page.waitForTimeout(240);await reset();
 }
 await page.waitForFunction(()=>{
  const panel=document.getElementById('poWatchFlowPanel');
  return panel?.dataset.poAiActive==='true'&&!panel.hidden&&
   [...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
    .filter(b=>!b.disabled&&b.getClientRects().length).length>=3;
 },null,{timeout:20000}).catch(async e=>{
  throw Error('P338 native recommendation cards missing: '+JSON.stringify(await get())+'; '+e.message);
 });
}
async function beforeAfter(page,size){
 await page.setViewportSize(size);
 await page.keyboard.press('Alt+Shift+J');
 const first=await snapshot(page),n=first.count;
 assert.ok(n>=3,'need three actual rendered, focusable native controls');
 assert.equal(first.index,0,'J selects first recommendation');
 assert.equal(first.status,'Gợi ý 1/'+n,'existing P337 badge correct before reverse');
 assert.equal(first.keyboardDeclared,true,'shortcut and keyboard help must be discoverable');
 const prefix='positron-p51338-previous-ai-';
 const pngBefore=await page.screenshot({
  path:path.join(out,prefix+'before-'+size.width+'x'+size.height+'-real.png'),
  animations:'disabled'
 });
 await page.keyboard.press('Alt+Shift+P');
 const previous=await snapshot(page);
 const pngAfter=await page.screenshot({
  path:path.join(out,prefix+'after-'+size.width+'x'+size.height+'-real.png'),
  animations:'disabled'
 });
 assert.equal(previous.count,n,'shortcut may not modify the recommendation list');
 assert.equal(previous.index,n-1,'from first, P wraps to last playable recommendation');
 assert.equal(previous.status,'Gợi ý '+n+'/'+n,'reverse focus updates exact progress');
 assert.ok(previous.indexBadgeVisible,'progress remains visible in sticky title');
 assert.ok(previous.noHorizontalOverflow&&previous.actionVisible,'last action is visible without overflow');
 assert.ok(previous.aiOpen,'AI panel stays active');
 assert.equal(previous.current,first.current,'shortcut must not play/change the current channel');
 assert.equal(previous.videoUrl,first.videoUrl,'shortcut must not start a stream');
 await page.keyboard.press('Alt+Shift+P');
 const twice=await snapshot(page);
 assert.equal(twice.index,n-2,'previous navigates backward, not forward');
 assert.equal(twice.status,'Gợi ý '+(n-1)+'/'+n,'previous updates position twice');
 await page.keyboard.press('Alt+Shift+K');
 const forwardAgain=await snapshot(page);
 assert.equal(forwardAgain.index,n-1,'previous is compatible with existing next shortcut');
 assert.equal(forwardAgain.current,first.current,'round-trip navigation remains focus-only');
 for(const [png,w,h] of [[pngBefore,size.width,size.height],[pngAfter,size.width,size.height]]){
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','actual PNG');
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 assert.ok(!pngBefore.equals(pngAfter),'native before/after must show different focused cards');
 return {first,previous,twice,forwardAgain,beforeSha256:digest(pngBefore),afterSha256:digest(pngAfter)};
}
async function run(page){
 fs.mkdirSync(out,{recursive:true});
 const original=await page.evaluate(()=>({
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  const state=window.IPTVState;
  window.__p338State=state;state.setPage('tv');
  if(state.getChannels().length<3){
   const list=['Giải trí','Thể thao','Thời sự'].map((name,i)=>({
    id:'p338-qa-'+i,name:'QA P338 '+name,url:'https://example.invalid/p338-'+i+'.m3u8',
    group:'QA kiểm thử',status:'alive'
   }));
   window.IPTVState=Object.freeze({...state,getChannels:()=>list});
  }
 });
 await ready(page);
 const desktop=await beforeAfter(page,{width:1920,height:1080});
 const narrow=await beforeAfter(page,{width:720,height:900});
 // Ordinary editor input must keep focus even with the new shortcut.
 await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>document.getElementById('searchBox')?.focus());
 await page.keyboard.press('Alt+Shift+P');
 const editing=await page.evaluate(()=>({
  input:document.activeElement?.id,
  focusOnRecommendation:!!document.activeElement?.closest?.('#poAICards .po-ai-card')
 }));
 assert.equal(editing.input,'searchBox','do not steal focus while editing');
 assert.equal(editing.focusOnRecommendation,false,'editor guard prevents navigation');
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p338State;delete window.__p338State;
 });
 const restored=await page.evaluate(()=>({
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 assert.deepEqual(restored,original,'preserve playlist,current playback,private model');
 const report={version:'P5.1.338',app:'4.23.423',environment:'actual Electron via CDP',
  desktop,narrow,editorProtected:true,dataUnchanged:true,autoplay:false,checks:16,pass:true,
  sourceNote:'Synthetic legal QA channels only when fewer than three; no stream playback, GPU, Cast/DVR validation',
  beforeNote:'BEFORE is first-card focus in P338 running Electron; AFTER is last-card focus after the new Alt+Shift+P shortcut'};
 fs.writeFileSync(path.join(root,'audit-p51338-previous-ai.json'),JSON.stringify(report,null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P338 native Electron reverse recommendation shortcut PASS',JSON.stringify({pass:true,checks:16}));
}
module.exports={run};
