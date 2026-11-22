'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('P5.1.226 ships visible accessible numeric channel jump without playback',()=>{
 const html=read('renderer/index.html'),js=read('renderer/positron-channel-jump.js');
 assert.ok(html.includes('positron-channel-jump.css'));
 assert.ok(html.includes('positron-channel-jump.js'));
 for(const fragment of ["toggle.id='poChannelJumpToggle'","panel.id='poChannelJumpPanel'","state.getChannels()",
  "all.click()","expandFolderBtn","list.scrollTop+=","target.focus({preventScroll:true})",
  "event.key==='Enter'","event.key==='Escape'"])
  assert.ok(js.includes(fragment),'Missing native channel jump: '+fragment);
 assert.ok(!js.includes('playChannel('),'Jump must never call playback');
 assert.ok(!js.includes('store.channels=')&&!js.includes('save()'),'Jump cannot reorder playlist');
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=311,'P226 numeric jump must remain covered');
});
test('P5.1.226 real Electron image and list focus are checked in CI',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),flow=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51226-channel-jump-before-1920x1080-real.png','positron-p51226-channel-jump-after-1920x1080-real.png']){
  assert.ok(qa.includes("await page.screenshot({path:path.join(out,'"+name+"'"));
  assert.ok(flow.includes(name));
 }
 assert.ok(qa.includes('focused250:active===row'));
 assert.ok(qa.includes('stillNotPlaying:'));
 assert.ok(qa.includes('focusReturned:'));
});

test('P5.1.230 keyboard group hopping does not play or reorder channels',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ["'ArrowLeft','ArrowRight'","const groupBoundaryTarget=",
  ".folder-header","nextElementSibling","rows.indexOf(groupBoundaryTarget(",
  "event.key==='ArrowRight'?1:-1","groupMove?'Đã chuyển nhóm. '"])
  assert.ok(js.includes(token),'Missing P230 behavior: '+token);
 assert.ok(!js.includes('playChannel('),'No autoplay allowed');
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=315,'P230 group traversal must survive subsequent versions');
});
test('P5.1.230 checks left/right transitions in real 16:9 Electron screenshots',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const flow=read('.github/workflows/positron-lab.yml');
 for(const filename of ['positron-p51230-group-navigation-before-1920x1080-real.png',
  'positron-p51230-group-navigation-after-1920x1080-real.png']){
  assert.ok(qa.includes(filename));
  assert.ok(flow.includes(filename));
 }
 for(const token of ["page.keyboard.press('ArrowRight')","page.keyboard.press('ArrowLeft')",
  'nextGroupFocused:','firstGroupFocused:','noAutoplay:','noHorizontalOverflow:'])
  assert.ok(qa.includes(token));
});

test('P5.1.231 opens native folder picker with Alt+G and does not play a stream',()=>{
 const ui=read('renderer/positron-channel-jump.js');
 for(const key of ["groupRow.id='poChannelGroupRow'","const visibleHeaders=",
  "const groupSelect=","function refreshGroups(){","function jumpGroup(){",
  "groupGo.addEventListener('click',jumpGroup)","header.click();",
  "target.focus({preventScroll:true})","event.key.toLowerCase()==='g'",
  "groupSelect.setAttribute('aria-keyshortcuts','Alt+G')"])
  assert.ok(ui.includes(key),'Missing direct folder picker behavior: '+key);
 assert.ok(!ui.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=316,'P231 direct folder picker must survive later versions');
});
test('P5.1.231 requires real Electron group picker screenshots and focus/scroll QA',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const flow=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51231-group-picker-before-1920x1080-real.png',
  'positron-p51231-group-picker-after-1920x1080-real.png']){
  assert.ok(qa.includes(name),'Missing screenshot QA '+name);
  assert.ok(flow.includes(name),'Missing workflow verification '+name);
 }
 for(const key of ["page.keyboard.press('Alt+g')",
  "page.locator('#poChannelGroupSelect').selectOption({index:2})",
  'selectedGroupFocused:','noAutoplay:','noHorizontalOverflow:','labelNotOverlapping:','buttonNotOverlapping:'])
  assert.ok(qa.includes(key),'Missing P231 Electron QA '+key);
});

