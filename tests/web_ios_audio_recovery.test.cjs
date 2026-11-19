'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'web-ios-audio-recovery.js'),'utf8');
const style=fs.readFileSync(path.join(root,'web-ios-audio-recovery.css'),'utf8');
test('Web Mobile loads Safari audio recovery last with versioned assets',()=>{
 assert.match(html,/web-ios-audio-recovery\.js\?v=ios-audio-pill-/);
 assert.match(html,/web-ios-audio-recovery\.css\?v=ios-audio-pill-/);
 assert.ok(html.indexOf('web-ios-audio-recovery.js')>html.indexOf('web-background-audio.js'));
});
test('silent autoplay remains muted until a user clicks unmute',()=>{
 assert.match(script,/addEventListener\('click'/);
 assert.match(script,/video\.muted=false/);
 assert.match(script,/openiptv:autoplay-muted/);
 assert.match(script,/video\.readyState>=2/);
 assert.doesNotMatch(script,/setTimeout\([^)]*video\.muted=false/);
});
test('only mobile overlay is shown and existing Cast/PiP buttons are preserved',()=>{
 assert.match(style,/html\[data-iptv-device="mobile"\]/);
 for(const id of ['castBtn','pipBtn','webVolumeMute'])assert.match(script,new RegExp("'"+id+"'"));
 assert.match(style,/web-unmute-assist\[hidden\]/);
});
test('Safari source does not claim audio codec support or alter playlist storage',()=>{
 assert.doesNotMatch(script,/localStorage|indexedDB|deleteChannel/);
 assert.match(script,/Luồng không hỗ trợ trên Safari/);
});
