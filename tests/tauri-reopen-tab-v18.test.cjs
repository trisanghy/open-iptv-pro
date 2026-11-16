const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(root,'renderer/player-layout-rollback-v19.css'),'utf8');
const index=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8');
function block(selector){const start=css.indexOf(selector);assert.ok(start>=0);return css.slice(start,css.indexOf('}',start)+1)}
const rootSelector='html[data-channel-panel-collapsed="true"]:not([data-ui-style="cinema"]) #page-tv .channel-panel-reopen{';
const buttonSelector='html[data-channel-panel-collapsed="true"]:not([data-ui-style="cinema"]) #page-tv .channel-panel-reopen button{';
test('reopen tab width is 15px, half original 30px, height remains 40px',()=>{
 const bar=block(rootSelector);const button=block(buttonSelector);
 assert.match(bar,/width:15px!important;height:40px!important/);
 assert.match(button,/width:15px!important;height:40px!important;min-width:15px!important;min-height:40px!important/);
});
test('tab position stays fixed for expanded and collapsed sidebar',()=>{
 assert.match(block(rootSelector),/top:26px!important;left:calc\(242px - 2px\)!important/);
 assert.match(css,/left:calc\(208px - 2px\)!important/);
 assert.match(css,/top:14px!important;left:calc\(72px - 2px\)!important/);
 assert.match(index,/id="channelPanelReopen"[^>]*aria-label="Mở lại danh sách kênh"/);
});
test('one ZIP fast installer now requires v19',()=>{
 assert.match(script,/VERSION="4\.23\.17-tauri\.19"/);
 assert.match(script,/archive\/refs\/heads\/\$\{BRANCH\}\.zip/);
 assert.match(script,/OpenIPTVPro_RustLab_v19/);
});