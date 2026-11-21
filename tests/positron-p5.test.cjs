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
 assert.equal(pkg.version,'4.23.232');
 const label=pkg.description.match(/Positron\s+(P\d+\.\d+\.\d+)/)?.[1];
 assert.ok(label,'product P-label must accompany SemVer');
 assert.ok(flow.includes('TAG=positron/v'+pkg.version+'-'+label.toLowerCase()),'release tag and app version must match');
 assert.ok(read('scripts/positron-50-audit.cjs').includes('runTwenty(page)'));
 assert.ok(flow.includes('Positron-'+label.replaceAll('.','')+'-20-Real-Screenshots.zip'),'screenshot artifact must match current P-label');
});

test('P5.1.1 sidebar badge matches shipped release instead of stale P4',()=>{const js=read('renderer/positron.js');const pkg=JSON.parse(read('package.json'));
 const label=pkg.description.match(/Positron\s+(P\d+\.\d+\.\d+)/)?.[1];
 assert.ok(label&&js.includes("descriptor.textContent='"+label+"'"));assert.ok(!js.includes('OPEN IPTV PRO · P4 · 50 VÒNG'));});

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

test('P5.1.18 footer status wraps and meets 4.5:1 contrast on compact view',()=>{
 const css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('.footer:not(:has(>.task-dock:not(.hidden)))'));
 assert.ok(css.includes('white-space:normal!important'));
 assert.ok(css.includes('#footerText'));
 assert.ok(audit.includes('metrics.footerStatus.contrast>=4.5'));
 assert.ok(audit.includes(String.raw`c.match(/\d+(?:\.\d+)?/g)`),'contrast RGB parser must recognize numeric channels');
 assert.ok(audit.includes('metrics.footerStatus.scrollWidth<=metrics.footerStatus.clientWidth+2'));
});

test('P5.1.19 slash focuses visible TV search and preserves Ctrl+K command palette',()=>{
 const js=read('renderer/positron.js'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("if(doc.querySelector('#page-tv.active-page')&&rect?.width>0&&rect?.height>0)return"));
 assert.ok(js.includes("event.preventDefault();open()"));
 assert.ok(audit.includes('keys.slashFocused,true'));
 assert.ok(audit.includes('keys.ctrlOpenedPalette,true'));
 assert.ok(audit.includes('keys.escapeClosedPalette,true'));
 assert.ok(audit.includes('positron-p5-19-slash-search-real.png'));
});

test('P5.1.21 command palette hint uses Ctrl on Windows/Linux and Command on Mac',()=>{
 const js=read('renderer/positron.js'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes('navigator.userAgentData?.platform||navigator.platform'));
 assert.ok(js.includes("shortcutBadge.textContent=isMac?'⌘ K':'Ctrl K'"));
 assert.ok(js.includes("shortcutButton.title=isMac?'Tìm nhanh (⌘+K)':'Tìm nhanh (Ctrl+K)'"));
 assert.ok(audit.includes('metrics.shortcutHint?.text,metrics.shortcutHint?.expected'));
 assert.ok(audit.includes('global search ARIA shortcuts lost'));
});

test('P5.1.21 native fallback link select has sufficient visible width at 450px',()=>{
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 const html=read('renderer/index.html');
 assert.ok(css.includes('P5.1.21 / independent screenshot-repair'));
 assert.ok(css.includes('#page-tv .player-control-card .control-layout-bottom .manual-link-picker'));
 assert.ok(css.includes('grid-column:1/-1!important;grid-row:3!important'));
 assert.ok(css.includes('#manualStreamSelect'));
 assert.ok(audit.includes('metrics.manualLink.controlWidth>=metrics.manualLink.selectedTextWidth+34'));
 assert.ok(audit.includes('metrics.manualLink.right<=width-6'));
 assert.ok(html.includes('id="manualStreamSelect"'));
 assert.ok(html.includes('id="favCurrentBtn"'));
});

test('P5.1.22 focus mode renders stateful SVG while preserving native toggling',()=>{
 const js=read('renderer/positron.js');
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes('function renderFocusVisual(active)'));
 assert.ok(js.includes('button.replaceChildren(svg,label)'));
 assert.ok(js.includes('renderFocusVisual(shouldFocus)'));
 assert.ok(css.includes('#positronBar #positronFocus svg'));
 assert.ok(css.includes('#positronBar #positronFocus::before{content:none!important'));
 assert.ok(audit.includes('assert.equal(focusState.active,true'));
 assert.ok(audit.includes('assert.equal(focusState.different,true'));
 assert.ok(audit.includes('assert.equal(focusState.restored,true'));
});

test('P5.1.23 Sources empty state is compact only without playlists',()=>{
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.23: Sources 720px real Electron screenshot'));
 assert.ok(css.includes('#sourcesList:has(>.empty-list)>.empty-list'));
 assert.ok(css.includes('#sourcesList:has(>.empty-list)+#smartDiscoverySection'));
 assert.ok(audit.includes('metrics.sourceEmpty.height<=65'));
 assert.ok(audit.includes('metrics.sourceEmpty.gap<=30'));
});

test('P5.1.24 EPG DVR recording heading uses monochrome vector, not OS emoji',()=>{
 const js=read('renderer/positron-twenty.js');
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("d.querySelector('#dvrPanel .dvr-heading h2')"));
 assert.ok(js.includes('dvrTitle.replaceChildren(icon,label)'));
 assert.ok(js.includes('new MutationObserver(ensureDvrVector)'));
 assert.ok(css.includes('#dvrPanel .dvr-heading h2 svg'));
 assert.ok(audit.includes('metrics.dvrHeading?.svg,true'));
 assert.ok(audit.includes("metrics.dvrHeading.aria,'true'"));
});

test('P5.1.26 DVR empty-state selector disables gracefully and re-enables on options',()=>{
 const js=read('renderer/positron-twenty.js');
 const audit=read('scripts/positron-20-extension.cjs');
 const css=read('renderer/positron-twenty.css');
 assert.ok(js.includes('const syncDvrChannel=()=>'));
 assert.ok(js.includes("option.textContent='Chưa có kênh để ghi hình'"));
 assert.ok(js.includes('dvrChannel.disabled=!hasChannels'));
 assert.ok(js.includes('new MutationObserver(syncDvrChannel)'));
 assert.ok(css.includes('#page-epg #dvrChannel:disabled'));
 assert.ok(audit.includes('metrics.dvrChannel?.disabled,true'));
});


test('P5.1.26 Doctor skips no-channel analysis and re-enables on source updates',()=>{
 const js=read('renderer/positron-twenty.js');
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const analysisButtons=['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify']"));
 assert.ok(js.includes("new MutationObserver(syncDoctorAvailability)"));
 assert.ok(js.includes("button.setAttribute('aria-describedby','positronDoctorEmptyHint')"));
 assert.ok(js.includes("button.removeAttribute('data-positron-no-channels')"));
 assert.ok(css.includes('#page-doctor button[data-positron-no-channels="true"]'));
 assert.ok(audit.includes("assert.equal(restored.enabled,true"));
 assert.ok(audit.includes("assert.equal(restored.disabledAgain,true"));
});


test('P5.1.27 deep-link check joins dynamic Doctor no-channel protection',()=>{
 const js=read('renderer/positron-twenty.js');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const analysisButtons=['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify']"));
 assert.ok(audit.includes("['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify']"));
 assert.ok(audit.includes('metrics.doctorAnalysis?.length,4'));
});


test('P5.1.28 sources desktop empty-state spacing preserves populated sources',()=>{
 const css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.28: P5.1.27 real Sources 1360px'));
 assert.ok(css.includes('@media(min-width:801px)'));
 assert.ok(css.includes('#sourcesList:has(>.empty-list)>.empty-list'));
 assert.ok(audit.includes('metrics.sourceEmpty?.height<=57'));
 assert.ok(audit.includes('metrics.sourceEmpty?.gap<=20'));
});


test('P5.1.29 real Sources status filter keeps a one-line label across viewports',()=>{
 const css=read('renderer/positron-twenty.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.29: real P5.1.28 Sources 1360px'));
 assert.ok(css.includes('#page-sources .smart-result-filters>label'));
 assert.ok(css.includes('white-space:nowrap!important'));
 assert.ok(css.includes('flex:0 0 auto!important'));
 assert.ok(audit.includes('metrics.smartStatusLabel?.lineRects,1'));
 assert.ok(audit.includes("metrics.smartStatusLabel?.whiteSpace,'nowrap'"));
});


test('P5.1.30 DVR scheduling button follows actual channel availability',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const schedule=byId('dvrAdd')"));
 assert.ok(js.includes("schedule.setAttribute('aria-describedby','dvrChannel')"));
 assert.ok(js.includes("schedule.removeAttribute('data-positron-no-channels')"));
 assert.ok(css.includes('#page-epg #dvrAdd[data-positron-no-channels="true"]'));
 assert.ok(audit.includes('state.enabledSubmit,true'));
 assert.ok(audit.includes('state.disabledSubmit,true'));
 assert.ok(audit.includes('metrics.dvrSchedule?.disabled,true'));
});