test('P5.1.232 local filter finds named groups without touching playback',()=>{
 const ui=read('renderer/positron-channel-jump.js');
 for(const token of ["searchRow.id='poChannelGroupSearchRow'","const normalizeGroup=",
  "function filterGroups(){","groupSearch.addEventListener('input',filterGroups)",
  "matchCount.textContent=filtered.length+'/'+groups.length",
  "groupSearch.focus()","groupGo.disabled=!filtered.length"])
  assert.ok(ui.includes(token),'P232 missing native group filter '+token);
 assert.ok(!ui.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=317,'P232 search feature must survive later versions');
});
test('P5.1.232 captures real Electron group search before/after with overflow and no autoplay checks',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const flow=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51232-group-search-before-1920x1080-real.png',
 'positron-p51232-group-search-after-1920x1080-real.png']){
  assert.ok(qa.includes(name));assert.ok(flow.includes(name));
 }
 for(const token of ["page.locator('#poChannelGroupSearch').fill('other')",
  "page.locator('#poChannelGroupGo').click()","filteredToOne:","selectedGroupFocused:",
  "noAutoplay:","labelNotOverlapping:","noHorizontalOverflow:"])
  assert.ok(qa.includes(token));
});

test('P5.1.233 stores bounded in-session folder navigation history, no autoplay',()=>{
 const ui=read('renderer/positron-channel-jump.js');
 for(const token of ["const groupHistory=[];","let returningToHistory=false;",
  "focusList?.addEventListener('focusin'","backRow.id='poChannelGroupHistoryRow'",
  "backButton.addEventListener('click'","groupHistory.push(lastFocusedGroup)",
  "if(groupHistory.length>10)groupHistory.shift()","returningToHistory=true;",
  "groupSelect.value=previous","target.focus({preventScroll:true})"])
  assert.ok(ui.includes(token),'Missing P233 group history: '+token);
 assert.ok(!ui.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=318);
});
test('P5.1.233 validates real Electron history jump with screenshot and unchanged media',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const flow=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51233-group-history-before-1920x1080-real.png',
 'positron-p51233-group-history-after-1920x1080-real.png']){
  assert.ok(qa.includes(name));assert.ok(flow.includes(name));
 }
 for(const token of ["page.locator('#poChannelGroupBack').click()",
  "historyButtonVisible:","returnedToPreviousGroup:","noAutoplay:",
  "noHorizontalOverflow:"])
  assert.ok(qa.includes(token));
});


test('P5.1.234 normalizes uppercase Vietnamese Đ in real group filter helper',()=>{
 const source=read('renderer/positron-channel-jump.js').match(/const normalizeGroup=value=>[\s\S]*?\.trim\(\);/);
 assert.ok(source);
 const normalizeGroup=vm.runInNewContext(source[0]+'\nnormalizeGroup');
 for(const [label,expected] of [
  ['ĐÀI TRUYỀN HÌNH','dai truyen hinh'],['Đại chúng','dai chung'],
  ['đài địa phương','dai dia phuong'],['  Nhóm ÁNH SÁNG  ','nhom anh sang']])
  assert.equal(normalizeGroup(label),expected,label);
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=319);
});
test('P5.1.234 requires real Electron screenshots and non-playback Vietnamese folder QA',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),workflow=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51234-vietnamese-group-before-1920x1080-real.png','positron-p51234-vietnamese-group-after-1920x1080-real.png']){
  assert.ok(qa.includes(name),'QA screenshot absent: '+name);
  assert.ok(workflow.includes(name),'Workflow screenshot absent: '+name);
 }
 for(const token of ['ĐÀI TRUYỀN HÌNH',"fill('dai truyen hinh')",'oneMatch:','uppercaseDMatches:','noAutoplay:','noHorizontalOverflow:'])
  assert.ok(qa.includes(token),'QA assertion absent: '+token);
});


