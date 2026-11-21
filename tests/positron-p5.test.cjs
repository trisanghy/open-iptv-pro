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
 assert.equal(pkg.version,'4.23.137');
 const label=pkg.description.match(/Positron\s+(P\d+\.\d+\.\d+)/)?.[1];
 assert.ok(label,'product P-label must accompany SemVer');
 assert.ok(flow.includes('TAG=positron/v'+pkg.version+'-'+label.toLowerCase()),'release tag and app version must match');
 assert.ok(read('scripts/positron-50-audit.cjs').includes('runTwenty(page)'));
 assert.ok(flow.includes('Positron-P5153-20-Real-Screenshots.zip'));
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


test('P5.1.53 no-channel EPG reload is disabled and restores safely with a playlist',()=>{
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

test('P5.1.53 empty-guide advanced tools are reversible and preserve native controls',()=>{
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

test('P5.1.53 hides duplicate empty EPG search guidance and refreshes when guide appears',()=>{
 const js=read('renderer/positron-twenty.js'),css=read('renderer/positron-twenty.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('#page-epg[data-positron-no-epg-programmes] #epgSearchResults'));
 assert.ok(js.includes("if(hasProgrammes&&wasCollapsed&&epgPage.classList.contains('active-page'))"));
 assert.ok(js.includes("window.IPTVProAdvanced?.onPage?.('epg')"));
 assert.ok(audit.includes('searchResultsVisible:'));
 assert.ok(audit.includes('epgSearchUpdatedAfterGuide'));
 assert.ok(read('renderer/advanced.js').includes('function renderEpgSearch()'));
});
