'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {derive}=require('../web-player-icons.js');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const local={paused:true,ended:false,muted:false,volume:0.8};
test('paired TV playing overrides a paused local video',()=>{
 assert.equal(derive(local,null,{pair:true,remoteState:'playing'}).playing,true);
});
test('paused, loading, stopped remote states drive button glyphs',()=>{
 assert.equal(derive({...local,paused:false},null,{pair:true,remoteState:'paused'}).playing,false);
 assert.deepEqual(derive(local,null,{pair:true,remoteState:'loading'}),{playing:false,pending:true,muted:false});
 assert.equal(derive(local,null,{pair:true,remoteState:'stopped'}).playing,false);
});
test('disconnected TV falls back to local or background audio',()=>{
 assert.equal(derive({...local,paused:false},null,{pair:false}).playing,true);
 assert.equal(derive(local,{active:true,getPlaybackState:()=>({playing:true,muted:false})},{pair:false}).playing,true);
});
test('paired controller sends playback state events and never locks retry',()=>{
 const sender=read('web-cast-v2.js'),icons=read('web-player-icons.js');
 assert.match(sender,/openiptv:remote-playback-state/);
 assert.match(sender,/awaitTVPlayback\(controller,lastMediaId\)/);
 assert.doesNotMatch(sender,/if\(remoteState==='loading'\)return false;/);
 assert.match(icons,/doc\.addEventListener\('openiptv:remote-playback-state',sync\)/);
});
test('TV reports failed playback and new scripts break caches',()=>{
 assert.match(read('web-tv-receiver.js'),/reportPlayback\('error',playingName,playingId\)/);
 assert.match(read('index.html'),/web-player-icons\.js\?v=tv-play-state-20261122a/);
 assert.match(read('tv.html'),/web-tv-receiver\.js\?v=tv-play-state-20261122a/);
});
