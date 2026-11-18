import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {swipeChannelDelta,nextChannelIndex,safeHistory} from '../src/mobile-ux.mjs';
test('swipe left/right changes channel only with intentional horizontal gestures',()=>{
 assert.equal(swipeChannelDelta(-93,12,420),1);
 assert.equal(swipeChannelDelta(95,-4,250),-1);
 assert.equal(swipeChannelDelta(-24,15,100),0);
 assert.equal(swipeChannelDelta(-145,195,200),0);
 assert.equal(swipeChannelDelta(-90,0,1200),0);
});
test('switching wraps around list and preserves session',()=>{
 const channels=[{url:'http://e/1'},{url:'http://e/2'},{url:'http://e/3'}];
 assert.equal(nextChannelIndex(channels,'http://e/3',1),0);
 assert.equal(nextChannelIndex(channels,'http://e/1',-1),2);
 assert.deepEqual(safeHistory(['http://e/2','http://e/1'],'http://e/2'),['http://e/2','http://e/1']);
});
test('safe-area is applied once by CSS and native contentInset is not double-applied',()=>{
 const root=path.resolve(import.meta.dirname,'..');
 const cap=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
 assert.equal(cap.ios.contentInset,'never');
 const css=fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
 assert.ok(css.includes('MOBILE_VIEWPORT_FIX_V4'));
 assert.ok(css.includes('env(safe-area-inset-top'));
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/viewport-fit=cover/);
});
test('mobile contains source paste control, old player and fixed bottom nav',async()=>{
 const {oldStyleLayout}=await import('../src/legacy-mobile-layout.mjs');
 const ui=oldStyleLayout('/icon.png');
 for(const id of ['pasteM3U','playCurrent','previousChannel','nextChannel','heroTitle','channelList'])assert.match(ui,new RegExp('id="'+id+'"'));
 assert.match(ui,/bottom-navigation/);
});