test('P5.1.31 compact TV tools use Vietnamese Tua lại and retain toggle',()=>{
 const fifty=read('renderer/positron-fifty.js'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(fifty.includes("'▾ Tua lại · Ghi hình · Công cụ'"));
 assert.ok(fifty.includes("tools.title='Hiện hoặc ẩn Tua lại"));
 assert.ok(!fifty.includes("'▾ Timeshift · Ghi hình · Công cụ'"));
 assert.ok(audit.includes("metrics.toolsToggle.title.includes('Tua lại')"));
 assert.ok(audit.includes('disclosure.restored,true'));
});


test('P5.1.32 theme control uses SVG without losing click and ARIA',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const themeControl=byId('positronStudioBtn')"));
 assert.ok(js.includes("vector.setAttribute('class','positron-theme-vector')"));
 assert.ok(js.includes('themeControl.replaceChildren(vector,word)'));
 assert.ok(css.includes('#positronStudioBtn::before'));
 assert.ok(css.includes('content:none!important;display:none!important'));
 assert.ok(audit.includes('themeLifecycle.opened,true'));
 assert.ok(audit.includes('metrics.themeButton.svg,true'));
});


test('P5.1.33 current favorite follows native selected-channel availability',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const currentFavorite=byId('favCurrentBtn')"));
 assert.ok(js.includes('window.IPTVState?.getCurrent?.()'));
 assert.ok(js.includes("new MutationObserver(syncFavoriteAvailability)"));
 assert.ok(js.includes("currentFavorite.removeAttribute('data-positron-no-current')"));
 assert.ok(css.includes('#favCurrentBtn[data-positron-no-current="true"]'));
 assert.ok(audit.includes('metrics.currentFavorite?.disabled,true'));
});

test('P5.1.34 disabled DVR schedule uses a neutral non-clickable visual',()=>{
 const css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-epg #dvrAdd:disabled[data-positron-no-channels="true"]'));
 assert.ok(css.includes('filter:grayscale(1)!important'));
 assert.ok(audit.includes('dvrSchedule?.filter.includes'));
 assert.ok(audit.includes('dvrSchedule?.opacity'));
});


test('P5.1.35 DVR schedule retains native click handling with monochrome SVG',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const nativeDvrSubmit=byId('dvrAdd')"));
 assert.ok(js.includes('nativeDvrSubmit.replaceChildren(icon,label)'));
 assert.ok(css.includes('#page-epg #dvrAdd svg.positron-dvr-record-icon'));
 assert.ok(audit.includes('metrics.dvrSchedule?.vector,true'));
 assert.ok(audit.includes('metrics.dvrSchedule?.ariaHidden'));
});


test('P5.1.36 EPG search guidance remains legible on dark themes',()=>{
 const css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-epg #epgSearchResults'));
 assert.ok(css.includes('color:var(--po-ink)!important'));
 assert.ok(audit.includes('epgGuidance:'));
 assert.ok(audit.includes('metrics.epgGuidance?.luma'));
});


test('P5.1.37 empty-TV Play is disabled, restores when channels appear',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const mainPlay=byId('playBtn')"));
 assert.ok(js.includes('new MutationObserver(syncPlayAvailability)'));
 assert.ok(js.includes("mainPlay.removeAttribute('data-positron-no-channels')"));
 assert.ok(css.includes('#page-tv #playBtn[data-positron-no-channels="true"]'));
 assert.ok(css.includes('#page-tv .player-control-card .controls.transport-controls #playBtn[data-positron-no-channels="true"]'));
 assert.ok(css.includes('opacity:.50!important'));
 assert.ok(audit.includes('metrics.playAvailability?.disabled,true'));
 assert.ok(audit.includes('playLifecycle.reenabled,true'));
});


test('P5.1.38 guards empty TV Prev/Stop/Next and re-enables navigation dynamically',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const transportActions=['prevBtn','stopBtn','nextBtn']"));
 assert.ok(js.includes('new MutationObserver(syncTransportAvailability)'));
 assert.ok(css.includes('#page-tv .player-control-card .controls.transport-controls :is(#prevBtn,#stopBtn,#nextBtn)[data-positron-inactive="true"]'));
 assert.ok(audit.includes('metrics.transportAvailability?.every'));
 assert.ok(audit.includes('transportLifecycle.navigationEnabled,true'));
});


test('P5.1.39 idle Cast and PiP preserve original buttons and re-enable on channel selection',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const idleOutputActions=['castBtn','pipBtn']"));
 assert.ok(js.includes('new MutationObserver(syncOutputAvailability)'));
 assert.ok(js.includes("b.removeAttribute('data-positron-no-current')"));
 assert.ok(css.includes('#page-tv .player-control-card .output-controls :is(#castBtn,#pipBtn)[data-positron-no-current="true"]'));
 assert.ok(audit.includes('metrics.outputAvailability?.every'));
});


test('P5.1.40 empty-player hero icon is accessible passive TV artwork',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const emptyPicture=byId('emptyPlayer')?.querySelector('.empty-icon')"));
 assert.ok(js.includes("svg.setAttribute('class','positron-empty-tv')"));
 assert.ok(js.includes('emptyPicture.replaceChildren(svg)'));
 assert.ok(css.includes('#emptyPlayer .empty-icon svg.positron-empty-tv'));
 assert.ok(audit.includes('metrics.emptyArtwork?.svg,true'));
});


test('P5.1.41 logged-out account card is compact without reducing OTP input/button size',()=>{
 const css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#openiptvPortableCloud:has(#portableCloudEmailForm:not([hidden]))'));
 assert.ok(css.includes('padding:14px 18px!important'));
 assert.ok(audit.includes('cloudLogin:(()=>'));
 assert.ok(audit.includes('metrics.cloudLogin?.height<=290'));
 assert.ok(audit.includes('metrics.cloudLogin?.inputHeight>=42'));
});


test('P5.1.43 unavailable Doctor actions are visually neutral, not bright primary',()=>{
 const css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-doctor :is(#doctorRun,#doctorDeepCheck,#doctor3Refresh,#doctor3Verify):disabled[data-positron-no-channels="true"]'));
 assert.ok(css.includes('filter:grayscale(1)!important'));
 assert.ok(audit.includes('metrics.doctorButtons?.every'));
 assert.ok(audit.includes('action.luma<140'));
});


test('P5.1.43 Smart Discovery default catalog guidance is accurate',()=>{
 const html=read('renderer/index.html'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(html.includes("Đã chọn bộ sưu tập mặc định. Nhấn Khám phá nguồn để tải kênh."));
 assert.ok(!html.includes("Chọn bộ sưu tập rồi bấm Khám phá."));
 assert.ok(audit.includes('metrics.smartInitial?.catalog'));
});


test('P5.1.43 Smart Discovery corrected default guidance is localized in 17 languages',()=>{
 const i18n=read('renderer/i18n.js');
 assert.ok(i18n.includes('positronSmartDefaultTranslations'));
 assert.ok(i18n.includes('dict[positronSmartDefault]=value'));
 for(const code of ['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'])assert.ok(i18n.includes(JSON.stringify(code)),code+' locale missing');
});


test('P5.1.45 Favorites empty state is centered and action remains accessible at 600px',()=>{
 const css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-fav #favoriteList:has(>.empty-list)'));
 assert.ok(css.includes('justify-content:center!important'));
 assert.ok(audit.includes('favoriteEmptyLayout:(()=>'));
 assert.ok(audit.includes('metrics.favoriteEmptyLayout?.top>=300'));
 assert.ok(audit.includes('metrics.favoriteEmptyLayout?.buttonBottom'));
});


test('P5.1.45 EPG empty instruction references the existing EPG Sources action and all native locales',()=>{
 const features=read('renderer/features.js');
 const i18n=read('renderer/i18n.js');
 const audit=read('scripts/positron-20-extension.cjs');
 const settings=read('renderer/settings-ui.js');
 assert.ok(features.includes("Chưa tải EPG. Nhấn “Nguồn EPG” phía trên để chọn hoặc cập nhật nguồn."));
 assert.ok(!features.includes('Chưa tải EPG. Vào Cài đặt và bấm'));
 assert.ok(settings.includes("openSection('epgSettingsCard')"));
 assert.ok(i18n.includes('positronEpgEmptyTranslations'));
 assert.ok(audit.includes('metrics.epgEmptySummary'));
 assert.ok(audit.includes('metrics.epgSourceAction?.visible'));
});


test('P5.1.46 unavailable DVR scheduler collapses without removing native recording form',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes('p46-no-channels'));
 assert.ok(js.includes('compactDvrForm.insertAdjacentElement'));
 assert.ok(js.includes("window.IPTVState?.setPage?.('sources')"));
 assert.ok(js.includes('MutationObserver(syncCompactDvr)'));
 assert.ok(css.includes('#dvrPanel.p46-no-channels #dvrForm'));
 assert.ok(css.includes('#positronDvrNoChannels:not([hidden])'));
 assert.ok(audit.includes('metrics.dvrFormVisible'));
 assert.ok(audit.includes('state.visibleWithChannels'));
 assert.ok(audit.includes('state.hiddenWithoutChannels'));
});

test('P5.1.46 release tag must match SemVer AND P-label, never carry the previous P-label',()=>{
 const pkg=JSON.parse(read('package.json')),workflow=read('.github/workflows/positron-lab.yml');
 const label=pkg.description.match(/Positron\s+(P\d+\.\d+\.\d+)/)?.[1];
 assert.ok(label,'package description needs an explicit P-label');
 const tag='TAG=positron/v'+pkg.version+'-p'+label.slice(1);
 assert.ok(workflow.includes(tag),'release tag mismatch: expected '+tag);
 assert.ok(!workflow.includes('TAG=positron/v'+pkg.version+'-p5.1.44'),'stale P-label in new release tag');
});


