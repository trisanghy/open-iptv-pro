'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,alternateTransport,isFresh,MAX_AGE_MS}=require('../renderer/playback-preference.js');
const {planReplacement}=require('../renderer/source-edit.js');
const {alternatives}=require('../renderer/advanced-core.js');
const app=fs.readFileSync(path.join(__dirname,'../renderer/app.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const now=Date.parse('2026-11-16T01:00:00Z');
const url1='https://a.test/ch.m3u8',url2='https://b.test/ch.m3u8';
const channel={id:'ch1',sourceId:'src',name:'VTV 1',url:url1};
function proof(preferred=url2,ageMs=1200,transport='ffmpeg'){
 return {...channel,lastPlayableUrl:preferred,lastPlayableTransport:transport,lastPlaybackAt:new Date(now-ageMs).toISOString()};
}
test('revisit channel prioritizes previously decoded URL and FFmpeg engine',()=>{
 const options=alternatives(channel,[channel],{ch1:[url2]});
 assert.deepEqual(options,[url1,url2]);
 assert.deepEqual(choose(proof(),options,now),{urls:[url2,url1],transport:'ffmpeg',remembered:true});
});
test('previous successful relay is reused without an FFmpeg startup',()=>{
 assert.deepEqual(choose(proof(url1,1000,'relay'),[url1,url2],now),{urls:[url1,url2],transport:'relay',remembered:true});
});
test('snapshot, HTTP link check, and alive label never create playback preference',()=>{
 assert.deepEqual(choose({...channel,status:'alive',checkedAt:new Date(now).toISOString()},[url1,url2],now),{urls:[url1,url2],transport:'relay',remembered:false});
});
test('expired, future, and removed URLs are never reused',()=>{
 assert.equal(isFresh(new Date(now-1000).toISOString(),now),true);
 for(const c of [proof(url2,MAX_AGE_MS+1),proof(url2,-5000),proof('https://removed.test/ch.m3u8')]){
  assert.deepEqual(choose(c,[url1,url2].filter(x=>!x.includes('b.test')),now),{urls:[url1],transport:'relay',remembered:false});
 }
 assert.deepEqual(choose(proof(url2,MAX_AGE_MS+1),[url1,url2],now),{urls:[url1,url2],transport:'relay',remembered:false});
 assert.deepEqual(choose(proof(url2,-5000),[url1,url2],now),{urls:[url1,url2],transport:'relay',remembered:false});
});
test('cached FFmpeg failure retries relay same link once, never loops',()=>{
 const tried=new Set(['ffmpeg']);
 assert.equal(alternateTransport('ffmpeg',tried,true),'relay');
 tried.add('relay');
 assert.equal(alternateTransport('relay',tried,true),null);
 assert.equal(alternateTransport('ffmpeg',tried,true),null);
 assert.equal(alternateTransport('relay',new Set(['relay']),false),null);
 assert.equal(alternateTransport('relay',new Set(['relay']),true),'ffmpeg');
});
test('refresh keeps playback proof only while primary URL is unchanged',()=>{
 const old=[{...proof(url1,100,'ffmpeg'),lastPlayableFormat:'hls',lastStartupDurationMs:2330}];
 const replace=(fresh)=>planReplacement(old,[{...channel,url:fresh}],channel.sourceId,[]).channels[0];
 const same=replace(url1);
 assert.equal(same.lastPlayableUrl,url1);assert.equal(same.lastPlayableTransport,'ffmpeg');
 assert.equal(same.lastPlayableFormat,'hls');assert.equal(same.lastStartupDurationMs,2330);
 const changed=replace('https://new.test/ch.m3u8');
 assert.equal(changed.id,'ch1');assert.equal(changed.lastPlayableUrl,undefined);
 assert.equal(changed.lastPlayableTransport,undefined);
});
test('renderer uses successful playback evidence before routing; guards stale recovery and persists transport',()=>{
 assert.match(index,/playback-preference\.js[^]*app\.js/);
 assert.match(app,/IPTVPlaybackPreference\?\.choose\(found,allCandidates\)/);
 assert.match(app,/tryPlayback\(playCandidates\[0\],generation,preferredTransport\)/);
 assert.match(app,/IPTVPlaybackRoutePolicy\?\.initialTransport\(/);
 assert.match(app,/ch\.lastPlayableTransport=\['ffmpeg','mpegts'\]\.includes\(activeTransport\)/);
 assert.match(app,/if\(!ch\|\|!url\|\|player\.readyState<2\|\|player\.paused/);
 assert.match(app,/ch\.lastStartupDurationMs=Math\.round\(firstFrameDurationMs\)/);
});