test('P5.1.235 group Back history never retains duplicate or self-reference',()=>{
 const source=read('renderer/positron-channel-jump.js');
 for(const token of [
  'groupHistory[groupHistory.length-1]===lastFocusedGroup',
  'const existing=groupHistory.indexOf(lastFocusedGroup);',
  'groupHistory.splice(existing,1)',
  'if(candidate===lastFocusedGroup)continue;',
  'groupHistory.push(lastFocusedGroup);'
 ])assert.ok(source.includes(token),'Missing self-history guard: '+token);
 assert.ok(!source.includes('playChannel('),'History must not autoplay');
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=320);
});
test('P5.1.235 real Electron checks Back button and no duplicate focused folder',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const wf=read('.github/workflows/positron-lab.yml');
 for(const file of [
  'positron-p51235-history-dedupe-before-1920x1080-real.png',
  'positron-p51235-history-dedupe-after-1920x1080-real.png']){
  assert.ok(qa.includes(file),'Missing Electron screenshot: '+file);
  assert.ok(wf.includes(file),'Workflow must check '+file);
 }
 for(const token of ['noSelfReference:', 'returnedToPreviousGroup:', 'noAutoplay:', 'noHorizontalOverflow:', 'historyButtonHidden:'])
  assert.ok(qa.includes(token),'Missing P235 QA assertion: '+token);
});


test('P5.1.236 enables redo of previously visited group after pressing Back',()=>{
 const code=read('renderer/positron-channel-jump.js'),styles=read('renderer/positron-channel-jump.css');
 for(const token of [
  'const forwardGroups=[];',
  'forwardButton.addEventListener(\'click\'',
  'forwardGroups.push(from);',
  'forwardGroups.length=0;',
  'forwardButton.hidden=!forwardGroups.length;',
  'backButton.hidden=!groupHistory.length;',
  'returningToHistory=true;'
 ])assert.ok(code.includes(token),'Missing P236 forward group action '+token);
 assert.ok(styles.includes('#poChannelGroupForward[hidden]'),'Native hidden state must not be overridden by styling');
 assert.ok(!code.includes('playChannel('),'Back/forward cannot autoplay');
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=321);
});
test('P5.1.236 validates real Electron group forward before/after and no autoplay',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),flow=read('.github/workflows/positron-lab.yml');
 for(const file of ['positron-p51236-group-forward-before-1920x1080-real.png',
  'positron-p51236-group-forward-after-1920x1080-real.png']){
  assert.ok(qa.includes(file),file);
  assert.ok(flow.includes(file),'Missing P236 workflow image '+file);
 }
 for(const token of ['forwardAvailable:', 'returnedToRecentGroup:', 'noAutoplay:',
    'noHorizontalOverflow:', 'forwardConsumed:'])
  assert.ok(qa.includes(token),token);
});


test('P5.1.237 Alt+ArrowLeft/Right keyboard history never starts playback',()=>{
 const code=read('renderer/positron-channel-jump.js');
 for(const token of [
  "const historyShortcut=event=>",
  "'Alt+ArrowLeft'",
  "'Alt+ArrowRight'",
  "event.key==='ArrowLeft'?backButton:forwardButton",
  "if(historyShortcut(event))return;",
  "event.target?.closest?.('input,textarea,select,[contenteditable",
  "event.preventDefault();",
  "control.click();"
 ])assert.ok(code.includes(token),'P237 keyboard shortcut implementation missing '+token);
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=322);
});
test('P5.1.237 tests real Electron keyboard group navigation screenshots',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),flow=read('.github/workflows/positron-lab.yml');
 for(const file of ['positron-p51237-keyboard-history-before-1920x1080-real.png',
 'positron-p51237-keyboard-history-after-1920x1080-real.png']){
  assert.ok(qa.includes(file));assert.ok(flow.includes(file));
 }
 for(const token of ["page.keyboard.press('Alt+ArrowLeft')","page.keyboard.press('Alt+ArrowRight')",
 'keyboardBackWorks:', 'keyboardForwardWorks:', 'noAutoplay:','noHorizontalOverflow:'])
  assert.ok(qa.includes(token),token);
});
test('P5.1.237 installer builds may parallelize capture only after tests pass',()=>{
 const w=read('.github/workflows/positron-lab.yml');
 assert.match(w,/\n  build:\n    needs: \[test\]/);
 assert.match(w,/\n  release:\n    needs: \[test, capture, build\]/);
});