test('P5.1.47 DVR idle readiness must disappear without hiding real errors or jobs',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes('p47-hide-idle-status'));
 assert.ok(js.includes('isIdle=(nativeText===idleReadyCopy||nativeText===translated)'));
 assert.ok(js.includes("!dvrNativeStatus?.classList.contains('dvr-error')"));
 assert.ok(js.includes('new MutationObserver(syncCompactDvr).observe(dvrNativeStatus'));
 assert.ok(css.includes('#dvrPanel.p46-no-channels.p47-hide-idle-status #dvrStatus'));
 assert.ok(audit.includes('metrics.dvrNativeStatus?.visible'));
 assert.ok(audit.includes('state.readyVisibleWithChannel'));
 assert.ok(audit.includes('state.nativeReadyHiddenAgain'));
});


test('P5.1.48 EPG guide treats missing M3U differently from unmatched XMLTV identifiers',()=>{
 const f=read('renderer/features.js'),i18n=read('renderer/i18n.js'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(f.includes('empty.textContent=channels.length?'));
 assert.ok(f.includes('Chưa có kênh. Thêm nguồn M3U trong Quản lý nguồn để xem lịch phát sóng.'));
 assert.ok(f.includes('Không tìm thấy lịch khớp với kênh trong playlist.'));
 assert.ok(i18n.includes('positronEpgNoPlaylistLocales'));
 assert.ok(audit.includes('metrics.epgGuideEmptyText'));
 assert.ok(audit.includes("metrics.sourceCount==='0'"));
});


test('P5.1.55 no-channel EPG reload is disabled and restores safely with a playlist',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("epgReload.setAttribute('data-positron-epg-no-channels','true')"));
 assert.ok(js.includes("new MutationObserver(syncReloadAvailability).observe(epgChannelCount"));
 assert.ok(js.includes("epgReload.removeAttribute('data-positron-epg-no-channels')"));
 assert.ok(js.includes("if(!byId('epgLoadBtn')?.disabled)epgReload.disabled=false"));
 assert.ok(css.includes('#epgRefreshBtn:disabled[data-positron-epg-no-channels="true"]'));
 assert.ok(audit.includes('metrics.epgReloadAvailability?.disabled'));
 assert.ok(audit.includes('reload.released'));
 assert.ok(audit.includes('reload.restored'));
});

test('P5.1.55 empty-guide advanced tools are reversible and preserve native controls',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("epgPage.toggleAttribute('data-positron-no-epg-programmes',!hasProgrammes)"));
 assert.ok(js.includes('new MutationObserver(syncEpgToolVisibility).observe(epgSummary'));
 assert.ok(css.includes('#page-epg[data-positron-no-epg-programmes] :is(.epg-filter,.epg-advanced)'));
 assert.ok(audit.includes('epgToolVisibility:'));
 assert.ok(audit.includes('epgToolsReopened'));
 assert.ok(audit.includes('epgToolsCollapsedAgain'));
 const html=read('renderer/index.html');
 for(const id of ['epgSearch','epgGlobalSearch','epgSearchGo','epgManualMap','epgOffset','epgSettingsBtn'])assert.ok(html.includes('id="'+id+'"'),'native EPG control must be retained: '+id);
});

test('P5.1.55 hides duplicate empty EPG search guidance and refreshes when guide appears',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-epg[data-positron-no-epg-programmes] #epgSearchResults'));
 assert.ok(js.includes("if(hasProgrammes&&wasCollapsed&&epgPage.classList.contains('active-page'))"));
 assert.ok(js.includes("window.IPTVProAdvanced?.onPage?.('epg')"));
 assert.ok(audit.includes('searchResultsVisible:'));
 assert.ok(audit.includes('epgSearchUpdatedAfterGuide'));
 assert.ok(read('renderer/advanced.js').includes('function renderEpgSearch()'));
});

test('P5.1.58 Horizon eliminates duplicate Favorites title while keeping accessible DOM text',()=>{
 const css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('.po-v3.po-horizon #positronBar .p-heading strong[data-short-title]'));
 assert.ok(css.includes('font-size:0!important;line-height:0!important'));
 assert.ok(css.includes('content:attr(data-short-title)!important'));
 assert.ok(audit.includes("metrics.heading?.fontSize,'0px'"));
 assert.ok(audit.includes("metrics.heading?.nativeText,'Kênh yêu thích'"));
});

test('P5.1.59 Horizon scrollbars use muted teal instead of legacy purple',()=>{
 const css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('--iptv-scroll-thumb:#40736c'));
 assert.ok(css.includes('--iptv-scroll-track:#101a23'));
 assert.ok(css.includes('po-v3.po-horizon ::-webkit-scrollbar-thumb:hover'));
 assert.ok(audit.includes("metrics.horizonScrollbar?.thumb,'#40736c'"));
 assert.ok(audit.includes("includes('64, 115, 108')"));
});

test('P5.1.60 real Electron WatchFlow QA checks diversity of both initial and refreshed cards',()=>{
 const audit=read('scripts/positron-20-extension.cjs');
 const core=read('renderer/positron-watchflow-core.js');
 assert.ok(audit.includes('watchFlowQa.firstGroupCount,3'));
 assert.ok(audit.includes('watchFlowQa.secondGroupCount,3'));
 assert.ok(core.includes("normalize(item.group)||'__ungrouped__'"));
 assert.ok(core.includes('highest-18'),'diversification must protect score evidence priority');
});

test('P5.1.61 real populated folder headers cannot inherit white/purple legacy palettes',()=>{
 const css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('.channel-panel :is(.folder-header,.folder-header.active)'));
 assert.ok(css.includes('background:#173038!important;color:#8ee9d3!important'));
 assert.ok(audit.includes("metadataQa.groupHeaderStyle?.background,'rgb(23, 48, 56)'"));
 assert.ok(audit.includes("metadataQa.groupHeaderStyle?.color,'rgb(142, 233, 211)'"));
});

test('P5.1.62 actual Electron narrow and desktop CC toolbar uses Horizon palette not legacy lavender',()=>{
 const css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('.po-v3.po-horizon #page-tv .unified-ai-row .unified-ai-toggle'));
 assert.ok(css.includes('background:#19352f!important;border:1px solid #3c7e70!important'));
 assert.ok(css.includes('background:#70d8bf!important;color:#083126!important'));
 assert.ok(css.includes('--ui-primary:#67d4c0!important'));
 assert.ok(audit.includes("metrics.unifiedAiColors?.background,'rgb(25, 53, 47)'"));
 assert.ok(audit.includes("metrics.unifiedAiColors?.markBackground,'rgb(112, 216, 191)'"));
});

test('P5.1.69 native 720px Source tools stay in a single scrollable row',()=>{
 const css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-sources .sources-hub-nav{'));
 assert.ok(css.includes('flex-wrap:nowrap!important;overflow-x:auto!important'));
 assert.ok(audit.includes('navQa.verticalGap<=1'));
 assert.ok(audit.includes("navQa.scroll,'auto'"));
});

test('P5.1.70 Sources navigation reports the selected section to screen readers',()=>{
 const js=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("jump.setAttribute('aria-current','location')"));
 assert.ok(js.includes('sourceJumps.forEach(jump=>jump.addEventListener'));
 assert.ok(css.includes('button.po-source-jump-active'));
 assert.ok(qa.includes('navQa.selectedCount,1'));
 assert.ok(qa.includes('navQa.selectedAccent'));
});

test('P5.1.73 Discovery shows 4 native filters before the 3 actions and matches keyboard order',()=>{
 const html=read('renderer/index.html'),css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 const positions=['smartCatalog','smartCountry','smartLimit','smartWorkers','smartFind','smartVerify','smartCancel'].map(id=>html.indexOf('id="'+id+'"'));
 assert.ok(positions.every(x=>x>=0));
 assert.ok(positions.every((x,i)=>i===0||x>positions[i-1]),'DOM tab order should match visible filter/action order');
 assert.ok(css.includes('display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important'));
 assert.ok(css.includes('@media(max-width:1100px)'));
 assert.ok(css.includes('@media(max-width:540px)'));
 for(const check of ['fieldsAboveActions,true','siblingActions,true','noHorizontalOverflow,true','tabOrder,true'])assert.ok(audit.includes(check));
});

