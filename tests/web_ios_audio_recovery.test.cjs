'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const recovery=fs.readFileSync(path.join(root,'web-ios-audio-recovery.js'),'utf8');
const resume=fs.readFileSync(path.join(root,'resume-last.js'),'utf8');
test('Web Mobile uses versioned top-only audio banner',()=>{
 assert.match(html,/web-ios-audio-recovery\.js\?v=top-banner-20261119b/);
 assert.match(html,/resume-last\.js\?v=autoplay-clean-20261119a/);
 assert.match(html,/web-ios-audio-recovery\.css\?v=top-banner-20261119b/);
 assert.doesNotMatch(html,/resume-last\.css/);
});
test('the only added sound button is inside the top video banner',()=>{
 assert.match(recovery,/getElementById\?\.\('webVolumeMute'\)/);
 assert.match(recovery,/mute\.addEventListener\('click'/);
 assert.match(recovery,/webAudioPermissionBanner/);
 assert.match(recovery,/box\.append\(banner\)/);
 assert.doesNotMatch(recovery,/web-unmute-assist-chrome-ios/);
 assert.doesNotMatch(resume,/web-resume-panel|showPrompt/);
});
test('one-tap Chrome unmute cannot change saved playlist data',()=>{
 assert.doesNotMatch(recovery,/localStorage|indexedDB|deleteChannel/);
 assert.match(recovery,/video\.play\(\)/);
});