test('P5.1.238 keeps Alt+J / Alt+G inside editable controls without opening channel jump',()=>{
 const code=read('renderer/positron-channel-jump.js');
 const check=code.slice(code.indexOf(" d.addEventListener('keydown',event=>{"));
 assert.ok(check.includes("event.defaultPrevented||event.isComposing"),'respect handled keys and IME');
 assert.ok(check.includes("[contenteditable]:not([contenteditable="),'editable regions protected');
 assert.ok(check.includes("[role=\"textbox\"]"),'custom text editor protected');
 assert.ok(check.includes("event.target?.closest?.('input,textarea,select"),'native input and select protected');
 assert.ok(!code.includes('playChannel('),'keyboard navigation must never start playback');
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=323);
});
test('P5.1.238 captures real Electron blocked and allowed Alt+J screenshots',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const workflow=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51238-shortcut-guard-before-1920x1080-real.png','positron-p51238-shortcut-guard-after-1920x1080-real.png']){
  assert.ok(qa.includes(f),'missing QA capture '+f);
  assert.ok(workflow.includes(f),'missing workflow screenshot check '+f);
 }
 for(const token of ["page.keyboard.press('Alt+j')","page.keyboard.press('Alt+g')",'inputRetainsFocus:','panelStayedClosed:','jumpOpenedOutsideInput:','noAutoplay:'])
  assert.ok(qa.includes(token),'missing P238 QA assertion '+token);
});

test('P5.1.239 Escape closes channel jump with native row focus, no playback',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const fragment of ["event.key==='Escape'&&!panel.hidden","row instanceof HTMLElement&&row.matches('.channel-item')",
 "event.preventDefault();event.stopPropagation();","setOpen(false);","if(row.isConnected)row.focus({preventScroll:true});"])
 assert.ok(js.includes(fragment),'Missing Escape behavior: '+fragment);
 assert.ok(!js.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=324);
});
test('P5.1.239 requires Electron Escape before/after and focus assertions',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const fn of ['positron-p51239-escape-jump-before-1920x1080-real.png','positron-p51239-escape-jump-after-1920x1080-real.png']){
  assert.ok(qa.includes(fn));assert.ok(wf.includes(fn));
 }
 for(const token of ["page.keyboard.press('Escape')","panelClosedAfterEscape:","rowFocusRetained:","noAutoplay:"])
  assert.ok(qa.includes(token),'Missing P239 Electron assertion: '+token);
});

test('P5.1.240 Shift+F cycles the native favorite filter without toggling any star',()=>{
 const source=read('renderer/positron-channel-jump.js');
 for(const fragment of ["const quickFavorites=","!event.shiftKey&&!event.ctrlKey",
  "if(quickFavorites){","(returnToAll?all:fav).click();","first||d.getElementById('searchBox')",
  "Đang lọc các kênh yêu thích"])
  assert.ok(source.includes(fragment),'Missing Shift+F filter: '+fragment);
 assert.ok(!source.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=325);
});
test('P5.1.240 demands real Electron favorite-filter screenshots and unchanged data',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51240-shift-favorites-before-1920x1080-real.png',
 'positron-p51240-shift-favorites-after-1920x1080-real.png']){
  assert.ok(qa.includes(name));assert.ok(wf.includes(name));
 }
 for(const token of ["page.keyboard.press('Shift+F')","favoriteFilterQA240","favoriteFilterRestoreQA240",
  "favoritesUnchanged:","favoriteFilterActive:","allFilterRestored:","noAutoplay:"])
  assert.ok(qa.includes(token),'Missing P240 Electron QA '+token);
});

test('P5.1.241 native favorite-filter chip shows mode and clears with all-tab, not data edits',()=>{
 const js=read('renderer/positron-channel-jump.js'),css=read('renderer/positron-channel-jump.css');
 for(const token of ["chip.id='poFavoriteFilterChip'","searchArea.after(chip)","new MutationObserver(syncFavoriteChip)",
  "chip.addEventListener('click'","filter-tab[data-filter=\"all\"]","Xem tất cả","channelMeta"])
  assert.ok(js.includes(token),'P241 chip implementation missing '+token);
 assert.ok(css.includes('#poFavoriteFilterChip[hidden]'));
 assert.ok(css.includes('#poFavoriteFilterChip:focus-visible'));
 assert.ok(!js.includes('playChannel('));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=326);
});
test('P5.1.241 asserts real Electron before/after and favorite chip clear',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51241-favorite-chip-before-1920x1080-real.png','positron-p51241-favorite-chip-after-1920x1080-real.png']){
  assert.ok(qa.includes(f));assert.ok(wf.includes(f));
 }
 for(const token of ["favoriteChipQA241","favoriteChipClearQA241","chipVisible:","chipFitsPanel:","favoritesUnchanged:","chipHidden:","noAutoplay:"])
  assert.ok(qa.includes(token),'Missing P241 Electron screenshot QA '+token);
});

