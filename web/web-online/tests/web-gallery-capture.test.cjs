'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const s=fs.readFileSync(path.join(root,'web-online/capture-gallery.cjs'),'utf8');
const w=fs.readFileSync(path.join(root,'.github/workflows/deploy-openiptv-web.yml'),'utf8');
test('capture uses real staged Web app, Chromium emulation and original demo stream',()=>{
 for(const key of ['chromium.launch','window.IPTVState','page.screenshot','devices[','assets','gallery','demoStore',
   'gallery-demo.mp4','DEMO STREAM - LOCAL SAMPLE','playChannel','deviceScaleFactor:1',
   'ios-channels','android-settings','desktop-sources'])assert.ok(s.includes(key),key);
 assert.match(s,/NOT Safari or native Android screenshots/);
 assert.ok(!s.includes('https://iptv-org.github.io/'));
});
test('deployment validates 12 screenshots and archives main documentation',()=>{
 assert.match(w,/Capture up-to-date desktop, iOS and Android browser gallery/);
 assert.match(w,/node --check web-online\/capture-gallery.cjs/);
 assert.match(w,/Archive current screenshots into main documentation/);
 assert.match(w,/git push origin HEAD:main/);
 assert.match(w,/docs\/images\/web-gallery/);
 assert.match(w,/assert not Path\('_site\/assets\/gallery-demo.mp4'\).exists\(\)/);
});
