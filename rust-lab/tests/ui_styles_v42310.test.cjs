'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,'renderer',p),'utf8');
const source=read('theme-boot.js');
const index=read('index.html');
test('Eleven interface styles are selectable, and use a visual-only CSS theme',()=>{
 const opts=['current','minimal','material3','hig','liquid','cinema','fluent','glass','broadcast','bento','swiss'];
 for(const v of opts){
  assert.match(index,new RegExp('name="uiStyle" value="'+v+'"'));
  assert.match(read('ui-styles.css')+read('ui-fullsync.css'),new RegExp('data-ui-style="'+v+'"'));
 }
 assert.match(index,/src="ui-style\.js"/);
 assert.match(index,/href="ui-styles\.css"/);
 assert.match(read('ui-style.js'),/open-iptv-pro-ui-style-v1/);
});
test('Theme bootstrap restores saved style and rejects corrupt/unrecognized values',()=>{
 const inputs=[['minimal','minimal'],['material3','material3'],['hig','hig'],['liquid','liquid'],['current','current'],['cinema','cinema'],['fluent','fluent'],['glass','glass'],['broadcast','broadcast'],['bento','bento'],['swiss','swiss'],['unknown','current']];
 for(const [saved,expected] of inputs){
  const document={documentElement:{dataset:{}}};
  const localStorage={getItem:k=>k==='open-iptv-pro-ui-style-v1'?saved:null};
  vm.runInNewContext(source,{document,localStorage,window:{matchMedia:()=>({matches:true})}});
  assert.equal(document.documentElement.dataset.uiStyle,expected);
 }
});
test('UI style preference is part of owned backup keys and not tied to player state',()=>{
 const backup=fs.readFileSync(path.join(root,'renderer','backup-ui.js'),'utf8');
 const allowed=fs.readFileSync(path.join(root,'src','backup-service.cjs'),'utf8');
 assert.match(backup,/k\.startsWith\('open-iptv-pro-'\)/);
 assert.match(allowed,/k\.startsWith\('open-iptv-pro-'\)/);
 const runtime=read('ui-style.js');
 assert.doesNotMatch(runtime,/setPage\(|getChannels\(|getStore\(|playChannel\(|streamleaf\./);
});

test('Full preset layouts and density settings affect entire shared interface',()=>{
 const css=read('ui-fullsync.css');
 for(const name of ['cinema','fluent','glass','broadcast','bento','swiss','minimal','material3','hig','liquid']){
  assert.match(css,new RegExp('data-ui-style="'+name+'"'));
 }
 for(const name of ['compact','comfort']) {
  assert.match(index,new RegExp('name="uiDensity" value="'+name+'"'));
  assert.match(css,new RegExp('data-ui-density="'+name+'"'));
 }
 assert.match(read('ui-style.js'),/open-iptv-pro-ui-density-v1/);
 assert.match(index,/href="ui-fullsync.css"/);
 assert.match(css,/\.tv-layout/);
 assert.match(css,/\.topbar/);
 assert.match(css,/\.footer/);
 assert.match(css,/\.channel-panel/);
 assert.match(css,/\.player-control-card/);
 assert.match(css,/\.settings-card/);
});
