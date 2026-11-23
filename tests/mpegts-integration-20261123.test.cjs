'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const policy=require('../renderer/playback-route-policy.js'),prefs=require('../renderer/playback-preference.js');
test('MPEG-TS and FLV start through mpegts.js, HLS and DASH unchanged',()=>{
 for(const url of ['https://tv.test/live.ts','https://tv.test/live.m2ts?t=5','https://tv.test/video.flv','https://tv.test/api?file=live.ts'])assert.equal(policy.initialTransport(url),'mpegts',url);
 assert.equal(policy.initialTransport('https://tv.test/live.m3u8'),'relay');
 assert.equal(policy.initialTransport('https://tv.test/live.mpd'),'relay');
});
test('previously verified mpegts is remembered on the same media URL',()=>{
 const now=Date.now(),url='https://tv.test/live?id=1';
 const p=prefs.choose({lastPlayableUrl:url,lastPlayableTransport:'mpegts',lastPlaybackAt:new Date(now-1000).toISOString()},[url],now);
 assert.equal(p.remembered,true);assert.equal(p.transport,'mpegts');
});
test('Electron includes offline mpegts.js and uses safe player lifecycle',()=>{
 const app=fs.readFileSync(path.join(root,'renderer/app.js'),'utf8');
 for(const marker of ['destroyMpegts','attachMediaElement','autoCleanupSourceBuffer',"activeTransport==='mpegts'"])assert.ok(app.includes(marker),marker);
 assert.ok(fs.statSync(path.join(root,'renderer/mpegts.min.js')).size>200000);
 assert.ok(fs.statSync(path.join(root,'renderer/licenses/mpegts-Apache-2.0.txt')).size>10000);
});