test('P5.1.73 EPG recording path is accessible, truncated visually and preserves native actions',()=>{
 const html=read('renderer/index.html'),css=read('renderer/positron-horizon-v4.css'),ui=read('renderer/positron-horizon-v4.js'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(html.includes('id="poDvrDirectoryLabel"'));
 assert.ok(html.includes('id="dvrDirectory" aria-labelledby="poDvrDirectoryLabel"'));
 assert.ok(html.includes('id="dvrChooseDir"'));
 assert.ok(css.includes('text-overflow:ellipsis!important'));
 assert.ok(css.includes('.po-dvr-directory strong'));
 assert.ok(ui.includes('new MutationObserver(syncDirectoryTitle)'));
 for(const k of ['folderQa.titled,true','folderQa.clipped,true','folderQa.buttonVisible,true','folderQa.rowAligned,true'])assert.ok(audit.includes(k));
});

test('P5.1.75 compact empty TV frees controls but loaded native video retains 16:9',()=>{
 const css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#playerBox:has(#emptyPlayer:not(.hidden))'));
 assert.ok(css.includes('aspect-ratio:auto!important'));
 assert.ok(css.includes('not(:has(:fullscreen))'));
 assert.ok(css.includes('body:has(#poWatchFlowPanel:not([hidden]))'));
 assert.ok(audit.includes('watchFlow.titleOffset<=-90'));

 assert.ok(css.includes('height:clamp(280px,calc(100dvh - 420px),430px)!important'));
 for(const t of ['emptyStage.compactHasRoom,true','emptyStage.nativeControlsReachable,true','emptyStage.preservesVideoRatio,true','emptyStage.restored,true'])assert.ok(audit.includes(t));
});

test('P5.1.76 Doctor hides empty analysis but restores full tools after native channels import',()=>{
 const css=read('renderer/positron-horizon-v4.css'),js=read('renderer/positron-horizon-v4.js'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-doctor[data-po-empty-doctor="true"]'));
 assert.ok(css.includes(':is(#doctorV3Panel,#doctorV2Panel)'));
 assert.ok(js.includes('const syncDoctorAvailability=()=>'));
 assert.ok(js.includes('window.IPTVState.getChannels().length===0'));
 for(const x of ['emptyDoctor.v3Hidden,true','emptyDoctor.v2Hidden,true','populatedDoctor.v3Visible,true','populatedDoctor.v2Visible,true'])assert.ok(qa.includes(x));
});

test('P5.1.77 Doctor screenshot QA locates real native onboarding button and verifies navigation',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const ui=read('renderer/positron-twenty.js');
 assert.ok(ui.includes("action.id='positronDoctorSources'"));
 assert.ok(ui.includes("window.IPTVState?.setPage?.('sources')"));
 assert.ok(qa.includes("document.getElementById('positronDoctorSources')"));
 assert.ok(qa.includes("doctorNavigation,'page-sources'"));
 assert.ok(!qa.includes("document.querySelector('#doctorReport button, #doctorReport a')"));
});

test('P5.1.78 Doctor onboarding hides only empty zero-statistics and restores native diagnostics',()=>{
 const css=read('renderer/positron-horizon-v4.css'),ui=read('renderer/positron-twenty.js'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-doctor[data-po-empty-doctor="true"] #doctorReport .doctor-metrics'));
 assert.ok(css.includes('.po-doctor-start-copy strong'));
 assert.ok(ui.includes("heading.textContent='Bắt đầu chẩn đoán với nguồn của bạn'"));
 assert.ok(ui.includes("action.id='positronDoctorSources'"));
 for(const statement of ['emptyDoctor.metricsHidden,true','populatedDoctor.metricsVisible,true'])assert.ok(qa.includes(statement));
});

test('P5.1.80 real media more-tools action uses SVG sliders, not unlabeled dots',()=>{
 const js=read('renderer/positron-fifty.js'),css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("stroke.setAttribute('d','M4 7h4m4 0h8M4 17h10m4 0h2')"));
 assert.ok(js.includes("tools.append(icon)"));
 assert.ok(js.includes("tools.addEventListener('click'"));
 assert.ok(css.includes('#positronToolsToggle::after{content:none!important}'));
 assert.ok(css.includes('#positronToolsToggle svg{'));
 for(const target of ['metrics.toolsToggle?.vector,true','disclosure.vectorAfterToggle,true'])assert.ok(audit.includes(target));
});

test('P5.1.82 450px channel chooser keeps three filters on one native row',()=>{
 const css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('.web-chooser-tabs{\n  display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important'));
 assert.ok(css.includes('.web-chooser-heading{\n  display:grid!important;grid-template-columns:minmax(0,1fr) auto!important'));
 for(const label of ['const chooserQa=await page.evaluate','chooserQa[key]','positron-p5-chooser-450-metadata-qa-real.png'])assert.ok(qa.includes(label));
});

test('P5.1.83 compact 450px player keeps fit, backup link and favorite on a native shared row',()=>{
 const css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr) 33px!important'));
 assert.ok(css.includes('.control-layout-bottom .manual-link-picker{'));
 assert.ok(css.includes('.control-layout-bottom .view-mode{'));
 assert.ok(qa.includes('chooserQa.playerRow.aligned,true'));
 assert.ok(qa.includes('chooserQa.playerRow.noOverflow,true'));
 assert.ok(qa.includes('chooserQa.playerRow.height<=145'));
});

test('P5.1.84 real empty TV sidebar offers native source import action',()=>{
 const js=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("window.IPTVState.getChannels().length>0"));
 assert.ok(js.includes("nativeChannelList.querySelector('.empty-list')"));
 assert.ok(js.includes("action.id='poEmptySourceAction'"));
 assert.ok(js.includes("window.IPTVState?.setPage?.('sources')"));
 assert.ok(css.includes('#channelList #poEmptySourceAction'));
 assert.ok(qa.includes("importedFromSidebar,'page-sources'"));
});

test('P5.1.88 populated native player replaces redundant import prompts with explicit start action',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes("start.id='poFirstChannelAction'"));
 assert.ok(ui.includes("start.addEventListener('click'"));
 assert.ok(ui.includes('window.IPTVState.playChannel(first.id)'));
 assert.ok(ui.includes('new MutationObserver(syncPlayerIntro)'));
 assert.ok(ui.includes("heading.textContent=hasChannels?'Chọn kênh để xem'"));
 assert.ok(ui.includes('fileAction.hidden=hasChannels&&!!first;urlAction.hidden=hasChannels&&!!first'),'import actions must remain when all known streams are unusable');
 assert.ok(css.includes('#poFirstChannelAction,#emptyFileBtn,#emptyUrlBtn'));
 assert.ok(qa.includes("populatedPlayerQa.title,'Chọn kênh để xem'"));
 assert.ok(qa.includes("populatedPlayerQa.noPlaying"));
 assert.ok(qa.includes('positron-p5188-player-ready-552-metadata-real.png'));
});

test('P5.1.89 native player status is synchronized without clobbering stop or playback messages',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes("const playerSubtitle=byId('playingSubtitle')"));
 assert.ok(ui.includes("if(playerSubtitle&&!window.IPTVState.getCurrent()?.id)"));
 assert.ok(ui.includes("text==='Nhập danh sách để bắt đầu'||text==='Chọn kênh để bắt đầu'"));
 assert.ok(ui.includes("playerSubtitle.textContent=hasChannels?'Chọn kênh để bắt đầu':'Nhập danh sách để bắt đầu'"));
 assert.ok(qa.includes("populatedPlayerQa.subtitle,'Chọn kênh để bắt đầu'"));
 assert.ok(qa.includes('positron-p5189-player-ready-subtitle-552-metadata-real.png'));
});

test('P5.1.90 Video Lab is contextual without removing controls or experimental settings',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes('const syncVideoLabAvailability=()=>'));
 assert.ok(ui.includes('trigger.hidden=!hasSelection'));
 assert.ok(ui.includes("const panel=byId('videoEnhancePanel');if(panel)panel.hidden=true"));
 assert.ok(ui.includes('new MutationObserver(syncVideoLabAvailability).observe(selectedTitle'));
 assert.ok(css.includes('#page-tv #videoEnhanceToggle[hidden]{display:none!important}'));
 assert.ok(qa.includes("videoLabAvailabilityQa[key],true"));
 assert.ok(qa.includes('visibleWithSelection'));
 assert.ok(qa.includes('positron-p5190-player-ready-video-lab-hidden-552-metadata-real.png'));
});


test('P5.1.108 mobile error toast stays outside 54px rail and inside viewport',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('html[data-positron="true"].po-horizon #toastArea.toast-area'));
 assert.ok(css.includes('left:66px!important;right:12px!important'));
 assert.ok(css.includes('pointer-events:none!important'));
 assert.ok(audit.includes('t.left>=sidebar.right+8'));
 assert.ok(audit.includes('t.right<=innerWidth-8'));
 assert.ok(audit.includes('positron-p51108-toast-clear-of-sidebar-450-real.png'));
 assert.ok(audit.includes('toastLayoutQA'));
});


test('P5.1.109 native toast deduplicates active identical messages but preserves severity and expiry',()=>{
 const src=read('renderer/app.js');
 const begin=src.indexOf(" function toast(message,type='ok'){");
 const end=src.indexOf('\n function setPage(',begin);
 assert.ok(begin>0&&end>begin,'native toast must remain available');
 const area={children:[],append(n){this.children.push(n);}};
 const callbacks=[];
 const document={createElement:()=>({dataset:{},className:'',textContent:'',remove(){const i=area.children.indexOf(this);if(i>=0)area.children.splice(i,1);}})};
 const factory=require('node:vm').runInNewContext('(function(document,$,setTimeout){'+src.slice(begin,end)+';return toast;})');
 const toast=factory(document,()=>area,fn=>callbacks.push(fn));
 toast('Xem sau đã lưu đủ','error');toast('Xem sau đã lưu đủ','error');
 assert.equal(area.children.length,1,'same active error must only appear once');
 toast('Xem sau đã lưu đủ','warn');toast('Kênh khác','error');
 assert.equal(area.children.length,3,'other type or message must remain visible');
 assert.equal(callbacks.length,3,'duplicate must not schedule an extra removal');
 callbacks[0]();assert.equal(area.children.length,2,'oldest notification expires');
 toast('Xem sau đã lưu đủ','error');assert.equal(area.children.length,3,'message can reappear after expiry');
});


test('P5.1.110 compact unplayed mobile player preserves the 28px SVG, CTA and native live aspect',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.110: Real P5.1.109 450px Electron screenshot'));
 assert.ok(css.includes('#playerBox:has(#emptyPlayer:not(.hidden))'));
 assert.ok(css.includes('height:174px!important'));
 assert.ok(css.includes('not(:has(:fullscreen))'));
 assert.ok(css.includes('display:flex!important;align-items:center!important;justify-content:center!important'));
 for(const check of ['videoUnmodified:Math.abs(live.width/live.height-16/9)<.08',
  'contentFits:title.top>=before.top-1','positron-p51110-compact-idle-player-450-real.png'])
  assert.ok(audit.includes(check),'native Electron idle-player audit missing '+check);
});