test('P5.1.242 chip identifies every hidden channel filter and recovers empty history',()=>{
 const js=read('renderer/positron-channel-jump.js'),css=read('renderer/positron-channel-jump.css');
 for(const token of ["const activeTab=[...d.querySelectorAll('#page-tv .filter-tab')]",
  "const mode=activeTab?.dataset.filter||'all'","chip.dataset.mode=mode",
  "chip.hidden=mode==='all'","label.textContent=title+' · '+count",
  "filter-tab[data-filter=\"all\"]"])
  assert.ok(js.includes(token),'P242 missing generalized active filter: '+token);
 assert.ok(css.includes('#poFavoriteFilterChip[data-mode="recent"]'));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=327);
});
test('P5.1.242 verifies native Electron recent-filter indicator and clear action',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51242-recent-filter-before-1920x1080-real.png','positron-p51242-recent-filter-after-1920x1080-real.png']){
  assert.ok(qa.includes(f));assert.ok(wf.includes(f));
 }
 for(const t of ['recentFilterQA242','recentFilterClearQA242','recentChipVisible:','recentNameVisible:',
  'chipFitsPanel:','favoritesUnchanged:','allTabActive:','noAutoplay:'])
  assert.ok(qa.includes(t),'P242 UI regression '+t);
});

test('P5.1.243 Shift+R toggles recent filter from rows and empty recent chip',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ["const quickRecent=","if(quickRecent){","chip.setAttribute('aria-keyshortcuts','Shift+R')",
  "event.target===d.getElementById('poFavoriteFilterChip')","Nhấn Shift+R để xem tất cả",
  "chip.hidden=false;chip.focus({preventScroll:true});"])
  assert.ok(js.includes(token),'P243 recent shortcut missing '+token);
 assert.ok(!js.includes('playChannel('));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.243 requires real Electron Shift+R screenshots and round-trip state',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51243-keyboard-recent-before-1920x1080-real.png','positron-p51243-keyboard-recent-after-1920x1080-real.png']){
  assert.ok(qa.includes(f));assert.ok(wf.includes(f));
 }
 for(const t of ['keyboardRecentQA243','keyboardRecentReturnQA243','page.keyboard.press(\'Shift+R\')',
  'recentChipFocused:','allChannelsRestored:','favoritesUnchanged:','noAutoplay:'])
  assert.ok(qa.includes(t),'P243 QA missing '+t);
});

test('P5.1.244 direct digits open channel jump and preserve player',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const t of ['// P244: direct numeric jump','/^[0-9]$/.test(event.key)',"event.target.matches('.channel-item')",'number.value=event.key'])
  assert.ok(js.includes(t),'P244: '+t);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.244 real Electron numeric scenario is required',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51244-direct-number-before-1920x1080-real.png','positron-p51244-direct-number-after-1920x1080-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),'P244 file '+f);
 for(const t of ['numericStartQA244','numericFinalQA244',"page.keyboard.press('4')","page.keyboard.type('12')",'focusedIndex412:','noAutoplay:'])
  assert.ok(qa.includes(t),'P244 QA '+t);
});

test('P5.1.245 focuses the correct group in the native picker, not a stale folder',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const t of ['// P245: follow the focused row', 'const syncFocusedGroupToPicker=', 'groupSelect.value=lastFocusedGroup;', 'syncFocusedGroupToPicker();'])
  assert.ok(js.includes(t),'P245 code absent '+t);
 assert.ok(!js.includes('playChannel('));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.245 requires real Electron screenshots and group focus regression',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51245-focus-group-before-1920x1080-real.png','positron-p51245-focus-group-after-1920x1080-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),'P245 screenshot missing '+f);
 for(const t of ['beforeGroupQA245','groupSyncQA245','pickerMatchesFocusedGroup:','group03Selected:','noAutoplay:',"page.keyboard.type('12')"])
  assert.ok(qa.includes(t),'P245 Electron QA missing '+t);
});

