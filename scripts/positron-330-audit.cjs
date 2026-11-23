'use strict';
// P330: independent native Electron CDP regression of the AI shortcut guard.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.resolve('positron-evidence','p5-20-rounds');
const state=page=>page.evaluate(()=>({
 panel:!document.getElementById('poWatchFlowPanel').hidden,
 ai:document.getElementById('poWatchFlowPanel').dataset.poAiActive==='true',
 focus:document.activeElement?.id||'',
 modal:!document.getElementById('modal').classList.contains('hidden'),
 cast:!document.getElementById('castModal').classList.contains('hidden'),
 overflow:document.documentElement.scrollWidth>innerWidth+3
}));
const saved=page=>page.evaluate(()=>({
 ids:JSON.stringify(window.IPTVState.getChannels().map(c=>c.id)),
 model:localStorage.getItem('positron-intelligence-preferences-v1'),
 playing:window.IPTVState.getCurrent()?.id||''
}));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function run(page){
 fs.mkdirSync(out,{recursive:true});await page.setViewportSize({width:1920,height:1080});
 await page.evaluate(()=>{
  window.IPTVState.setPage('tv');window.PositronWatchFlow.close();
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalClose').focus();
 });
 const initial=await saved(page),beforeState=await state(page);
 const before=await page.screenshot({path:path.join(out,'positron-p51330-modal-f6-before-1920x1080-real.png'),animations:'disabled'});
 await page.keyboard.press('F6');
 const sourceModalSafe=await state(page);
 const after=await page.screenshot({path:path.join(out,'positron-p51330-modal-f6-after-1920x1080-real.png'),animations:'disabled'});
 await page.evaluate(()=>{
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('castModal').classList.remove('hidden');
  document.getElementById('castClose').focus();
 });
 await page.keyboard.press('Alt+Shift+W');const castModalSafe=await state(page);
 await page.evaluate(()=>{
  document.getElementById('castModal').classList.add('hidden');
  const x=document.createElement('div');x.id='po330Editable';
  x.setAttribute('contenteditable','plaintext-only');x.textContent='QA editing focus';
  document.getElementById('page-tv').append(x);x.focus();
 });
 await page.keyboard.press('F6');const plaintextEditableSafe=await state(page);
 await page.evaluate(()=>{
  const x=document.getElementById('po330Editable');x.setAttribute('contenteditable','');x.focus();
 });
 await page.keyboard.press('Alt+Shift+W');const emptyEditableSafe=await state(page);
 await page.evaluate(()=>{document.getElementById('po330Editable').remove();document.getElementById('poWatchFlowToggle').focus();});
 await page.keyboard.press('F6');
 await page.waitForFunction(()=>!document.getElementById('poWatchFlowPanel').hidden&&document.activeElement?.id==='poFlowPlusAI',null,{timeout:12000});
 const desktopShortcutWorks=await state(page);
 await page.keyboard.press('F6');const twoWayUnchanged=await state(page);
 await page.setViewportSize({width:720,height:900});
 await page.evaluate(()=>document.getElementById('poWatchFlowToggle').focus());
 await page.keyboard.press('Alt+Shift+W');
 await page.waitForFunction(()=>!document.getElementById('poWatchFlowPanel').hidden&&document.activeElement?.id==='poFlowPlusAI',null,{timeout:12000});
 const narrowShortcutWorks=await state(page);
 const narrow=await page.screenshot({path:path.join(out,'positron-p51330-ai-after-720x900-real.png'),animations:'disabled'});
 const final=await saved(page);
 const qa={
  sourceModalSafe:beforeState.modal&&sourceModalSafe.modal&&!sourceModalSafe.panel,
  castModalSafe:castModalSafe.cast&&!castModalSafe.panel,
  plaintextEditableSafe:!plaintextEditableSafe.panel&&plaintextEditableSafe.focus==='po330Editable',
  emptyEditableSafe:!emptyEditableSafe.panel&&emptyEditableSafe.focus==='po330Editable',
  desktopShortcutWorks:desktopShortcutWorks.panel&&desktopShortcutWorks.ai,
  twoWayUnchanged:!twoWayUnchanged.panel,
  narrowShortcutWorks:narrowShortcutWorks.panel&&narrowShortcutWorks.ai&&!narrowShortcutWorks.overflow,
  noOverflow:!sourceModalSafe.overflow&&!desktopShortcutWorks.overflow,
  playlistUnchanged:initial.ids===final.ids,
  modelUnchanged:initial.model===final.model,
  noAutoplay:initial.playing===final.playing
 };
 for(const [key,passed] of Object.entries(qa))assert.equal(passed,true,'P330 Electron '+key+': '+JSON.stringify(qa));
 for(const [png,w,h] of [[before,1920,1080],[after,1920,1080],[narrow,720,900]]){
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
 fs.writeFileSync('positron-evidence/audit-p51330-modal-f6.json',JSON.stringify({
  version:'P5.1.330',app:'4.23.415',realElectron:true,
  before:{...beforeState,sha256:sha(before)},after:{...sourceModalSafe,sha256:sha(after)},
  castModalSafe,plaintextEditableSafe,emptyEditableSafe,desktopShortcutWorks,twoWayUnchanged,
  narrow:{...narrowShortcutWorks,sha256:sha(narrow)},qa,
  scope:'Electron UI with real native source/Cast dialogs; editable fixture only for keyboard context, no IPTV stream'
 },null,2));
 console.log('P330 Electron modal/shortcut QA',JSON.stringify(qa));
 await page.evaluate(()=>window.PositronWatchFlow.close());
 await page.setViewportSize({width:1920,height:1080});
}
module.exports={run};
