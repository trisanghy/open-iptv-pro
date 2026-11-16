const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('renderer/index.html');
const app=read('renderer/app.js');
const css=read('renderer/sidebar-compact.css');
const script=read('renderer/sidebar-compact.js');
test('Top header removed while M3U entry points survive',()=>{
 assert.doesNotMatch(html,/<header class="topbar"/);
 for(const id of ['sourcesFileBtn','sourcesUrlBtn','emptyFileBtn','emptyUrlBtn'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/if\(\$\('#pageTitle'\)\)/);
 assert.match(app,/if\(\$\('#activeSourceTag'\)\)/);
});
test('Sidebar can collapse and re-expand with accessible control',()=>{
 assert.match(html,/id="sidebarToggle"/);
 assert.match(html,/aria-expanded="true"/);
 assert.match(html,/id="appSidebar"/);
 assert.match(css,/data-sidebar-collapsed="true"/);
 assert.match(script,/button\.addEventListener\('click'/);
 assert.match(script,/aria-expanded/);
 assert.match(script,/localStorage\.setItem/);
});
test('Collapsed navigation keeps labels for accessibility and theme symbols',()=>{
 assert.match(html,/class="nav-label"/);
 assert.match(css,/\.macos-nav-symbol svg/);
 assert.match(css,/data-ui-style="cinema"/);
 for(const page of ['tv','fav','epg','multiview','shots','folders','sources','settings']){
  assert.match(html,new RegExp('data-page="'+page+'"[^>]+aria-label='));
 }
});