test('P5.1.111 category chips stay on a single keyboard-accessible horizontal line and retain native scroll',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const chooser=read('renderer/web-channel-chooser-v42371.js');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#webChooserGroups.web-chooser-chips'));
 assert.ok(css.includes('overflow-x:auto!important;overflow-y:hidden!important'));
 assert.ok(css.includes('flex:0 0 auto!important;white-space:nowrap!important'));
 assert.ok(chooser.includes('const previousChipsScroll=groups.scrollLeft;'));
 assert.ok(chooser.includes('groups.scrollLeft=previousChipsScroll;'));
 for(const check of ['retainsScroll=before>50&&after>=before-3',
  'oneRow=tabs.length>=9','positron-p51111-single-row-chips-450-real.png'])
  assert.ok(audit.includes(check),'missing native chip-rail regression '+check);
});


test('P5.1.111 narrow chooser advanced disclosure preserves source group and sort selects',()=>{
 const src=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(src.includes("chooserAdvanced.id='webChooserAdvanced'"));
 assert.ok(src.includes("chooserAdvanced.append(chooserAdvancedSummary)"));
 assert.ok(src.includes("[...filterControls.querySelectorAll('label')].forEach(label=>chooserAdvanced.append(label))"));
 assert.ok(src.includes("compactFilterMedia.addEventListener('change',syncAdvancedDisclosure)"));
 assert.ok(css.includes('.web-chooser-filters:has(#webChooserAdvanced[open])'));
 assert.ok(qa.includes("nativeControlsPreserved:group.closest('details')===details"));
 assert.ok(qa.includes('positron-p51111-compact-filters-450-real.png'));
});


test('P5.1.112 narrow native channel grid uses two readable columns without modifying list view',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.112: real P5.1.111 Electron 450px image'));
 assert.ok(css.includes('#webChooserGrid.web-chooser-grid:not(.list)'));
 assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'));
 assert.ok(css.includes('-webkit-line-clamp:2!important'));
 assert.ok(audit.includes('readableWidths:r.length>=2&&r[0].width>=145'));
 assert.ok(audit.includes('twoAcross:r.length===3'));
 assert.ok(audit.includes('positron-p51112-readable-channel-cards-450-real.png'));
});


test('P5.1.113 channel chooser tabs support ArrowLeft/Right/Home/End with one tab stop',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("chooserTabs.forEach(b=>b.setAttribute('aria-controls','webChooserGrid'))"));
 assert.ok(js.includes("b.tabIndex=active?0:-1"));
 assert.ok(js.includes("['ArrowLeft','ArrowRight','Home','End']"));
 assert.ok(js.includes("target.click();target.focus()"));
 assert.ok(audit.includes("const keyboardTabQA={arrowRight,end,home,wrap"));
 assert.ok(audit.includes("positron-p51113-keyboard-favorites-tab-450-real.png"));
});


test('P5.1.114 Favorites and Recent zero-state explains empty lists with a native return action',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("Chưa có kênh yêu thích. Nhấn biểu tượng sao"));
 assert.ok(js.includes("Chưa xem kênh nào gần đây."));
 assert.ok(js.includes("back.textContent='Xem tất cả kênh'"));
 assert.ok(js.includes("pageLabel.closest('.web-chooser-pager').hidden=pages<=1"));
 assert.ok(css.includes('.web-chooser-pager[hidden]{display:none!important}'));
 assert.ok(css.includes('.po-chooser-empty-action:focus-visible'));
 assert.ok(audit.includes("positron-p51114-favorite-empty-action-450-real.png"));
 assert.ok(audit.includes('emptyPagerHidden:pager?.hidden===true'));
});


test('P5.1.115 compact empty Favorites/Recent mini panels are hidden only when redundant',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("tab==='fav'&&!favoriteItems.length"));
 assert.ok(js.includes("tab==='recent'&&!recentItems.length"));
 assert.ok(css.includes('@media(max-width:650px)'));
 assert.ok(css.includes('.web-chooser-side section[data-po-duplicate-empty="true"]'));
 assert.ok(audit.includes('const duplicateEmptyQA={...duplicateFavoriteQA,favoriteRestored,recentHidden,recentRestored'));
 assert.ok(audit.includes('positron-p51115-no-duplicate-favorite-450-real.png'));
});


test('P5.1.116 category chips only include actual imported group labels and keep keyboard focus',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("const groupForChip=value=>groupNames.find(name=>"));
 assert.ok(js.includes("if(value!=='all'&&!match)continue"));
 assert.ok(js.includes("btn.setAttribute('aria-pressed',String(active))"));
 assert.ok(js.includes("x.dataset.poQuickGroup===value)?.focus({preventScroll:true})"));
 assert.ok(qa.includes("LOCAL QA CATEGORY META ONLY"));
 assert.ok(qa.includes("const kPlusAbsent=!labels.includes('K+')"));
 assert.ok(qa.includes("names.length===1&&names[0].includes('VTV QA')"));
 assert.ok(qa.includes("positron-p51116-real-category-filter-450-real.png"));
});


test('P5.1.117 450px single filtered channel fills row in a readable horizontal tile',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.117: actual P5.1.116 Electron 450px VTV-filter screenshot'));
 assert.ok(css.includes('>.web-chooser-card-wrap:only-child>button.web-chooser-card'));
 assert.ok(css.includes('grid-column:1/-1!important;min-height:84px!important'));
 assert.ok(css.includes('flex-direction:row!important;justify-content:flex-start!important'));
 assert.ok(qa.includes('const compactSingleQA={...singleResultQA,multipleCardsUnchanged}'));
 assert.ok(qa.includes('positron-p51117-single-result-wide-card-450-real.png'));
});


test('P5.1.118 main grid separates native play and favorite buttons with persistent save/rollback',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("if(compact)return card"));
 assert.ok(js.includes("frame.append(card)"));
 assert.ok(js.includes("frame.append(star)"));
 assert.ok(js.includes("favorites.toggle(s,ch)"));
 assert.ok(js.includes("if(!state.save?.())"));
 assert.ok(js.includes("s.favorites=oldUrls"));
 assert.ok(css.includes('#webChooserGrid .web-chooser-card-wrap'));
 assert.ok(css.includes('.web-chooser-favorite[aria-pressed="true"]'));
 assert.ok(qa.includes("positron-p51118-direct-favorite-channel-450-real.png"));
 assert.ok(qa.includes("persistedInStorage:Array.isArray(persisted.favoriteKeys)"));
});


test('P5.1.119 favorite count badge updates through native Favorites visibility after icon initialization',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.indexOf("const favCountBadge=document.createElement('span')")>js.indexOf('for(const [selector,label,paths] of chooserIconSpecs)'));
 assert.ok(js.includes("favCountBadge.textContent=String(favCount)"));
 assert.ok(js.includes("favCountBadge.hidden=favCount===0"));
 assert.ok(js.includes("favTabButton?.setAttribute('aria-label','Yêu thích, '+favCount+' kênh')"));
 assert.ok(css.includes('.po-favorite-count[hidden]'));
 assert.ok(qa.includes("positron-p51119-favorite-count-badge-450-real.png"));
 assert.ok(qa.includes("const favoriteCountQA={...badgeOnQA,...badgeOffQA}"));
});

test('P5.1.120 compact success toast remains visible without hiding warnings',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.120: Real P5.1.119 450px Electron screenshot'));
 assert.ok(css.includes('.toast:not(.err):not(.warn):has(~ .toast:not(.err):not(.warn))'));
 assert.ok(css.includes('display:none!important'));
 assert.ok(audit.includes('positron-p51120-compact-toast-stack-450-real.png'));
 assert.ok(audit.includes('onlyNewestVisible:shown.length===1'));
 assert.ok(audit.includes('warningVisible,successStillVisible'));
});

test('P5.1.121 native toast observer adds a real accessible close action',()=>{
 const script=read('renderer/positron-toast-dismiss.js');
 const css=read('renderer/positron-horizon-v4.css');
 const html=read('renderer/index.html');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.ok(html.includes('src="positron-toast-dismiss.js"'));
 assert.ok(script.includes('new MutationObserver('));
 assert.ok(script.includes("button.setAttribute('aria-label','Đóng thông báo / Dismiss notification')"));
 assert.ok(script.includes("button.addEventListener('click'"));
 assert.ok(script.includes('node.remove()'));
 assert.ok(css.includes('#toastArea.toast-area .toast .po-toast-dismiss'));
 assert.ok(css.includes('pointer-events:auto!important'));
 assert.ok(qa.includes('positron-p51121-toast-dismiss-visible-450-real.png'));
 assert.ok(qa.includes('clickedDismissed,keyboardDismissed'));
});


test('P5.1.122 native toast restores keyboard focus after dismissal',()=>{
 const src=read('renderer/positron-toast-dismiss.js'),qa=read('scripts/positron-20-extension.cjs');
 assert.doesNotThrow(()=>new vm.Script(src));
 assert.ok(src.includes("document.addEventListener('focusin'"));
 assert.ok(src.includes('!area.contains(target)'));
 assert.ok(src.includes("restore.focus({preventScroll:true})"));
 assert.ok(qa.includes("focusRestored:document.activeElement?.id==='webChooserSearch'"));
 assert.ok(qa.includes('positron-p51122-toast-focus-return-450-real.png'));
});


