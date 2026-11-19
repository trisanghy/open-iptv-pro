'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),advanced=read('advanced.js');
test('desktop and mobile TV pages no longer include live Timeshift controls',()=>{
 for(const id of ['bufferToggle','bufferRewind','bufferRewind10','bufferLive','bufferInfo','autoTimeshiftSetting','replayMinutesState'])
  assert.doesNotMatch(html,new RegExp('id="'+id+'"'),id);
 assert.doesNotMatch(html,/class="timeshift-actions"/);
 assert.doesNotMatch(html,/name="replayMinutesChoice"/);
 assert.doesNotMatch(html,/id="defaultBufferSettings"/);
});
test('background engine no longer starts Timeshift even for previously persisted settings',()=>{
 for(const fragment of ['startTimeshift','maybeAutoBuffer','autoTimeshift','replayMinutes','bufferToggle','bufferRewind','timeshiftStatus'])
  assert.doesNotMatch(advanced,new RegExp(fragment),fragment);
 assert.match(advanced,/function onStop\(\)\{\}/);
 assert.match(advanced,/function onChannel\(\)\{\}/);
});
test('keep live TV, VOD seeking, EPG, recording and source management in DOM',()=>{
 for(const id of ['video','videoSeek','videoSeekWrap','epgCurrent','manualStreamSelect','dvrQuickToggle','dvrQuickForm','dvrQuickManage','channelList','webBackgroundAudioToggle'])
  assert.match(html,new RegExp('id="'+id+'"'),id);
 assert.match(html,/aria-label="Hẹn giờ ghi hình"/);
});
test('mobile and desktop share hidden legacy bar while channel list remains visible',()=>{
 const css=read('web-only.css'),mobile=read('web-mobile-player.css');
 assert.match(css,/#page-tv \.advanced-timebar/);
 assert.match(css,/display:none!important/);
 assert.match(mobile,/body #page-tv \.channel-panel/);
 assert.doesNotMatch(mobile,/timeshift-actions|#bufferToggle/);
});
test('Web builder strips legacy Timeshift controls from fresh WebView sources',()=>{
 const build=read('web-online/prepare-web.py');
 assert.match(build,/Missing Web Timeshift removal anchor/);
 assert.match(build,/Timeshift buttons/);
 assert.match(build,/Timeshift minutes/);
 assert.match(build,/Timeshift automatic setting/);
 assert.match(build,/background_end='<article class="settings-card" id="epgSettingsCard">/);
});

test('live Timeshift removal uses versioned JS and CSS so Safari cannot reuse stale modules',()=>{
 assert.match(html,/advanced\.js\?v=no-timeshift-20261119a/);
 assert.match(html,/web-only\.css\?v=no-timeshift-20261119a/);
 const builder=read('web-online/prepare-web.py');
 assert.match(builder,/version='no-timeshift-20261119a'/);
 assert.match(builder,/web-only\.css\?v=no-timeshift-20261119a/);
});
