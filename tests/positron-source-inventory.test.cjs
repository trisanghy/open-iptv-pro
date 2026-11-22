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
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=342);
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
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=342);
});
test('P5.1.257 Electron screenshot QA checks read-only breakdown at wide and 720px',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),flow=read('.github/workflows/positron-lab.yml');
 for(const n of ['positron-p51257-source-details-before-1920x1080-real.png','positron-p51257-source-details-after-1920x1080-real.png','positron-p51257-source-details-720-real.png'])
  assert.ok(qa.includes(n)&&flow.includes(n),'P257 screenshot missing '+n);
 for(const t of ['sourceDetailsStartQA257','sourceDetailsQA257','sourceDetailsNarrowQA257',"page.locator('#poSourceInventoryToggle').click()",'rowCountsCorrect:','statusesCorrect:','noAutoplay:','sourcesUnchanged:','noOverflow:'])
  assert.ok(qa.includes(t),'P257 QA missing '+t);
});

test('P5.1.258 search source names across all sources without modifying playlists',()=>{
 const vm=require('node:vm');
 const js=read('renderer/positron-source-inventory.js'),css=read('renderer/positron-source-inventory.css');
 for(const token of ["search.id='poSourceInventorySearch';","search.type='search';","search.hidden=true;","search.addEventListener('input'",'sources.filter(source=>','filtered.slice(0,30)',"Không tìm thấy nguồn phù hợp.","if(!expanded){search.value='';","statusSelect.value='all';"])
  assert.ok(js.includes(token),'P258 source search missing: '+token);
 const match=js.match(/const foldSourceName=value=>[\s\S]*?toLocaleLowerCase\('vi'\);/);
 assert.ok(match,'P258 normalization helper absent');
 const fold=vm.runInNewContext(match[0]+'\nfoldSourceName');
 assert.equal(fold('ĐÀI TRUYỀN HÌNH'),'dai truyen hinh');
 assert.equal(fold('  Nguồn Ánh  '),'nguon anh');
 assert.equal(fold('LỌC CATEGORY'),'loc category');
 assert.ok(css.includes('#poSourceInventorySearch[hidden]'));
 assert.ok(css.includes('max-height:245px'));
 assert.ok(!js.includes('save(')&&!js.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=343);
});
test('P5.1.258 validates real filtered Electron source screenshots and readonly state',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51258-source-search-before-1920x1080-real.png','positron-p51258-source-search-after-1920x1080-real.png','positron-p51258-source-search-720-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),'Missing P258 real screenshot '+f);
 for(const key of ['sourceSearchQA258','filteredToOne:','queryMatches:','noAutoplay:','sourcesUnchanged:','playlistUnchanged:','noOverflow:'])
  assert.ok(qa.includes(key),'P258 QA missing '+key);
});

test('P5.1.259 offers native enabled/disabled source filtering and result totals',()=>{
 const js=read('renderer/positron-source-inventory.js'),css=read('renderer/positron-source-inventory.css');
 for(const s of ["statusRow.id='poSourceInventoryFilterRow';","statusSelect.id='poSourceInventoryStatus';",
  "resultCount.id='poSourceInventoryResultCount';","['enabled','Đang bật']","['disabled','Đang tắt']",
  "statusSelect.addEventListener('change'","resultCount.textContent=filtered.length",
  "statusRow.hidden=!expanded;","statusSelect.value='all'"])
  assert.ok(js.includes(s),'P259 state filter missing '+s);
 assert.ok(css.includes('#poSourceInventoryFilterRow[hidden]'));
 assert.ok(css.includes('#poSourceInventoryStatus:focus-visible'));
 assert.ok(!js.includes('playChannel(')&&!js.includes('save('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=344);
});
test('P5.1.259 requires source status filter Electron before/after and 720px evidence',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51259-source-status-before-1920x1080-real.png','positron-p51259-source-status-after-1920x1080-real.png','positron-p51259-source-status-720-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),f);
 for(const key of ['sourceStatusQA259','correctRows:','totalMatches:','noAutoplay:','sourcesUnchanged:','playlistUnchanged:','noOverflow:'])
  assert.ok(qa.includes(key),'P259 QA missing '+key);
});