test('P5.1.123 routine success dock avoids channel cards without hiding warnings',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.123: The verified P5.1.122 450px Electron image'));
 assert.ok(css.includes('#toastArea.toast-area:not(:has(.toast.warn,.toast.err))'));
 assert.ok(css.includes('bottom:2px!important'));
 assert.ok(qa.includes('positron-p51123-success-toast-footer-450-real.png'));
 assert.ok(qa.includes('withinFooter:t.top>=f.top-3&&t.bottom<=f.bottom+2'));
 assert.ok(qa.includes('warningNotFooterDock'));
});

test('P5.1.124 compact category wheel navigation releases native page scroll at boundaries',()=>{
 const chooser=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const code of ["groups.addEventListener('wheel',event=>",
  "event.deltaMode===1?16:event.deltaMode===2?groups.clientWidth:1",
  "if(Math.abs(next-groups.scrollLeft)<.5)return;","event.preventDefault();","{passive:false}"])
  assert.ok(chooser.includes(code),'missing wheel guard '+code);
 assert.ok(css.includes('P5.1.124: Genuine P5.1.123 Electron 450px screenshot'));
 assert.ok(css.includes('scrollbar-color:rgba(106,150,147,.45) transparent!important'));
 for(const token of ['mouseWheelMoved:after.x-before.x>25',
  'boundaryReleasesPage:boundaryAllowed','positron-p51124-chip-wheel-450-real.png'])
  assert.ok(qa.includes(token),'missing native Electron QA '+token);
});

test('P5.1.125 compact All channels reset stays usable when category chips scroll',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.125: verified P5.1.124 actual 450px Electron after-image'));
 assert.ok(css.includes('#webChooserGroups.web-chooser-chips>.web-chooser-chip:first-child'));
 assert.ok(css.includes('position:sticky!important;left:8px!important;z-index:3!important'));
 for(const token of ['pinnedVisible:left.left>=rect.left-2',
  'allResetClearsGroup:','positron-p51125-pinned-all-450-real.png'])
  assert.ok(qa.includes(token),'missing native pinned-All verification '+token);
});

test('P5.1.126 pinned All reset blocks clipped underlying chip text and clicks',()=>{
 const css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.126: The real P5.1.125 450px Electron image'));
 assert.ok(css.includes('#webChooserGroups.web-chooser-chips>.web-chooser-chip:first-child::before'));
 assert.ok(css.includes('left:-22px!important;top:-6px!important;bottom:-6px!important'));
 assert.ok(css.includes('width:22px!important;background:#0a1b29!important'));
 assert.ok(css.includes('pointer-events:auto!important'));
 for(const token of ['maskOpaque:mask.backgroundColor===','maskCapturesTap:hit===all||all.contains(hit)','positron-p51126-pinned-all-masked-450-real.png'])
  assert.ok(qa.includes(token),'missing native Electron mask regression '+token);
});

test('P5.1.127 category keys navigate hidden chips without selecting until Enter',()=>{
 const src=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(src.includes("groups.addEventListener('keydown',event=>"));
 assert.ok(src.includes("['ArrowLeft','ArrowRight','Home','End'].includes(event.key)"));
 assert.ok(src.includes("target.focus({preventScroll:true})"));
 assert.ok(src.includes("target.scrollIntoView({block:'nearest',inline:'nearest'})"));
 for(const token of ['endFocus:last===document.activeElement','selectionUnchanged:!group.value',
  'homeFocus:first===document.activeElement','const enterApplied=await page.evaluate(',
  "enterReset:group.value===''",'positron-p51127-category-keys-450-real.png'])
  assert.ok(qa.includes(token),'missing genuine Electron category-key regression '+token);
});

test('P5.1.128 advanced group dropdown reveals corresponding active quick chip',()=>{
 const src=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(src.includes('P5.1.128: when the user selects a group from the native advanced dropdown'));
 assert.ok(src.includes("const active=groups.querySelector('button.web-chooser-chip.active')"));
 assert.ok(src.includes("if(!group.value)groups.scrollLeft=0"));
 assert.ok(src.includes("else active?.scrollIntoView({block:'nearest',inline:'nearest'})"));
 for(const token of ["exactSelectedGroup:select.value==='Tin tức'",
  "activeVisible:chipRect.right<=laneRect.right+1", "resetScroll:rail.scrollLeft<=1",
  "positron-p51128-dropdown-chip-450-real.png"])
  assert.ok(qa.includes(token),'missing genuine Electron dropdown-chip QA '+token);
});

test('P5.1.128 immutable Release notes remain below GitHub 125k maximum',()=>{
 const workflow=read('.github/workflows/positron-lab.yml');
 assert.ok(!workflow.includes('--notes-file POSITRON_P5_CHANGELOG.md'),'full growing changelog may exceed GitHub body size');
 assert.ok(workflow.includes('Full change history is included as POSITRON_P5_CHANGELOG.md in the Source ZIP asset'));
 assert.ok(workflow.includes('--prerelease --latest=false'));
});

test('P5.1.129 compact sticky reset masks trailing category glyph only when scrolled',()=>{
 const src=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(src.includes("groups.addEventListener('scroll',syncPinnedResetMask,{passive:true})"));
 assert.ok(src.includes("groups.classList.toggle('po-groups-scrolled',groups.scrollLeft>4)"));
 assert.ok(css.includes('P5.1.129: genuine P5.1.128 Electron 450px screenshot'));
 assert.ok(css.includes('.po-groups-scrolled>.web-chooser-chip:first-child::after'));
 assert.ok(css.includes('right:-18px!important'));
 assert.ok(qa.includes("resetClearsMask:rail.scrollLeft<=1"));
 assert.ok(qa.includes("masksGhostTap:hit===all||all.contains(hit)"));
 assert.ok(qa.includes('positron-p51129-right-mask-450-real.png'));
});

test('P5.1.130 real screenshot revealed clipped curved category border; scoped mask must not conceal next chip',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.130: after manually opening the ACTUAL P5.1.129 450px Electron'));
 assert.ok(css.includes('right:-30px!important;width:30px!important'));
 assert.ok(qa.includes('ghostStrokeNotClickable:behind===all||all.contains(behind)'));
 assert.ok(qa.includes('nextChipUnmasked:!!child&&!!n'));
 assert.ok(qa.includes('nextChipClickable:atNext===child||child?.contains(atNext)'));
 assert.ok(qa.includes('positron-p51130-border-mask-450-real.png'));
});

test('P5.1.131 Vietnamese ASCII search matches native group containing đ without changing playback',()=>{
 const src=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(src.includes('P5.1.131: Unicode NFD does NOT decompose Vietnamese'));
 assert.ok(src.includes(".toLocaleLowerCase().replace(/đ/g,'d')"));
 for(const token of ["await page.fill('#webChooserSearch','dia phuong')",
  "matchesVietnameseD:names.length===1&&names[0]==='TH QA 1'",
  "exactGroupOriginal:window.IPTVState.getChannels().some",
  "noAutoPlayAfterReset:window.IPTVState.getCurrent()===null",
  'positron-p51131-ascii-d-search-450-real.png',
  "await page.waitForFunction(()=>document.querySelectorAll('#webChooserGrid button.web-chooser-card').length===18"])
  assert.ok(qa.includes(token),'missing native Vietnamese search proof: '+token);
});

test('P5.1.132 actionable empty channel search restores all and input focus without autoplay',()=>{
 const chooser=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(chooser.includes("if(tab==='all'&&(search.value.trim()||group.value||onAirOnly.checked||soonOnly.checked))"));
 assert.ok(chooser.includes("clear.id='poChooserClearFilters'"));
 assert.ok(chooser.includes("search.value='';group.value='';onAirOnly.checked=false;soonOnly.checked=false;soonWindow.value='60';soonCaption.textContent='Sắp chiếu trong 60 phút (EPG)';soonWindowLabel.hidden=true;page=0;render();"));
 assert.ok(chooser.includes('search.focus({preventScroll:true})'));
 for(const t of ["await page.fill('#webChooserSearch','zz-no-channel')",
  "await page.click('#poChooserClearFilters')",
  'focusReturned:document.activeElement===document.getElementById',
  'noAutoplayAfterReset:window.IPTVState.getCurrent()===null',
  'positron-p51132-empty-search-clear-before-450-real.png',
  'positron-p51132-empty-search-clear-after-450-real.png'])
  assert.ok(qa.includes(t),'missing no-result recovery Electron proof '+t);
});

test('P5.1.133 compact multi-result channel titles wrap above native separate favorite control',()=>{
 const css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('P5.1.133: review of P5.1.132 genuine 450px Electron'));
 assert.ok(css.includes('min-height:142px!important;padding:10px 9px 49px!important'));
 assert.ok(css.includes('-webkit-line-clamp:2!important'));
 assert.ok(css.includes('right:calc(50% - 17px)!important'));
 for(const t of ['readableWithoutClipping:','noStarOverlap:',
  'separateStarHitArea:',"realLongTitle:title?.textContent.length>=14",
  'positron-p51133-compact-card-title-star-450-real.png'])
  assert.ok(qa.includes(t),'missing real compact card proof '+t);
});

test('P5.1.133 CI assertions use actual previous and current screenshot names',()=>{
 const wf=read('.github/workflows/positron-lab.yml');
 assert.ok(wf.includes('positron-p51132-empty-search-clear-before-450-real.png'));
 assert.ok(wf.includes('positron-p51132-empty-search-clear-after-450-real.png'));
 assert.ok(wf.includes('positron-p51133-compact-card-title-star-450-real.png'));
 assert.ok(!wf.includes('positron-p51133-empty-search-clear-before-450-real.png'));
});

