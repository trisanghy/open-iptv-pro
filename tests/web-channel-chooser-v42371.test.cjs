'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('channel chooser mounted under Quick Tools and loads scripts after IPTVState',()=>{
 const html=read('renderer/index.html');
 assert.ok(html.indexOf('id="quickTools"')<html.indexOf('id="webChannelChooser"'));
 assert.ok(html.indexOf('id="webChannelChooser"')<html.indexOf('id="themeGuidePanel"'));
 assert.ok(html.includes('web-channel-chooser-v42371.css'));
 assert.ok(html.includes('web-channel-chooser-v42371.js'));
 assert.ok(html.indexOf('app.js')<html.indexOf('web-channel-chooser-v42371.js'));
 const chooser=read('renderer/web-channel-chooser-v42371.js');
 for(const id of ['webChooserSearch','webChooserGroup','webChooserSort','webChooserGrid','webChooserFavorites','webChooserRecent','webChooserPrev','webChooserNext'])assert.ok(chooser.includes('id=\\"'+id+'\\"'),id);
});
test('chooser uses enabled channels, existing favorites/recent keys, and real playChannel',()=>{
 const js=read('renderer/web-channel-chooser-v42371.js');
 assert.doesNotThrow(()=>new Function(js));
 for(const token of ['state.getChannels','favorites.visible','recent.visible','favorites.key','state.playChannel(ch.id)','data-chooser-tab','data-chooser-see'])assert.ok(js.includes(token),token);
 const writes=[...js.matchAll(/localStorage\.setItem\(([^,]+),/g)].map(x=>x[1]);
 assert.deepEqual(writes,["'open-iptv-positron-reminder-lead-v1'"],'only the reminder preference may persist; never overwrite playlist or favorites');
});
test('channel chooser styles are restricted to TV page and responsive',()=>{
 const css=read('renderer/web-channel-chooser-v42371.css');
 assert.match(css,/#page-tv \.web-channel-chooser/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/\.web-chooser-card\.active/);
});