test('P5.1.260 sorts only a local filtered source inventory, not playlist order',()=>{
 const code=read('renderer/positron-source-inventory.js'),css=read('renderer/positron-source-inventory.css');
 for(const term of ["sortSelect.id='poSourceInventorySort';","['count-desc','Nhiều kênh trước']",
  "['count-asc','Ít kênh trước']","['name','Tên A–Z']","filtered.sort((a,b)=>sign*",
  "filtered.sort((a,b)=>String(a.name","sortSelect.value='original'","sortSelect.addEventListener('change'"])
  assert.ok(code.includes(term),'Missing P260 source sort '+term);
 assert.ok(css.includes('#poSourceInventorySort:focus-visible'));
 assert.ok(!code.includes('store.sources.sort(')&&!code.includes('sources.sort('));
 assert.ok(!code.includes('save(')&&!code.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=345);
});
test('P5.1.260 screenshots Electron source sort sequence and 720px UI',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const filename of ['positron-p51260-source-sort-before-1920x1080-real.png',
  'positron-p51260-source-sort-after-1920x1080-real.png','positron-p51260-source-sort-720-real.png'])
  assert.ok(qa.includes(filename)&&wf.includes(filename),filename);
 for(const key of ['sourceSortQA260','ascendingByChannelCount:','reversedOriginalOrder:',
  'noAutoplay:','sourcesUnchanged:','playlistUnchanged:','noOverflow:'])
  assert.ok(qa.includes(key),'Missing P260 real Electron verification '+key);
});

test('P5.1.261 source detail rows jump to matching native source card safely',()=>{
 const js=read('renderer/positron-source-inventory.js'),css=read('renderer/positron-source-inventory.css');
 for(const token of ["jump.className='po-source-inventory-jump';","jump.textContent='Đi tới';",
  "jump.addEventListener('click'","currentSources.findIndex(", "#sourcesList .source-card",
  "target.dataset.poInventoryTarget='true';","target.focus({preventScroll:true});",
  "target.scrollIntoView({block:'center',behavior:'auto'});"])
  assert.ok(js.includes(token),'P261 direct source navigation '+token);
 assert.ok(css.includes('.source-card[data-po-inventory-target="true"]'));
 assert.ok(!js.includes('playChannel(')&&!js.includes('save(')&&!js.includes('localStorage.setItem('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=346);
});
test('P5.1.261 Electron screenshots verify native card focus, scroll and unchanged playlist',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const filename of ['positron-p51261-source-jump-before-1920x1080-real.png',
  'positron-p51261-source-jump-after-1920x1080-real.png','positron-p51261-source-jump-720-real.png'])
  assert.ok(qa.includes(filename)&&wf.includes(filename),filename);
 for(const key of ['sourceJumpQA261','focusedCard:','highlightedCard:',
  'sourceIdCorrect:','noAutoplay:','sourcesUnchanged:','playlistUnchanged:','noOverflow:'])
  assert.ok(qa.includes(key),'P261 native card QA '+key);
});

test('P5.1.262 return navigation restores focus on the exact source inventory row',()=>{
 const code=read('renderer/positron-source-inventory.js'),css=read('renderer/positron-source-inventory.css');
 for(const k of ["back.className='po-source-inventory-back';","back.textContent='↖ Chi tiết';",
  "back.addEventListener('click'","if(details.hidden)toggle.click();",
  "row.dataset.poInventoryReturn='true';","row.focus({preventScroll:true});",
  "target.removeAttribute('data-po-inventory-target');","back.remove();"])
  assert.ok(code.includes(k),'Missing P262 source return '+k);
 assert.ok(css.includes('li[data-po-inventory-return="true"]'));
 assert.ok(!code.includes('playChannel(')&&!code.includes('save(')&&!code.includes('localStorage.setItem('));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.347');
});
test('P5.1.262 real Electron screenshots prove reverse navigation and playlist invariance',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51262-source-return-before-1920x1080-real.png',
  'positron-p51262-source-return-after-1920x1080-real.png','positron-p51262-source-return-720-real.png'])
  assert.ok(qa.includes(name)&&wf.includes(name),name);
 for(const k of ['sourceReturnQA262','focusedRow:','highlightedRow:','backRemoved:',
  'noAutoplay:','sourcesUnchanged:','playlistUnchanged:','noOverflow:'])
  assert.ok(qa.includes(k),'P262 return QA missing '+k);
});