test('P5.1.134 native vector Favorite stars retain aria and real CSS pressed state',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const t of ["document.createElementNS(svgNS,'svg')",
  "starSvg.setAttribute('aria-hidden','true')",
  "star.replaceChildren(starSvg)","star.setAttribute('aria-pressed',String(isFavorite))"])
  assert.ok(js.includes(t));
 assert.ok(css.includes('P5.1.134: native vector Favorite'));
 assert.ok(css.includes('.web-chooser-favorite[aria-pressed="true"] svg path'));
 for(const t of ['hollowWhenUnselected:', 'filledWhenSelected:', 'restoredHollow:',
   'positron-p51134-favorite-native-svg-before-450-real.png',
   'positron-p51134-favorite-native-svg-after-450-real.png'])
  assert.ok(qa.includes(t));
});

test('P5.1.134 NEW keyboard F on focused channel card toggles persistent Favorite without video',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("card.addEventListener('keydown',event=>"));
 assert.ok(js.includes("if(!/^[fF]$/.test(event.key)"));
 assert.ok(js.includes('fromFavoriteShortcut=true;star.click();'));
 assert.ok(js.includes('const replacementCard=restoreCardFocus'));
 for(const t of ['P5.1.134 NEW: press F on a focused native channel tile',
  "await page.keyboard.press('f')",
  'favoriteWithoutPlaying:', 'keyboardFocusPreserved:', 'restoredOriginalFavorite:',
  'positron-p51134-favorite-hotkey-f-450-real.png'])
  assert.ok(qa.includes(t),'missing real Electron keyboard Favorite proof: '+t);
});

test('P5.1.134 legacy direct Favorite regression checks native SVG fill instead of Unicode',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(qa.includes('starPressed:button?.getAttribute'), 'retain the pressed state assertion');
 assert.ok(qa.includes("getComputedStyle(button.querySelector('svg path')).fill!=='none'"), 'verify SVG selected fill');
 assert.ok(qa.includes('persistedInStorage:'), 'retain persistent Favorite assertion');
 assert.ok(qa.includes('keyboardFocus:'), 'retain keyboard focus assertion');
 assert.ok(!qa.includes("button.textContent==='★'"), 'reject stale font glyph assertion');
});

test('P5.1.135 tìm kênh nhiều từ không đúng thứ tự vẫn thuần local',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("normalize(search.value.trim()).split(/\\s+/).filter(Boolean)"));
 assert.ok(js.includes('terms.every(term=>searchable.includes(term))'));
 assert.ok(js.includes("normalize(c.name+' '+(c.group||''))"));
 assert.ok(!js.includes("normalize(c.name+' '+(c.group||'')).includes(q)"));
 for(const proof of ["await page.fill('#webChooserSearch','001 Channel QA')",
  'reorderedKeywordsFindChannel:', 'repeatedSpacesAccepted:', 'noAutoplay:',
  'positron-p51135-reordered-search-before-450-real.png',
  'positron-p51135-reordered-search-450-real.png'])
  assert.ok(qa.includes(proof),'Thiếu kiểm thử Electron: '+proof);
});

test('P5.1.135 tiêu đề Electron và sidebar đồng bộ phiên bản ứng dụng',()=>{
 const html=read('renderer/index.html'),pkg=JSON.parse(read('package.json'));
 assert.ok(html.includes('<title>Open IPTV Pro '+pkg.version+'</title>'),'tiêu đề cửa sổ phải khớp package');
 assert.ok(html.includes('<span class="version">'+pkg.version+'</span>'),'sidebar không được hiển thị phiên bản cũ');
});

test('P5.1.136 Enter khi tìm chỉ chọn kênh bằng focus, không phát ngay',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js'),qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["search.addEventListener('keydown',event=>","event.key!=='Enter'||event.isComposing","grid.querySelector('button.web-chooser-card')","first.focus({preventScroll:true})"])assert.ok(js.includes(token),token);
 for(const token of ["await page.keyboard.press('Enter')","focusMovedToMatch:","correctChannel:","queryPreserved:","noMatchKeepsSearchFocus:","noAutoplay:","positron-p51136-search-enter-before-450-real.png","positron-p51136-search-enter-after-450-real.png"])assert.ok(qa.includes(token),token);
});

test('P5.1.137 điều hướng thẻ kênh bằng mũi tên trong lưới/danh sách, không tự phát',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js'),qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["grid.addEventListener('keydown',event=>","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","target.focus({preventScroll:true})","target.scrollIntoView({block:'nearest',inline:'nearest'})"])
  assert.ok(js.includes(token),'Thiếu xử lý bàn phím: '+token);
 for(const token of ["gridRightSelectsSecond:","downKeepsColumn:","leftChangesColumn:","homeSelectsFirst:","endSelectsLast:","listDownSelectsNext:","noAutoplay:","positron-p51137-arrow-navigation-before-450-real.png","positron-p51137-arrow-navigation-after-450-real.png"])
  assert.ok(qa.includes(token),'Thiếu QA Electron: '+token);
});

test('P5.1.138 PageDown/PageUp chuyển trang kênh mà không tự phát',()=>{
 const ui=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["['PageDown','PageUp']","const destination=page+direction;","page=destination;render();","grid.setAttribute('aria-keyshortcuts','PageDown PageUp')"])assert.ok(ui.includes(token),token);
 for(const token of ["await page.keyboard.press('PageDown')","await page.keyboard.press('PageUp')","nextPageStartsAtNineteen:","previousPageLastFocused:","returnStillNoAutoplay:","positron-p51138-page-navigation-before-450-real.png","positron-p51138-page-navigation-after-450-real.png"])assert.ok(qa.includes(token),token);
});

test('P5.1.138 hồi quy: render mới không làm mất focus của thẻ kênh',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js'),qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes('const focusedCardId=grid.contains(document.activeElement)'));
 assert.ok(js.includes('restored?.focus({preventScroll:true})'));
 assert.ok(qa.includes("document.querySelector('#webChooserGrid .web-chooser-name')?.textContent==='QA Channel 001'"));
 assert.ok(qa.includes("assert.equal(nativeFocusReady,true"));
});

test('P5.1.139 tùy chọn yêu thích lên đầu chỉ sắp xếp hiển thị',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["favoriteFirstOption.value='fav-first'",
  "favoriteFirstOption.textContent='Yêu thích lên đầu'",
  "favoriteFirst=sort.value==='fav-first'",
  "favorites.has(saved,a)","favorites.has(saved,b)",
  "result=[...result].sort"])assert.ok(js.includes(token),token);
 for(const token of ["await page.selectOption('#webChooserSort','fav-first')",
  'channelsNotAltered:','favoritesBeforeOtherChannels:','noAutoplay:',
  'positron-p51139-favorites-first-before-450-real.png',
  'positron-p51139-favorites-first-after-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu Electron QA: '+token);
});

test('P5.1.140 lọc theo chương trình hiện tại chỉ từ EPG/XMLTV đã nhập',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/web-channel-chooser-v42371.css');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["onAirOnly.id='webChooserOnAirOnly'",
  "onAirOnly.addEventListener('change'","epg?.lookup(guide,c,clock,window.IPTVGuide)",
  "card.append(now)","onAirOnly.checked=false;soonOnly.checked=false;soonWindow.value='60';soonCaption.textContent='Sắp chiếu trong 60 phút (EPG)';soonWindowLabel.hidden=true;page=0;render();"])
  assert.ok(js.includes(token),'Thiếu hành vi EPG: '+token);
 assert.ok(css.includes('#page-tv #webChooserOnAirOnly'));
 assert.ok(css.includes('.web-chooser-onair-programme'));
 assert.ok(!/fetch\s*\(|XMLHttpRequest/.test(js),'Không tự tải lịch EPG hoặc stream');
 for(const token of ["await page.click('#webChooserOnAirOnly')",
  'onlyRealCurrentProgramme:','programmeLabel:','sourcesUnchanged:','noAutoplay:',
  'positron-p51140-epg-current-filter-before-450-real.png',
  'positron-p51140-epg-current-filter-after-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu QA Electron: '+token);
});

test('P5.1.141 hồi quy: sắp xếp yêu thích không thay playlist và nguồn đã lưu',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(qa.includes('const stored=window.IPTVState.getStore()'));
 assert.ok(qa.includes("stored.channels.map(ch=>JSON.stringify(["));
 assert.ok(qa.includes("stored.sources.map(s=>JSON.stringify(["));
 assert.ok(qa.includes('JSON.stringify(channelEntries)===JSON.stringify(original.channelEntries)'));
 assert.ok(qa.includes('sourceActivationUnchanged:JSON.stringify(sourceEntries)===JSON.stringify(original.sourceEntries)'));
 assert.ok(qa.includes('noAutoplay:window.IPTVState.getCurrent()===null'));
});

test('P5.1.141 tìm chương trình XMLTV đang chiếu bằng tên có dấu hoặc không dấu',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js'),qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["guideForSearch=window.IPTVExtras?.getGuide?.()",
  "window.PositronOnAirCore?.lookup(guideForSearch,c,searchClock,window.IPTVGuide)?.title",
  "normalize(c.name+' '+(c.group||''))+' '+normalize(currentProgramme)",
  "onAirOnly.checked?'Tìm kênh hoặc chương trình EPG…'"])
  assert.ok(js.includes(token),'Thiếu tìm chương trình theo XMLTV '+token);
 for(const token of ["await page.fill('#webChooserSearch','tin yeu thich')",
  'matchesProgrammeWithoutChannelKeywords:','programmeTitleIsFromXMLTV:',
  'sourceCountStable:','noAutoplay:',
  'positron-p51141-programme-title-search-before-450-real.png',
  'positron-p51141-programme-title-search-after-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu Electron QA '+token);
});

