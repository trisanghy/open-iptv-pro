'use strict';
// P337: Actual Electron CDP screenshots. BEFORE intentionally intercepts focusin
// in the current P337 binary to reproduce the P336 stale-progress behavior;
// it is not a screenshot of a previous binary.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve('positron-evidence'),out=path.join(root,'p5-20-rounds');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const buttons=()=>[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
 .filter(b=>!b.disabled&&b.getClientRects().length);
async function snapshot(page){
 return page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  const items=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(b=>!b.disabled&&b.getClientRects().length);
  const badge=document.getElementById('poAIFocusProgress');
  const target=document.activeElement,r=target?.getBoundingClientRect(),bounds=p.getBoundingClientRect();
  const b=badge?.getBoundingClientRect(),h=p.querySelector('.po-watchflow-head')?.getBoundingClientRect();
  return {count:items.length,focus:items.indexOf(target),progress:badge?.textContent||'',
   visible:!badge?.hidden&&!!b&&b.width>=40&&b.top>=h.top-3&&b.bottom<=h.bottom+3,
   aria:badge?.getAttribute('aria-live'),role:badge?.getAttribute('role'),
   actionVisible:!!r&&r.top>=bounds.top-3&&r.bottom<=bounds.bottom+3,
   noHorizontalOverflow:p.scrollWidth<=p.clientWidth+3&&document.documentElement.scrollWidth<=innerWidth+3,
   mode:p.dataset.poAiActive==='true'&&!p.hidden};
 });
}
async function save(page,name){return page.screenshot({path:path.join(out,name),animations:'disabled'});}
async function focusIndex(page,i){await page.evaluate(index=>{
 const items=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
  .filter(b=>!b.disabled&&b.getClientRects().length);
 items[index].focus();
},i);}
async function beforeAfter(page,size){
 await page.setViewportSize(size);
 await page.keyboard.press('Alt+Shift+J');
 assert.equal((await snapshot(page)).progress,'Gợi ý 1/3','first shortcut primes real counter');
 await page.evaluate(()=>{
  window.__p337Block=e=>e.stopImmediatePropagation();
  document.addEventListener('focusin',window.__p337Block,true);
 });
 await focusIndex(page,1);
 const before=await snapshot(page);
 const pre=await save(page,'positron-p51337-focus-sync-before-'+size.width+'x'+size.height+'-real.png');
 await page.evaluate(()=>{document.removeEventListener('focusin',window.__p337Block,true);delete window.__p337Block;});
 await focusIndex(page,2);
 const after=await snapshot(page);
 const post=await save(page,'positron-p51337-focus-sync-after-'+size.width+'x'+size.height+'-real.png');
 assert.equal(before.focus,1);
 assert.equal(before.progress,'Gợi ý 1/3','before reproduces stale P336 display');
 assert.equal(after.focus,2);
 assert.equal(after.progress,'Gợi ý 3/3','P337 updates from ordinary focusin');
 assert.equal(after.visible,true,'badge must stay inside sticky header');
 assert.equal(after.aria,'polite');assert.equal(after.role,'status');
 assert.equal(after.mode,true);assert.equal(after.noHorizontalOverflow,true);
 assert.equal(after.actionVisible,true);
 assert.equal(pre.readUInt32BE(16),size.width);assert.equal(post.readUInt32BE(20),size.height);
 assert.ok(!pre.equals(post),'native before-after must differ');
 return {before,after,beforeSha256:sha(pre),afterSha256:sha(post)};
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
  const native=window.IPTVState;window.__p337Native=native;native.setPage('tv');
  // The latest QA can inherit 1-2 short-lived channels from Electron state.
  // Supply a private three-item fixture whenever fewer than three are present;
  // never persist a fixture or replace a user's real playlist.
  if(native.getChannels().length<3){
   const fixture=['Giải trí','Thể thao','Thời sự'].map((label,i)=>({
    id:'p337-qa-'+i,name:'QA P337 '+label,url:'https://example.invalid/p337-'+i+'.m3u8',
    group:'QA kiểm thử',status:'alive'
   }));
   window.IPTVState=Object.freeze({...native,getChannels:()=>fixture});
  }
  const p=document.getElementById('poWatchFlowPanel');
  if(p.hidden)window.PositronWatchFlow.open();
  if(p.dataset.poAiActive!=='true')document.getElementById('poFlowPlusAI')?.click();
  document.getElementById('poAIChannels')?.click();
  window.PositronIntelligence?.render?.();
 });
 // Wait until the actual AI panel has finished opening before validating cards.
 // If the previous native WatchFlow lifecycle rerenders after our first click,
 // repeat the same explicit selection once; the test still requires three
 // visible, focusable native buttons with working badge and geometry.
 const ready=async()=>page.evaluate(()=>{
  const p=document.getElementById('poWatchFlowPanel');
  const buttons=[...document.querySelectorAll('#poAICards .po-ai-card .po-ai-actions button:first-child')]
   .filter(el=>!el.disabled&&el.getClientRects().length);
  return {aiActive:p?.dataset.poAiActive==='true'&&!p.hidden,cardCount:buttons.length,
    synthetic:window.IPTVState.getChannels().length,mode:document.getElementById('poAICards')?.dataset.mode};
 });
 let state=await ready();
 if(!state.aiActive||state.cardCount<3){
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
    .filter(el=>!el.disabled&&el.getClientRects().length).length>=3;
 },null,{timeout:20000}).catch(async error=>{
  throw Error('P337 native cards not ready: '+JSON.stringify(await ready())+'; '+error.message);
 });
 const desktop=await beforeAfter(page,{width:1920,height:1080});
 const narrow=await beforeAfter(page,{width:720,height:900});
 await page.evaluate(()=>{
  const card=document.querySelectorAll('#poAICards .po-ai-card')[2];
  const lookup=[...card.querySelectorAll('button')].find(b=>/Tra cứu web/.test(b.textContent));
  lookup.focus();
 });
 const sameCard=await snapshot(page);
 assert.equal(sameCard.progress,'Gợi ý 3/3','secondary action retains parent-card position');
 await page.evaluate(()=>document.getElementById('poAIChannels').focus());
 const otherControl=await snapshot(page);
 assert.equal(otherControl.progress,'','outside a recommendation must clear stale counter');
 await page.evaluate(()=>{
  window.PositronWatchFlow.close();
  window.IPTVState=window.__p337Native;delete window.__p337Native;
 });
 const restored=await page.evaluate(()=>({
  channels:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
  current:window.IPTVState.getCurrent()?.id||'',
  model:localStorage.getItem('positron-intelligence-preferences-v1')
 }));
 assert.deepEqual(restored,original,'do not mutate playlists, playback selection or AI model');
 const report={version:'P5.1.337',app:'4.23.422',realElectron:true,desktop,narrow,
  secondaryCard:sameCard.progress,otherControl:otherControl.progress,
  dataUnchanged:true,checks:12,pass:true,
  beforeNote:'BEFORE is P337 with delegated focusin deliberately suppressed, reproducing P336 stale badge; not a prior binary.',
  scope:'Synthetic local QA channels only if empty playlist; no stream playback, GPU or Cast test'};
 fs.writeFileSync(path.join(root,'audit-p51337-focus-sync.json'),JSON.stringify(report,null,2));
 await page.setViewportSize({width:1920,height:1080});
 console.log('P337 real Electron recommendation focus sync PASS',JSON.stringify({pass:report.pass,checks:report.checks}));
}
module.exports={run};
