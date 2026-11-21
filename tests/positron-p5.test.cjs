'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('P5 has twenty scoped improvements with independent stage gates',()=>{
 const css=read('renderer/positron-twenty.css');
 for(let i=1;i<=20;i++){const n=String(i).padStart(2,'0');
  assert.ok(css.includes('Upgrade '+n+':'),'missing improvement '+n);
  assert.ok(css.includes('.p20-'+n),'missing style gate '+n);
 }
 assert.equal((css.match(/\/\* Upgrade \d\d:/g)||[]).length,20);
 assert.ok(css.includes('page-sources')&&css.includes('page-doctor')&&css.includes('page-epg'));
 assert.ok(css.includes('#page-sources .source-hub-section'),'P5.1 parent background repair must persist');
 assert.ok(css.includes('#appShell #appSidebar .brand-icon'),'P5.1 rail icon overlap repair must persist');
});
test('P5 companion is syntax safe and does not touch native streaming or persistence',()=>{
 const js=read('renderer/positron-twenty.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const unsafe of ['innerHTML=','removeChild(','IPTVState.playChannel(','localStorage.clear(','deleteChannel('])
  assert.ok(!js.includes(unsafe),unsafe);
 assert.ok(js.includes('OpenIPTVPositronTwenty'));
 assert.ok(js.includes("event.key==='/'"));
 assert.ok(js.includes("button.replaceChildren(svg)"),'P5.1 vector transport controls must not use OS emoji');
});
test('P5 assets are loaded after P4 without replacing it',()=>{
 const html=read('renderer/index.html');
 assert.ok(html.includes('href="positron-twenty.css"'));
 assert.ok(html.includes('src="positron-twenty.js"'));
 assert.ok(html.indexOf('positron-twenty.css')>html.indexOf('positron-fifty.css'));
 assert.ok(html.indexOf('positron-twenty.js')>html.indexOf('positron-fifty.js'));
 const script=read('scripts/positron-20-extension.cjs');
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.ok(script.includes('page.screenshot'));
 assert.ok(script.includes('sha256'));
 assert.ok(script.includes('20')&&script.includes('realElectron:true'));
});
test('P5 release is immutable and versioned separately from P4.1',()=>{
 const pkg=JSON.parse(read('package.json'));
 const flow=read('.github/workflows/positron-lab.yml');
 assert.equal(pkg.version,'4.23.101');
 assert.ok(flow.includes('positron/v4.23.101-p5.1.17'));
 assert.ok(read('scripts/positron-50-audit.cjs').includes('runTwenty(page)'));
 assert.ok(flow.includes('Positron-P5117-20-Real-Screenshots.zip'));
});

test('P5.1.1 sidebar badge matches shipped release instead of stale P4',()=>{const js=read('renderer/positron.js');assert.ok(js.includes("descriptor.textContent='P5.1.17'"));assert.ok(!js.includes('OPEN IPTV PRO · P4 · 50 VÒNG'));});

test('P5.1.3 fullscreen icon uses SVG not a tiny platform glyph',()=>{const js=read('renderer/positron-twenty.js');const css=read('renderer/positron-twenty.css');assert.ok(js.includes("['fullscreenBtn','M8 3H3v5"));assert.ok(css.includes('#page-tv #fullscreenBtn svg'));});

test('P5.1.4 compact header shows accessible short page title',()=>{const js=read('renderer/positron-studio.js');const css=read('renderer/positron-twenty.css');assert.ok(js.includes('title.dataset.shortTitle='));assert.ok(css.includes('content:attr(data-short-title)'));});

test('P5.1.5 compact page title covers 720px source layout',()=>{const css=read('renderer/positron-twenty.css');assert.ok(css.includes('@media(max-width:760px){html[data-positron="true"] #positronBar .p-heading'));});

test('P5.1.6 Smart Discovery inherits theme card surface instead of black',()=>{const css=read('renderer/positron-twenty.css');assert.match(css,/\.p20-07 #page-sources \.source-hub-section\{\s*background:var\(--po-card\)!important/);});

test('P5.1.6 Smart Discovery heading and its parent must share theme card surface',()=>{const css=read('renderer/positron-twenty.css');assert.ok(css.includes('#page-sources .source-hub-heading{background:var(--po-card)!important'));});

test('P5.1.8 compact theme control keeps native button and accessible name',()=>{
 const css=read('renderer/positron-twenty.css');
 const js=read('renderer/positron-studio.js');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('p50-49 #positronBar .p-actions #positronStudioBtn'));
 assert.ok(css.includes('font-size:0!important;width:36px!important'));
 assert.ok(css.includes('#positronStudioBtn::before'));
 assert.ok(js.includes("theme.setAttribute('aria-label','Chọn chủ đề màu Positron')"));
 assert.ok(audit.includes("metrics.themeButton.fontSize,'0px'"));
 assert.ok(audit.includes("metrics.themeButton.width<=46"));
});

test('P5.1.9 Favorites empty state navigates to Sources without mutating stored favorites',()=>{
 const js=read('renderer/positron-twenty.js');
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const favoriteList=byId('favoriteList')"));
 assert.ok(js.includes("empty.querySelector('#positronFavoritesSources')"));
 assert.ok(js.includes("button.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'))"));
 assert.ok(js.includes('new MutationObserver(syncFavoriteSourceAction)'));
 assert.ok(css.includes('#page-fav #positronFavoritesSources'));
 assert.ok(audit.includes("destination,'page-sources'"));
});

test('P5.1.10 empty Favorites text matches actual source count and retains action',()=>{
 const js=read('renderer/positron-twenty.js');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("byId('sourceCount')"));
 assert.ok(js.includes("num===0"));
 assert.ok(js.includes("copy?.nodeType===3&&copy.textContent!==guidance"));
 assert.ok(js.includes("new MutationObserver(syncFavoriteSourceAction).observe(countNode"));
 assert.ok(js.includes("empty.querySelector('#positronFavoritesSources')"));
 assert.ok(audit.includes("metrics.favoriteGuidance.startsWith('Chưa có nguồn IPTV.')"));
});

test('P5.1.11 small TV keeps next EPG programme title readable without ellipsis',()=>{
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('@media(max-width:540px)'));
 assert.ok(css.includes('#epgCurrent :is(.epg-current-item,.epg-next-item) b'));
 assert.ok(css.includes('white-space:normal!important;text-overflow:clip!important'));
 assert.ok(audit.includes("metrics.epgNext.whiteSpace,'normal'"));
 assert.ok(audit.includes("metrics.epgNext.scrollWidth<=metrics.epgNext.clientWidth+2"));
});

test('P5.1.12 search toolbar uses legible SVG and concise visual label',()=>{
 const js=read('renderer/positron-twenty.js');
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const searchButton=byId('positronOpen')"));
 assert.ok(js.includes("label.textContent='Tìm kênh / trang'"));
 assert.ok(js.includes("searchButton.setAttribute('aria-label','Tìm kiếm kênh, trang và công cụ')"));
 assert.ok(js.includes("circle.setAttribute('cx','10.5')"));
 assert.ok(css.includes('#positronOpen>span:first-child svg'));
 assert.ok(audit.includes('metrics.searchButton.labelClipped,false'));
 assert.ok(audit.includes("searchOpens,true"));
});

test('P5.1.13 sidebar system status wraps without hiding native FFmpeg details',()=>{
 const css=read('renderer/positron-twenty.css');
 const js=read('renderer/positron-twenty.js');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#appSidebar .sidebar-bottom #miniStatus'));
 assert.ok(css.includes('white-space:normal!important;text-overflow:clip!important'));
 assert.ok(js.includes("const statusLabel=byId('miniStatus')"));
 assert.ok(js.includes('new MutationObserver(syncStatusTitle)'));
 assert.ok(audit.includes("metrics.sidebarStatus.scrollHeight<=metrics.sidebarStatus.clientHeight+2"));
});

test('P5.1.14 Smart Discovery small-window option is readable and remains unlimited',()=>{
 const js=read('renderer/positron-twenty.js'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("smartLimit.querySelector('option[value=\"all\"]')"));
 assert.ok(js.includes("unlimited.textContent='Tất cả kênh'"));
 assert.ok(js.includes("unlimited.title='Kiểm tra tất cả (không giới hạn)'"));
 assert.ok(audit.includes("metrics.smartLimit?.value,'all'"));
 assert.ok(audit.includes("metrics.smartLimit.textWidth+32<=metrics.smartLimit.controlWidth"));
});

test('P5.1.15 Doctor zero-channel state provides real source navigation',()=>{
 const js=read('renderer/positron-twenty.js');
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const doctorPage=byId('page-doctor')"));
 assert.ok(js.includes("const count=byId('navCount')"));
 assert.ok(js.includes("action.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'))"));
 assert.ok(js.includes("new MutationObserver(updateHint)"));
 assert.ok(css.includes('#positronDoctorEmptyHint[hidden]{display:none!important}'));
 assert.ok(audit.includes("destination,'page-sources'"));
});

test('P5.1.16 native volume label uses a vector speaker while retaining for=volume',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("label.volume-icon[for=\"volume\"]"));
 assert.ok(js.includes('volumeLabel.replaceChildren(svg)'));
 assert.ok(css.includes('#page-tv .volume-controls label.volume-icon svg'));
 assert.ok(audit.includes('metrics.volumeIcon?.svg,true'));
 assert.ok(audit.includes("metrics.volumeIcon?.for,'volume'"));
});

test('P5.1.17 Cast and PiP keep native listeners and readable SVG icons',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("id:'castBtn',caption:'Cast / AirPlay'"));
 assert.ok(js.includes("id:'pipBtn',caption:'PiP'"));
 assert.ok(js.includes('button.replaceChildren(svg,label)'));
 assert.ok(css.includes('#page-tv .output-controls :is(#castBtn,#pipBtn) svg'));
 assert.ok(audit.includes('metrics.outputIcons?.[key]'));
 assert.ok(audit.includes("i.label,label"));
});