test('P5.1.142 chương trình tiếp theo và giờ hiển thị theo XMLTV cục bộ',()=>{
 const ui=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/web-channel-chooser-v42371.css');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["window.PositronOnAirCore?.upcoming(guide,ch,Date.now(),window.IPTVGuide)",
  "next.className='web-chooser-next-programme'",
  "toLocaleTimeString('vi-VN'", "next.textContent=(soonOnly.checked?'Sắp chiếu ':sort.value==='upcoming-first'?'Sắp tới ':'Tiếp theo ')+time+': '+upcoming.title"])
  assert.ok(ui.includes(token),'Thiếu thao tác chương trình tiếp theo: '+token);
 assert.ok(css.includes('.web-chooser-next-programme'));
 for(const token of ['upcomingFromRealLocalXMLTV:','upcomingShowsLocalClock:','noNextProgrammeWithoutOptIn:','noAutoplay:',
  'positron-p51142-next-programme-before-450-real.png','positron-p51142-next-programme-after-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu bằng chứng Electron: '+token);
});

test('P5.1.143 lọc XMLTV sắp chiếu trong giờ tới, tìm không dấu, không autoplay',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js'),css=read('renderer/web-channel-chooser-v42371.css');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["soonOnly.id='webChooserSoonOnly'","next.start-clock<=Number(soonWindow.value)*60000",
 "soonOnly.addEventListener('change'","if(soonOnly.checked)onAirOnly.checked=false",
 "if(onAirOnly.checked)soonOnly.checked=false","result=result.filter(c=>Boolean(startingSoon(guide,c,clock)))",
 "const soonProgramme=soonOnly.checked","soonOnly.checked=false;soonWindow.value='60';soonCaption.textContent='Sắp chiếu trong 60 phút (EPG)';soonWindowLabel.hidden=true;page=0;render();",
 "next.textContent=(soonOnly.checked?'Sắp chiếu '"])
 assert.ok(js.includes(token),'Thiếu logic XMLTV: '+token);
 assert.ok(css.includes('#page-tv #webChooserSoonOnly'));
 assert.ok(!/fetch\s*\(|XMLHttpRequest/.test(js),'Không tự tải chương trình trên mạng');
 for(const token of ['optInActive:','mutuallyExclusive:','futureOnlyChannel:',
 'findsUnaccentedFutureTitle:','noInventedCurrentTitle:','sourceRecordsUnchanged:',
 'noAutoplay:','noHorizontalOverflow:','onAirDisablesSoon:',
 'positron-p51143-soon-filter-before-450-real.png',
 'positron-p51143-soon-filter-after-450-real.png'])
 assert.ok(qa.includes(token),'Thiếu Electron QA '+token);
});

test('P5.1.143 kiểm tra nhãn EPG không bị bó cột tại Electron 450px',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("card.classList.add('po-epg-card')"));
 assert.ok(css.includes('grid-template-columns:58px minmax(0,1fr)!important'));
 for(const token of ['epgTitlesLegible:','epgRowsStacked:','futureTitleLegible:','futureRowBelowName:'])
  assert.ok(qa.includes(token),'Thiếu kiểm chứng rõ chữ: '+token);
});

test('P5.1.144 sắp xếp EPG sắp phát sớm nhất và không ẩn kênh chưa có lịch',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["earliestOption.value='upcoming-first'",
 "earliestOption.textContent='Chương trình sắp phát sớm nhất (EPG)'",
 "const earliestFirst=sort.value==='upcoming-first'",
 "window.PositronOnAirCore?.upcoming(sortGuide,c,sortClock,window.IPTVGuide)",
 "nextStartCache.set(key,Number.isFinite(upcoming?.start)?upcoming.start:Infinity)",
 "if(first!==second)return first<second?-1:1",
 "sort.value==='upcoming-first'?'Sắp tới '"])
  assert.ok(js.includes(token),'Thiếu sắp xếp EPG sớm nhất '+token);
 for(const token of ['selectedRealEpgSort:','upcomingSoonestFirst:','unknownEpgNotLost:',
 'earlyTitleFromXMLTV:','laterTitleFromXMLTV:','sourceRecordsUnchanged:',
 'alphabeticalUndoRestored:','noAutoplay:',
 'positron-p51144-earliest-epg-before-450-real.png','positron-p51144-earliest-epg-after-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu QA Electron P144 '+token);
});

test('P5.1.145 chọn mốc chương trình sắp chiếu 15, 30 và 60 phút',()=>{
 const ui=read('renderer/web-channel-chooser-v42371.js'),css=read('renderer/web-channel-chooser-v42371.css');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["soonWindow.id='webChooserSoonWindow'",
 "for(const minutes of [15,30,60])",
 "next.start-clock<=Number(soonWindow.value)*60000",
 "soonWindow.addEventListener('change'",
 "soonCaption.textContent='Sắp chiếu trong '+soonWindow.value+' phút (EPG)'",
 "soonWindowLabel.hidden=!soonOnly.checked"])
  assert.ok(ui.includes(token),'Thiếu chức năng chọn thời gian '+token);
 assert.ok(css.includes('.web-chooser-soon-window[hidden]'));
 for(const token of ['fifteenMinuteWindowEmpty:','thirtyMinuteMatchesOnlyOne:',
 'sixtyMinuteRestoresBoth:','durationHiddenWhenOff:','actionableRecovery:',
 'localPlaylistUnchanged:','noAutoplay:','noHorizontalOverflow:',
 'positron-p51145-time-window-before-450-real.png','positron-p51145-time-window-after-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu kiểm thử Electron '+token);
});

test('P5.1.146 tiến độ chương trình hiện tại từ EPG cục bộ, không phát stream',()=>{
 const core=read('renderer/positron-onair-core.js');
 const ui=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/web-channel-chooser-v42371.css');
 const qa=read('scripts/positron-20-extension.cjs');
 for(const token of ["function scheduleProgress(item,clock=Date.now())",
  "Math.floor(100*(clock-item.start)/(item.end-item.start))", "start:item.start",
  "Object.freeze({lookup,upcoming,scheduleProgress})"])
   assert.ok(core.includes(token),'Thiếu tính phần trăm lịch XMLTV: '+token);
 for(const token of ["window.PositronOnAirCore?.scheduleProgress(item,Date.now())",
  "track.className='web-chooser-epg-progress'",
  "fill.style.width=timeline.percent+'%'",
  "remaining.textContent='Theo lịch EPG: '+timeline.percent+'% · còn '+timeline.remainingMinutes+' phút'"])
   assert.ok(ui.includes(token),'Thiếu nhãn tiến độ: '+token);
 assert.ok(css.includes('.web-chooser-epg-progress'));
 for(const token of ['const scheduleProgressQA=','percentApproximatelyHalf:','showsRemainingMinutes:',
  'progressAfterProgramme:','noProgressWithoutOptIn:','noAutoplay:',
  'positron-p51146-epg-progress-before-450-real.png','positron-p51146-epg-progress-after-450-real.png'])
   assert.ok(qa.includes(token),'Thiếu ảnh kiểm thử Electron: '+token);
});

test('P5.1.147 chuông nhắc XMLTV trong bộ chọn kênh sử dụng dịch vụ nhắc lịch có thật',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js'),css=read('renderer/positron-horizon-v4.css');
 const qa=read('scripts/positron-20-extension.cjs');
 assert.ok(js.includes("reminder.className='web-chooser-remind'"));
 assert.ok(js.includes("const remind=window.IPTVProAdvanced?.remind"));
 assert.ok(js.includes("remind({id:next.id,title:next.title,start:next.start},ch)"));
 assert.ok(css.includes('.web-chooser-card-wrap>.web-chooser-remind'));
 for(const token of ['addedOnce:','correctChannel:','noDuplicateReminder:','noAutoplay:',
  'positron-p51147-epg-reminder-before-450-real.png',
  'positron-p51147-epg-reminder-after-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu Electron QA '+token);
});

test('P5.1.148 hủy nhắc lịch EPG độc lập, biểu tượng phản ánh trạng thái lưu',()=>{
 const adv=read('renderer/advanced.js'),ui=read('renderer/web-channel-chooser-v42371.js');
 const css=read('renderer/positron-horizon-v4.css'),qa=read('scripts/positron-20-extension.cjs');
 for(const token of ['const hasReminder=p=>','function cancelReminder(p)',"state.reminders.splice(at,1);save()",
  'doctor,playCatchup,remind,hasReminder,cancelReminder'])
  assert.ok(adv.includes(token),'Thiếu tính năng hủy nhắc '+token);
 for(const token of ["reminder.setAttribute('aria-pressed',String(reminderActive))",
  "if(hasReminder(item))cancelReminder(item)","reminder.setAttribute('aria-pressed',String(saved))"])
  assert.ok(ui.includes(token),'Thiếu trạng thái nút '+token);
 assert.ok(css.includes('.web-chooser-remind[aria-pressed="true"]'));
 for(const token of ['localSavedOnce:','canceledOnlyMatchingReminder:','cancelIndicatorReset:',
  'noPlaybackAfterCancel:','positron-p51148-cancel-reminder-before-450-real.png',
  'positron-p51148-cancel-reminder-after-450-real.png',
  'positron-p51148-cancel-reminder-canceled-450-real.png'])
  assert.ok(qa.includes(token),'Thiếu kiểm thử Electron '+token);
});
