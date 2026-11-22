'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('P5.1.256 read-only live source inventory badge follows native footer count',()=>{
 const js=read('renderer/positron-source-inventory.js'),css=read('renderer/positron-source-inventory.css'),html=read('renderer/index.html');
 for(const t of ["summary.id='poSourceInventorySummary';","state.getStore()","item?.enabled!==false","store?.channels","new MutationObserver(refresh)","observer.observe(footer,{childList:true,subtree:true,characterData:true})","Object.freeze({refresh})"])
  assert.ok(js.includes(t),'Missing P256 inventory '+t);
 assert.ok(html.includes('positron-source-inventory.js')&&html.includes('positron-source-inventory.css'));
 assert.ok(css.includes('#page-sources #poSourceInventorySummary'));
 assert.ok(!js.includes('save(')&&!js.includes('playChannel('),'Inventory must only read library metadata');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.342');
});
test('P5.1.256 real Electron screenshots verify source counts and narrow layout',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const n of ['positron-p51256-inventory-before-1920x1080-real.png','positron-p51256-inventory-after-1920x1080-real.png','positron-p51256-inventory-720-real.png'])
  assert.ok(qa.includes(n)&&wf.includes(n),'Missing actual Electron evidence '+n);
 for(const t of ['sourceInventoryQA256','sourceInventoryNarrowQA256','countMatchesStore:','enabledSourceCount:','noAutoplay:','favoritesUnchanged:','playlistUnchanged:','noHorizontalOverflow:'])
  assert.ok(qa.includes(t),'Missing source inventory QA '+t);
});

test('P5.1.257 source inventory has accessible optional read-only source breakdown',()=>{
 const js=read('renderer/positron-source-inventory.js'),css=read('renderer/positron-source-inventory.css');
 for(const t of ["toggle.id='poSourceInventoryToggle';","toggle.setAttribute('aria-expanded','false');","details.id='poSourceInventoryDetails';","const countBySource=new Map();","source.name||'Nguồn chưa đặt tên'","status.textContent=source.enabled===false?'Tắt':'Bật';","toggle.addEventListener('click',()=>","if(!details.hidden)renderDetails();"])
  assert.ok(js.includes(t),'P257 source overview missing '+t);
 assert.ok(css.includes('#page-sources #poSourceInventoryDetails[hidden]'));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.342');
});
test('P5.1.257 Electron screenshot QA checks read-only breakdown at wide and 720px',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),flow=read('.github/workflows/positron-lab.yml');
 for(const n of ['positron-p51257-source-details-before-1920x1080-real.png','positron-p51257-source-details-after-1920x1080-real.png','positron-p51257-source-details-720-real.png'])
  assert.ok(qa.includes(n)&&flow.includes(n),'P257 screenshot missing '+n);
 for(const t of ['sourceDetailsStartQA257','sourceDetailsQA257','sourceDetailsNarrowQA257',"page.locator('#poSourceInventoryToggle').click()",'rowCountsCorrect:','statusesCorrect:','noAutoplay:','sourcesUnchanged:','noOverflow:'])
  assert.ok(qa.includes(t),'P257 QA missing '+t);
});
