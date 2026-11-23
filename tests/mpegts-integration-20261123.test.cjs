'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const policy=require('../playback-route-policy.js'),prefs=require('../playback-preference.js');
test('TS/FLV use MSE before FFmpeg and HLS/DASH remain unchanged',()=>{
 for(const url of ['https://t.test/live.ts','https://t.test/live.m2ts?k=1','https://t.test/live.flv','https://t.test/live?file=ch.ts'])assert.equal(policy.initialTransport(url),'mpegts',url);
 assert.equal(policy.initialTransport('https://t.test/live.m3u8'),'relay');
 assert.equal(policy.initialTransport('https://t.test/live.mpd'),'relay');
});
test('remember successful TS transport for same URL',()=>{
 const now=Date.now(),url='https://t.test/live?id=5';
 const p=prefs.choose({lastPlayableUrl:url,lastPlayableTransport:'mpegts',lastPlaybackAt:new Date(now-1000).toISOString()},[url],now);
 assert.equal(p.transport,'mpegts');assert.equal(p.remembered,true);
});
test('Web contains bundled decoder loading and release lifecycle',()=>{
 const loader=fs.readFileSync(path.join(root,'web-playback-libs.js'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert.ok(loader.includes("mpegts:{file:'mpegts.min.js',global:'mpegts'}"));
 for(const name of ['destroyMpegts','attachMediaElement','autoCleanupSourceBuffer',"activeTransport==='mpegts'"])assert.ok(app.includes(name),name);
 assert.ok(fs.statSync(path.join(root,'mpegts.min.js')).size>200000);
});