test('P5.1.246 Ctrl+Enter jumps and closes tool but keeps keyboard focus',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ["// P246: Ctrl+Enter goes", "const quickClose=event.ctrlKey||event.metaKey;",
  "if(quickClose){","setOpen(false);","row.focus({preventScroll:true});",
  "number.setAttribute('aria-keyshortcuts','Enter Control+Enter Meta+Enter')"])
  assert.ok(js.includes(token),'P246 quick-close shortcut missing '+token);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.246 requires real Electron Ctrl+Enter before/after and preserves playback',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51246-quick-close-before-1920x1080-real.png',
  'positron-p51246-quick-close-after-1920x1080-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),'P246 screenshots absent '+f);
 for(const token of ['quickCloseStartQA246','quickCloseQA246',
  "page.keyboard.press('Control+Enter')",'panelClosed:','focusedIndex412:','noAutoplay:'])
  assert.ok(qa.includes(token),'P246 Electron QA '+token);
});

test('P5.1.247 focused channel index is read-only and visible under total count',()=>{
 const js=read('renderer/positron-channel-jump.js'),css=read('renderer/positron-channel-jump.css');
 for(const t of ["// P247: show the keyboard-focused row index","focusedPosition.id='poFocusedPosition'",
  "visibleRows.indexOf(row)+1","'Kênh '+index+'/'+visibleRows.length",
  "focusedPosition.setAttribute('aria-live','polite')"])
  assert.ok(js.includes(t),'P247 focused index code missing '+t);
 for(const t of ['#poFocusedPosition','font-variant-numeric:tabular-nums',
   '#poFocusedPosition[hidden]'])assert.ok(css.includes(t),'P247 style '+t);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.247 real Electron screenshot proves selected index, focus, and data-safe action',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51247-focus-index-before-1920x1080-real.png',
  'positron-p51247-focus-index-after-1920x1080-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),'P247 screenshot missing '+f);
 for(const t of ['positionStartQA247','positionQA247','position412:','noAutoplay:',
  'chipVisible:'])assert.ok(qa.includes(t),'P247 Electron QA '+t);
});

test('P5.1.248 Alt+Shift+J pre-fills focused row index, plain Alt+J remains blank',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ['// P248: Alt+Shift+J opens',
  "const selectedIndex=row&&channelList?",
  "if(event.shiftKey&&selectedIndex>0)",
  "number.value=String(selectedIndex);",
  "toggle.setAttribute('aria-keyshortcuts','Alt+J Alt+Shift+J')"])
  assert.ok(js.includes(token),'P248 prefill shortcut missing '+token);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.248 Electron screenshot asserts editable prefill and no playback',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51248-prefill-index-before-1920x1080-real.png',
  'positron-p51248-prefill-index-after-1920x1080-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),'P248 evidence missing '+f);
 for(const t of ['regularJumpQA248','prefillQA248',
  "page.keyboard.press('Alt+Shift+J')",'prefilled412:',
  'noAutoplay:','regularEmpty:'])
  assert.ok(qa.includes(t),'P248 Electron QA '+t);
});

test('P5.1.249 Escape from jump restores focused origin row instead of toggle',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ['// P249: preserve the originating focused channel',
  'jumpOriginRow=candidate?.matches?',
  'const origin=jumpOriginRow;',
  "if(origin?.isConnected&&origin.matches('.channel-item')&&origin.getClientRects().length)",
  'origin.focus({preventScroll:true});'])
  assert.ok(js.includes(token),'P249 Escape focus recovery missing '+token);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.249 Electron screenshots exercise Escape recovery and unchanged toolbar behavior',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51249-escape-focus-before-1920x1080-real.png',
   'positron-p51249-escape-focus-after-1920x1080-real.png'])
   assert.ok(qa.includes(f)&&wf.includes(f),'P249 evidence '+f);
 for(const token of ['escapeStartQA249','escapeRestoreQA249',
   "page.keyboard.press('Escape')",'restoredRow412:','const toggleAfterNonRowEscape=',
   'noAutoplay:'])
   assert.ok(qa.includes(token),'P249 Electron recovery QA '+token);
});

