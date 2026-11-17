'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const js=read('renderer/rust-subtitle-controls-v23-8-5.js'),css=read('renderer/rust-subtitle-controls-v23-8-5.css');
test('Six selectable subtitle fonts with multilingual fallback and immediate preview',()=>{
 for(const key of ['system','arial','tahoma','verdana','noto','serif']){
  assert.ok(js.includes('value="'+key+'"'),key);
  assert.ok(js.includes(key+':'),key);
 }
 for(const id of ['rustSubtitleFont','rustSubtitleFontPreview'])assert.ok(js.includes(id),id);
 for(const family of ['PingFang SC','Microsoft YaHei','Noto Sans CJK SC'])assert.ok(js.includes(family),family);
 assert.ok(js.includes('fontStacks[settings.font]||fontStacks.system'));
 assert.ok(js.includes("overlay.style.setProperty('--rust-cc-font-stack',stack)"));
 assert.ok(js.includes("font:['system','arial','tahoma','verdana','noto','serif']"));
 assert.ok(!js.includes('https://fonts.'));
});
test('Style improves thin CJK glyph readability without changing chosen size/color',()=>{
 assert.ok(css.includes('font-family:var(--rust-cc-font-stack'));
 assert.ok(css.includes('font-weight:600!important'));
 assert.ok(css.includes('letter-spacing:0!important'));
 assert.ok(css.includes('-webkit-text-stroke:.28px'));
 assert.ok(css.includes('.rust-cc-font-preview'));
});
test('Saved CC preferences remain backward compatible and restore chosen font',()=>{
 assert.ok(js.includes("font:'system'"));
 assert.ok(js.includes('localStorage.setItem(KEY,JSON.stringify(settings))'));
 assert.ok(js.includes("const stack=fontStacks[settings.font]||fontStacks.system;"));
 assert.ok(js.includes("el.addEventListener(key==='opacity'?'input':'change'"));
});
test('Mac builder tracks immutable v23.8.10 release tag',()=>{
 const pkg=JSON.parse(read('package.json')),sh=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.equal(pkg.version,'4.23.17-tauri.23.8.10');
 assert.ok(sh.includes('TAG="rust-lab/v23.8.10"'));
 assert.ok(sh.includes('npm run build -- --bundles app'));
});
