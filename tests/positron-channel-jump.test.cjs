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
 assert.equal(JSON.parse(read('package.json')).version,'4.23.320');
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