test('P5.1.250 hides stale focused-index badge when leaving channels, not during jump',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ["// P250: hide the keyboard-focus position","focusList?.addEventListener('focusout'",
  "if(!panel.hidden)return;", "focusList.contains(event.relatedTarget)",
  "focusedPosition.textContent='';","focusedPosition.hidden=true;"])
  assert.ok(js.includes(token),'P250 badge cleanup absent: '+token);
 assert.ok(!js.includes('playChannel('),'Badge must not start playback');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.250 requires real-Electron before/after and focus restoration QA',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const filename of ['positron-p51250-focus-badge-before-1920x1080-real.png',
  'positron-p51250-focus-badge-after-1920x1080-real.png'])
  assert.ok(qa.includes(filename)&&wf.includes(filename),'P250 evidence absent '+filename);
 for(const token of ['positionStartQA250','positionClearedQA250','positionJumpQA250',
  'positionReturnQA250','badgeHidden:','originRetained:','noAutoplay:'])
  assert.ok(qa.includes(token),'P250 Electron assertion missing: '+token);
});

test('P5.1.251 remembers last focused channel row and restores it with Alt+Shift+L',()=>{
 const source=read('renderer/positron-channel-jump.js');
 for(const token of ['// P251: session-only bookmark','let lastVisitedRow=null;',
  'lastVisitedRow=row;', "event.key.toLowerCase()==='l'", 'row?.isConnected',
  "row.matches('.channel-item')", 'row.focus({preventScroll:true});',
  "Alt+Shift+L: trở lại kênh vừa duyệt"])
  assert.ok(source.includes(token),'P251 row resume missing '+token);
 assert.ok(!source.includes('playChannel('),'Resume focus cannot autoplay');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.251 requires actual Electron screenshots with shortcut and no mutation',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const f of ['positron-p51251-return-to-row-before-1920x1080-real.png',
  'positron-p51251-return-to-row-after-1920x1080-real.png'])
  assert.ok(qa.includes(f)&&wf.includes(f),'P251 evidence absent '+f);
 for(const token of ['rowReturnStartQA251','rowReturnQA251',
  "page.keyboard.press('Alt+Shift+L')",'restoredRow412:', 'noAutoplay:',
  'favoritesUnchanged:', 'playlistUnchanged:'])
  assert.ok(qa.includes(token),'P251 Electron regression missing '+token);
});

test('P5.1.252 uses stable channel ID to restore from favorite-filter rerenders',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ['// P252: stable channel ID','let lastVisitedChannelId=null;',
  'lastVisitedChannelId=row.dataset.channelId||null;', 'const available=row=>',
  'el.dataset.channelId===lastVisitedChannelId', "all.click();restoredAll=true;",
  "restoredAll?'Đã xem tất cả để quay lại. '"])
  assert.ok(js.includes(token),'P252 filtered resume missing '+token);
 assert.ok(!js.includes('playChannel('),'Filtered resume cannot start video');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.252 requires real Electron filtered-before and restored-after screenshots',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const n of ['positron-p51252-resume-filter-before-1920x1080-real.png',
  'positron-p51252-resume-filter-after-1920x1080-real.png'])
  assert.ok(qa.includes(n)&&wf.includes(n),'P252 screenshot missing '+n);
 for(const token of ['filteredReturnStartQA252','filteredReturnQA252',
  'targetNotVisible:','allFilterRestored:','restoredRowId:',
  'favoritesUnchanged:','playlistUnchanged:','noAutoplay:'])
  assert.ok(qa.includes(token),'P252 regression missing '+token);
});

test('P5.1.253 centers bookmarked row after Alt+Shift+L without scrolling outer viewport',()=>{
 const js=read('renderer/positron-channel-jump.js');
 assert.ok(js.includes('// P253: center the restored row'),'missing P253 center');
 assert.ok(js.includes('list.scrollTop+=rect.top-box.top-(list.clientHeight-rect.height)/2;'));
 assert.ok(!js.includes('else if(rect.bottom>box.bottom)list.scrollTop+=rect.bottom-box.bottom;'));
 assert.ok(!js.includes('window.scrollTo('),'Must keep main page stationary');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.338');
});
test('P5.1.253 requires Electron screenshots and measured center offset before/after',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const n of ['positron-p51253-centered-row-before-1920x1080-real.png',
  'positron-p51253-centered-row-after-1920x1080-real.png'])
  assert.ok(qa.includes(n)&&wf.includes(n),'P253 screenshot missing '+n);
 for(const name of ['centerRowStartQA253','centerRowQA253',
  'bottomEdgeBaseline:','restoredRow412:','centered:','improved:',
  'noAutoplay:','favoritesUnchanged:','playlistUnchanged:'])
  assert.ok(qa.includes(name),'P253 native geometry regression missing '+name);
});
