'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const css=read('renderer/unified-ai-inline-v1.css');
const oldCss=read('renderer/compact-live-ai-controls-v42366.css');
const html=read('renderer/index.html');
const js=read('renderer/unified-ai-inline-v1.js');
function rule(prefix) {
  const start=css.lastIndexOf(prefix);
  assert.ok(start>=0,'Missing rule '+prefix);
  const open=css.indexOf('{',start);
  const close=css.indexOf('}',open);
  return css.slice(open+1,close).replace(/\s+/g,' ');
}
test('Root cause: legacy 920px flex basis becomes HEIGHT after CC controls reparent into a column',()=>{
  assert.match(oldCss,/\.caption-third-controls\s*\{\s*display:grid!important;[\s\S]*?flex:1 1 920px!important/);
  assert.match(js,/while \(row\.firstChild\) content\.appendChild\(row\.firstChild\)/);
  assert.match(js,/content\.className = 'unified-ai-content'/);
  assert.match(css,/#page-tv \.unified-ai-content\{display:flex!important;flex-direction:column/);
});
test('Expanded caption content uses intrinsic height, not 920px reserved space',()=>{
  const selector='#page-tv .player-control-card .unified-ai-row > .unified-ai-content > :is(.caption-third-controls,.caption-third-setup,.unified-ai-tools)';
  const decl=rule(selector);
  assert.match(decl,/flex:0 0 auto!important/);
  assert.match(decl,/flex-grow:0!important/);
  assert.match(decl,/flex-basis:auto!important/);
  assert.match(decl,/height:auto!important/);
  assert.match(decl,/min-height:0!important/);
  assert.match(css,/#page-tv \.player-control-card \.unified-ai-row > \.unified-ai-content > \.caption-third-controls \{/);
});
test('CC advanced options scroll within the opened area rather than growing forever',()=>{
  const selector='#page-tv .player-control-card .unified-ai-content > #rustSubtitleOptionsPanel.rust-cc-panel.unified-inline-cc:not([hidden])';
  const decl=rule(selector);
  assert.match(decl,/max-height:min\(70vh,570px\)!important/);
  assert.match(decl,/overflow-y:auto!important/);
  assert.match(decl,/grid-auto-rows:max-content!important/);
  assert.match(css,/\.caption-third-setup\[hidden\]\s*\{\s*display:none!important;/);
});
test('Both CC and AI controls keep original event listeners and visible button placement',()=>{
  assert.match(js,/trigger\.addEventListener\('click', \(\) => setOpen\(content\.hidden\)\)/);
  assert.match(js,/row\.append\(trigger, content\)/);
  assert.match(js,/row\.classList\.toggle\('unified-ai-open', open\)/);
  assert.match(html,/unified-ai-inline-v1\.css/);
  assert.match(html,/video-enhancement-v23-8-70\.css/);
  assert.ok(html.indexOf('compact-live-ai-controls-v42366.css')<html.indexOf('unified-ai-inline-v1.css'));
  assert.match(html,/id="liveTtsVoice"/);
  assert.match(html,/id="liveCaptionToggle"/);
});
