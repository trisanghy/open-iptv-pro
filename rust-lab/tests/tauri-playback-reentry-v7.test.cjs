'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const reentry=require('../renderer/playback-reentry.js');
const app=fs.readFileSync(path.join(root,'renderer/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const rust=fs.readFileSync(path.join(root,'src-tauri/src/stream.rs'),'utf8');

test('a channel with demonstrated video progress can recover ONE brief WebKit decode failure',()=>{
 const when=1_800_000;
 reentry.notePlaying('vtv3','https://video.example/live.m3u8',when);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/live.m3u8','Định dạng hoặc URL video không được hỗ trợ (MediaError 4)',when+1000),true);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/live.m3u8','Không giải mã được codec (MediaError 3)',when+1000),true);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/live.m3u8','The operation is not supported.',when+2000),true);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/live.m3u8','Kết nối quá thời gian',when+2000),false);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/live.m3u8','HLS HTTP 403',when+1000),false);
});
test('a channel does not inherit success from another channel, another URL, or a stale playback',()=>{
 const now=2_000_000;
 reentry.notePlaying('vtv3','https://video.example/one',now);
 assert.equal(reentry.shouldRetry('vtv2','https://video.example/one','MediaError 4',now+200),false);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/two','MediaError 4',now+200),false);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/one','MediaError 4',now+90001),false);
 assert.equal(reentry.shouldRetry('vtv3','https://video.example/one','MediaError 4',now-1),false);
});
test('new local HLS manifest request has a fresh identity, but source URL and token remain identical',()=>{
 const signed='https://tv.example/hls/master.m3u8?token=long%2Fsecret&expires=456';
 const input='http://127.0.0.1:3333/stream?key=abc&url='+encodeURIComponent(signed);
 const a=reentry.freshProxy(input,'v7-23');
 const b=reentry.freshProxy(input,'v7-24');
 assert.notEqual(a,b);
 for(const x of [a,b]){
  const u=new URL(x);
  assert.equal(u.searchParams.get('url'),signed);
  assert.equal(u.searchParams.get('key'),'abc');
  assert.equal(u.pathname,'/stream');
 }
 assert.equal(reentry.freshProxy(signed,'another'),signed,'never change a signed upstream URL');
 assert.equal(reentry.freshProxy('file:///etc/passwd','x'),'file:///etc/passwd');
 assert.equal(reentry.freshProxy('http://127.0.0.1:4444/snapshot?key=x&file=shot.jpg','x'),'http://127.0.0.1:4444/snapshot?key=x&file=shot.jpg');
});
test('pending channel switches and late errors cannot recover another selected channel',()=>{
 assert.match(app,/const selection=\+\+selectionSerial/);
 assert.match(app,/selection!==selectionSerial/);
 assert.match(app,/disposeActiveMedia\(\); \/\/ Release the old decoder immediately/);
 assert.match(app,/activeMediaSrc='';activeMediaGeneration=0;activeMediaAttempt=0/);
 assert.match(app,/if\(!current\|\|!player\.error\|\|!activeMediaEvent\(\)\)return/);
 assert.match(app,/activeMediaGeneration,reason\+' \(MediaError '\+code\+'\)',activeMediaAttempt/);
 assert.match(app,/activeMediaEvent\(\)&&serial===waitingSerial/);
 assert.match(app,/reentryRetryKeys\.has\(retryKey\)/);
 assert.match(app,/reentryRetryKeys\.add\(retryKey\)/);
 assert.match(app,/setTimeout\(resolve,550\)/);
});
test('progress events use active generation rather than being mistaken for numeric generations',()=>{
 assert.doesNotMatch(app,/addEventListener\('timeupdate',markPlaybackVerified\)/);
 assert.match(app,/addEventListener\('timeupdate',\(\)=>markPlaybackVerified\(\)\)/);
 assert.match(app,/reentry\?\.notePlaying\(ch\.id,url\)/);
 assert.match(app,/Date\.now\(\)-stablePlayback\.startedAt>=12000/);
});
test('Tauri build bundles playback guard before app-entry and relay forbids stale cache',()=>{
 assert.ok(html.indexOf('playback-reentry.js')>html.indexOf('adaptive-playback.js'));
 assert.ok(html.indexOf('playback-reentry.js')<html.indexOf('app-entry.js'));
 assert.match(rust,/HeaderValue::from_static\("no-store, no-cache, max-age=0"\)/);
 assert.match(rust,/request=request\.header\(header::CACHE_CONTROL,"no-cache"\)/);
});

test('WebView MSE events require the new attached blob identity, not any old blob',()=>{
 assert.match(app,/activeMediaBlobSrc=''/);
 assert.match(app,/activeMediaUsesMSE&&!!activeMediaBlobSrc&&actual===activeMediaBlobSrc/);
 assert.match(app,/H.Events.MEDIA_ATTACHED/);
 assert.match(app,/events.STREAM_INITIALIZED/);
});
